import { h } from '../../ui.js';
import { field, errBox, authShell, submitAuth } from '../../components/authkit.js';
export const guest = true;
export default async function () {
  const err = errBox(), ok = h('div', { class: 'callout tip', hidden: true }), btn = h('button', { class: 'btn btn-primary btn-lg', style: { width: '100%' }, type: 'submit' }, 'أرسل رابط الاستعادة');
  const form = h('form', {}, err, ok, field('email', 'البريد الإلكتروني', { type: 'email', dir: 'ltr', autocomplete: 'email' }), btn);
  form.addEventListener('submit', (e) => { e.preventDefault(); submitAuth(btn, err, '/api/auth/forgot', () => ({ email: form.email.value }), (r) => { ok.textContent = r.message; ok.hidden = false; }); });
  return authShell('استعادة كلمة المرور', 'سنرسل لك رابطاً صالحاً لمدة محدودة.', form, ['تذكّرتها؟ ', h('a', { href: '/login' }, 'العودة للدخول')]);
}
