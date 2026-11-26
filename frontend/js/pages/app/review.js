import { h, toast, confetti, showAchievements } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { pageHead } from '../../components/layouts.js';

const GRADES = [[1, 'نسيتها'], [3, 'بصعوبة'], [4, 'جيد'], [5, 'سهلة']];
export default async function () {
  const { cards, total } = await api.get('/api/review/due'), root = h('div', { class: 'center' });
  if (!cards.length) { root.append(h('div', { class: 'card empty' }, h('h2', {}, total ? 'أنهيت مراجعة اليوم 🎉' : 'لا توجد كلمات محفوظة'), h('p', {}, total ? 'ستظهر البطاقات التالية في موعدها المناسب.' : 'احفظ كلمات من القاموس لتبدأ.'), h('a', { class: 'btn btn-primary', href: '/app/vocab' }, 'القاموس'))); return { title: 'المراجعة', node: h('div', {}, pageHead('مراجعة المفردات'), root) }; }
  let i = 0, done = 0; const stage = h('div'), prog = h('p', { class: 'muted' });
  const show = () => {
    if (i >= cards.length) { confetti(); stage.replaceChildren(h('div', { class: 'card empty' }, h('h2', {}, 'أحسنت! أنهيت الجلسة'), h('p', {}, `راجعت ${done} بطاقة.`), h('a', { class: 'btn btn-primary', href: '/app' }, 'العودة للوحة'))); prog.textContent = ''; return; }
    const c = cards[i]; prog.textContent = `${i + 1} / ${cards.length}`;
    const flash = h('div', { class: 'flash', role: 'button', tabindex: '0', 'aria-label': 'اقلب البطاقة' }, h('div', { class: 'inner' }, h('div', { class: 'face front' }, h('span', { class: 'es' }, (c.gender === 'مذكر' ? 'el ' : c.gender === 'مؤنث' ? 'la ' : '') + c.es), h('small', {}, 'اضغط لقلب البطاقة')), h('div', { class: 'face back' }, h('b', {}, c.ar), h('span', { class: 'es muted' }, c.example), h('span', { class: 'muted' }, c.example_ar))));
    const grades = h('div', { class: 'grades', hidden: true }, GRADES.map(([g, t]) => h('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => { try { const r = await api.post('/api/review/answer', { id: c.id, grade: g }); store.user.xp += g >= 3 ? 2 : 0; showAchievements(r.achievements); done++; i++; show(); } catch (e) { toast(e.message, true); } } }, t)));
    const flip = () => { flash.classList.toggle('flipped'); grades.hidden = !flash.classList.contains('flipped'); };
    flash.addEventListener('click', flip); flash.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } });
    stage.replaceChildren(flash, grades);
  };
  show(); root.append(prog, stage);
  return { title: 'المراجعة', node: h('div', {}, pageHead('مراجعة المفردات', 'قيّم تذكّرك بصدق ليُجدول التكرار المتباعد بدقة.'), root) };
}
