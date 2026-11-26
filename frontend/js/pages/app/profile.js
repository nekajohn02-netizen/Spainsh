import { h, toast, avatar, ring } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { refresh } from '../../router.js';
import { buildForm } from '../../components/form.js';
import { pageHead } from '../../components/layouts.js';
import { fmtDate } from '../../lib/format.js';

export default async function () {
  const { profile: p } = await api.get('/api/profile');
  const f = buildForm([{ name: 'name', label: 'الاسم', required: true }, { name: 'goalMin', label: 'هدف الدراسة اليومي (دقائق)', type: 'number', min: 5, max: 240 },
    { name: 'hue', label: 'لون الصورة الرمزية', type: 'number', min: 0, max: 360, hint: 'رقم من 0 إلى 360' }, { name: 'timezone', label: 'المنطقة الزمنية', dir: 'ltr' },
    { name: 'bio', label: 'نبذة عنك', type: 'textarea', full: true, rows: 3 }, { name: 'publicProfile', label: 'إظهار ملفي في لوحة الصدارة', type: 'checkbox', full: true }], p);
  const preview = h('div', { class: 'center' });
  const paintPreview = () => preview.replaceChildren(avatar(f.inputs.name.value || p.name, f.inputs.hue.value, 'lg'));
  f.inputs.hue.addEventListener('input', paintPreview); f.inputs.name.addEventListener('input', paintPreview); paintPreview();
  const save = h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => { if (!f.valid()) return; try { await api.patch('/api/profile', f.read()); const v = f.read(); store.user.name = v.name; store.user.hue = +v.hue; toast('تم حفظ الملف الشخصي'); refresh(); } catch (e) { toast(e.message, true); } } }, 'حفظ التغييرات');
  return { title: 'الملف الشخصي', node: h('div', {}, pageHead('الملف الشخصي', 'بياناتك وتفضيلات التعلّم.'),
    h('div', { class: 'dash' }, h('section', { class: 'card center' }, preview, h('h3', { style: { 'margin-top': '1rem' } }, p.name), h('p', { class: 'muted', dir: 'ltr' }, p.email), h('div', { class: 'pill-row', style: { 'justify-content': 'center' } }, h('span', { class: 'badge info' }, `المستوى ${p.level}`), h('span', { class: 'badge es' }, p.stage), h('span', { class: 'badge' }, `${p.xp} XP`)),
      h('p', { class: 'muted small' }, 'عضو منذ ' + fmtDate(p.joined)), p.placementStage && h('p', { class: 'muted small' }, 'تقدير تحديد المستوى: ', h('b', { class: 'es' }, p.placementStage))),
      h('section', { class: 'card w8' }, h('h3', {}, 'تعديل البيانات'), f.root, save))) };
}
