import { h, ic, toast, avatar } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { dataTable, actionBtn } from '../../components/datatable.js';
import { buildForm } from '../../components/form.js';
import { openModal } from '../../components/modal.js';
import { pageHead } from '../../components/layouts.js';
import { fmtDate, ago } from '../../lib/format.js';

const ROLES = [['student', 'طالب'], ['instructor', 'مدرّس'], ['admin', 'مدير']];
export default async function () {
  if (store.user.role !== 'admin') return { title: 'المستخدمون', node: h('div', { class: 'card empty' }, 'هذه الصفحة للمدير فقط') };
  const detail = async (u) => { const d = await api.get('/api/admin/users/' + u.id);
    openModal({ title: d.user.name, wide: true, body: h('div', { class: 'grid' }, h('div', { class: 'row' }, avatar(d.user.name, 20, 'lg'), h('div', {}, h('p', { dir: 'ltr', style: { margin: 0 } }, d.user.email), h('p', { class: 'muted', style: { margin: 0 } }, `${d.user.xp} XP · المرحلة ${d.user.stage} · انضم ${fmtDate(d.user.created_at)}`))),
      h('h4', {}, 'المقررات'), d.courses.length ? d.courses.map((c) => h('div', { class: 'list-item' }, c.title_ar, h('span', { class: 'spacer' }), c.completed_at ? h('span', { class: 'badge ok' }, 'مكتمل') : h('span', { class: 'badge' }, 'جارٍ'))) : h('p', { class: 'muted' }, 'لا مقررات'),
      h('h4', {}, 'آخر المحاولات'), d.attempts.length ? d.attempts.map((a) => h('div', { class: 'list-item' }, a.title_ar, h('span', { class: 'spacer' }), h('b', {}, `${a.score}/${a.total}`), h('small', { class: 'muted' }, ago(a.at)))) : h('p', { class: 'muted' }, 'لا محاولات')) }); };
  const edit = (u, reload) => { const f = buildForm([{ name: 'role', label: 'الدور', type: 'select', options: ROLES }, { name: 'status', label: 'الحالة', type: 'select', options: [['active', 'نشط'], ['suspended', 'موقوف']] }, { name: 'stage', label: 'المرحلة', dir: 'ltr', hint: 'مثل A1.2' }], u);
    openModal({ title: 'تعديل ' + u.name, body: f.root, footer: (close) => [h('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'إلغاء'), h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => { try { await api.patch('/api/admin/users/' + u.id, f.read()); toast('تم الحفظ'); close(); reload(); } catch (e) { toast(e.message, true); } } }, 'حفظ')] }); };
  const resetPw = (u) => { const f = buildForm([{ name: 'password', label: 'كلمة مرور جديدة', type: 'password', required: true, full: true, hint: '10 أحرف على الأقل مع حروف وأرقام' }]);
    openModal({ title: 'إعادة تعيين كلمة المرور: ' + u.name, body: f.root, footer: (close) => [h('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'إلغاء'), h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => { try { await api.post(`/api/admin/users/${u.id}/reset-password`, f.read()); toast('تم التغيير وإنهاء جلساته'); close(); } catch (e) { toast(e.message, true); } } }, 'تعيين')] }); };
  const create = (reload) => { const f = buildForm([{ name: 'name', label: 'الاسم', required: true }, { name: 'email', label: 'البريد', type: 'email', required: true, dir: 'ltr' }, { name: 'password', label: 'كلمة المرور', type: 'password', required: true }, { name: 'role', label: 'الدور', type: 'select', options: ROLES }]);
    openModal({ title: 'مستخدم جديد', body: f.root, footer: (close) => [h('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'إلغاء'), h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => { if (!f.valid()) return; try { await api.post('/api/admin/users', f.read()); toast('تم إنشاء المستخدم'); close(); reload(); } catch (e) { toast(e.message, true); } } }, 'إنشاء')] }); };
  let dt;
  dt = dataTable({ url: '/api/admin/users', sort: 'id', filters: [{ key: 'role', label: 'الدور', options: ROLES }, { key: 'status', label: 'الحالة', options: [['active', 'نشط'], ['suspended', 'موقوف']] }],
    columns: [{ key: 'name', label: 'المستخدم', sortable: true, render: (u) => h('div', { class: 'row' }, avatar(u.name, u.hue), h('div', {}, h('b', {}, u.name), h('div', { class: 'tiny muted', dir: 'ltr' }, u.email))) },
      { key: 'role', label: 'الدور', sortable: true, render: (u) => h('span', { class: 'badge ' + (u.role === 'admin' ? 'bad' : u.role === 'instructor' ? 'info' : '') }, ROLES.find((r) => r[0] === u.role)[1]) },
      { key: 'status', label: 'الحالة', sortable: true, render: (u) => h('span', { class: 'badge ' + (u.status === 'active' ? 'ok' : 'warn') }, u.status === 'active' ? 'نشط' : 'موقوف') },
      { key: 'stage', label: 'المرحلة', sortable: true, render: (u) => h('span', { class: 'es' }, u.stage) }, { key: 'xp', label: 'XP', sortable: true }, { key: 'courses', label: 'مقررات' }, { key: 'passed', label: 'دروس مجتازة' },
      { key: 'last_login', label: 'آخر دخول', sortable: true, render: (u) => (u.last_login ? ago(u.last_login) : '—') }, { key: 'created_at', label: 'الانضمام', sortable: true, render: (u) => fmtDate(u.created_at) }],
    bulk: [{ label: 'إيقاف', danger: true, confirm: 'إيقاف {n} حساب؟', run: async (ids) => { const r = await api.post('/api/admin/users/bulk', { ids, action: 'suspend' }); return { message: `تم إيقاف ${r.affected}` }; } }, { label: 'تفعيل', run: async (ids) => { const r = await api.post('/api/admin/users/bulk', { ids, action: 'activate' }); return { message: `تم تفعيل ${r.affected}` }; } }],
    toolbar: h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: () => create(() => dt.reload()) }, ic('plus'), 'مستخدم جديد'),
    actions: (u, reload) => [actionBtn('eye', 'تفاصيل', () => detail(u)), actionBtn('edit', 'تعديل', () => edit(u, reload)), actionBtn('lock', 'كلمة المرور', () => resetPw(u))] });
  return { title: 'المستخدمون', node: h('div', {}, pageHead('المستخدمون', 'إدارة الحسابات والأدوار.'), dt.node) };
}
