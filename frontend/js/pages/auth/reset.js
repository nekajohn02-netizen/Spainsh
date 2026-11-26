import { h, toast } from '../../ui.js';
import { pwField, errBox, authShell, submitAuth } from '../../components/authkit.js';
import { navigate } from '../../router.js';
export const guest = true;
export default async function ({ params }) {
  const err = errBox(), btn = h('button', { class: 'btn btn-primary btn-lg', style: { width: '100%' }, type: 'submit' }, 'حفظ كلمة المرور الجديدة');
  const form = h('form', {}, err, pwField('password', 'كلمة المرور الجديدة', 'new-password', '10 أحرف على الأقل مع حروف وأرقام'), pwField('confirm', 'تأكيد كلمة المرور', 'new-password'), btn);
  form.addEventListener('submit', (e) => { e.preventDefault();
    if (form.password.value !== form.confirm.value) { err.textContent = 'كلمتا المرور غير متطابقتين'; err.hidden = false; return; }
    submitAuth(btn, err, '/api/auth/reset', () => ({ token: params.token, password: form.password.value }), () => { toast('تم تغيير كلمة المرور، سجّل الدخول'); navigate('/login'); }); });
  return authShell('كلمة مرور جديدة', 'اختر كلمة مرور قوية لحسابك.', form);
}
