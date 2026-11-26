'use strict';
const r = require('../../core/router');
const { bad } = require('../../core/errors');
const { tableParams, like } = require('../../core/paginate');
const { audit } = require('../../lib/audit');
const { getSetting } = require('../../lib/progress');

r.get('/api/admin/audit', ({ db, query }) => {
  const p = tableParams(query, ['id', 'at', 'action'], 'id'); const w = p.q ? "WHERE a.action LIKE ? ESCAPE '\\'" : '', args = p.q ? [like(p.q)] : [];
  return { total: db.prepare(`SELECT COUNT(*) c FROM audit a ${w}`).get(...args).c, page: p.page, size: p.size,
    rows: db.prepare(`SELECT a.id,a.action,a.ip,a.at,u.name FROM audit a LEFT JOIN users u ON u.id=a.user_id ${w} ORDER BY a.${p.sort} ${p.dir} LIMIT ? OFFSET ?`).all(...args, p.size, p.offset) };
}, { role: 'admin' });
r.get('/api/admin/outbox', ({ db }) => ({ rows: db.prepare('SELECT * FROM email_outbox ORDER BY id DESC LIMIT 50').all() }), { role: 'admin' });
r.get('/api/admin/cheat-events', ({ db, query }) => {
  const p = tableParams(query, ['id', 'at', 'kind'], 'id'); const w = p.q ? "WHERE ce.kind LIKE ? ESCAPE '\\'" : '', args = p.q ? [like(p.q)] : [];
  return { total: db.prepare(`SELECT COUNT(*) c FROM cheat_events ce ${w}`).get(...args).c, page: p.page, size: p.size,
    rows: db.prepare(`SELECT ce.id,ce.kind,ce.at,u.name,l.title_ar lesson FROM cheat_events ce LEFT JOIN users u ON u.id=ce.user_id LEFT JOIN lessons l ON l.id=ce.lesson_id ${w} ORDER BY ce.${p.sort} ${p.dir} LIMIT ? OFFSET ?`).all(...args, p.size, p.offset) };
}, { role: 'admin' });
r.get('/api/admin/settings', ({ db }) => ({ settings: { pass_percent: getSetting(db, 'pass_percent', '70'), registration_open: getSetting(db, 'registration_open', '1'), announcement_banner: getSetting(db, 'announcement_banner', '') } }), { role: 'admin' });
r.put('/api/admin/settings', ({ db, body, session, ip }) => {
  const pass = Number(body.pass_percent); if (!Number.isInteger(pass) || pass < 40 || pass > 100) throw bad('نسبة النجاح بين 40 و100');
  const up = db.prepare('INSERT INTO settings(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v');
  up.run('pass_percent', String(pass)); up.run('registration_open', body.registration_open ? '1' : '0'); up.run('announcement_banner', String(body.announcement_banner || '').slice(0, 200));
  audit(db, session.id, 'settings:update', ip); return { ok: true };
}, { role: 'admin' });
