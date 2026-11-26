'use strict';
const crypto = require('node:crypto');
const r = require('../../core/router');
const cfg = require('../../config');
const { bad, HttpError, conflict } = require('../../core/errors');
const { sessionCookie } = require('../../core/http');
const P = require('../../security/password');
const S = require('../../security/session');
const { limiter } = require('../../security/ratelimit');
const { publicUser, getSetting, notify } = require('../../lib/progress');
const { audit } = require('../../lib/audit');

const M = cfg.rateMult;
const loginLimit = limiter(10 * M, 15 * 60e3), registerLimit = limiter(5 * M, 3600e3), emailFails = limiter(8 * M, 15 * 60e3), forgotLimit = limiter(5 * M, 3600e3);

r.post('/api/auth/register', ({ db, body, ip, req, setCookie }) => {
  if (getSetting(db, 'registration_open', '1') !== '1') throw new HttpError(403, 'التسجيل مغلق مؤقتاً');
  if (!registerLimit(ip)) throw new HttpError(429, 'محاولات كثيرة، حاول لاحقاً');
  const name = String(body.name || '').trim(), email = String(body.email || '').trim().toLowerCase();
  if (name.length < 2 || name.length > 80) throw bad('الاسم غير صالح');
  if (!P.EMAIL_RE.test(email)) throw bad('البريد الإلكتروني غير صالح');
  const pwErr = P.validatePassword(body.password); if (pwErr) throw bad(pwErr);
  if (body.password !== body.confirm) throw bad('كلمتا المرور غير متطابقتين');
  if (body.terms !== true) throw bad('يجب الموافقة على الشروط وسياسة الخصوصية');
  if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) throw conflict('لا يمكن إنشاء الحساب بهذه البيانات');
  const hue = Math.floor(Math.random() * 360);
  const info = db.prepare('INSERT INTO users(email,name,pw_hash,hue,created_at) VALUES(?,?,?,?,?)').run(email, name, P.hashPassword(body.password), hue, Date.now());
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid);
  const s = S.createSession(db, user.id, req.headers['user-agent'], false); setCookie(s);
  audit(db, user.id, 'register', ip);
  notify(db, user.id, 'أهلاً بك في أكاديميا إسبانيولا', 'ابدأ باختبار تحديد المستوى أو من أول درس.', 'welcome');
  db.prepare('INSERT INTO email_outbox(to_email,subject,body,at) VALUES(?,?,?,?)').run(email, 'مرحباً بك', `أهلاً ${name}، تم إنشاء حسابك بنجاح.`, Date.now());
  return { user: publicUser(user), csrf: s.csrf };
});

r.post('/api/auth/login', ({ db, body, ip, req, setCookie }) => {
  const email = String(body.email || '').trim().toLowerCase();
  if (!loginLimit(ip) || !emailFails(email)) throw new HttpError(429, 'محاولات كثيرة، حاول بعد قليل');
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  const ok = P.verifyPassword(String(body.password || ''), user ? user.pw_hash : P.dummyHash());
  if (!user || !ok) throw new HttpError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
  if (user.status !== 'active') throw new HttpError(403, 'هذا الحساب موقوف، تواصل مع الإدارة');
  const s = S.createSession(db, user.id, req.headers['user-agent'], !!body.remember); setCookie(s);
  db.prepare('UPDATE users SET last_login=? WHERE id=?').run(Date.now(), user.id);
  audit(db, user.id, 'login', ip);
  return { user: publicUser(user), csrf: s.csrf };
});

r.post('/api/auth/logout', ({ db, session, clearCookie }) => { db.prepare('DELETE FROM sessions WHERE token_hash=?').run(session.sid); clearCookie(); return { ok: true }; }, { auth: true });
r.post('/api/auth/logout-all', ({ db, session, clearCookie }) => { db.prepare('DELETE FROM sessions WHERE user_id=?').run(session.id); clearCookie(); return { ok: true }; }, { auth: true });
r.get('/api/auth/me', ({ db, session }) => ({
  user: session ? publicUser(session) : null, csrf: session?.csrf || null,
  unread: session ? db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND read=0').get(session.id).c : 0,
  banner: getSetting(db, 'announcement_banner', ''),
}));

