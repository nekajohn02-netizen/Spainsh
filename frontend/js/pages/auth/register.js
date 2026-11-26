import { h } from '../../ui.js';
import { field, pwField, errBox, authShell, submitAuth, afterLogin } from '../../components/authkit.js';
export const guest = true;
export default async function () {
  const err = errBox(), btn = h('button', { class: 'btn btn-primary btn-lg', style: { width: '100%' }, type: 'submit' }, 'إنشاء الحساب');
  const form = h('form', {}, err, field('name', 'الاسم الكامل', { autocomplete: 'name', maxlength: 80 }), field('email', 'البريد الإلكتروني', { type: 'email', autocomplete: 'email', dir: 'ltr' }),
    pwField('password', 'كلمة المرور', 'new-password', '10 أحرف على الأقل مع حروف وأرقام'), pwField('confirm', 'تأكيد كلمة المرور', 'new-password'),
    h('label', { class: 'check field' }, h('input', { type: 'checkbox', id: 'terms' }), 'أوافق على الشروط وسياسة الخصوصية'), btn);
  form.addEventListener('submit', (e) => { e.preventDefault(); submitAuth(btn, err, '/api/auth/register', () => ({ name: form.name.value, email: form.email.value, password: form.password.value, confirm: form.confirm.value, terms: form.terms.checked }), afterLogin); });
  return authShell('إنشاء حساب', 'خطوة واحدة تفصلك عن عالم يتحدث الإسبانية، في دقيقة ولا نطلب إلا ما نحتاجه.', form, ['لديك حساب؟ ', h('a', { href: '/login' }, 'سجّل الدخول')]);
}
