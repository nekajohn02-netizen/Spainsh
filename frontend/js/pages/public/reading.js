import { h, ic, es, empty } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { levelColor, stageColor } from '../../constants.js';

export async function readingView(base) {
  const { stories } = await api.get('/api/stories');
  return h('div', { class: 'grid cgrid' }, stories.length ? stories.map((s) => h('a', { class: 'card hover ccard', href: `${base}/${s.slug}`, style: { '--c': stageColor(s.stage) } },
    h('div', { class: 'cover' }, s.cover && h('img', { src: s.cover, alt: '', loading: 'lazy' }), es(s.stage)), h('div', { class: 'body' }, h('h3', {}, s.title_ar), h('small', { class: 'es muted' }, s.title_es), h('div', { class: 'meta' }, h('span', { class: 'badge' }, s.category), h('span', { class: 'badge' }, ic('clock'), s.minutes + ' د'), s.read && h('span', { class: 'badge ok' }, 'تمت القراءة'))))) : [empty('لا توجد قصص بعد')]);
}
export default async function () {
  return { title: 'مكتبة القراءة', node: h('div', { class: 'container page' }, h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'مكتبة القراءة'), h('p', {}, 'قصص مدرّجة بحسب المستوى، بترجمة وقاموس بالنقر.'))), await readingView(store.user ? '/app/reading' : '/login?next=/app/reading')) };
}
