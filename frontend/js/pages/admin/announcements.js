import { h } from '../../ui.js';
import { resourcePage } from '../../components/resource.js';
import { fmtDate } from '../../lib/format.js';

export default async function () {
  const AUD = [['all', 'الجميع'], ['student', 'الطلاب'], ['instructor', 'المدرّسون'], ['admin', 'المديرون']];
  return { title: 'الإعلانات', node: resourcePage({ title: 'الإعلانات', sub: 'تظهر في لوحة الطالب وصفحة الإشعارات.', path: 'announcements', sort: 'id', defaults: { audience: 'all' },
    columns: [{ key: 'title', label: 'العنوان', sortable: true }, { key: 'body', label: 'النص', render: (a) => a.body.slice(0, 70) }, { key: 'audience', label: 'الجمهور', sortable: true, render: (a) => AUD.find((x) => x[0] === a.audience)?.[1] }, { key: 'at', label: 'التاريخ', sortable: true, render: (a) => fmtDate(a.at) }],
    fields: () => [{ name: 'title', label: 'العنوان', required: true, full: true }, { name: 'audience', label: 'الجمهور', type: 'select', options: AUD, full: true }, { name: 'body', label: 'النص', type: 'textarea', required: true, full: true }] }) };
}
