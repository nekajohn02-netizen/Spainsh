import { h, ic, toast } from '../ui.js';
import { api } from '../api.js';
import { store } from '../store.js';
import { navigate } from '../router.js';

export const field = (id, label, props = {}, hint) => h('div', { class: 'field' }, h('label', { for: id }, label), h('input', { class: 'input', id, name: id, required: true, ...props }), hint && h('span', { class: 'hint' }, hint));
export function pwField(id, label, autocomplete, hint) {
  const input = h('input', { class: 'input', id, name: id, type: 'password', required: true, autocomplete, dir: 'ltr' });
  const eye = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'إظهار أو إخفاء كلمة المرور', onclick: () => { input.type = input.type === 'password' ? 'text' : 'password'; } }, ic('eye'));
  return h('div', { class: 'field' }, h('label', { for: id }, label), h('div', { class: 'pw' }, input, eye), hint && h('span', { class: 'hint' }, hint));
}
export const errBox = () => h('div', { class: 'form-error', role: 'alert', tabindex: '-1', hidden: true });
export function authShell(title, sub, form, alt) {
  return { title, node: h('div', { class: 'auth' }, h('div', { class: 'card' }, store.site.images.auth ? h('img', { class: 'auth-img', src: store.site.images.auth, alt: '' }) : h('div', { class: 'auth-logo' }, h('img', { src: store.site.brand.logo, alt: store.site.brand.name_ar, width: 84, height: 84 })), h('h2', {}, title), h('p', { class: 'muted' }, sub), form, alt && h('p', { class: 'center muted' }, alt))) };
}
export async function submitAuth(btn, err, path, payload, onOk) {
  err.hidden = true; btn.disabled = true;
  try { const r = await api.post(path, payload()); await onOk(r); }
  catch (e) { err.textContent = e.message; err.hidden = false; err.focus(); }
  finally { btn.disabled = false; }
}
export async function afterLogin(r) {
  store.user = r.user; store.csrf = r.csrf; toast('أهلاً بك ' + r.user.name);
  const next = new URLSearchParams(location.search).get('next');
  navigate(next && next.startsWith('/') ? next : r.user.role === 'student' ? (r.user.onboarded ? '/app' : '/app/welcome') : '/admin');
}
