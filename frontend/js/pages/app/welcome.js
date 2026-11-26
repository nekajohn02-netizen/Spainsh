import { h, toast } from '../../ui.js';
import { api } from '../../api.js';
import { navigate } from '../../router.js';
import { store } from '../../store.js';

export default async function () {
  let goal = 15;
  const opts = h('div', { class: 'pill-row' }), paint = () => opts.replaceChildren(...[5, 10, 15, 30, 60].map((m) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(m === goal), onclick: () => { goal = m; paint(); } }, m + ' دقيقة')));
  paint();
  const finish = async (to) => { await api.post('/api/profile/onboarding', { goalMin: goal }); store.user.onboarded = true; navigate(to); };
  return { title: 'مرحباً', node: h('div', { class: 'container page', style: { 'max-width': '760px' } }, h('div', { class: 'card' },
    h('h1', {}, `أهلاً ${store.user.name.split(' ')[0]} 🎉`), h('p', { class: 'muted' }, 'خطوة واحدة قبل أن نبدأ: كم دقيقة تريد أن تدرس يومياً؟ (يمكنك تغييره لاحقاً)'), opts,
    h('h3', { style: { 'margin-top': '2rem' } }, 'من أين تريد أن تبدأ؟'),
    h('div', { class: 'grid', style: { 'grid-template-columns': 'repeat(auto-fit,minmax(220px,1fr))' } },
      [['ابدأ من الصفر', 'أول درس: الأبجدية', '/app/lesson/alfabeto'], ['اختبار تحديد المستوى', 'تقدير مبدئي لنقطة البداية', '/app/placement'], ['تصفّح المقررات', 'اختر ما يناسبك', '/app/courses'], ['استعرض المنهج', 'كل المراحل الثماني عشرة', '/app/curriculum']].map(([t, d, to]) =>
        h('button', { class: 'card hover game-card', type: 'button', onclick: () => finish(to) }, h('h3', {}, t), h('p', { class: 'muted' }, d)))),
    h('p', { class: 'hint' }, 'لا يوجد إلزام باختبار تحديد المستوى.'))) };
}
