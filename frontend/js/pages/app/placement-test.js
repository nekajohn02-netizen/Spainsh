import { h, ring, toast } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { pageHead } from '../../components/layouts.js';

export default async function ({ params }) {
  const { test, questions, disclaimer } = await api.get(`/api/placement/tests/${params.id}/questions`), answers = {}, box = h('div');
  const form = h('form', {}, h('div', { class: 'callout' }, disclaimer), questions.map((q, i) => h('fieldset', { class: 'card q', style: { border: '1px solid var(--line)' } }, h('h3', {}, h('span', { class: 'num' }, `${i + 1}. `), h('span', { dir: 'auto' }, q.prompt)),
    h('div', { class: 'opts' }, q.options.map((o, oi) => h('label', { class: 'opt' }, h('input', { type: 'radio', name: q.id, onchange: () => { answers[q.id] = String(oi); } }), h('span', { dir: 'auto' }, o)))))),
    h('div', { class: 'row' }, h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'apply', checked: true }), 'ابدأ من المرحلة الموصى بها'), h('button', { class: 'btn btn-primary btn-lg', type: 'submit' }, 'اعرض نتيجتي')));
  form.addEventListener('submit', async (e) => { e.preventDefault();
    try {
      const r = await api.post(`/api/placement/tests/${params.id}/submit`, { answers, apply: form.querySelector('#apply').checked });
      if (r.applied) store.user.stage = r.recommended;
      box.replaceChildren(h('div', { class: 'card result' }, ring((r.score / r.total) * 100, `${r.score}/${r.total}`), h('h2', {}, 'نقطة البداية المقترحة ضمن هذا النطاق: ', h('span', { class: 'es', style: { color: 'var(--brand)' } }, r.recommended)),
        h('p', { class: 'muted' }, r.note), h('div', { class: 'row', style: { 'justify-content': 'center', 'margin-top': '1rem' } }, h('a', { class: 'btn btn-primary', href: '/app/curriculum' }, 'عرض المنهج'), h('a', { class: 'btn btn-ghost', href: '/app/placement/tests' }, 'اختبارات أخرى'))));
      window.scrollTo(0, 0);
    } catch (err) { toast(err.message, true); }
  });
  box.append(form);
  return { title: test.title_ar, node: h('div', {}, pageHead(test.title_ar, `يغطي: ${test.stages.join('، ')}`), box) };
}
