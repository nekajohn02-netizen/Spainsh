import { h } from '../../ui.js';
import { store } from '../../store.js';
export default async function () {
  const A = store.site.about, img = store.site.images.about;
  return { title: A.title, node: h('div', { class: 'container page' }, h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, A.title), h('p', {}, A.subtitle))),
    img && h('img', { class: 'about-img', src: img, alt: '' }), h('div', { class: 'card' }, A.body.split('\n').filter(Boolean).map((p) => h('p', {}, p)))) };
}
