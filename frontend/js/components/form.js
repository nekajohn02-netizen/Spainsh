import { h, ic } from '../ui.js';
import { pickImage } from './media.js';

// حقول: { name, label, type: text|textarea|select|number|checkbox|color|password|email|image|datetime, options:[[value,label]], required, hint, full, dir, code, disabled }
const pad2 = (n) => String(n).padStart(2, '0');
const msToLocalInput = (ms) => { if (!ms) return ''; const d = new Date(ms); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
export function buildForm(fields, values = {}) {
  const inputs = {};
  const rows = fields.map((f) => {
    let el, extra = null;
    const v = f.type === 'datetime' ? msToLocalInput(values[f.name]) : (values[f.name] ?? f.def ?? '');
    if (f.type === 'textarea') el = h('textarea', { class: 'input' + (f.code ? ' code' : ''), id: 'f-' + f.name, rows: f.rows || 4, dir: f.dir }, v);
    else if (f.type === 'datetime') el = h('input', { class: 'input', id: 'f-' + f.name, type: 'datetime-local', value: v });
    else if (f.type === 'select') el = h('select', { class: 'input', id: 'f-' + f.name }, (f.options || []).map(([val, label]) => h('option', { value: val, selected: String(val) === String(v) }, label)));
    else if (f.type === 'checkbox') el = h('input', { type: 'checkbox', id: 'f-' + f.name, checked: !!Number(v === '0' ? 0 : v) || v === true });
    else if (f.type === 'color') el = h('input', { class: 'color-input', id: 'f-' + f.name, type: 'color', value: /^#[0-9a-f]{6}$/i.test(v) ? v : '#9b1b30' });
    else if (f.type === 'image') {
      el = h('input', { class: 'input', id: 'f-' + f.name, dir: 'ltr', value: v, placeholder: '/uploads/…', autocomplete: 'off' });
      const thumb = h('img', { class: 'thumb', alt: '', src: v || '', hidden: !v }); el.addEventListener('input', () => { thumb.src = el.value; thumb.hidden = !el.value; });
      extra = h('div', { class: 'img-field' }, thumb, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => { const u = await pickImage(); if (u) { el.value = u; el.dispatchEvent(new Event('input')); } } }, ic('grid'), 'من المكتبة'), h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { el.value = ''; el.dispatchEvent(new Event('input')); } }, 'إزالة'));
    } else el = h('input', { class: 'input', id: 'f-' + f.name, type: f.type || 'text', value: f.type === 'password' ? '' : v, dir: f.dir, min: f.min, max: f.max, autocomplete: 'off' });
    if (f.required) el.required = true; if (f.disabled) el.disabled = true;
    inputs[f.name] = el;
    if (f.type === 'checkbox') return h('label', { class: 'check field ' + (f.full ? 'full' : '') }, el, f.label);
    return h('div', { class: 'field ' + (f.full ? 'full' : '') }, h('label', { for: 'f-' + f.name }, f.label + (f.required ? ' *' : '')), f.type === 'image' ? h('div', {}, el, h('div', { style: { height: '.4rem' } }), extra) : el, f.hint && h('span', { class: 'hint' }, f.hint));
  });
  const root = h('form', { class: 'form-grid', novalidate: false }, rows);
  const read = () => Object.fromEntries(fields.filter((f) => !f.disabled).map((f) => { const e = inputs[f.name]; return [f.name, f.type === 'checkbox' ? e.checked : f.type === 'number' ? (e.value === '' ? '' : Number(e.value)) : f.type === 'datetime' ? (e.value ? new Date(e.value).getTime() : '') : e.value]; }));
  return { root, read, inputs, valid: () => root.reportValidity() };
}
// محرر قوائم قابل لإعادة الترتيب والإضافة والحذف والإخفاء
// cols: [{key,label,type:'text'|'textarea'|'checkbox'|'select'|'color',options,wide}]
export function listEditor(cols, items, { newItem, canAdd = false, canRemove = false, labelKey } = {}) {
  const state = items.map((x) => ({ ...x })), root = h('div');
  const paint = () => {
    root.replaceChildren(...state.map((it, i) => {
      const fields = h('div', { class: 'fields' }, cols.map((c) => {
        let el;
        if (c.type === 'checkbox') el = h('label', { class: 'check' }, h('span', { class: 'switch' }, h('input', { type: 'checkbox', checked: !!it[c.key], onchange: (e) => { it[c.key] = e.target.checked; item.classList.toggle('off', c.key === 'visible' && !e.target.checked); } }), h('span')), c.label);
        else if (c.type === 'select') el = h('div', { class: 'field' }, h('label', {}, c.label), h('select', { class: 'input', onchange: (e) => { it[c.key] = e.target.value; } }, c.options.map(([v, l]) => h('option', { value: v, selected: v === it[c.key] }, l))));
        else if (c.type === 'color') el = h('div', { class: 'field' }, h('label', {}, c.label), h('input', { class: 'color-input', type: 'color', value: it[c.key], oninput: (e) => { it[c.key] = e.target.value; } }));
        else el = h('div', { class: 'field', style: c.wide ? { 'grid-column': '1 / -1' } : {} }, h('label', {}, c.label), c.type === 'textarea' ? h('textarea', { class: 'input', rows: 2, oninput: (e) => { it[c.key] = e.target.value; } }, it[c.key] ?? '') : h('input', { class: 'input', value: it[c.key] ?? '', oninput: (e) => { it[c.key] = e.target.value; } }));
        return el;
      }));
      const ctrl = h('div', { class: 'le-ctrl' }, h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'للأعلى', disabled: i === 0, onclick: () => { [state[i - 1], state[i]] = [state[i], state[i - 1]]; paint(); } }, '↑'), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'للأسفل', disabled: i === state.length - 1, onclick: () => { [state[i + 1], state[i]] = [state[i], state[i + 1]]; paint(); } }, '↓'),
        canRemove && h('button', { class: 'icon-btn', type: 'button', style: { color: 'var(--bad)' }, 'aria-label': 'حذف', onclick: () => { state.splice(i, 1); paint(); } }, ic('trash')));
      const item = h('div', { class: 'le-item' + (it.visible === false ? ' off' : '') }, fields, ctrl); return item;
    }), canAdd && h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { state.push(newItem()); paint(); } }, ic('plus'), 'إضافة'));
  };
  paint();
  return { node: root, read: () => state.map((x) => ({ ...x })) };
}
