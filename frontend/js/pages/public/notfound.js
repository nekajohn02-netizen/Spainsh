import { h } from '../../ui.js';
export default async function () { return { title: 'غير موجود', node: h('div', { class: 'container page empty' }, h('div', { class: 'big-num es' }, '404'), h('p', {}, 'الصفحة التي تبحث عنها غير موجودة.'), h('a', { class: 'btn btn-primary', href: '/' }, 'العودة للرئيسية')) }; }
