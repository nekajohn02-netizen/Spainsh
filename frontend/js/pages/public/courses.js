import { h, ic, setTitle } from '../../ui.js';
import { api } from '../../api.js';
import { courseCard } from '../../components/cards.js';
import { levelCodes, levelOfStage } from '../../constants.js';
import { debounce } from '../../lib/format.js';

// كتالوج المقررات (يُستخدم في الموقع العام وفي التطبيق بمسار أساسي مختلف)
export async function catalog(base) {
  const data = await api.get('/api/courses');
  const f = { q: '', stage: '', track: '' };
  const grid = h('div', { class: 'grid cgrid' });
  const paint = () => {
    const list = data.courses.filter((c) => (!f.stage || levelOfStage(c.stage) === f.stage) && (!f.track || c.track === f.track) && (!f.q || (c.title_ar + c.title_es + c.description).toLowerCase().includes(f.q)));
    grid.replaceChildren(...(list.length ? list.map((c) => courseCard(c, base)) : [h('div', { class: 'card empty' }, 'لا توجد مقررات مطابقة')]));
  };
  const sel = (label, key, opts) => h('select', { class: 'input', 'aria-label': label, style: { width: 'auto' }, onchange: (e) => { f[key] = e.target.value; paint(); } }, h('option', { value: '' }, label + ': الكل'), opts.map(([v, l]) => h('option', { value: v }, l)));
  paint();
  return h('div', {}, h('div', { class: 'toolbar' }, h('input', { class: 'input', style: { 'max-width': '320px' }, type: 'search', placeholder: 'ابحث عن مقرر…', 'aria-label': 'بحث', oninput: debounce((e) => { f.q = e.target.value.trim().toLowerCase(); paint(); }, 150) }),
    sel('المستوى', 'stage', levelCodes().map((l) => [l, l])), sel('المسار', 'track', data.tracks.map((t) => [t.id, t.title_ar]))), grid);
}
export default async function () {
  return { title: 'المقررات', node: h('div', { class: 'container page' }, h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'المقررات'), h('p', {}, 'تصفّح المقررات المتاحة وابدأ التعلّم الذاتي.'))), await catalog('/courses')) };
}
