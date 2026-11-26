import { h } from '../../ui.js';
import { store } from '../../store.js';
export default async function () { return { title: 'الأسئلة الشائعة', node: h('div', { class: 'container page faq' }, h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'الأسئلة الشائعة'))), store.site.faq.filter((x) => x.visible).map((x) => h('details', {}, h('summary', {}, x.q), h('p', {}, x.a)))) }; }
