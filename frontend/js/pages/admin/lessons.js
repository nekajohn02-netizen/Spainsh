import { h, ic, toast } from '../../ui.js';
import { api } from '../../api.js';
import { dataTable, actionBtn } from '../../components/datatable.js';
import { confirmBox } from '../../components/modal.js';
import { pageHead } from '../../components/layouts.js';
import { lookups, STATUS_OPTS, statusBadge } from '../../lib/lookups.js';
import { navigate } from '../../router.js';
import { ago } from '../../lib/format.js';

export default async function () {
  const L = await lookups(true), setStatus = (status) => ({ label: status === 'published' ? 'نشر' : status === 'draft' ? 'تحويل لمسودة' : 'أرشفة', run: async (ids) => { const r = await api.post('/api/admin/lessons/bulk-status', { ids, status }); return { message: `تم تحديث ${r.affected}` }; } });
  const dt = dataTable({ url: '/api/admin/lessons', sort: 'updated_at',
    filters: [{ key: 'status', label: 'الحالة', options: STATUS_OPTS }, { key: 'stage', label: 'المرحلة', options: L.stages }, { key: 'track', label: 'المسار', options: L.tracks }],
    columns: [{ key: 'title_ar', label: 'الدرس', sortable: true, render: (l) => h('a', { href: '/admin/lessons/' + l.id }, h('b', {}, l.title_ar), h('div', { class: 'tiny muted es' }, l.title_es)) }, { key: 'stage', label: 'المرحلة', sortable: true, render: (l) => h('span', { class: 'badge es' }, l.stage) }, { key: 'track', label: 'المسار', sortable: true },
      { key: 'questions', label: 'أسئلة', render: (l) => (l.questions ? l.questions : h('span', { class: 'badge warn' }, '0')) }, { key: 'minutes', label: 'دقائق', sortable: true }, { key: 'version', label: 'إصدار', render: (l) => 'v' + l.version },
      { key: 'status', label: 'الحالة', sortable: true, render: (l) => { const [k, t] = statusBadge(l.status); return h('span', { class: 'badge ' + k }, t); } }, { key: 'updated_at', label: 'التحديث', sortable: true, render: (l) => ago(l.updated_at) }],
    bulk: [setStatus('published'), setStatus('draft'), setStatus('archived'), { label: 'حذف', danger: true, confirm: 'حذف {n} درس نهائياً مع تقدّم الطلاب فيها؟', run: async (ids) => { const r = await api.post('/api/admin/lessons/bulk-delete', { ids }); return { message: `تم حذف ${r.deleted}` }; } }],
    toolbar: h('a', { class: 'btn btn-primary btn-sm', href: '/admin/lessons/new' }, ic('plus'), 'درس جديد'),
    actions: (l, reload) => [actionBtn('help', 'الأسئلة', () => navigate('/admin/questions?lesson=' + l.id)), actionBtn('edit', 'تحرير', () => navigate('/admin/lessons/' + l.id)), actionBtn('eye', 'معاينة كطالب', () => navigate('/app/lesson/' + l.slug))] });
  return { title: 'الدروس', node: h('div', {}, pageHead('الدروس', 'أنشئ الدروس وانشرها وتابع إصداراتها.'), dt.node) };
}
