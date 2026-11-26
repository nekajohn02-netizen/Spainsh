import { h, ic } from '../../ui.js';
import { api } from '../../api.js';
import { dataTable, actionBtn } from '../../components/datatable.js';
import { pageHead } from '../../components/layouts.js';
import { STATUS_OPTS, statusBadge } from '../../lib/lookups.js';
import { navigate } from '../../router.js';
import { ago } from '../../lib/format.js';

export default async function () {
  const dt = dataTable({ url: '/api/admin/articles', sort: 'updated_at',
    filters: [{ key: 'status', label: 'الحالة', options: STATUS_OPTS }],
    columns: [{ key: 'title_ar', label: 'المقال', sortable: true, render: (a) => h('a', { href: '/admin/articles/' + a.id }, h('b', {}, a.title_ar), h('div', { class: 'tiny muted es' }, a.title_es)) },
      { key: 'category', label: 'التصنيف', sortable: true }, { key: 'status', label: 'الحالة', sortable: true, render: (a) => { const [k, t] = statusBadge(a.status); return h('span', { class: 'badge ' + k }, t); } },
      { key: 'updated_at', label: 'التحديث', sortable: true, render: (a) => ago(a.updated_at) }],
    bulk: [{ label: 'حذف', danger: true, confirm: 'حذف {n} مقال نهائياً؟', run: async (ids) => { const r = await api.post('/api/admin/articles/bulk-delete', { ids }); return { message: `تم حذف ${r.deleted}` }; } }],
    toolbar: h('a', { class: 'btn btn-primary btn-sm', href: '/admin/articles/new' }, ic('plus'), 'مقال جديد'),
    actions: (a, reload) => [actionBtn('edit', 'تحرير', () => navigate('/admin/articles/' + a.id)), actionBtn('eye', 'معاينة', () => navigate('/articles/' + a.slug))] });
  return { title: 'المقالات', node: h('div', {}, pageHead('المقالات', 'مجلة/بلوج عام للموقع — نصائح وقواعد وثقافة، منفصل عن الدروس والقصص.'), dt.node) };
}
