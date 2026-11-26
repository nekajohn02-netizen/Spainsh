import { h } from '../../ui.js';
import { dataTable } from '../../components/datatable.js';
import { pageHead } from '../../components/layouts.js';
import { fmtDateTime } from '../../lib/format.js';
import { store } from '../../store.js';

export default async function () {
  if (store.user.role !== 'admin') return { title: 'سجل التدقيق', node: h('div', { class: 'card empty' }, 'هذه الصفحة للمدير فقط') };
  const dt = dataTable({ url: '/api/admin/audit', sort: 'id', size: 25, columns: [{ key: 'at', label: 'الوقت', sortable: true, render: (r) => fmtDateTime(r.at) }, { key: 'name', label: 'المستخدم', render: (r) => r.name || '—' }, { key: 'action', label: 'الإجراء', sortable: true, render: (r) => h('code', { dir: 'ltr' }, r.action) }, { key: 'ip', label: 'IP', render: (r) => h('span', { dir: 'ltr' }, r.ip) }] });
  return { title: 'سجل التدقيق', node: h('div', {}, pageHead('سجل التدقيق', 'كل العمليات الحساسة على المنصة.'), dt.node) };
}
