import { h, empty } from '../../ui.js';
import { api } from '../../api.js';
import { pageHead } from '../../components/layouts.js';
import { fmtDateTime } from '../../lib/format.js';

export default async function () {
  const { rows } = await api.get('/api/admin/outbox');
  return { title: 'البريد التجريبي', node: h('div', {}, pageHead('صندوق البريد التجريبي', 'رسائل النظام (ترحيب، استعادة كلمة المرور). في الإنتاج تُرسل عبر مزوّد بريد.'),
    rows.length ? h('div', { class: 'grid' }, rows.map((m) => h('article', { class: 'card' }, h('div', { class: 'row' }, h('b', {}, m.subject), h('span', { class: 'spacer' }), h('small', { class: 'muted' }, fmtDateTime(m.at))), h('p', { class: 'muted', dir: 'ltr' }, m.to_email), h('pre', { style: { 'white-space': 'pre-wrap', margin: 0, 'font-family': 'inherit' } }, m.body)))) : empty('لا رسائل')) };
}
