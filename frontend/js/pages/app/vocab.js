import { h, ic, toast, showAchievements } from '../../ui.js';
import { api } from '../../api.js';
import { pageHead } from '../../components/layouts.js';
import { levelColor, stageColor } from '../../constants.js';
import { debounce } from '../../lib/format.js';

export default async function () {
  const { words } = await api.get('/api/vocab');
  const f = { q: '', topic: 'الكل', stage: '', saved: false };
  const topics = ['الكل', ...new Set(words.map((w) => w.topic).filter(Boolean))], stages = [...new Set(words.map((w) => w.stage).filter(Boolean))].sort();
  const grid = h('div', { class: 'grid vgrid' }), count = h('span', { class: 'muted' }), chips = h('div', { class: 'lv-tabs' });
  const paint = () => {
    chips.replaceChildren(...topics.map((t) => h('button', { class: 'chip', 'aria-pressed': String(t === f.topic), onclick: () => { f.topic = t; paint(); } }, t)));
    const list = words.filter((w) => (f.topic === 'الكل' || w.topic === f.topic) && (!f.stage || w.stage === f.stage) && (!f.saved || w.saved) && (!f.q || (w.es + w.ar).toLowerCase().includes(f.q)));
    count.textContent = `${list.length} كلمة`;
    grid.replaceChildren(...list.map((w) => { const btn = h('button', { class: 'btn btn-sm ' + (w.saved ? 'btn-primary' : 'btn-ghost'), type: 'button', 'aria-pressed': String(!!w.saved), onclick: async () => { const r = await api.post(`/api/vocab/${w.id}/${w.saved ? 'unsave' : 'save'}`); w.saved = w.saved ? 0 : 1; toast(w.saved ? 'أُضيفت إلى مراجعتك' : 'أُزيلت من مراجعتك'); showAchievements(r.achievements); paint(); } }, ic('star'), w.saved ? 'محفوظة' : 'احفظ');
      return h('article', { class: 'card hover' }, h('div', { class: 'word' }, h('div', {}, h('span', { class: 'es' }, (w.gender === 'مذكر' ? 'el ' : w.gender === 'مؤنث' ? 'la ' : '') + w.es), h('b', {}, w.ar)), btn),
        h('p', { class: 'es muted', style: { margin: '.6rem 0 0', 'font-size': '.95rem' } }, w.example), h('p', { class: 'muted', style: { margin: 0, 'font-size': '.85rem' } }, w.example_ar),
        h('div', { class: 'row', style: { 'margin-top': '.6rem' } }, h('span', { class: 'badge' }, w.pos), w.stage && h('span', { class: 'badge', style: { color: stageColor(w.stage) } }, w.stage))); }));
  };
  paint();
  const saveStage = h('select', { class: 'input', style: { width: 'auto' }, 'aria-label': 'حفظ كل كلمات مرحلة', onchange: async (e) => { if (!e.target.value) return; const r = await api.post('/api/vocab/save-stage', { stage: e.target.value }); toast(`أُضيفت ${r.added} كلمة`); const fresh = await api.get('/api/vocab'); words.splice(0, words.length, ...fresh.words); e.target.value = ''; paint(); } }, h('option', { value: '' }, 'احفظ كل كلمات مرحلة…'), stages.map((s) => h('option', { value: s }, s)));
  return { title: 'المفردات', node: h('div', {}, pageHead('قاموس المفردات', 'احفظ الكلمات لتدخل في جدول المراجعة بالتكرار المتباعد.', h('a', { class: 'btn btn-primary', href: '/app/review' }, ic('zap'), 'راجع بطاقاتك')),
    h('div', { class: 'toolbar' }, h('input', { class: 'input', style: { 'max-width': '320px' }, type: 'search', placeholder: 'ابحث بالإسبانية أو العربية…', 'aria-label': 'بحث', oninput: debounce((e) => { f.q = e.target.value.trim().toLowerCase(); paint(); }, 150) }),
      h('select', { class: 'input', style: { width: 'auto' }, 'aria-label': 'المرحلة', onchange: (e) => { f.stage = e.target.value; paint(); } }, h('option', { value: '' }, 'كل المراحل'), stages.map((s) => h('option', { value: s }, s))),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', onchange: (e) => { f.saved = e.target.checked; paint(); } }), 'المحفوظة فقط'), saveStage), chips, count, h('div', { style: { height: '.8rem' } }), grid) };
}
