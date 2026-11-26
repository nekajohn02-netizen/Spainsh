import { h, ic, toast, showAchievements, es } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { pageHead } from '../../components/layouts.js';

export default async function ({ params }) {
  const { story: s, read } = await api.get('/api/stories/' + params.slug);
  let showAr = true, timer;
  const gloss = (word, meaning) => { document.querySelector('.gloss')?.remove(); const g = h('div', { class: 'gloss' }, h('span', { class: 'es' }, word), ' = ', meaning); document.body.append(g); clearTimeout(timer); timer = setTimeout(() => g.remove(), 3000); };
  const lineEs = (t) => { const p = h('div', { class: 'es-line', lang: 'es', dir: 'ltr' }); t.split(/(\s+)/).forEach((tok) => { const clean = tok.toLowerCase().replace(/[.,;:¡!¿?—«»"]/g, ''); if (s.glossary[clean]) p.append(h('span', { class: 'w', tabindex: '0', role: 'button', onclick: () => gloss(clean, s.glossary[clean]), onkeydown: (e) => e.key === 'Enter' && gloss(clean, s.glossary[clean]) }, tok)); else p.append(tok); }); return p; };
  const arLines = [];
  const paras = s.body.map((p) => { const ar = h('div', { class: 'ar-line' }, p.ar); arLines.push(ar); return h('div', { class: 'story-p' }, lineEs(p.es), ar); });
  const toggle = h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { showAr = !showAr; arLines.forEach((a) => (a.hidden = !showAr)); toggle.textContent = showAr ? 'إخفاء الترجمة' : 'إظهار الترجمة'; } }, 'إخفاء الترجمة');
  const finish = h('button', { class: 'btn btn-primary btn-lg', type: 'button', onclick: async () => { const r = await api.post(`/api/stories/${s.slug}/finish`); store.user.xp += r.xp; toast(r.xp ? `أحسنت! +${r.xp} XP` : 'تمت القراءة مسبقاً'); showAchievements(r.achievements); finish.disabled = true; } }, ic('check'), read ? 'قرأتها سابقاً' : 'أنهيت القراءة');
  const vocab = Object.entries(s.glossary);
  return { title: s.title_ar, node: h('div', {}, pageHead(s.title_ar, `${s.stage} · ${s.category} · ${s.minutes} دقائق`, toggle), h('p', { class: 'es muted', style: { 'font-size': '1.3rem' } }, s.title_es), h('p', { class: 'hint' }, 'انقر على الكلمات المسطّرة لمعرفة معناها.'), paras,
    h('div', { class: 'card' }, h('h3', {}, 'مفردات القصة'), h('div', { class: 'pill-row' }, vocab.map(([w, m]) => h('span', { class: 'badge' }, es(w), ' = ', m)))), h('div', { style: { 'margin-top': '1.5rem' } }, finish)) };
}
