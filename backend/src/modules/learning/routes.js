'use strict';
const r = require('../../core/router');
const { notFound, bad } = require('../../core/errors');
const { grade } = require('../../lib/quiz');
const { str, oneOf } = require('../../core/validate');
const cfg = require('../../config');
const P = require('../../lib/progress');
const S = require('../../lib/structure');

const GRACE_MS = 20_000; // سماحية فوق الحد الزمني للاختبار قبل اعتباره متأخراً
const CHEAT_KINDS = ['blur', 'visibility', 'paste', 'copy', 'devtools'];

function loadLesson(db, slug) {
  const l = db.prepare("SELECT * FROM lessons WHERE slug=? AND status='published'").get(slug);
  if (!l || !S.lessonVisible(db, slug)) throw notFound('الدرس غير موجود'); return l;
}
const autoEnroll = (db, uid, courseId) => courseId && db.prepare('INSERT OR IGNORE INTO enrollments(user_id,course_id,enrolled_at) VALUES(?,?,?)').run(uid, courseId, Date.now());

r.get('/api/lessons/:slug', ({ db, session, params }) => {
  const l = loadLesson(db, params.slug);
  const questions = db.prepare("SELECT id,type,prompt,options FROM questions WHERE lesson_id=? AND bank='lesson' ORDER BY id").all(l.id).map((q) => ({ ...q, options: JSON.parse(q.options || '[]') }));
  const sib = db.prepare("SELECT slug,title_ar FROM lessons WHERE status='published' AND IFNULL(course_id,'')=IFNULL(?,'') ORDER BY ord, stage").all(l.course_id);
  const i = sib.findIndex((s) => s.slug === l.slug);
  const course = l.course_id ? db.prepare('SELECT slug,title_ar FROM courses WHERE id=?').get(l.course_id) : null;
  let progress = null, notes = [];
  if (session) {
    progress = db.prepare('SELECT status,best_score FROM progress WHERE user_id=? AND lesson_id=?').get(session.id, l.id) || null;
    if (!progress) { db.prepare("INSERT INTO progress(user_id,lesson_id,status,updated_at) VALUES(?,?,'viewed',?)").run(session.id, l.id, Date.now()); progress = { status: 'viewed', best_score: null }; }
    notes = db.prepare('SELECT id,body,at FROM notes WHERE user_id=? AND lesson_id=? ORDER BY id DESC').all(session.id, l.id);
  }
  return { lesson: { ...l, version: undefined }, course, questions, progress, notes, prev: sib[i - 1] || null, next: sib[i + 1] || null };
});
r.post('/api/lessons/:slug/complete', ({ db, session, params }) => {
  const l = loadLesson(db, params.slug); autoEnroll(db, session.id, l.course_id);
  const cur = db.prepare('SELECT status FROM progress WHERE user_id=? AND lesson_id=?').get(session.id, l.id);
  let gained = 0;
  if (!cur || cur.status === 'viewed') {
    db.prepare(`INSERT INTO progress(user_id,lesson_id,status,updated_at) VALUES(?,?,'completed',?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET status='completed', updated_at=excluded.updated_at`).run(session.id, l.id, Date.now());
    gained = cfg.xp.lessonComplete; P.addActivity(db, session.id, { minutes: l.minutes, xp: gained });
  }
  const achievements = P.checkAchievements(db, session.id);
  return { status: cur && cur.status !== 'viewed' ? cur.status : 'completed', xp: gained, achievements };
}, { auth: true });

r.post('/api/lessons/:slug/quiz/start', ({ db, session, params }) => {
  const l = loadLesson(db, params.slug);
  const startedAt = Date.now();
  db.prepare(`INSERT INTO quiz_sessions(user_id,lesson_id,started_at,submitted_at) VALUES(?,?,?,NULL)
    ON CONFLICT(user_id,lesson_id) DO UPDATE SET started_at=excluded.started_at, submitted_at=NULL`).run(session.id, l.id, startedAt);
  return { startedAt, limitMin: l.time_limit_min || null };
}, { auth: true });

