import { h, toast, ic } from '../../ui.js';
import { api } from '../../api.js';
import { store, theme } from '../../store.js';
import { navigate } from '../../router.js';
import { buildForm } from '../../components/form.js';
import { openModal } from '../../components/modal.js';
import { pageHead } from '../../components/layouts.js';
import { fmtDateTime } from '../../lib/format.js';

async function security() {
  const { sessions, logins } = await api.get('/api/auth/sessions');
  const f = buildForm([{ name: 'current', label: 'كلمة المرور الحالية', type: 'password', required: true, full: true }, { name: 'password', label: 'كلمة المرور الجديدة', type: 'password', required: true, hint: '10 أحرف على الأقل مع حروف وأرقام' }, { name: 'confirm', label: 'تأكيد الجديدة', type: 'password', required: true }]);
  const list = h('div', { class: 'list' });
  const paint = () => list.replaceChildren(...sessions.map((s) => h('div', { class: 'list-item' }, ic('shield'), h('div', { style: { flex: 1 } }, h('b', { dir: 'ltr' }, (s.ua || 'جهاز غير معروف').slice(0, 60)), h('div', { class: 'tiny muted' }, 'آخر نشاط: ' + fmtDateTime(s.last_seen))), s.current ? h('span', { class: 'badge ok' }, 'هذا الجهاز') : h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => { await api.post('/api/auth/sessions/revoke', { id: s.id }); sessions.splice(sessions.indexOf(s), 1); paint(); toast('تم إنهاء الجلسة'); } }, 'إنهاء'))));
  paint();
  return h('div', { class: 'grid' }, h('section', { class: 'card' }, h('h3', {}, 'تغيير كلمة المرور'), f.root, h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => { if (!f.valid()) return; const v = f.read(); if (v.password !== v.confirm) return toast('كلمتا المرور غير متطابقتين', true); try { await api.post('/api/auth/change-password', { current: v.current, password: v.password }); toast('تم تغيير كلمة المرور'); f.root.reset(); } catch (e) { toast(e.message, true); } } }, 'تغيير')),
    h('section', { class: 'card' }, h('h3', {}, 'الجلسات النشطة'), list, h('div', { style: { 'margin-top': '1rem' } }, h('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => { await api.post('/api/auth/logout-all'); store.user = null; navigate('/login'); } }, 'تسجيل الخروج من كل الأجهزة'))),
    h('section', { class: 'card' }, h('h3', {}, 'آخر عمليات الدخول'), h('div', { class: 'list' }, logins.map((l) => h('div', { class: 'list-item' }, fmtDateTime(l.at), h('span', { class: 'spacer' }), h('small', { dir: 'ltr', class: 'muted' }, l.ip))))));
}
async function privacy() {
  const del = () => { const f = buildForm([{ name: 'password', label: 'أدخل كلمة المرور للتأكيد', type: 'password', required: true, full: true }]);
    openModal({ title: 'حذف الحساب نهائياً', body: h('div', {}, h('div', { class: 'callout warn' }, 'سيتم حذف حسابك وكل بياناتك وتقدّمك نهائياً ولا يمكن التراجع.'), f.root),
      footer: (close) => [h('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'إلغاء'), h('button', { class: 'btn btn-danger', type: 'button', onclick: async () => { try { await api.post('/api/profile/delete', f.read()); store.user = null; close(); toast('تم حذف الحساب'); navigate('/'); } catch (e) { toast(e.message, true); } } }, 'احذف حسابي')] }); };
  return h('div', { class: 'grid' }, h('section', { class: 'card' }, h('h3', {}, 'تصدير بياناتي'), h('p', { class: 'muted' }, 'نزّل نسخة JSON من تقدّمك ومفرداتك وملاحظاتك وشهاداتك.'),
    h('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => { const d = await api.get('/api/profile/export'); const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })), download: 'my-data.json', target: '_blank' }); document.body.append(a); a.click(); a.remove(); } }, ic('down'), 'تنزيل البيانات')),
    h('section', { class: 'card' }, h('h3', { style: { color: 'var(--bad)' } }, 'منطقة الخطر'), h('p', { class: 'muted' }, 'حذف الحساب نهائي.'), h('button', { class: 'btn btn-danger', type: 'button', onclick: del }, ic('trash'), 'حذف الحساب')));
}
function appearance() {
  const b = h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { theme.toggle(); b.textContent = theme.current() === 'dark' ? 'الوضع الداكن مفعّل، بدّل للفاتح' : 'الوضع الفاتح مفعّل، بدّل للداكن'; } }, theme.current() === 'dark' ? 'الوضع الداكن مفعّل، بدّل للفاتح' : 'الوضع الفاتح مفعّل، بدّل للداكن');
  return h('section', { class: 'card' }, h('h3', {}, 'المظهر'), h('p', { class: 'muted' }, 'اختر الوضع الأنسب لعينيك. يُحفظ اختيارك على هذا الجهاز.'), b);
}
export default async function () {
  const tabs = [['security', 'الأمان', security], ['privacy', 'الخصوصية والبيانات', privacy], ['look', 'المظهر', async () => appearance()]], body = h('div'), bar = h('div', { class: 'tabs', role: 'tablist' });
  const show = async (i) => { bar.replaceChildren(...tabs.map(([, t], j) => h('button', { role: 'tab', 'aria-selected': String(i === j), onclick: () => show(j) }, t))); body.replaceChildren(await tabs[i][2]()); };
  await show(0);
  return { title: 'الإعدادات', node: h('div', {}, pageHead('الإعدادات والأمان'), bar, body) };
}
