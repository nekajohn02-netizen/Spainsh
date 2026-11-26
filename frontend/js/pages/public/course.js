import { h, ic, es, bar, toast } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { navigate } from '../../router.js';
import { lessonRow } from '../../components/cards.js';
import { pct } from '../../lib/format.js';

// صفحة المقرر: تُستعمل للعرض العام والتطبيق (base يحدد مسار الدرس)
export async function courseView(slug, appMode) {
  const d = await api.get('/api/courses/' + slug), c = d.course, all = d.modules.flatMap((m) => m.lessons), done = all.filter((l) => ['passed', 'mastered'].includes(l.status)).length;
  const enrollBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button' });
  const paint = () => { enrollBtn.textContent = d.enrolled ? 'إلغاء التسجيل' : 'سجّل في المقرر'; enrollBtn.className = 'btn btn-lg ' + (d.enrolled ? 'btn-ghost' : 'btn-primary'); if (d.completed) enrollBtn.hidden = true; };
  paint();
  enrollBtn.addEventListener('click', async () => {
    if (!store.user) return navigate('/login?next=' + encodeURIComponent(location.pathname));
    await api.post(`/api/courses/${slug}/${d.enrolled ? 'unenroll' : 'enroll'}`); d.enrolled = !d.enrolled; toast(d.enrolled ? 'تم التسجيل في المقرر' : 'تم إلغاء التسجيل'); paint();
  });
  const first = all.find((l) => !['passed', 'mastered'].includes(l.status)) || all[0];
  return h('div', {},
    h('section', { class: 'course-hero', style: { '--c': c.color } }, h('div', { class: 'row' }, h('span', { class: 'badge es' }, c.stage), h('span', { class: 'badge' }, `${c.hours} ساعة تقديرية`), h('span', { class: 'badge' }, `${all.length} دروس`)),
      h('h1', {}, c.title_ar), h('p', { class: 'es', style: { 'font-size': '1.3rem' } }, c.title_es), h('p', {}, c.description), h('p', {}, 'المدرّس: ', c.instructor || 'فريق الأكاديمية'),
      h('div', { class: 'row' }, enrollBtn, first && h('a', { class: 'btn btn-ghost btn-lg', href: `/app/lesson/${first.slug}` }, d.enrolled && done ? 'تابع المقرر' : 'ابدأ أول درس'),
        d.certificate && h('a', { class: 'btn btn-ghost btn-lg', href: '/certificate/' + d.certificate }, ic('award'), 'شهادة الإتمام'))),
    d.enrolled && h('div', { class: 'card', style: { 'margin-bottom': '1.5rem' } }, h('div', { class: 'row' }, h('b', {}, 'تقدّمك'), h('span', { class: 'spacer' }), h('span', {}, `${done}/${all.length}`)), bar(pct(done, all.length))),
    d.modules.map((m, i) => h('details', { class: 'card module', open: i === 0 }, h('summary', {}, h('span', { class: 'badge info' }, i + 1), m.title_ar, h('span', { class: 'count' }, `${m.lessons.length} دروس`)),
      m.lessons.map((l) => store.user ? lessonRow(l) : h('div', { class: 'lesson-item' }, h('span', { class: 'dot' }), h('b', {}, l.title_ar), h('span', { class: 'spacer' }), h('span', { class: 'badge' }, l.minutes + ' د'))))),
    !store.user && h('p', { class: 'center muted' }, h('a', { href: '/register' }, 'أنشئ حساباً'), ' لفتح الدروس وتتبّع تقدّمك.'));
}
export default async function ({ params }) { return { title: 'مقرر', node: h('div', { class: 'container page' }, await courseView(params.slug)) }; }
