import { h, ic } from '../../ui.js';
import { resourcePage } from '../../components/resource.js';
import { actionBtn } from '../../components/datatable.js';
import { lookups, STATUS_OPTS, statusBadge } from '../../lib/lookups.js';
import { navigate } from '../../router.js';

export default async function () {
  const L = await lookups(true);
  return { title: 'المقررات', node: resourcePage({ title: 'المقررات', sub: 'أنشئ المقررات وأدِر وحداتها ودروسها.', path: 'courses', sort: 'created_at', defaults: { status: 'draft', hours: 10, color: '#d9461f', stage: 'A1.1', track: 'grammar' },
    filters: [{ key: 'status', label: 'الحالة', options: STATUS_OPTS }, { key: 'track', label: 'المسار', options: L.tracks }],
    columns: [{ key: 'title_ar', label: 'المقرر', sortable: true, render: (c) => h('div', {}, h('b', {}, c.title_ar), h('div', { class: 'tiny muted es' }, c.title_es)) }, { key: 'stage', label: 'المرحلة', sortable: true, render: (c) => h('span', { class: 'badge es' }, c.stage) }, { key: 'track', label: 'المسار', sortable: true },
      { key: 'lessons', label: 'الدروس' }, { key: 'students', label: 'الطلاب' }, { key: 'hours', label: 'الساعات', sortable: true }, { key: 'status', label: 'الحالة', sortable: true, render: (c) => { const [k, t] = statusBadge(c.status); return h('span', { class: 'badge ' + k }, t); } }],
    extraActions: (row) => [actionBtn('layers', 'إدارة الوحدات والدروس', () => navigate('/admin/courses/' + row.id))],
    fields: () => [{ name: 'title_ar', label: 'العنوان بالعربية', required: true }, { name: 'title_es', label: 'العنوان بالإسبانية', dir: 'ltr' }, { name: 'slug', label: 'المعرّف (slug)', dir: 'ltr', hint: 'يُولَّد تلقائياً إن تُرك فارغاً' }, { name: 'instructor', label: 'المدرّس' },
      { name: 'stage', label: 'المرحلة', type: 'select', options: L.stages }, { name: 'track', label: 'المسار', type: 'select', options: L.tracks }, { name: 'hours', label: 'الساعات التقديرية', type: 'number', min: 1 }, { name: 'color', label: 'اللون', type: 'color' },
      { name: 'status', label: 'الحالة', type: 'select', options: STATUS_OPTS }, { name: 'cover', label: 'صورة الغلاف (اختياري)', type: 'image', full: true }, { name: 'description', label: 'الوصف', type: 'textarea', full: true }] }) };
}
