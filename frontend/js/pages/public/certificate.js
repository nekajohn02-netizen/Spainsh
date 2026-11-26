import { h, ic } from '../../ui.js';
import { api } from '../../api.js';
import { fmtDate } from '../../lib/format.js';
export default async function ({ params }) {
  const { certificate: c } = await api.get('/api/certificates/' + params.code);
  return { title: 'شهادة إتمام', node: h('div', { class: 'container page' }, h('div', { class: 'cert' }, h('div', { class: 'ic' }, ic('award')), h('h1', {}, 'شهادة إتمام مقرر'), h('p', { class: 'muted' }, 'تشهد أكاديميا إسبانيولا بأن'), h('div', { class: 'name' }, c.name), h('p', {}, 'أتمّ بنجاح مقرر'), h('h2', {}, c.course), h('p', { class: 'es' }, c.title_es),
    h('p', { class: 'muted' }, `المرحلة ${c.stage} · ${c.hours} ساعة تقديرية · ${fmtDate(c.issued_at)}`), h('p', { class: 'badge ok' }, 'رقم التحقق: ' + c.code), h('p', { class: 'muted small' }, 'شهادة داخلية للمنصة، وليست شهادة CEFR أو اعتماداً أكاديمياً رسمياً.'),
    h('button', { class: 'btn btn-primary no-print', type: 'button', onclick: () => print() }, ic('print'), 'طباعة'))) };
}
