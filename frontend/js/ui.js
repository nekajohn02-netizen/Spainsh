import { icon } from './icons.js';
import { store } from './store.js';

// بنّاء DOM آمن: النص يُدرج كـ textContent دائماً
export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style') for (const [p, val] of Object.entries(v)) el.style.setProperty(p, val);
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) { if (kid == null || kid === false) continue; el.append(kid.nodeType ? kid : document.createTextNode(String(kid))); }
  return el;
}
export const ic = (name, cls) => h('span', { html: icon(name, cls), class: 'ic' });
export const es = (t) => h('span', { lang: 'es', dir: 'ltr', class: 'es' }, t);
export const sp = (px = 16) => h('div', { style: { height: px + 'px' } });

export function toast(msg, bad = false) {
  const t = h('div', { class: 'toast' + (bad ? ' bad' : ''), role: 'status' }, msg);
  document.getElementById('toasts').append(t); setTimeout(() => t.remove(), 3400);
}
export const setTitle = (t) => { const b = store.site?.brand; document.title = t ? `${t} | ${b?.name_ar || ''}` : `${b?.name_ar || ''} | ${b?.tagline || ''}`; };
export const spinner = () => h('div', { class: 'empty', role: 'status' }, h('div', { class: 'loader' }), 'جارٍ التحميل…');
export const empty = (title, text, action) => { const img = store.site?.images?.empty; return h('div', { class: 'card empty' }, img ? h('img', { class: 'empty-img', src: img, alt: '' }) : h('div', { class: 'empty-ico', html: icon('layers') }), h('h3', {}, title), text && h('p', { class: 'muted' }, text), action); };

export function ring(percent, label, size) {
  const R = 52, C = 2 * Math.PI * R, wrap = h('div', { class: 'ring', style: size ? { '--size': size + 'px' } : {} });
  wrap.innerHTML = `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop class="a" offset="0"/><stop class="b" offset="1"/></linearGradient></defs><circle class="bg" cx="60" cy="60" r="${R}"/><circle class="fg" cx="60" cy="60" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>`;
  wrap.append(h('b', {}, label ?? `${Math.round(percent)}%`));
  requestAnimationFrame(() => requestAnimationFrame(() => (wrap.querySelector('.fg').style.strokeDashoffset = C * (1 - Math.min(1, percent / 100)))));
  return wrap;
}
export const bar = (percent) => h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': Math.round(percent), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('span', { style: { '--p': Math.round(percent) + '%' } }));
export const avatar = (name, hue, cls = '') => h('span', { class: 'avatar ' + cls, style: { '--h': hue ?? 20 }, 'aria-hidden': 'true' }, (name || '?').trim()[0]);

export function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = h('canvas', { class: 'confetti', 'aria-hidden': 'true' }); document.body.append(c);
  const ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const cs = getComputedStyle(document.documentElement), colors = [cs.getPropertyValue('--brand').trim() || '#9b1b30', cs.getPropertyValue('--gold').trim() || '#c8962e', '#2dd4bf', '#a493ff', '#ff6b9d'];
  const ps = Array.from({ length: 140 }, () => ({ x: c.width / 2, y: c.height * .4, vx: (Math.random() - .5) * 16, vy: -Math.random() * 14 - 4, s: 6 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[Math.random() * 5 | 0] }));
  let f = 0;
  (function tick() { ctx.clearRect(0, 0, c.width, c.height);
    for (const p of ps) { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); ctx.restore(); }
    if (++f < 150) requestAnimationFrame(tick); else c.remove(); })();
}
// عرض الإنجازات الجديدة كإشعارات
export function showAchievements(list = []) { list.forEach((a, i) => setTimeout(() => toast(`🏆 إنجاز جديد: ${a.title_ar}`), i * 700)); if (list.length) confetti(); }
