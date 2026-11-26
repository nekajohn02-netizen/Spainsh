'use strict';
const r = require('../../core/router');
const { notFound, bad } = require('../../core/errors');
const { BANDS } = require('../../db/seeds/placement');
const cfg = require('../../config');
const P = require('../../lib/progress');

r.get('/api/placement/questions', ({ db }) => ({
  questions: db.prepare("SELECT id,prompt,options FROM questions WHERE bank='placement' ORDER BY stage, id").all().map((q) => ({ ...q, options: JSON.parse(q.options) })),
  disclaimer: 'هذا اختبار قصير للقواعد والمفردات يعطي تقديراً مبدئياً لنقطة البداية، وليس قياساً شاملاً لمستوى CEFR.',
}), { auth: true });
r.post('/api/placement/submit', ({ db, session, body }) => {
  const qs = db.prepare("SELECT * FROM questions WHERE bank='placement' ORDER BY stage, id").all();
  let score = 0; const byLevel = {};
  for (const q of qs) {
    const ok = String(body.answers?.[q.id] ?? '') === q.answer; if (ok) score++;
    const lv = q.stage.slice(0, 2); byLevel[lv] ||= { correct: 0, total: 0 }; byLevel[lv].total++; if (ok) byLevel[lv].correct++;
  }
  let stage = BANDS[0][1]; for (const [min, s] of BANDS) if (score >= min) stage = s;
  const first = !db.prepare('SELECT placement_stage p FROM users WHERE id=?').get(session.id).p;
  db.prepare('UPDATE users SET placement_stage=? WHERE id=?').run(stage, session.id);
  if (body.apply) db.prepare('UPDATE users SET stage=? WHERE id=?').run(stage, session.id);
  if (first) P.addActivity(db, session.id, { xp: cfg.xp.placement });
  return { score, total: qs.length, recommended: stage, applied: !!body.apply, byLevel, achievements: P.checkAchievements(db, session.id),
    note: 'تقدير مبدئي مبني على القواعد والمفردات فقط. يمكنك البدء من مرحلة أقل في أي وقت.' };
}, { auth: true });

/* ---------- اختبارات تحديد مستوى متعددة بنطاقات مخصصة (مرحلة واحدة، مستوى كامل، أو عدة مستويات معاً) ---------- */
r.get('/api/placement/tests', ({ db }) => ({
  tests: db.prepare("SELECT id,title_ar,title_es,stages FROM placement_tests WHERE status='published' ORDER BY ord").all().map((t) => ({ ...t, stages: t.stages.split(',') })),
}), { auth: true });
function loadTest(db, id) { const t = db.prepare("SELECT * FROM placement_tests WHERE id=? AND status='published'").get(id); if (!t) throw notFound('الاختبار غير موجود'); return { ...t, stageList: t.stages.split(',') }; }
r.get('/api/placement/tests/:id/questions', ({ db, params }) => {
  const t = loadTest(db, params.id);
  const questions = db.prepare(`SELECT id,prompt,options FROM questions WHERE bank='placement' AND stage IN (${t.stageList.map(() => '?').join(',')}) ORDER BY stage, id`).all(...t.stageList).map((q) => ({ ...q, options: JSON.parse(q.options) }));
  return { test: { id: t.id, title_ar: t.title_ar, title_es: t.title_es, stages: t.stageList }, questions,
    disclaimer: 'اختبار قصير ضمن نطاق محدّد يعطي تقديراً مبدئياً للقواعد والمفردات، وليس قياساً شاملاً لمستوى CEFR.' };
}, { auth: true });
r.post('/api/placement/tests/:id/submit', ({ db, session, params, body }) => {
  const t = loadTest(db, params.id);
  const qs = db.prepare(`SELECT * FROM questions WHERE bank='placement' AND stage IN (${t.stageList.map(() => '?').join(',')})`).all(...t.stageList);
  if (!qs.length) throw bad('لا توجد أسئلة ضمن نطاق هذا الاختبار');
  let score = 0; for (const q of qs) if (String(body.answers?.[q.id] ?? '') === q.answer) score++;
  const pct = score / qs.length, idx = Math.min(t.stageList.length - 1, Math.floor(pct * t.stageList.length)), recommended = t.stageList[idx];
  if (body.apply) db.prepare('UPDATE users SET stage=? WHERE id=?').run(recommended, session.id);
  return { score, total: qs.length, percent: Math.round(pct * 100), recommended, scope: t.stageList, applied: !!body.apply,
    note: 'التوصية نسبية داخل نطاق هذا الاختبار فقط، وليست تقييماً شاملاً.' };
}, { auth: true });
