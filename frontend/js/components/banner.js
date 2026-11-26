import { h } from '../ui.js';

/* بانر متجاوب بنسختين (فاتح/داكن) وقصّات للموبايل والتابلت.
   name: hero | intro ، custom: رابط صورة مخصّصة من لوحة الإدارة (يُستعمل للوضعين).
   الأبعاد ثابتة (width/height + aspect-ratio في CSS) لمنع Layout Shift.
   النسخة غير الظاهرة تُحمَّل كسولاً فلا تُجلب إلا عند تبديل الوضع. */
const ASSET = '/assets/';
function picture(name, theme, { eager, alt }) {
  const f = (s) => `${ASSET}${name}-${theme}-${s}.webp`;
  return h('picture', { class: `pbanner-pic pic-${theme}` },
    h('source', { media: '(max-width: 640px)', srcset: f('m'), width: 800, height: 520 }),
    h('source', { media: '(max-width: 1100px)', srcset: f('1000'), width: 1000, height: 275 }),
    h('img', { src: f('1600'), srcset: `${f('1000')} 1000w, ${f('1600')} 1600w`, sizes: '100vw', width: 1600, height: 440, alt, decoding: 'async', loading: eager ? 'eager' : 'lazy', fetchpriority: eager ? 'high' : null }));
}
export function banner({ name, custom, alt, eager = false, className = '' }) {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const box = h('div', { class: `pbanner ${className}` });
  if (custom) { box.append(h('img', { class: 'pbanner-custom', src: custom, alt, width: 1600, height: 440, decoding: 'async', loading: eager ? 'eager' : 'lazy', fetchpriority: eager ? 'high' : null })); return box; }
  // الصورة الأولى (eager) هي نسخة الوضع الحالي فقط
  box.append(picture(name, 'light', { eager: eager && !dark, alt }), picture(name, 'dark', { eager: eager && dark, alt }));
  return box;
}
