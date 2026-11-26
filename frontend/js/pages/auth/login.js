import { h } from '../../ui.js';
import { field, pwField, errBox, authShell, submitAuth, afterLogin } from '../../components/authkit.js';
export const guest = true;
export default async function () {
  const err = errBox(), btn = h('button', { class: 'btn btn-primary btn-lg', style: { width: '100%' }, type: 'submit' }, 'تسجيل الدخول');
  const form = h('form', {}, err, field('email', 'البريد الإلكتروني', { type: 'email', autocomplete: 'email', dir: 'ltr' }), pwField('password', 'كلمة المرور', 'current-password'),
    h('div', { class: 'row', style: { 'justify-content': 'space-between', 'margin-bottom': '1rem' } }, h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'remember' }), 'تذكّرني'), h('a', { href: '/forgot' }, 'نسيت كلمة المرور؟')), btn);
  form.addEventListener('submit', (e) => { e.preventDefault(); submitAuth(btn, err, '/api/auth/login', () => ({ email: form.email.value, password: form.password.value, remember: form.remember.checked }), afterLogin); });
  return authShell('تسجيل الدخول', 'أهلاً بعودتك، تابع من حيث توقفت.', form, ['ليس لديك حساب؟ ', h('a', { href: '/register' }, 'أنشئ حساباً')]);
}
