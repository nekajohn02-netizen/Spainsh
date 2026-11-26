import { h, toast } from '../../ui.js';
import { buildForm } from '../../components/form.js';
export default async function () {
  const f = buildForm([{ name: 'name', label: 'الاسم', required: true }, { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, dir: 'ltr' }, { name: 'msg', label: 'رسالتك', type: 'textarea', required: true, full: true }]);
  const form = h('div', { class: 'card', style: { 'max-width': '640px' } }, f.root, h('p', { class: 'hint' }, 'سيتم الرد على بريدك في أقرب وقت.'), h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { if (!f.valid()) return; toast('شكراً لتواصلك، سجّلنا رسالتك'); f.root.reset(); } }, 'إرسال'));
  return { title: 'تواصل معنا', node: h('div', { class: 'container page' }, h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'تواصل معنا'), h('p', {}, 'لأي استفسار أو اقتراح.'))), form) };
}
