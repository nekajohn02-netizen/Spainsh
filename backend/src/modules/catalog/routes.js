'use strict';
const r = require('../../core/router');
const { notFound } = require('../../core/errors');
const { like } = require('../../core/paginate');
const { checkCourseCompletion, notify } = require('../../lib/progress');
const S = require('../../lib/structure');
const { getSite } = require('../../lib/site');

const NOTE = 'المراحل الثلاث داخل كل مستوى تقسيم داخلي للمنصة وليست تصنيفاً رسمياً من CEFR.';

r.get('/api/curriculum', ({ db, session, query }) => {
  const stages = S.stages(db), tracks = S.tracks(db), levels = S.levels(db);
  const trackFilter = (query.get('track') || '').split(',').map((s) => s.trim()).filter(Boolean);
  let lessons = db.prepare(`SELECT l.id,l.slug,l.title_ar,l.title_es,l.summary,l.stage,l.track,l.minutes,l.ord,l.course_id FROM lessons l WHERE l.status='published' AND ${S.VISIBLE_LESSON} ORDER BY l.stage, l.ord`).all();
  if (trackFilter.length) lessons = lessons.filter((l) => trackFilter.includes(l.track));
  const prog = session ? Object.fromEntries(db.prepare('SELECT lesson_id,status,best_score FROM progress WHERE user_id=?').all(session.id).map((p) => [p.lesson_id, p])) : {};
  return { note: NOTE, levels, tracks, stages: stages.map((s) => ({ ...s, lessons: lessons.filter((l) => l.stage === s.code).map((l) => ({ ...l, status: prog[l.id]?.status || 'new', bestScore: prog[l.id]?.best_score ?? null })) })) };
});

function courseStats(db, uid) {
  return db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id AND l.status='published') lessons,
    (SELECT COUNT(*) FROM enrollments e WHERE e.course_id=c.id) students,
    ${uid ? "(SELECT COUNT(*) FROM progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=? AND l.course_id=c.id AND p.status IN ('passed','mastered'))" : '0'} done,
    ${uid ? '(SELECT 1 FROM enrollments e WHERE e.user_id=? AND e.course_id=c.id)' : '0'} enrolled
    FROM courses c WHERE c.status='published' AND c.stage IN (SELECT code FROM stages WHERE visible=1) AND c.track IN (SELECT id FROM tracks WHERE visible=1)`);
}
r.get('/api/courses', ({ db, session, query }) => {
  const stage = query.get('stage'), track = query.get('track'), q = (query.get('q') || '').trim();
  let rows = (session ? courseStats(db, true).all(session.id, session.id) : courseStats(db, false).all());
  if (stage) rows = rows.filter((c) => c.stage.startsWith(stage));
  if (track) rows = rows.filter((c) => c.track === track);
  if (q) rows = rows.filter((c) => (c.title_ar + c.title_es + c.description).toLowerCase().includes(q.toLowerCase()));
  return { courses: rows.map((c) => ({ ...c, enrolled: !!c.enrolled })), tracks: S.tracks(db) };
});
r.get('/api/courses/:slug', ({ db, session, params }) => {
  const c = db.prepare("SELECT * FROM courses WHERE slug=? AND status='published' AND stage IN (SELECT code FROM stages WHERE visible=1) AND track IN (SELECT id FROM tracks WHERE visible=1)").get(params.slug); if (!c) throw notFound('المقرر غير موجود');
  const modules = db.prepare('SELECT * FROM modules WHERE course_id=? ORDER BY ord').all(c.id);
  const lessons = db.prepare("SELECT id,slug,title_ar,title_es,minutes,module_id,ord FROM lessons WHERE course_id=? AND status='published' ORDER BY ord").all(c.id);
  const prog = session ? Object.fromEntries(db.prepare('SELECT lesson_id,status,best_score FROM progress WHERE user_id=?').all(session.id).map((p) => [p.lesson_id, p])) : {};
  const enr = session ? db.prepare('SELECT * FROM enrollments WHERE user_id=? AND course_id=?').get(session.id, c.id) : null;
  const cert = enr?.completed_at ? db.prepare('SELECT code FROM certificates WHERE user_id=? AND course_id=?').get(session.id, c.id) : null;
  return { course: c, enrolled: !!enr, completed: !!enr?.completed_at, certificate: cert?.code || null,
    modules: modules.map((m) => ({ ...m, lessons: lessons.filter((l) => l.module_id === m.id).map((l) => ({ ...l, status: prog[l.id]?.status || 'new', bestScore: prog[l.id]?.best_score ?? null })) })),
    outcomes: lessons.length, minutes: lessons.reduce((a, l) => a + l.minutes, 0) };
});
r.post('/api/courses/:slug/enroll', ({ db, session, params }) => {
  const c = db.prepare("SELECT * FROM courses WHERE slug=? AND status='published'").get(params.slug); if (!c) throw notFound();
  const info = db.prepare('INSERT OR IGNORE INTO enrollments(user_id,course_id,enrolled_at) VALUES(?,?,?)').run(session.id, c.id, Date.now());
  if (info.changes) notify(db, session.id, `تم تسجيلك في «${c.title_ar}»`, 'بالتوفيق في رحلتك!', 'enroll');
  checkCourseCompletion(db, session.id, c.id);
  return { enrolled: true };
}, { auth: true });
r.post('/api/courses/:slug/unenroll', ({ db, session, params }) => {
  const c = db.prepare('SELECT id FROM courses WHERE slug=?').get(params.slug); if (!c) throw notFound();
  db.prepare('DELETE FROM enrollments WHERE user_id=? AND course_id=? AND completed_at IS NULL').run(session.id, c.id);
  return { enrolled: false };
}, { auth: true });
r.get('/api/my/courses', ({ db, session }) => ({
  courses: courseStats(db, true).all(session.id, session.id).filter((c) => c.enrolled).map((c) => ({ ...c, enrolled: true, completed: !!db.prepare('SELECT completed_at FROM enrollments WHERE user_id=? AND course_id=?').get(session.id, c.id).completed_at })),
}), { auth: true });
r.get('/api/search', ({ db, query }) => {
  const q = (query.get('q') || '').trim(); if (q.length < 2) return { lessons: [], courses: [], vocab: [] };
  const l = like(q);
  return {
    lessons: db.prepare(`SELECT slug,title_ar,title_es,stage FROM lessons l WHERE status='published' AND ${S.VISIBLE_LESSON} AND (title_ar LIKE ? ESCAPE '\\' OR title_es LIKE ? ESCAPE '\\' OR summary LIKE ? ESCAPE '\\') LIMIT 6`).all(l, l, l),
    courses: db.prepare("SELECT slug,title_ar,stage FROM courses WHERE status='published' AND (title_ar LIKE ? ESCAPE '\\' OR title_es LIKE ? ESCAPE '\\') LIMIT 4").all(l, l),
    vocab: db.prepare("SELECT id,es,ar FROM vocab WHERE es LIKE ? ESCAPE '\\' OR ar LIKE ? ESCAPE '\\' LIMIT 6").all(l, l),
  };
});

// الإعدادات العامة للموقع (هوية، ألوان، قوائم، ميزات) + الهيكل الأكاديمي الظاهر
r.get('/api/site', ({ db }) => ({ site: getSite(db), levels: S.levels(db), tracks: S.tracks(db), stages: S.stages(db).map((x) => ({ code: x.code, level: x.level, title_ar: x.title_ar, color: x.color_eff })) }));
