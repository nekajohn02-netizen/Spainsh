'use strict';
const r = require('../../core/router');
const { bad, notFound, conflict, forbid } = require('../../core/errors');
const { tableParams, like } = require('../../core/paginate');
const P = require('../../security/password');
const { audit } = require('../../lib/audit');
const cfg = require('../../config');

r.get('/api/admin/users', ({ db, query }) => {
  const p = tableParams(query, ['id', 'name', 'email', 'role', 'status', 'stage', 'xp', 'created_at', 'last_login'], 'id');
  const where = [], args = [];
  if (p.q) { where.push("(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\')"); args.push(like(p.q), like(p.q)); }
  for (const f of ['role', 'status', 'stage']) { const v = query.get(f); if (v) { where.push(`${f}=?`); args.push(v); } }
  const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
  return {
    total: db.prepare(`SELECT COUNT(*) c FROM users ${w}`).get(...args).c, page: p.page, size: p.size,
    rows: db.prepare(`SELECT id,name,email,role,status,stage,xp,hue,last_login,created_at,(SELECT COUNT(*) FROM enrollments e WHERE e.user_id=users.id) courses,(SELECT COUNT(*) FROM progress g WHERE g.user_id=users.id AND g.status IN ('passed','mastered')) passed FROM users ${w} ORDER BY ${p.sort} ${p.dir} LIMIT ? OFFSET ?`).all(...args, p.size, p.offset),
  };
}, { role: 'admin' });

r.get('/api/admin/users/:id', ({ db, params }) => {
  const u = db.prepare('SELECT id,name,email,role,status,stage,xp,bio,created_at,last_login,placement_stage FROM users WHERE id=?').get(+params.id); if (!u) throw notFound();
  return { user: u,
    courses: db.prepare('SELECT c.title_ar, e.enrolled_at, e.completed_at FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=?').all(u.id),
    attempts: db.prepare('SELECT l.title_ar, a.score, a.total, a.at FROM attempts a JOIN lessons l ON l.id=a.lesson_id WHERE a.user_id=? ORDER BY a.id DESC LIMIT 10').all(u.id),
    activity: db.prepare('SELECT day,minutes,xp FROM activity WHERE user_id=? ORDER BY day DESC LIMIT 14').all(u.id) };
}, { role: 'admin' });

r.post('/api/admin/users', ({ db, body, session, ip }) => {
  const email = String(body.email || '').trim().toLowerCase(), name = String(body.name || '').trim();
  if (!P.EMAIL_RE.test(email) || name.length < 2) throw bad('بيانات غير صالحة');
  const e = P.validatePassword(body.password); if (e) throw bad(e);
  if (!cfg.roles.includes(body.role || 'student')) throw bad('دور غير صالح');
  if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) throw conflict('البريد مستخدم');
  const info = db.prepare('INSERT INTO users(email,name,pw_hash,role,onboarded,hue,created_at) VALUES(?,?,?,?,1,?,?)').run(email, name, P.hashPassword(body.password), body.role || 'student', Math.floor(Math.random() * 360), Date.now());
  audit(db, session.id, `user:create:${info.lastInsertRowid}`, ip); return { id: Number(info.lastInsertRowid) };
}, { role: 'admin' });

r.patch('/api/admin/users/:id', ({ db, params, body, session, ip }) => {
  const id = +params.id, u = db.prepare('SELECT * FROM users WHERE id=?').get(id); if (!u) throw notFound();
  const role = body.role ?? u.role, status = body.status ?? u.status, stage = body.stage ?? u.stage;
  if (!cfg.roles.includes(role) || !['active', 'suspended'].includes(status)) throw bad('قيمة غير صالحة');
  if (id === session.id && (role !== 'admin' || status !== 'active')) throw forbid('لا يمكنك تعديل صلاحياتك أو إيقاف حسابك');
  db.prepare('UPDATE users SET role=?,status=?,stage=? WHERE id=?').run(role, status, stage, id);
  if (status !== 'active') db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);
  audit(db, session.id, `user:update:${id}:${role}:${status}`, ip); return { ok: true };
}, { role: 'admin' });

r.post('/api/admin/users/bulk', ({ db, body, session, ip }) => {
  const ids = (Array.isArray(body.ids) ? body.ids : []).map(Number).filter((n) => n && n !== session.id).slice(0, 200);
  if (!ids.length || !['suspend', 'activate'].includes(body.action)) throw bad('طلب غير صالح');
  const status = body.action === 'suspend' ? 'suspended' : 'active';
  for (const id of ids) { db.prepare('UPDATE users SET status=? WHERE id=?').run(status, id); if (status !== 'active') db.prepare('DELETE FROM sessions WHERE user_id=?').run(id); }
  audit(db, session.id, `user:bulk:${body.action}:${ids.length}`, ip); return { affected: ids.length };
}, { role: 'admin' });

r.post('/api/admin/users/:id/reset-password', ({ db, params, body, session, ip }) => {
  const e = P.validatePassword(body.password); if (e) throw bad(e);
  if (!db.prepare('SELECT 1 FROM users WHERE id=?').get(+params.id)) throw notFound();
  db.prepare('UPDATE users SET pw_hash=? WHERE id=?').run(P.hashPassword(body.password), +params.id);
  db.prepare('DELETE FROM sessions WHERE user_id=?').run(+params.id); audit(db, session.id, `user:reset-password:${params.id}`, ip); return { ok: true };
}, { role: 'admin' });
