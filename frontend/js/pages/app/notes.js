import { h, ic, empty, toast } from '../../ui.js';
import { api } from '../../api.js';
import { pageHead } from '../../components/layouts.js';
import { ago } from '../../lib/format.js';

export default async function () {
  let { notes } = await api.get('/api/notes'); let q = ''; const list = h('div', { class: 'grid' });
  const paint = () => { const v = notes.filter((n) => !q || n.body.toLowerCase().includes(q) || (n.lesson || '').includes(q));
    list.replaceChildren(...(v.length ? v.map((n) => h('article', { class: 'card note-card' }, h('p', { style: { margin: 0 } }, n.body), h('div', { class: 'row' }, n.slug ? h('a', { class: 'badge info', href: '/app/lesson/' + n.slug }, n.lesson) : h('span', { class: 'badge' }, 'عامة'), h('span', { class: 'tiny muted' }, ago(n.at)), h('span', { class: 'spacer' }),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تعديل', onclick: async () => { const t = prompt2(n.body); if (t) { await api.patch('/api/notes/' + n.id, { body: t }); n.body = t; paint(); } } }, ic('edit')), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'حذف', onclick: async () => { await api.delete('/api/notes/' + n.id); notes = notes.filter((x) => x.id !== n.id); paint(); } }, ic('trash'))))) : [empty('لا ملاحظات', 'أضف ملاحظات من داخل أي درس.')])); };
  const prompt2 = (cur) => window.prompt ? (window.prompt('عدّل الملاحظة', cur) || '').trim() : '';
  const add = h('div', { class: 'card' }, h('textarea', { class: 'input', id: 'nn', rows: 2, placeholder: 'ملاحظة عامة جديدة…', 'aria-label': 'ملاحظة جديدة' }), h('div', { style: { 'margin-top': '.6rem' } }, h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: async () => { const el = document.getElementById('nn'), t = el.value.trim(); if (!t) return; const r = await api.post('/api/notes', { body: t }); notes.unshift({ id: r.id, body: t, at: Date.now() }); el.value = ''; toast('تم الحفظ'); paint(); } }, ic('plus'), 'حفظ')));
  paint();
  return { title: 'ملاحظاتي', node: h('div', {}, pageHead('ملاحظاتي', 'كل ملاحظاتك في مكان واحد.'), add, h('div', { style: { height: '1rem' } }), h('input', { class: 'input', type: 'search', placeholder: 'ابحث في الملاحظات…', 'aria-label': 'بحث', style: { 'max-width': '320px', 'margin-bottom': '1rem' }, oninput: (e) => { q = e.target.value.trim().toLowerCase(); paint(); } }), list) };
}
