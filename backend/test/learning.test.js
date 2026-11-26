'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./helpers');
const { sm2 } = require('../src/lib/srs'); const { grade } = require('../src/lib/quiz'); const { conjugate } = require('../src/lib/conjugate');
let T; before(async () => { T = await boot(); }); after(() => T.close());
const key = (lessonId) => Object.fromEntries(T.db.prepare("SELECT id,answer FROM questions WHERE lesson_id=? AND bank='lesson'").all(lessonId).map((q) => [q.id, q.answer]));

test('الأسئلة لا تكشف الإجابات', async () => { const r = await T.client().call('GET', '/api/lessons/articulos'); assert.ok(r.json.questions.length); for (const q of r.json.questions) assert.equal('answer' in q, false); });
test('تصحيح في الخادم: XP مرة واحدة والإتقان يحتاج محاولتين كاملتين', async () => {
  const { c } = await T.reg(); const k = key('L-A1.1-001');
  const r1 = await c.call('POST', '/api/lessons/alfabeto/quiz', { answers: k }); assert.equal(r1.json.status, 'passed'); assert.ok(r1.json.xp > 0);
  const r2 = await c.call('POST', '/api/lessons/alfabeto/quiz', { answers: k }); assert.equal(r2.json.xp, 0); assert.equal(r2.json.status, 'mastered');
  assert.equal((await c.call('POST', '/api/lessons/alfabeto/quiz', { answers: {} })).json.status, 'mastered');
});
test('فتح الدرس لا يمنح إتقاناً', async () => {
  const { c, email } = await T.reg(); await c.call('GET', '/api/lessons/saludos');
  assert.equal(T.db.prepare("SELECT status FROM progress WHERE lesson_id='L-A1.1-002' AND user_id=(SELECT id FROM users WHERE email=?)").get(email).status, 'viewed');
});
test('الإنجازات تُمنح من الخادم وتصل إشعاراً', async () => {
  const { c } = await T.reg(); const r = await c.call('POST', '/api/lessons/saludos/complete'); assert.ok(r.json.achievements.some((a) => a.code === 'first_lesson'));
  const ach = await c.call('GET', '/api/achievements'); assert.ok(ach.json.achievements.find((a) => a.code === 'first_lesson').unlockedAt);
});
test('إكمال مقرر يصدر شهادة قابلة للتحقق', async () => {
  const { c } = await T.reg(); await c.call('POST', '/api/courses/alfabeto-y-pronunciacion/enroll');
  const r = await c.call('POST', '/api/lessons/alfabeto/quiz', { answers: key('L-A1.1-001') }); assert.ok(r.json.certificate);
  const v = await T.client().call('GET', '/api/certificates/' + r.json.certificate); assert.equal(v.json.certificate.course, 'الأبجدية والنطق');
  assert.equal((await T.client().call('GET', '/api/certificates/FAKE')).status, 404);
});
test('التقدّم التلقائي للمرحلة التالية', async () => {
  const { c, email } = await T.reg();
  for (const l of T.db.prepare("SELECT id,slug FROM lessons WHERE stage='A1.1'").all()) await c.call('POST', `/api/lessons/${l.slug}/quiz`, { answers: key(l.id) });
  assert.equal(T.db.prepare('SELECT stage FROM users WHERE email=?').get(email).stage, 'A1.2');
});
test('المفردات: حفظ ومراجعة SM-2 ولا مراجعة مبكرة', async () => {
  const { c } = await T.reg(); await c.call('POST', '/api/vocab/1/save');
  assert.equal((await c.call('GET', '/api/review/due')).json.cards.length, 1);
  assert.equal((await c.call('POST', '/api/review/answer', { id: 1, grade: 5 })).status, 200); assert.equal((await c.call('POST', '/api/review/answer', { id: 1, grade: 5 })).status, 409);
});
test('اختبار تحديد المستوى والتقدير', async () => {
  const { c } = await T.reg(); const q = await c.call('GET', '/api/placement/questions'); assert.ok(q.json.questions.length >= 10); assert.equal('answer' in q.json.questions[0], false);
  const all = Object.fromEntries(T.db.prepare("SELECT id,answer FROM questions WHERE bank='placement'").all().map((x) => [x.id, x.answer]));
  const r = await c.call('POST', '/api/placement/submit', { answers: all, apply: true }); assert.equal(r.json.score, r.json.total); assert.equal(r.json.recommended, 'B2.1');
  assert.equal((await c.call('GET', '/api/profile')).json.profile.stage, 'B2.1');
});
test('القصص والملاحظات ولوحة الصدارة الاختيارية', async () => {
  const { c } = await T.reg(); assert.equal((await c.call('POST', '/api/stories/un-dia-en-madrid/finish')).json.xp, 15); assert.equal((await c.call('POST', '/api/stories/un-dia-en-madrid/finish')).json.xp, 0);
  const n = await c.call('POST', '/api/notes', { body: 'مهم', slug: 'saludos' }); assert.ok(n.json.id); assert.equal((await c.call('GET', '/api/notes')).json.notes.length, 1);
  assert.equal((await c.call('GET', '/api/leaderboard')).json.rows.length, 0); await c.call('PATCH', '/api/profile', { publicProfile: true }); assert.equal((await c.call('GET', '/api/leaderboard')).json.rows.length, 1);
});
test('لوحة الطالب والسجل الأكاديمي', async () => {
  const { c } = await T.reg(); const d = (await c.call('GET', '/api/dashboard')).json; assert.equal(d.streak, 0); assert.equal(d.review.saved, 0);
  const t = (await c.call('GET', '/api/transcript')).json; assert.match(t.disclaimer, /ليست/); assert.equal(t.stages.length, 18);
});
test('وحدات: SM-2 والتصحيح والتصريف', () => { let c = { ease: 2.5, interval: 0, reps: 0 }; c = sm2(c, 5); assert.equal(c.interval, 1); assert.equal(sm2(c, 1).reps, 0); assert.equal(grade([{ id: 'a', answer: 'Soy' }], { a: ' soy ' }).score, 1);
  assert.equal(conjugate('hablar', 3), 'hablamos'); assert.equal(conjugate('vivir', 3), 'vivimos'); });
