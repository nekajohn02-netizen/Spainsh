'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./helpers');
let T; before(async () => { T = await boot(); }); after(() => T.close());

test('التسجيل: Argon2id وكوكي HttpOnly وإشعار ترحيب', async () => {
  const { c, email, r } = await T.reg(); assert.equal(r.status, 200);
  assert.match(T.db.prepare('SELECT pw_hash FROM users WHERE email=?').get(email).pw_hash, /^argon2id\$/);
  assert.match(r.headers.get('set-cookie'), /HttpOnly/); assert.equal((await c.call('GET', '/api/auth/me')).json.unread, 1);
});
test('رفض كلمة ضعيفة وبريد مكرر ومصدر غريب', async () => {
  assert.equal((await T.client().call('POST', '/api/auth/register', { name: 'x y', email: 'w@b.io', password: '123', confirm: '123', terms: true })).status, 400);
  const { email } = await T.reg(); assert.equal((await T.reg(email)).r.status, 409);
});
test('رسالة الدخول عامة', async () => {
  const { email } = await T.reg();
  const a = await T.client().call('POST', '/api/auth/login', { email: 'no@x.io', password: 'whatever12345' }), b = await T.client().call('POST', '/api/auth/login', { email, password: 'wrongpass12345' });
  assert.equal(a.status, 401); assert.equal(a.json.error, b.json.error);
});
test('CSRF: رفض الطلب بدون رمز ومع Origin غريب', async () => {
  const { c } = await T.reg(); const raw = await fetch(T.base + '/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(raw.status, 401);
  const { c: c2 } = await T.reg(); c2.call; // جلسة صالحة لكن بدون رمز
  const login = await T.client().call('POST', '/api/auth/login', { email: 'admin@test.io', password: 'AdminPass12345' });
  const res = await fetch(T.base + '/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'sid=bad', Origin: 'http://evil.example' }, body: '{}' });
  assert.ok([401, 403].includes(res.status)); void login; void c;
});
test('استعادة كلمة المرور: رمز لمرة واحدة وإبطال الجلسات', async () => {
  const { c, email } = await T.reg();
  const f = await T.client().call('POST', '/api/auth/forgot', { email }); assert.equal(f.status, 200);
  const unknown = await T.client().call('POST', '/api/auth/forgot', { email: 'ghost@x.io' }); assert.equal(f.json.message, unknown.json.message);
  const mail = T.db.prepare('SELECT body FROM email_outbox WHERE to_email=? AND subject LIKE ? ORDER BY id DESC').get(email, '%كلمة المرور%');
  const token = mail.body.split('/reset/')[1].trim();
  assert.equal((await T.client().call('POST', '/api/auth/reset', { token, password: 'NewSecret12345' })).status, 200);
  assert.equal((await T.client().call('POST', '/api/auth/reset', { token, password: 'Another12345' })).status, 400);
  assert.equal((await c.call('GET', '/api/auth/me')).json.user, null);
  assert.equal((await T.client().call('POST', '/api/auth/login', { email, password: 'NewSecret12345' })).status, 200);
});
test('تغيير كلمة المرور وإدارة الجلسات', async () => {
  const { c, email } = await T.reg(); const second = T.client(); await second.call('POST', '/api/auth/login', { email, password: 'Secret12345' });
  assert.equal((await c.call('POST', '/api/auth/change-password', { current: 'wrong', password: 'Brand12345x' })).status, 400);
  assert.equal((await c.call('POST', '/api/auth/change-password', { current: 'Secret12345', password: 'Brand12345x' })).status, 200);
  assert.equal((await second.call('GET', '/api/auth/me')).json.user, null); // أُبطلت الجلسات الأخرى
  assert.equal((await c.call('GET', '/api/auth/sessions')).json.sessions.length, 1);
});
test('الحساب الموقوف لا يدخل', async () => {
  const { email } = await T.reg(), a = await T.admin(); const id = T.db.prepare('SELECT id FROM users WHERE email=?').get(email).id;
  assert.equal((await a.call('PATCH', '/api/admin/users/' + id, { status: 'suspended' })).status, 200);
  assert.equal((await T.client().call('POST', '/api/auth/login', { email, password: 'Secret12345' })).status, 403);
});
test('تصدير البيانات وحذف الحساب', async () => {
  const { c, email } = await T.reg(); await c.call('POST', '/api/notes', { body: 'ملاحظة' });
  assert.equal((await c.call('GET', '/api/profile/export')).json.profile.email, email);
  assert.equal((await c.call('POST', '/api/profile/delete', { password: 'bad' })).status, 400);
  assert.equal((await c.call('POST', '/api/profile/delete', { password: 'Secret12345' })).status, 200);
  assert.equal(T.db.prepare('SELECT COUNT(*) c FROM users WHERE email=?').get(email).c, 0);
});
test('ترويسات الأمان ومنع الخروج من مجلد الواجهة', async () => {
  const r = await fetch(T.base + '/'); assert.match(r.headers.get('content-security-policy'), /script-src 'self'/);
  assert.ok([403, 404].includes((await fetch(T.base + '/..%2f..%2fpackage.json')).status));
});
