'use strict';
const r = require('../../core/router');
const { notFound, bad } = require('../../core/errors');

const stateOf = (e, now = Date.now()) => (now < e.starts_at ? 'upcoming' : now > e.ends_at ? 'ended' : 'live');

r.get('/api/events', ({ db, session }) => {
  const rows = db.prepare("SELECT id,slug,title_ar,title_es,description,starts_at,ends_at,points_note FROM events WHERE status='published' ORDER BY starts_at DESC").all();
  return { events: rows.map((e) => ({ ...e, state: stateOf(e), joined: !!db.prepare('SELECT 1 FROM event_joins WHERE user_id=? AND event_id=?').get(session.id, e.id) })) };
}, { auth: true });

function loadEvent(db, slug) { const e = db.prepare("SELECT * FROM events WHERE slug=? AND status='published'").get(slug); if (!e) throw notFound('الفعالية غير موجودة'); return e; }

r.get('/api/events/:slug', ({ db, session, params }) => {
  const e = loadEvent(db, params.slug);
  const joined = !!db.prepare('SELECT 1 FROM event_joins WHERE user_id=? AND event_id=?').get(session.id, e.id);
  const since = new Date(e.starts_at).toISOString().slice(0, 10), until = new Date(e.ends_at).toISOString().slice(0, 10);
  const leaderboard = db.prepare(`SELECT u.id,u.name,u.hue, COALESCE(SUM(a.xp),0) xp FROM event_joins ej JOIN users u ON u.id=ej.user_id LEFT JOIN activity a ON a.user_id=u.id AND a.day>=? AND a.day<=?
    WHERE ej.event_id=? GROUP BY u.id ORDER BY xp DESC LIMIT 50`).all(since, until, e.id).map((u, i) => ({ rank: i + 1, name: u.name, hue: u.hue, xp: u.xp, me: u.id === session.id }));
  return { event: e, joined, state: stateOf(e), leaderboard };
}, { auth: true });

r.post('/api/events/:slug/join', ({ db, session, params }) => {
  const e = loadEvent(db, params.slug); if (Date.now() > e.ends_at) throw bad('انتهت الفعالية، لا يمكن الانضمام إليها بعد الآن');
  db.prepare('INSERT OR IGNORE INTO event_joins(user_id,event_id,joined_at) VALUES(?,?,?)').run(session.id, e.id, Date.now());
  return { ok: true };
}, { auth: true });
