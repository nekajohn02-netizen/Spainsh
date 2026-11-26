import { h } from '../../ui.js';
import { resourcePage } from '../../components/resource.js';
import { switchCell } from '../../components/datatable.js';

export default function () {
  return { title: 'فريق العمل', node: resourcePage({ title: 'فريق العمل', sub: 'المدرّبون والقائمون على الأكاديمية. الصفحة العامة مخفية حالياً — فعّلها من إعدادات الموقع (الميزات) حين تكون جاهزة.', path: 'team', sort: 'ord',
    defaults: { ord: 10, visible: 1 },
    columns: [{ key: 'name', label: 'الاسم', sortable: true }, { key: 'role_ar', label: 'الصفة', sortable: true }, { key: 'email', label: 'البريد' }, { key: 'ord', label: 'الترتيب', sortable: true },
      { key: 'visible', label: 'ظاهر', sortable: true, render: (r) => switchCell(r, '/api/admin/team/' + r.id, 'visible') }],
    fields: () => [{ name: 'name', label: 'الاسم', required: true }, { name: 'role_ar', label: 'الصفة/الدور (مثل: مدرّب إسبانية)' }, { name: 'email', label: 'البريد (اختياري)', dir: 'ltr' },
      { name: 'photo', label: 'الصورة الشخصية (اختياري)', type: 'image' }, { name: 'cv_url', label: 'رابط السيرة الذاتية (اختياري)', dir: 'ltr' },
      { name: 'bio', label: 'نبذة', type: 'textarea', full: true, rows: 3 }, { name: 'ord', label: 'الترتيب', type: 'number', min: 0 }, { name: 'visible', label: 'ظاهر في الصفحة العامة', type: 'checkbox' }] }) };
}
