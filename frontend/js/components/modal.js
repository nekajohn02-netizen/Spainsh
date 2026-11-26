import { h, ic } from '../ui.js';

export function openModal({ title, body, footer, wide, onClose }) {
  const back = h('div', { class: 'modal-back', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
  const close = () => { back.remove(); document.removeEventListener('keydown', esc); onClose?.(); };
  const esc = (e) => { if (e.key === 'Escape') close(); };
  const box = h('div', { class: 'modal' + (wide ? ' wide' : '') }, h('div', { class: 'modal-head' }, h('h3', {}, title), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'إغلاق', onclick: close }, ic('x'))), h('div', { class: 'modal-body' }, body), footer && h('div', { class: 'modal-foot' }, footer(close)));
  back.append(box); back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  document.addEventListener('keydown', esc); document.body.append(back);
  box.querySelector('input,select,textarea')?.focus();
  return close;
}
export function confirmBox(message, { okText = 'تأكيد', danger = false } = {}) {
  return new Promise((resolve) => {
    let result = false;
    openModal({ title: 'تأكيد الإجراء', body: h('p', {}, message), onClose: () => resolve(result),
      footer: (close) => [h('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'إلغاء'),
        h('button', { class: 'btn ' + (danger ? 'btn-danger' : 'btn-primary'), type: 'button', onclick: () => { result = true; close(); } }, okText)] });
  });
}
