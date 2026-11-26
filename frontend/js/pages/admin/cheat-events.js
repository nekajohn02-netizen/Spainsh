import { h } from '../../ui.js';
import { dataTable } from '../../components/datatable.js';
import { pageHead } from '../../components/layouts.js';
import { fmtDateTime } from '../../lib/format.js';

const KIND_AR = { blur: 'فقدان تركيز النافذة', visibility: 'تبديل التبويب', paste: 'محاولة لصق', copy: 'محاولة نسخ', devtools: 'احتمال فتح أدوات المطوّر' };

export default async function () {
  const dt = dataTable({ url: '/api/admin/cheat-events', sort: 'id', size: 25, columns: [
    { key: 'at', label: 'الوقت', sortable: true, render: (r) => fmtDateTime(r.at) },
    { key: 'name', label: 'الطالب', render: (r) => r.name || '—' },
    { key: 'lesson', label: 'الدرس', render: (r) => r.lesson || '—' },
    { key: 'kind', label: 'النوع', sortable: true, render: (r) => KIND_AR[r.kind] || r.kind },
  ] });
  return { title: 'سجل الاختبارات المشبوهة', node: h('div', {}, pageHead('سجل الاختبارات المشبوهة', 'سلوك مرصود أثناء حل الاختبارات الموقوتة (تبديل تبويب، لصق، نسخ…)، للمراجعة فقط وليس إثباتاً قاطعاً على الغش.'), dt.node) };
}
