import { h, toast, ring, showAchievements, empty } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { pageHead } from '../../components/layouts.js';
import { levelColor, stageColor } from '../../constants.js';

export default async function () {
  const { questions, disclaimer } = await api.get('/api/placement/questions'), answers = {}, box = h('div');
  const form = h('form', {}, h('div', { class: 'callout' }, disclaimer), questions.map((q, i) => h('fieldset', { class: 'card q', style: { border: '1px solid var(--line)' } }, h('h3', {}, h('span', { class: 'num' }, `${i + 1}. `), h('span', { dir: 'auto' }, q.prompt)),
    h('div', { class: 'opts' }, q.options.map((o, oi) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: q.id, onchange: () => { answers[q.id] = String(oi); } }), h('span', { dir: 'auto' }, o)))))),
    h('div', { class: 'row' }, h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'apply', checked: true }), 'ابدأ من المرحلة الموصى بها'), h('button', { class: 'btn btn-primary btn-lg', type: 'submit' }, 'اعرض نتيجتي')));
  form.addEventListener('submit', async (e) => { e.preventDefault();
    const r = await api.post('/api/placement/submit', { answers, apply: form.querySelector('#apply').checked }); showAchievements(r.achievements);
    if (r.applied) store.user.stage = r.recommended;
    box.replaceChildren(h('div', { class: 'card result' }, ring((r.score / r.total) * 100, `${r.score}/${r.total}`), h('h2', {}, 'نقطة البداية المقترحة: ', h('span', { class: 'es', style: { color: 'var(--brand)' } }, r.recommended)),
      h('p', { class: 'muted' }, r.note), h('div', { class: 'pill-row', style: { 'justify-content': 'center' } }, Object.entries(r.byLevel).map(([lv, v]) => h('span', { class: 'badge', style: { background: levelColor(lv), color: '#fff' } }, `${lv}: ${v.correct}/${v.total}`))),
      h('div', { class: 'row', style: { 'justify-content': 'center', 'margin-top': '1rem' } }, h('a', { class: 'btn btn-primary', href: '/app/curriculum' }, 'عرض المنهج'), h('a', { class: 'btn btn-ghost', href: '/app/courses' }, 'اختر مقرراً')))); window.scrollTo(0, 0); });
  box.append(form);
  return { title: 'تحديد المستوى', node: h('div', {}, pageHead('اختبار تحديد المستوى', 'تقدير مبدئي لنقطة البداية في 16 سؤالاً.', h('a', { class: 'btn btn-ghost', href: '/app/placement/tests' }, 'اختبارات تحديد مستوى أخرى (لمرحلة أو عدة مستويات)')), box) };
}