// استعادة كلمة المرور: رمز عشوائي يُخزَّن مجزّأً، صالح لمدة محدودة ولمرة واحدة. الرسالة تُحفظ في صندوق البريد التجريبي.
r.post('/api/auth/forgot', ({ db, body, ip, req }) => {
  if (!forgotLimit(ip)) throw new HttpError(429, 'محاولات كثيرة، حاول لاحقاً');
  const email = String(body.email || '').trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email=? AND status='active'").get(email);
  if (user) {
    const token = crypto.randomBytes(32).toString('base64url');
    db.prepare('INSERT INTO password_resets(token_hash,user_id,expires_at) VALUES(?,?,?)').run(S.sha(token), user.id, Date.now() + cfg.resetTokenMinutes * 60e3);
    const link = `http://${req.headers.host}/reset/${token}`;
    db.prepare('INSERT INTO email_outbox(to_email,subject,body,at) VALUES(?,?,?,?)').run(email, 'إعادة تعيين كلمة المرور', `استخدم الرابط التالي (صالح ${cfg.resetTokenMinutes} دقيقة):\n${link}`, Date.now());
    if (process.env.NODE_ENV !== 'production') console.log('[dev-mail] reset link:', link);
  }
  return { ok: true, message: 'إن كان البريد مسجلاً لدينا فقد أرسلنا إليه رابط الاستعادة' }; // نفس الرد دائماً
});
r.post('/api/auth/reset', ({ db, body, ip }) => {
  const pwErr = P.validatePassword(body.password); if (pwErr) throw bad(pwErr);
  const row = db.prepare('SELECT * FROM password_resets WHERE token_hash=? AND used=0 AND expires_at>?').get(S.sha(String(body.token || '')), Date.now());
  if (!row) throw bad('الرابط غير صالح أو منتهي');
  db.prepare('UPDATE users SET pw_hash=? WHERE id=?').run(P.hashPassword(body.password), row.user_id);
  db.prepare('UPDATE password_resets SET used=1 WHERE token_hash=?').run(row.token_hash);
  db.prepare('DELETE FROM sessions WHERE user_id=?').run(row.user_id); // إبطال كل الجلسات بعد تغيير حساس
  audit(db, row.user_id, 'password-reset', ip);
  return { ok: true };
});
r.post('/api/auth/change-password', ({ db, session, body, ip }) => {
  if (!P.verifyPassword(String(body.current || ''), session.pw_hash)) throw bad('كلمة المرور الحالية غير صحيحة');
  const e = P.validatePassword(body.password); if (e) throw bad(e);
  db.prepare('UPDATE users SET pw_hash=? WHERE id=?').run(P.hashPassword(body.password), session.id);
  db.prepare('DELETE FROM sessions WHERE user_id=? AND token_hash!=?').run(session.id, session.sid);
  audit(db, session.id, 'password-change', ip);
  return { ok: true };
}, { auth: true });
r.get('/api/auth/sessions', ({ db, session }) => ({
  sessions: db.prepare('SELECT token_hash id, ua, created_at, last_seen FROM sessions WHERE user_id=? ORDER BY created_at DESC').all(session.id).map((s) => ({ ...s, current: s.id === session.sid, id: s.id.slice(0, 16) })),
  logins: db.prepare("SELECT at, ip FROM audit WHERE user_id=? AND action='login' ORDER BY id DESC LIMIT 8").all(session.id),
}), { auth: true });
r.post('/api/auth/sessions/revoke', ({ db, session, body }) => {
  db.prepare('DELETE FROM sessions WHERE user_id=? AND substr(token_hash,1,16)=? AND token_hash!=?').run(session.id, String(body.id || ''), session.sid);
  return { ok: true };
}, { auth: true });
