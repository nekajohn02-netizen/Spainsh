import { h, ic, empty } from '../../ui.js';
import { api } from '../../api.js';
import { pageHead } from '../../components/layouts.js';

export default async function () {
  const { mistakes } = await api.get('/api/mistakes'), list = h('div', { class: 'grid' });
  const paint = () => list.replaceChildren(...(mistakes.length ? mistakes.map((m) => h('article', { class: 'card q-mistake' }, h('div', { class: 'row' }, h('b', { dir: 'auto' }, m.prompt), h('span', { class: 'spacer' }), h('span', { class: 'badge bad' }, `أخطأت ${m.count}×`)),
    h('p', {}, 'الإجابة الصحيحة: ', h('b', {}, m.answerText)), m.explain && h('p', { class: 'muted' }, m.explain),
    h('div', { class: 'row' }, h('a', { class: 'btn btn-ghost btn-sm', href: '/app/lesson/' + m.slug }, 'راجع الدرس: ' + m.lesson), h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => { await api.post(`/api/mistakes/${encodeURIComponent(m.id)}/dismiss`); mistakes.splice(mistakes.indexOf(m), 1); paint(); } }, ic('check'), 'أتقنتها')))) : [empty('لا أخطاء مسجّلة', 'ممتاز! عند الخطأ في اختبار سيُحفظ هنا للمراجعة.', h('a', { class: 'btn btn-primary', href: '/app/curriculum' }, 'ابدأ درساً'))]));
  paint();
  return { title: 'أخطائي', node: h('div', {}, pageHead('دفتر الأخطاء', 'الأسئلة التي أخطأت فيها، راجعها حتى تتقنها.'), list) };
}
