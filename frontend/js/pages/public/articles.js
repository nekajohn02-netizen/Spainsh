import { h, empty, setTitle } from '../../ui.js';
import { api } from '../../api.js';
import { ago } from '../../lib/format.js';

export async function articlesView() {
  const { articles } = await api.get('/api/articles');
  return h('div', { class: 'grid cgrid' }, articles.length ? articles.map((a) => h('a', { class: 'card hover ccard', href: '/articles/' + a.slug },
    h('div', { class: 'cover' }, a.cover && h('img', { src: a.cover, alt: '', loading: 'lazy' })),
    h('div', { class: 'body' }, h('h3', {}, a.title_ar), a.title_es && h('small', { class: 'es muted' }, a.title_es), h('p', { class: 'muted' }, a.excerpt),
      h('div', { class: 'meta' }, a.category && h('span', { class: 'badge' }, a.category), h('span', { class: 'tiny muted' }, ago(a.published_at)))))) : [empty('لا توجد مقالات بعد')]);
}
export default async function () {
  setTitle('المقالات');
  return { title: 'المقالات', node: h('div', { class: 'container page' }, h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'المقالات'), h('p', {}, 'نصائح وقواعد وثقافة حول تعلّم الإسبانية.'))), await articlesView()) };
}
