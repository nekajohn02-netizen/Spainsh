'use strict';
const r = require('../../core/router');
const { str, int, oneOf } = require('../../core/validate');
const { bad } = require('../../core/errors');
const P = require('../../security/password');
const { publicUser } = require('../../lib/progress');
const { audit } = require('../../lib/audit');

r.get('/api/profile', ({ session }) => ({ profile: { ...publicUser(session), bio: session.bio, timezone: session.timezone, publicProfile: !!session.public_profile, placementStage: session.placement_stage, joined: session.created_at } }), { auth: true });
r.patch('/api/profile', ({ db, session, body }) => {
  const name = str(body.name ?? session.name, 'الاسم', { min: 2, max: 80, required: true });
  const bio = str(body.bio ?? session.bio, 'النبذة', { max: 300 });
  const goal = int(body.goalMin ?? session.goal_min, 'الهدف اليومي', { min: 5, max: 240 });
  const hue = int(body.hue ?? session.hue, 'اللون', { min: 0, max: 360 });
  const tz = str(body.timezone ?? session.timezone, 'المنطقة الزمنية', { max: 60 });
  const pub = body.publicProfile === undefined ? session.public_profile : body.publicProfile ? 1 : 0;
  db.prepare('UPDATE users SET name=?,bio=?,goal_min=?,hue=?,timezone=?,public_profile=? WHERE id=?').run(name, bio, goal, hue, tz, pub, session.id);
  return { ok: true };
}, { auth: true });
r.post('/api/profile/onboarding', ({ db, session, body }) => {
  const goal = int(body.goalMin, 'الهدف', { min: 5, max: 240, def: 15 });
  db.prepare('UPDATE users SET goal_min=?, onboarded=1 WHERE id=?').run(goal, session.id);
  return { ok: true };
}, { auth: true });
// تصدير بيانات المستخدم (قابلية نقل البيانات)
r.get('/api/profile/export', ({ db, session }) => {
  const q = (sql) => db.prepare(sql).all(session.id);
  return { exportedAt: new Date().toISOString(), profile: publicUser(session), progress: q('SELECT * FROM progress WHERE user_id=?'), attempts: q('SELECT * FROM attempts WHERE user_id=?'),
    vocab: q('SELECT * FROM srs WHERE user_id=?'), notes: q('SELECT * FROM notes WHERE user_id=?'), enrollments: q('SELECT * FROM enrollments WHERE user_id=?'), certificates: q('SELECT * FROM certificates WHERE user_id=?') };
}, { auth: true });
// حذف الحساب بتأكيد كلمة المرور
r.post('/api/profile/delete', ({ db, session, body, ip, clearCookie }) => {
  if (session.role === 'admin' && db.prepare("SELECT COUNT(*) c FROM users WHERE role='admin'").get().c <= 1) throw bad('لا يمكن حذف آخر مدير');
  if (!P.verifyPassword(String(body.password || ''), session.pw_hash)) throw bad('كلمة المرور غير صحيحة');
  const id = session.id;
  for (const t of ['progress', 'attempts', 'mistakes', 'notes', 'srs', 'activity', 'story_reads', 'user_achievements', 'notifications', 'enrollments', 'certificates']) db.prepare(`DELETE FROM ${t} WHERE user_id=?`).run(id);
  audit(db, null, `account-deleted:${id}`, ip);
  db.prepare('DELETE FROM users WHERE id=?').run(id); clearCookie();
  return { ok: true };
}, { auth: true });
