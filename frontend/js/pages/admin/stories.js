import { h } from '../../ui.js';
import { resourcePage } from '../../components/resource.js';
import { lookups, STATUS_OPTS, statusBadge } from '../../lib/lookups.js';

export default async function () {
  const L = await lookups(true);
  return { title: 'القصص', node: resourcePage({ title: 'القصص', sub: 'مكتبة القراءة المدرّجة.', path: 'stories', sort: 'id', wide: true, defaults: { status: 'draft', stage: 'A1.1', minutes: 5, body: '[{"es":"Hola.","ar":"مرحباً."}]', glossary: '{"hola":"مرحباً"}' },
    filters: [{ key: 'status', label: 'الحالة', options: STATUS_OPTS }, { key: 'stage', label: 'المرحلة', options: L.stages }],
    columns: [{ key: 'title_ar', label: 'القصة', sortable: true, render: (s) => h('div', {}, h('b', {}, s.title_ar), h('div', { class: 'tiny muted es' }, s.title_es)) }, { key: 'stage', label: 'المرحلة', sortable: true, render: (s) => h('span', { class: 'badge es' }, s.stage) }, { key: 'category', label: 'التصنيف', sortable: true }, { key: 'minutes', label: 'دقائق', sortable: true }, { key: 'status', label: 'الحالة', sortable: true, render: (s) => { const [k, t] = statusBadge(s.status); return h('span', { class: 'badge ' + k }, t); } }],
    fields: () => [{ name: 'title_ar', label: 'العنوان بالعربية', required: true }, { name: 'title_es', label: 'العنوان بالإسبانية', dir: 'ltr' }, { name: 'slug', label: 'المعرّف', dir: 'ltr' }, { name: 'category', label: 'التصنيف' }, { name: 'stage', label: 'المرحلة', type: 'select', options: L.stages }, { name: 'minutes', label: 'المدة', type: 'number', min: 1 }, { name: 'status', label: 'الحالة', type: 'select', options: STATUS_OPTS },
      { name: 'cover', label: 'صورة الغلاف (اختياري)', type: 'image', full: true }, { name: 'body', label: 'الفقرات (JSON: [{es, ar}])', type: 'textarea', code: true, full: true, rows: 8 }, { name: 'glossary', label: 'المسرد (JSON: {كلمة: معنى})', type: 'textarea', code: true, full: true, rows: 4 }] }) };
}
