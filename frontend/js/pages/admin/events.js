import { h } from '../../ui.js';
import { resourcePage } from '../../components/resource.js';
import { STATUS_OPTS, statusBadge } from '../../lib/lookups.js';
import { fmtDateTime } from '../../lib/format.js';

export default function () {
  return { title: 'الفعاليات الأسبوعية', node: resourcePage({ title: 'الفعاليات الأسبوعية', sub: 'فعالية محدودة بمدة لها لوحة صدارة خاصة بها، تُحسب من نشاط المشاركين خلال فترة الفعالية فقط.', path: 'events', sort: 'starts_at',
    defaults: { status: 'draft' },
    filters: [{ key: 'status', label: 'الحالة', options: STATUS_OPTS }],
    columns: [{ key: 'title_ar', label: 'الفعالية', sortable: true, render: (e) => h('div', {}, h('b', {}, e.title_ar), h('div', { class: 'tiny muted es' }, e.title_es)) },
      { key: 'starts_at', label: 'البداية', sortable: true, render: (e) => fmtDateTime(e.starts_at) }, { key: 'ends_at', label: 'النهاية', sortable: true, render: (e) => fmtDateTime(e.ends_at) },
      { key: 'status', label: 'الحالة', sortable: true, render: (e) => { const [k, t] = statusBadge(e.status); return h('span', { class: 'badge ' + k }, t); } }],
    fields: () => [{ name: 'title_ar', label: 'العنوان بالعربية', required: true }, { name: 'title_es', label: 'العنوان بالإسبانية', dir: 'ltr' }, { name: 'slug', label: 'المعرّف', dir: 'ltr' },
      { name: 'starts_at', label: 'بداية الفعالية', type: 'datetime', required: true }, { name: 'ends_at', label: 'نهاية الفعالية', type: 'datetime', required: true },
      { name: 'points_note', label: 'ملاحظة عن النقاط/التقييم (نص حر)', hint: 'مثل: نقطة واحدة لكل سؤال صحيح، وجائزة لأول 3 متصدّرين' }, { name: 'status', label: 'الحالة', type: 'select', options: STATUS_OPTS },
      { name: 'description', label: 'الوصف', type: 'textarea', full: true, rows: 3 }] }) };
}
