import { h, ic, toast } from '../ui.js';
import { api } from '../api.js';
import { openModal, confirmBox } from './modal.js';
import { store } from '../store.js';

const readFile = (f) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
export async function uploadFiles(files) {
  const out = [];
  for (const f of files) {
    if (f.size > 5 * 1024 * 1024) { toast(`${f.name}: أكبر من 5 ميغابايت`, true); continue; }
    try { out.push(await api.post('/api/admin/media', { name: f.name, data: await readFile(f) })); } catch (e) { toast(`${f.name}: ${e.message}`, true); }
  }
  return out;
}
// شبكة الصور: وضع الاختيار (pick) أو الإدارة (حذف ونسخ الرابط)
export async function mediaGrid({ onPick, onChange }) {
  const grid = h('div', { class: 'media-grid' }), drop = h('div', { class: 'dropzone' }, ic('down'), h('p', {}, 'اسحب الصور هنا أو '), h('label', { class: 'btn btn-primary btn-sm' }, 'اختر ملفات', h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', multiple: true, hidden: true, onchange: (e) => handle(e.target.files) })), h('p', { class: 'hint' }, 'PNG / JPG / WEBP / GIF حتى 5 ميغابايت. يُفضّل WEBP لتخفيف الحجم.'));
  async function handle(files) { const r = await uploadFiles([...files]); if (r.length) { toast(`تم رفع ${r.length}`); await load(); onChange?.(); } }
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); }); drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); handle(e.dataTransfer.files); });
  async function load() {
    const { rows } = await api.get('/api/admin/media');
    grid.replaceChildren(...(rows.length ? rows.map((m) => h('div', { class: 'media-item' + (onPick ? ' pick' : ''), onclick: onPick ? () => onPick(m.url) : null },
      h('img', { src: m.url, alt: m.original || '', loading: 'lazy' }), h('div', { class: 'm' }, h('span', { dir: 'ltr', title: m.original }, (m.original || m.filename).slice(0, 22)), h('span', {}, `${Math.round(m.size / 1024)} KB`),
        !onPick && h('div', { class: 'row' }, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => { try { await navigator.clipboard.writeText(m.url); toast('تم نسخ الرابط'); } catch { toast(m.url); } } }, 'نسخ الرابط'),
          store.user.role === 'admin' && h('button', { class: 'icon-btn', style: { width: '34px', height: '34px', color: 'var(--bad)' }, type: 'button', 'aria-label': 'حذف', onclick: async () => { if (await confirmBox('حذف الصورة نهائياً؟ قد تتأثر الصفحات التي تستخدمها.', { danger: true, okText: 'حذف' })) { await api.delete('/api/admin/media/' + m.id); await load(); } } }, ic('trash'))))))
      : [h('p', { class: 'muted' }, 'لا صور بعد.')]));
  }
  await load();
  return h('div', {}, drop, h('div', { style: { height: '1rem' } }), grid);
}
export async function pickImage() {
  return new Promise(async (resolve) => {
    let chosen = null;
    const body = await mediaGrid({ onPick: (url) => { chosen = url; closeFn(); } });
    const closeFn = openModal({ title: 'اختر صورة من المكتبة', wide: true, body, onClose: () => resolve(chosen) });
  });
}
