'use strict';
const r = require('../../core/router');
const { bad, notFound, conflict } = require('../../core/errors');
const { sm2 } = require('../../lib/srs');
const cfg = require('../../config');
const P = require('../../lib/progress');

r.get('/api/vocab', ({ db, session }) => ({
  words: db.prepare(`SELECT v.*, s.due, s.reps, CASE WHEN s.user_id IS NULL THEN 0 ELSE 1 END saved FROM vocab v LEFT JOIN srs s ON s.vocab_id=v.id AND s.user_id=? ORDER BY v.stage, v.topic, v.es`).all(session?.id ?? -1),
}));
r.post('/api/vocab/:id/save', ({ db, session, params }) => {
  const id = +params.id; if (!db.prepare('SELECT 1 FROM vocab WHERE id=?').get(id)) throw notFound('الكلمة غير موجودة');
  db.prepare('INSERT OR IGNORE INTO srs(user_id,vocab_id,due) VALUES(?,?,?)').run(session.id, id, Date.now());
  return { saved: true, achievements: P.checkAchievements(db, session.id) };
}, { auth: true });
r.post('/api/vocab/:id/unsave', ({ db, session, params }) => { db.prepare('DELETE FROM srs WHERE user_id=? AND vocab_id=?').run(session.id, +params.id); return { saved: false }; }, { auth: true });
r.post('/api/vocab/save-stage', ({ db, session, body }) => {
  const rows = db.prepare('SELECT id FROM vocab WHERE stage=?').all(String(body.stage || ''));
  const ins = db.prepare('INSERT OR IGNORE INTO srs(user_id,vocab_id,due) VALUES(?,?,?)');
  let n = 0; for (const w of rows) n += ins.run(session.id, w.id, Date.now()).changes;
  return { added: n, achievements: P.checkAchievements(db, session.id) };
}, { auth: true });

r.get('/api/review/due', ({ db, session }) => ({
  cards: db.prepare('SELECT v.id,v.es,v.ar,v.pos,v.gender,v.example,v.example_ar FROM srs s JOIN vocab v ON v.id=s.vocab_id WHERE s.user_id=? AND s.due<=? ORDER BY s.due LIMIT 20').all(session.id, Date.now()),
  total: db.prepare('SELECT COUNT(*) c FROM srs WHERE user_id=?').get(session.id).c,
}), { auth: true });
r.post('/api/review/answer', ({ db, session, body }) => {
  const g = Number(body.grade); if (!Number.isInteger(g) || g < 0 || g > 5) throw bad('تقييم غير صالح');
  const card = db.prepare('SELECT * FROM srs WHERE user_id=? AND vocab_id=?').get(session.id, +body.id); if (!card) throw notFound('البطاقة غير محفوظة');
  if (card.due > Date.now()) throw conflict('موعد مراجعة هذه البطاقة لم يحن بعد');
  const n = sm2(card, g);
  db.prepare('UPDATE srs SET ease=?,interval=?,reps=?,due=? WHERE user_id=? AND vocab_id=?').run(n.ease, n.interval, n.reps, n.due, session.id, +body.id);
  P.addActivity(db, session.id, { xp: g >= 3 ? cfg.xp.review : 0, minutes: 0 });
  return { nextInDays: n.interval, achievements: P.checkAchievements(db, session.id) };
}, { auth: true });
