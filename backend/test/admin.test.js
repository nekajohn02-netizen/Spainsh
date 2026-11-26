'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./helpers');
const { sanitizeHtml } = require('../src/lib/sanitize');
let T; before(async () => { T = await boot(); }); after(() => T.close());

test('الصلاحيات: الطالب ممنوع والمدير مسموح والمدرّس للمحتوى فقط', async () => {
  const { c } = await T.reg(), a = await T.admin();
  assert.equal((await c.call('GET', '/api/admin/stats')).status, 403); assert.equal((await T.client().call('GET', '/api/admin/users')).status, 401);
  assert.equal((await a.call('GET', '/api/admin/stats')).status, 200);
  const created = await a.call('POST', '/api/admin/users', { name: 'مدرّس تجريبي', email: 'ins@t.io', password: 'Teacher12345', role: 'instructor' }); assert.equal(created.status, 200);
  const ins = T.client(); await ins.call('POST', '/api/auth/login', { email: 'ins@t.io', password: 'Teacher12345' });
  assert.equal((await ins.call('GET', '/api/admin/lessons')).status, 200); assert.equal((await ins.call('GET', '/api/admin/users')).status, 403); assert.equal((await ins.call('GET', '/api/admin/settings')).status, 403);
});
test('جدول المستخدمين: بحث وفرز وترقيم وحماية الذات', async () => {
  const a = await T.admin(); for (let i = 0; i < 3; i++) await T.reg();
  const r = (await a.call('GET', '/api/admin/users?size=2&page=1&sort=id&dir=asc')).json; assert.equal(r.rows.length, 2); assert.ok(r.total >= 4);
  assert.equal((await a.call('GET', '/api/admin/users?q=admin')).json.total, 1);
  const me = T.db.prepare("SELECT id FROM users WHERE email='admin@test.io'").get().id; assert.equal((await a.call('PATCH', '/api/admin/users/' + me, { role: 'student' })).status, 403);
});
test('CRUD المقررات والوحدات والدروس مع نسخ الإصدارات', async () => {
  const a = await T.admin();
  const c = (await a.call('POST', '/api/admin/courses', { title_ar: 'مقرر تجريبي', title_es: 'Prueba', stage: 'A1.1', track: 'grammar', hours: 5, status: 'published' })).json.row; assert.ok(c.id.startsWith('C-'));
  const m = (await a.call('POST', '/api/admin/modules', { course_id: c.id, title_ar: 'وحدة 1', ord: 1 })).json.row;
  const l = (await a.call('POST', '/api/admin/lessons', { title_ar: 'درس تجريبي', title_es: 'Lección', stage: 'A1.1', track: 'grammar', course_id: c.id, module_id: m.id, body: '<h2>مرحباً</h2><script>alert(1)</script><p onclick="x()">نص</p>', status: 'published' })).json.row;
  assert.doesNotMatch(l.body, /script|onclick/); assert.equal(l.version, 1);
  const u = (await a.call('PUT', '/api/admin/lessons/' + l.id, { body: '<p>جديد</p>' })).json.row; assert.equal(u.version, 2);
  const vs = (await a.call('GET', `/api/admin/lessons/${l.id}/versions`)).json.versions; assert.equal(vs.length, 2);
  await a.call('POST', `/api/admin/lessons/${l.id}/restore/${vs[1].id}`); assert.match((await a.call('GET', '/api/admin/lessons/' + l.id)).json.row.body, /مرحباً/);
  assert.equal((await T.client().call('GET', '/api/lessons/' + l.slug)).status, 200);
  assert.equal((await a.call('POST', '/api/admin/lessons/bulk-status', { ids: [l.id], status: 'draft' })).json.affected, 1); assert.equal((await T.client().call('GET', '/api/lessons/' + l.slug)).status, 404);
  assert.equal((await a.call('DELETE', '/api/admin/courses/' + c.id)).status, 200);
});
test('التحقق من المدخلات: حالة ومسار ومعرّف مكرر', async () => {
  const a = await T.admin();
  assert.equal((await a.call('POST', '/api/admin/courses', { title_ar: 'x', stage: 'Z9.9', track: 'grammar' })).status, 400);
  assert.equal((await a.call('POST', '/api/admin/courses', { title_ar: 'x', stage: 'A1.1', track: 'nope' })).status, 400);
  assert.equal((await a.call('POST', '/api/admin/questions', { bank: 'lesson', lesson_id: 'L-A1.1-001', type: 'single', prompt: 'س', options: 'a\nb', answer: '5' })).status, 400);
});
test('بنك الأسئلة CRUD والبحث والحذف الجماعي', async () => {
  const a = await T.admin();
  const q = (await a.call('POST', '/api/admin/questions', { bank: 'lesson', lesson_id: 'L-A1.1-001', type: 'single', prompt: 'سؤال جديد؟', options: 'أ\nب\nج', answer: '1' })).json.row; assert.deepEqual(JSON.parse(q.options), ['أ', 'ب', 'ج']);
  assert.ok((await a.call('GET', '/api/admin/questions?q=' + encodeURIComponent('جديد'))).json.total >= 1);
  assert.equal((await a.call('POST', '/api/admin/questions/bulk-delete', { ids: [q.id] })).json.deleted, 1);
});
test('القصص (JSON) والمفردات والإعلانات والإعدادات', async () => {
  const a = await T.admin();
  assert.equal((await a.call('POST', '/api/admin/stories', { title_ar: 'قصة', stage: 'A1.1', status: 'published', body: 'not json' })).status, 400);
  assert.equal((await a.call('POST', '/api/admin/stories', { title_ar: 'قصة', title_es: 'Cuento', stage: 'A1.1', status: 'published', body: [{ es: 'Hola', ar: 'مرحباً' }], glossary: { hola: 'مرحباً' } })).status, 200);
  assert.equal((await a.call('POST', '/api/admin/vocab', { es: 'zapato', ar: 'حذاء', pos: 'اسم', gender: 'مذكر', stage: 'A1.1' })).status, 200); assert.equal((await a.call('POST', '/api/admin/vocab', { es: 'zapato', ar: 'x' })).status, 400);
  await a.call('POST', '/api/admin/announcements', { title: 'إعلان', body: 'نص', audience: 'all' }); const { c } = await T.reg(); assert.ok((await c.call('GET', '/api/notifications')).json.announcements.length >= 1);
  assert.equal((await a.call('PUT', '/api/admin/settings', { pass_percent: 90, registration_open: false, announcement_banner: 'صيانة' })).status, 200);
  assert.equal((await T.client().call('POST', '/api/auth/register', { name: 'خالد علي', email: 'closed@t.io', password: 'Secret12345', confirm: 'Secret12345', terms: true })).status, 403);
  assert.equal((await T.client().call('GET', '/api/auth/me')).json.banner, 'صيانة'); await a.call('PUT', '/api/admin/settings', { pass_percent: 70, registration_open: true, announcement_banner: '' });
  assert.ok((await a.call('GET', '/api/admin/audit?size=5')).json.total > 0);
});
test('منقّي HTML', () => {
  const s = sanitizeHtml('<h2 id="a" onclick="x">t</h2><iframe src="//e"></iframe><a href="javascript:alert(1)">x</a><a href="https://ok.com">y</a><img src="x" onerror="e()"><style>a{}</style><svg onload=1>');
  assert.doesNotMatch(s, /onclick|iframe|javascript|onerror|<style|svg/); assert.match(s, /https:\/\/ok\.com/); assert.match(s, /<h2 id="a">/);
});
