import { h, ic, toast } from '../../ui.js';
import { api } from '../../api.js';
import { buildForm } from '../../components/form.js';
import { openModal, confirmBox } from '../../components/modal.js';
import { pageHead } from '../../components/layouts.js';
import { actionBtn } from '../../components/datatable.js';
import { refresh, navigate } from '../../router.js';
import { statusBadge } from '../../lib/lookups.js';

export default async function ({ params }) {
  const { row: course } = await api.get('/api/admin/courses/' + params.id);
  const [mods, lessons] = await Promise.all([api.get(`/api/admin/modules?course_id=${params.id}&size=100&sort=ord&dir=asc`), api.get(`/api/admin/lessons?course_id=${params.id}&size=100&sort=ord&dir=asc`)]);
  const modForm = (m) => { const f = buildForm([{ name: 'title_ar', label: 'عنوان الوحدة', required: true, full: true }, { name: 'ord', label: 'الترتيب', type: 'number', min: 0 }], m || { ord: mods.rows.length + 1 });
    openModal({ title: m ? 'تعديل الوحدة' : 'وحدة جديدة', body: f.root, footer: (close) => [h('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'إلغاء'), h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => { if (!f.valid()) return; const data = { ...f.read(), course_id: params.id }; try { if (m) await api.put('/api/admin/modules/' + m.id, data); else await api.post('/api/admin/modules', data); close(); refresh(); } catch (e) { toast(e.message, true); } } }, 'حفظ')] }); };
  const lessonRow = (l) => h('div', { class: 'list-item' }, h('a', { href: '/admin/lessons/' + l.id }, h('b', {}, l.title_ar)), h('span', { class: 'badge es' }, l.stage), h('span', { class: 'badge ' + statusBadge(l.status)[0] }, statusBadge(l.status)[1]), h('span', { class: 'badge' }, `${l.questions} أسئلة`), h('span', { class: 'spacer' }), actionBtn('edit', 'تحرير الدرس', () => navigate('/admin/lessons/' + l.id)));
  const orphan = lessons.rows.filter((l) => !l.module_id);
  return { title: course.title_ar, node: h('div', {}, pageHead(course.title_ar, 'الوحدات والدروس داخل المقرر.', h('a', { class: 'btn btn-ghost', href: '/admin/courses' }, 'كل المقررات'), h('a', { class: 'btn btn-primary', href: '/admin/lessons/new?course=' + course.id }, ic('plus'), 'درس جديد'), h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => modForm(null) }, ic('plus'), 'وحدة جديدة')),
    mods.rows.length ? mods.rows.map((m) => h('section', { class: 'card', style: { 'margin-bottom': '1rem' } }, h('div', { class: 'row' }, h('h3', { style: { margin: 0 } }, `${m.ord}. ${m.title_ar}`), h('span', { class: 'spacer' }), actionBtn('edit', 'تعديل', () => modForm(m)), actionBtn('trash', 'حذف', async () => { if (await confirmBox('حذف الوحدة؟ ستبقى دروسها بدون وحدة.', { danger: true })) { await api.delete('/api/admin/modules/' + m.id); refresh(); } }, true)),
      h('div', { class: 'list', style: { 'margin-top': '.8rem' } }, lessons.rows.filter((l) => l.module_id === m.id).map(lessonRow)))) : h('div', { class: 'card empty' }, 'لا وحدات بعد، أنشئ أول وحدة.'),
    orphan.length ? h('section', { class: 'card' }, h('h3', {}, 'دروس بدون وحدة'), h('div', { class: 'list' }, orphan.map(lessonRow))) : null) };
}