r.post('/api/lessons/:slug/quiz', ({ db, session, params, body }) => {
  const l = loadLesson(db, params.slug); autoEnroll(db, session.id, l.course_id);
  const qs = db.prepare("SELECT * FROM questions WHERE lesson_id=? AND bank='lesson'").all(l.id);
  if (!qs.length) throw bad('لا يوجد اختبار لهذا الدرس');
  const { score, total, results } = grade(qs, body.answers || {});
  const pct = Math.round((score / total) * 100), now = Date.now(), pass = P.passPercent(db);
  const qsess = db.prepare('SELECT started_at FROM quiz_sessions WHERE user_id=? AND lesson_id=?').get(session.id, l.id);
  const timedOut = !!(l.time_limit_min && qsess && (now - qsess.started_at) > l.time_limit_min * 60000 + GRACE_MS);
  db.prepare('DELETE FROM quiz_sessions WHERE user_id=? AND lesson_id=?').run(session.id, l.id);
  db.prepare('INSERT INTO attempts(user_id,lesson_id,score,total,at) VALUES(?,?,?,?,?)').run(session.id, l.id, score, total, now);
  const wasPassed = db.prepare("SELECT 1 FROM progress WHERE user_id=? AND lesson_id=? AND status IN ('passed','mastered')").get(session.id, l.id);
  const perfect = db.prepare('SELECT COUNT(*) c FROM attempts WHERE user_id=? AND lesson_id=? AND score=total').get(session.id, l.id).c;
  const best = Math.max(pct, db.prepare('SELECT best_score FROM progress WHERE user_id=? AND lesson_id=?').get(session.id, l.id)?.best_score || 0);
  let status = perfect >= 2 ? 'mastered' : pct >= pass || wasPassed ? 'passed' : 'assessed';
  if (wasPassed && status === 'assessed') status = 'passed';
  if (timedOut && status !== 'assessed' && !wasPassed) status = 'assessed'; // تجاوز الوقت يمنع النجاح/الإتقان في هذه المحاولة
  db.prepare(`INSERT INTO progress(user_id,lesson_id,status,best_score,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET status=?, best_score=?, updated_at=?`).run(session.id, l.id, status, best, now, status, best, now);
  let xp = 0; if (!wasPassed && pct >= pass && !timedOut) xp = cfg.xp.quizPass + Math.round(pct / 10);
  P.addActivity(db, session.id, { xp });
  for (const x of results) if (!x.correct) db.prepare(`INSERT INTO mistakes(user_id,question_id,count,at) VALUES(?,?,1,?) ON CONFLICT(user_id,question_id) DO UPDATE SET count=count+1, at=excluded.at`).run(session.id, x.id, now);
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(session.id);
  const advancedTo = pct >= pass && !timedOut ? P.maybeAdvanceStage(db, user) : null;
  const certificate = pct >= pass && !timedOut ? P.checkCourseCompletion(db, session.id, l.course_id) : null;
  const achievements = P.checkAchievements(db, session.id);
  return { score, total, percent: pct, passed: pct >= pass && !timedOut, timedOut, status, xp, advancedTo, certificate, achievements, results };
}, { auth: true });

r.post('/api/lessons/:slug/cheat-event', ({ db, session, params, body }) => {
  const l = loadLesson(db, params.slug);
  const kind = oneOf(body.kind, CHEAT_KINDS, 'النوع');
  db.prepare('INSERT INTO cheat_events(user_id,lesson_id,kind,at) VALUES(?,?,?,?)').run(session.id, l.id, kind, Date.now());
  return { ok: true };
}, { auth: true });

r.get('/api/mistakes', ({ db, session }) => ({
  mistakes: db.prepare(`SELECT m.question_id id, m.count, q.prompt, q.answer, q.options, q.type, q.explain, l.title_ar lesson, l.slug FROM mistakes m
    JOIN questions q ON q.id=m.question_id JOIN lessons l ON l.id=q.lesson_id WHERE m.user_id=? ORDER BY m.at DESC LIMIT 200`).all(session.id)
    .map((m) => ({ ...m, answerText: m.type === 'fill' ? m.answer : JSON.parse(m.options || '[]')[+m.answer] ?? m.answer, options: undefined })),
}), { auth: true });
r.post('/api/mistakes/:id/dismiss', ({ db, session, params }) => { db.prepare('DELETE FROM mistakes WHERE user_id=? AND question_id=?').run(session.id, params.id); return { ok: true }; }, { auth: true });

// الملاحظات الشخصية
r.get('/api/notes', ({ db, session }) => ({
  notes: db.prepare('SELECT n.id,n.body,n.at,n.lesson_id,l.title_ar lesson,l.slug FROM notes n LEFT JOIN lessons l ON l.id=n.lesson_id WHERE n.user_id=? ORDER BY n.id DESC LIMIT 300').all(session.id),
}), { auth: true });
r.post('/api/notes', ({ db, session, body }) => {
  const text = str(body.body, 'الملاحظة', { required: true, max: 2000 });
  let lessonId = null;
  if (body.slug) lessonId = loadLesson(db, String(body.slug)).id;
  const info = db.prepare('INSERT INTO notes(user_id,lesson_id,body,at) VALUES(?,?,?,?)').run(session.id, lessonId, text, Date.now());
  return { id: Number(info.lastInsertRowid) };
}, { auth: true });
r.patch('/api/notes/:id', ({ db, session, params, body }) => {
  const info = db.prepare('UPDATE notes SET body=? WHERE id=? AND user_id=?').run(str(body.body, 'الملاحظة', { required: true, max: 2000 }), +params.id, session.id);
  if (!info.changes) throw notFound(); return { ok: true };
}, { auth: true });
r.delete('/api/notes/:id', ({ db, session, params }) => { db.prepare('DELETE FROM notes WHERE id=? AND user_id=?').run(+params.id, session.id); return { ok: true }; }, { auth: true });
