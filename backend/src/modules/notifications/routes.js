'use strict';
const r = require('../../core/router');

r.get('/api/notifications', ({ db, session }) => ({
  notifications: db.prepare('SELECT id,title,body,kind,read,at FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 60').all(session.id),
  announcements: db.prepare("SELECT id,title,body,at FROM announcements WHERE audience IN ('all',?) ORDER BY id DESC LIMIT 10").all(session.role),
}), { auth: true });
r.post('/api/notifications/read-all', ({ db, session }) => { db.prepare('UPDATE notifications SET read=1 WHERE user_id=?').run(session.id); return { ok: true }; }, { auth: true });
r.post('/api/notifications/:id/read', ({ db, session, params }) => { db.prepare('UPDATE notifications SET read=1 WHERE id=? AND user_id=?').run(+params.id, session.id); return { ok: true }; }, { auth: true });
