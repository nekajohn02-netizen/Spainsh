import { h } from '../../ui.js';
import { resourcePage } from '../../components/resource.js';
import { lookups } from '../../lib/lookups.js';

export default async function () {
  const L = await lookups(true);
  return { title: 'المفردات', node: resourcePage({ title: 'قاموس المفردات', sub: 'القاموس الرسمي للمنصة (مستقل عن مفردات الطلاب).', path: 'vocab', sort: 'id', defaults: { gender: '', stage: 'A1.1' },
    filters: [{ key: 'stage', label: 'المرحلة', options: L.stages }],
    columns: [{ key: 'es', label: 'الإسبانية', sortable: true, render: (v) => h('b', { class: 'es' }, v.es) }, { key: 'ar', label: 'العربية', sortable: true }, { key: 'pos', label: 'النوع', sortable: true }, { key: 'gender', label: 'الجنس' }, { key: 'topic', label: 'الموضوع', sortable: true }, { key: 'stage', label: 'المرحلة', sortable: true, render: (v) => h('span', { class: 'es' }, v.stage || '—') }],
    fields: () => [{ name: 'es', label: 'الكلمة بالإسبانية', required: true, dir: 'ltr' }, { name: 'ar', label: 'المعنى بالعربية', required: true }, { name: 'pos', label: 'النوع (اسم/فعل/صفة…)' }, { name: 'gender', label: 'الجنس', type: 'select', options: [['', '—'], ['مذكر', 'مذكر'], ['مؤنث', 'مؤنث']] },
      { name: 'stage', label: 'المرحلة', type: 'select', options: L.stages }, { name: 'topic', label: 'الموضوع' }, { name: 'example', label: 'مثال بالإسبانية', dir: 'ltr', full: true }, { name: 'example_ar', label: 'ترجمة المثال', full: true }] }) };
}
