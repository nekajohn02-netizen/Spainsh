'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./helpers');
let T; before(async () => { T = await boot(); }); after(() => T.close());
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

test('إضافة مستوى ومرحلة وقسم جديد وظهورها للطالب', async () => {
  const a = await T.admin();
  assert.equal((await a.call('POST', '/api/admin/levels', { code: 'PRE', title_ar: 'تمهيدي', color: '#112233', ord: 0 })).status, 200);
  assert.equal((await a.call('POST', '/api/admin/stages', { code: 'PRE.1', level: 'PRE', idx: 1, title_ar: 'أول خطوة', hours: 5 })).status, 200);
  assert.equal((await a.call('POST', '/api/admin/tracks', { code: 'legal', title_ar: 'إسبانية قانونية', icon: 'book', ord: 9 })).status, 200);
  const cur = (await T.client().call('GET', '/api/curriculum')).json;
  assert.ok(cur.levels.some((l) => l.code === 'PRE')); assert.ok(cur.stages.some((s) => s.code === 'PRE.1')); assert.ok(cur.tracks.some((t) => t.id === 'legal'));
  assert.equal((await a.call('POST', '/api/admin/levels', { code: 'PRE', title_ar: 'مكرر' })).status, 400);
  assert.equal((await a.call('POST', '/api/admin/levels', { code: 'bad code!', title_ar: 'x' })).status, 400);
});
test('إخفاء مرحلة وقسم يخفي دروسهما ومقرراتهما ويمنع الوصول', async () => {
  const a = await T.admin();
  assert.equal((await T.client().call('GET', '/api/lessons/ser-presente')).status, 200);
  await a.call('PUT', '/api/admin/stages/A1.1', { visible: false });
  const cur = (await T.client().call('GET', '/api/curriculum')).json; assert.equal(cur.stages.some((s) => s.code === 'A1.1'), false);
  assert.equal((await T.client().call('GET', '/api/lessons/ser-presente')).status, 404);
  assert.equal((await T.client().call('GET', '/api/courses')).json.courses.some((c) => c.stage === 'A1.1'), false);
  await a.call('PUT', '/api/admin/stages/A1.1', { visible: true }); assert.equal((await T.client().call('GET', '/api/lessons/ser-presente')).status, 200);
  await a.call('PUT', '/api/admin/tracks/grammar', { visible: false }); assert.equal((await T.client().call('GET', '/api/lessons/ser-presente')).status, 404);
  await a.call('PUT', '/api/admin/tracks/grammar', { visible: true });
});
test('لا حذف لمرحلة أو قسم أو مستوى مستخدم، والحذف مسموح لغير المستخدم', async () => {
  const a = await T.admin();
  assert.equal((await a.call('DELETE', '/api/admin/stages/A1.1')).status, 400); assert.equal((await a.call('DELETE', '/api/admin/tracks/grammar')).status, 400); assert.equal((await a.call('DELETE', '/api/admin/levels/A1')).status, 400);
  assert.equal((await a.call('DELETE', '/api/admin/tracks/legal')).status, 200);
});
test('التقدّم التلقائي يتخطى المراحل المخفية', async () => {
  const a = await T.admin(); await a.call('PUT', '/api/admin/stages/A1.2', { visible: false });
  const { c, email } = await T.reg(); const key = (id) => Object.fromEntries(T.db.prepare('SELECT id,answer FROM questions WHERE lesson_id=?').all(id).map((q) => [q.id, q.answer]));
  for (const l of T.db.prepare("SELECT id,slug FROM lessons WHERE stage='A1.1'").all()) await c.call('POST', `/api/lessons/${l.slug}/quiz`, { answers: key(l.id) });
  assert.equal(T.db.prepare('SELECT stage FROM users WHERE email=?').get(email).stage, 'A1.3'); await a.call('PUT', '/api/admin/stages/A1.2', { visible: true });
});
test('إعدادات الموقع: حفظ وتنقية وقيم افتراضية وإعادة ضبط', async () => {
  const a = await T.admin(); const pub = (await T.client().call('GET', '/api/site')).json; assert.equal(pub.site.brand.logo, '/assets/logo-256.webp');
  const site = (await a.call('GET', '/api/admin/site')).json.site;
  site.brand.name_ar = 'اسم جديد'; site.theme.brand_light = '#112233'; site.theme.brand_dark = 'not-a-color'; site.brand.logo = 'javascript:alert(1)'; site.home.sections[0].visible = false; site.features.articles = false; site.evil = { x: 1 };
  const saved = (await a.call('PUT', '/api/admin/site', { site })).json.site;
  assert.equal(saved.brand.name_ar, 'اسم جديد'); assert.equal(saved.theme.brand_light, '#112233'); assert.equal(saved.theme.brand_dark, '#ff7a8a'); assert.equal(saved.brand.logo, '/assets/logo-256.webp'); assert.equal('evil' in saved, false);
  assert.equal((await T.client().call('GET', '/api/site')).json.site.home.sections[0].visible, false);
  assert.equal((await a.call('POST', '/api/admin/site/reset')).json.site.brand.name_ar, 'أكاديميا إسبانيولا');
  assert.equal((await (await T.reg()).c.call('GET', '/api/admin/site')).status, 403);
});
test('إيقاف ميزة يوقفها في الخادم أيضاً', async () => {
  const a = await T.admin(), { c } = await T.reg(); assert.equal((await c.call('GET', '/api/stories')).status, 200);
  const site = (await a.call('GET', '/api/admin/site')).json.site; site.features.reading = false; await a.call('PUT', '/api/admin/site', { site });
  assert.equal((await c.call('GET', '/api/stories')).status, 404);
  site.features.reading = true; await a.call('PUT', '/api/admin/site', { site }); assert.equal((await c.call('GET', '/api/stories')).status, 200);
});
test('رفع الصور: PNG مقبول، SVG وملف مزيّف مرفوضان، والحذف', async () => {
  const a = await T.admin(); const up = await a.call('POST', '/api/admin/media', { name: 'x.png', data: PNG }); assert.equal(up.status, 200); assert.match(up.json.url, /^\/uploads\/[0-9a-f]{16}\.png$/);
  const img = await fetch(T.base + up.json.url); assert.equal(img.status, 200); assert.equal(img.headers.get('content-type'), 'image/png');
  assert.equal((await a.call('POST', '/api/admin/media', { name: 'a.svg', data: 'data:image/svg+xml;base64,' + Buffer.from('<svg onload=alert(1)/>').toString('base64') })).status, 400);
  assert.equal((await a.call('POST', '/api/admin/media', { name: 'fake.png', data: 'data:image/png;base64,' + Buffer.from('not an image').toString('base64') })).status, 400);
  assert.equal((await (await T.reg()).c.call('POST', '/api/admin/media', { name: 'x', data: PNG })).status, 403);
  assert.equal((await a.call('DELETE', '/api/admin/media/' + up.json.id)).status, 200); assert.equal((await fetch(T.base + up.json.url)).status, 404);
  assert.equal((await fetch(T.base + '/uploads/..%2f..%2fpackage.json')).status >= 400, true);
});
test('غلاف المقرر يقبل رابط الوسائط فقط', async () => {
  const a = await T.admin(); const mk = (cover) => a.call('POST', '/api/admin/courses', { title_ar: 'غلاف', title_es: 'c' + Math.random(), stage: 'A1.1', track: 'grammar', cover });
  assert.equal((await mk('/uploads/abc.png')).status, 200); assert.equal((await mk('javascript:alert(1)')).status, 400);
});
