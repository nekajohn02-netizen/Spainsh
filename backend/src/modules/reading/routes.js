'use strict';
const r = require('../../core/router');
const { notFound } = require('../../core/errors');
const cfg = require('../../config');
const P = require('../../lib/progress');

r.get('/api/stories', ({ db, session }) => ({
  stories: db.prepare("SELECT id,slug,title_ar,title_es,stage,category,minutes FROM stories WHERE status='published' ORDER BY stage, id").all()
    .map((s) => ({ ...s, read: session ? !!db.prepare('SELECT 1 FROM story_reads WHERE user_id=? AND story_id=?').get(session.id, s.id) : false })),
}));
r.get('/api/stories/:slug', ({ db, session, params }) => {
  const s = db.prepare("SELECT * FROM stories WHERE slug=? AND status='published'").get(params.slug); if (!s) throw notFound('القصة غير موجودة');
  return { story: { ...s, body: JSON.parse(s.body), glossary: JSON.parse(s.glossary) }, read: session ? !!db.prepare('SELECT 1 FROM story_reads WHERE user_id=? AND story_id=?').get(session.id, s.id) : false };
});
r.post('/api/stories/:slug/finish', ({ db, session, params }) => {
  const s = db.prepare('SELECT * FROM stories WHERE slug=?').get(params.slug); if (!s) throw notFound();
  const info = db.prepare('INSERT OR IGNORE INTO story_reads(user_id,story_id,at) VALUES(?,?,?)').run(session.id, s.id, Date.now());
  const xp = info.changes ? cfg.xp.story : 0; if (xp) P.addActivity(db, session.id, { xp, minutes: s.minutes });
  return { xp, achievements: P.checkAchievements(db, session.id) };
}, { auth: true });
