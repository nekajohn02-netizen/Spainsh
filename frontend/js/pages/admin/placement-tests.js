import { h } from '../../ui.js';
import { resourcePage } from '../../components/resource.js';
import { lookups, STATUS_OPTS, statusBadge } from '../../lib/lookups.js';

export default async function () {
  const L = await lookups(true);
  return { title: 'اختبارات تحديد المستوى', node: resourcePage({ title: 'اختبارات تحديد المستوى', sub: 'عرّف اختباراً لمرحلة واحدة (A1.1) أو مستوى كامل (A1.1,A1.2,A1.3) أو عدة مستويات معاً (A1.1,A1.2,A1.3,A2.1,A2.2,A2.3).', path: 'placement-tests', sort: 'ord',
    defaults: { status: 'published', ord: 10 },
    filters: [{ key: 'status', label: 'الحالة', options: STATUS_OPTS }],
    columns: [{ key: 'title_ar', label: 'الاختبار', sortable: true, render: (t) => h('div', {}, h('b', {}, t.title_ar), h('div', { class: 'tiny muted es' }, t.title_es)) }, { key: 'stages', label: 'النطاق', render: (t) => h('code', { dir: 'ltr' }, t.stages) }, { key: 'ord', label: 'الترتيب', sortable: true }, { key: 'status', label: 'الحالة', sortable: true, render: (t) => { const [k, s] = statusBadge(t.status); return h('span', { class: 'badge ' + k }, s); } }],
    fields: () => [{ name: 'title_ar', label: 'العنوان بالعربية', required: true }, { name: 'title_es', label: 'العنوان بالإسبانية', dir: 'ltr' },
      { name: 'stages', label: 'أكواد المراحل المشمولة (مفصولة بفواصل)', dir: 'ltr', required: true, hint: 'مثال: A1.1,A1.2,A1.3 — الأكواد المتاحة: ' + L.stages.map((s) => s[0]).join('، '), full: true },
      { name: 'ord', label: 'الترتيب', type: 'number', min: 0 }, { name: 'status', label: 'الحالة', type: 'select', options: STATUS_OPTS }] }) };
}
