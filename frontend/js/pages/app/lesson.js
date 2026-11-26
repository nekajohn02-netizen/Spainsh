import { h, ic, toast, ring, confetti, showAchievements } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { navigate } from '../../router.js';
import { STATUS_AR } from '../../constants.js';
import { ago } from '../../lib/format.js';
import { guardQuiz } from '../../components/anticheat.js';

// دفاع إضافي: إزالة أي سكربت أو معالج حدث (CSP يمنع تنفيذها أصلاً، والخادم ينقّي المحتوى)
function safeHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,iframe,object,embed,link,style').forEach((n) => n.remove());
  doc.body.querySelectorAll('*').forEach((el) => [...el.attributes].forEach((a) => { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) el.removeAttribute(a.name); }));
  return doc.body.innerHTML;
}
function notesPanel(slug, initial) {
  const list = h('div', { class: 'list' }), box = h('textarea', { class: 'input', rows: 3, placeholder: 'اكتب ملاحظة عن هذا الدرس…', 'aria-label': 'ملاحظة جديدة' });
  let notes = initial;
  const paint = () => list.replaceChildren(...notes.map((n) => h('div', { class: 'list-item note-card' }, h('div', { style: { flex: 1 } }, n.body, h('div', { class: 'tiny muted' }, ago(n.at))),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'حذف', onclick: async () => { await api.delete('/api/notes/' + n.id); notes = notes.filter((x) => x.id !== n.id); paint(); } }, ic('trash')))));
  paint();
  return h('section', { class: 'card', style: { 'margin-top': '2rem' } }, h('h3', {}, 'ملاحظاتي'), box,
    h('div', { style: { margin: '.6rem 0' } }, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => { const t = box.value.trim(); if (!t) return; const r = await api.post('/api/notes', { body: t, slug }); notes.unshift({ id: r.id, body: t, at: Date.now() }); box.value = ''; paint(); } }, ic('plus'), 'حفظ الملاحظة')), list);
}
export default async function ({ params }) {
  const { lesson: L, course, questions, progress, notes, prev, next } = await api.get('/api/lessons/' + params.slug);
  let size = +(localStorage.getItem('rsize') || 1.1);
  const prose = h('div', { class: 'prose', html: safeHtml(L.body) }), applySize = () => { prose.style.setProperty('--read-size', size + 'rem'); try { localStorage.setItem('rsize', size); } catch {} }; applySize();
  const toc = h('aside', { class: 'toc card' }, h('h3', {}, 'محتويات الدرس'), [...prose.querySelectorAll('h2')].map((x) => h('a', { href: '#' + x.id, onclick: (e) => { e.preventDefault(); x.scrollIntoView({ behavior: 'smooth' }); } }, x.textContent)));
  const status = h('span', { class: 'badge ok' }, STATUS_AR[progress?.status || 'new']);
  const completeBtn = h('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => { const r = await api.post(`/api/lessons/${L.slug}/complete`); status.textContent = STATUS_AR[r.status]; store.user.xp += r.xp; toast(r.xp ? `أحسنت! +${r.xp} XP` : 'تم تسجيل الاكتمال'); showAchievements(r.achievements); } }, ic('check'), 'أنهيتُ القراءة');
  const quizBox = h('section', { id: 'quiz' });
  const startQuiz = async () => {
    const answers = {};
    const isExam = !!L.time_limit_min; // الاختبارات الموقوتة الرسمية تُعرض بالإسبانية بالكامل (dir/lang) باعتبارها محتوى احترافياً
    const form = h('form', {}, h('h2', {}, isExam ? 'الاختبار' : 'اختبر نفسك'), isExam && h('p', { class: 'callout tip' }, 'اختبار رسمي: يُفضَّل أن تكون الأسئلة بالإسبانية بالكامل.'),
      questions.map((q, i) => h('fieldset', { class: 'card q', style: { border: '1px solid var(--line)' } }, h('legend', { class: 'sr' }, 'سؤال ' + (i + 1)),
      h('h3', {}, h('span', { class: 'num' }, (i + 1) + '. '), h('span', { dir: isExam ? 'ltr' : 'auto', lang: isExam ? 'es' : undefined }, q.prompt)),
      q.type === 'fill' ? h('input', { class: 'input', dir: 'ltr', lang: 'es', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'إجابتك', oninput: (e) => { answers[q.id] = e.target.value; } })
        : h('div', { class: 'opts' }, q.options.map((o, oi) => h('label', { class: 'opt', 'data-q': q.id, 'data-i': oi }, h('input', { type: 'radio', name: q.id, onchange: () => { answers[q.id] = String(oi); } }), h('span', { dir: isExam ? 'ltr' : 'auto', lang: isExam ? 'es' : undefined }, o)))),
      h('div', { class: 'fb-slot', 'data-q': q.id }))), h('button', { class: 'btn btn-primary btn-lg', type: 'submit' }, 'تسليم الإجابات'));
    try { await api.post(`/api/lessons/${L.slug}/quiz/start`); } catch {}
    const guard = guardQuiz(form, { lessonSlug: L.slug, limitMin: L.time_limit_min, onExpire: () => form.requestSubmit() });
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const r = await api.post(`/api/lessons/${L.slug}/quiz`, { answers });
        guard.detach();
        for (const x of r.results) { const q = questions.find((z) => z.id === x.id), slot = form.querySelector(`.fb-slot[data-q="${CSS.escape(x.id)}"]`);
          slot.replaceChildren(h('div', { class: 'fb ' + (x.correct ? 'ok' : 'bad') }, x.correct ? '✓ إجابة صحيحة' : '✗ ' + (q.type === 'fill' ? `الإجابة الصحيحة: ${x.answer}` : `الإجابة الصحيحة: ${q.options[+x.answer]}`), x.explain ? ' — ' + x.explain : ''));
          form.querySelectorAll(`.opt[data-q="${CSS.escape(x.id)}"]`).forEach((o) => { if (o.dataset.i === x.answer) o.classList.add('right'); else if (o.dataset.i === x.given) o.classList.add('wrong'); o.querySelector('input').disabled = true; }); }
        store.user.xp += r.xp; showAchievements(r.achievements);
        const res = h('div', { class: 'card result' }, ring(r.percent), h('h2', {}, r.passed ? 'أحسنت! اجتزتَ الاختبار' : 'محاولة جيدة، راجع الدرس وأعد المحاولة'),
          h('p', { class: 'muted' }, `${r.score} من ${r.total} · ${STATUS_AR[r.status]}${r.xp ? ` · +${r.xp} XP` : ''}`), r.timedOut && h('p', { class: 'badge bad' }, 'انتهى الوقت المحدد — سُجّلت إجاباتك كما هي'),
          r.advancedTo && h('p', { class: 'badge warn' }, '🎉 انتقلت إلى المرحلة ' + r.advancedTo), r.certificate && h('p', {}, h('a', { class: 'btn btn-primary', href: '/certificate/' + r.certificate }, ic('award'), 'شهادة إتمام المقرر')),
          h('div', { class: 'row', style: { 'justify-content': 'center' } }, h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => navigate(location.pathname, true) }, 'إعادة الاختبار'), next && h('a', { class: 'btn btn-primary', href: '/app/lesson/' + next.slug }, 'الدرس التالي')));
        form.after(res); res.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (r.passed) confetti(); status.textContent = STATUS_AR[r.status];
      } catch (err) { toast(err.message, true); btn.disabled = false; }
    });
    quizBox.replaceChildren(form);
  };
  const readbar = h('div', { class: 'readbar', 'aria-hidden': 'true' });
  const onScroll = () => { const m = document.documentElement.scrollHeight - innerHeight; readbar.style.setProperty('--read', m > 0 ? Math.min(1, scrollY / m) : 0); };
  addEventListener('scroll', onScroll, { passive: true });
  const node = h('div', {}, readbar,
    h('div', { class: 'crumbs' }, course ? h('a', { href: '/app/courses/' + course.slug }, course.title_ar) : h('a', { href: '/app/curriculum' }, 'المنهج'), ' / ', h('span', { class: 'es' }, L.stage), ' / ', L.title_ar),
    L.cover && h('img', { class: 'about-img', src: L.cover, alt: '', style: { 'margin-top': '1rem' } }),
    h('div', { class: 'row' }, h('div', {}, h('h1', {}, L.title_ar), h('p', { class: 'es muted', style: { 'font-size': '1.3rem' } }, L.title_es)), h('span', { class: 'spacer' }),
      h('div', { class: 'tools no-print' }, h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تصغير الخط', onclick: () => { size = Math.max(.9, size - .1); applySize(); } }, 'A−'), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تكبير الخط', onclick: () => { size = Math.min(1.7, size + .1); applySize(); } }, 'A+'), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'طباعة', onclick: () => print() }, ic('print')))),
    h('div', { class: 'row' }, h('span', { class: 'badge info' }, ic('clock'), L.minutes + ' دقيقة'), status),
    h('div', { class: 'lesson-layout', style: { 'margin-top': '1.5rem' } }, h('article', {}, prose,
      h('div', { class: 'row no-print', style: { margin: '2rem 0' } }, completeBtn, questions.length ? h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { startQuiz(); quizBox.scrollIntoView({ behavior: 'smooth' }); } }, 'ابدأ الاختبار') : null), quizBox, notesPanel(L.slug, notes),
      h('div', { class: 'row no-print', style: { 'margin-top': '2rem', 'justify-content': 'space-between' } }, prev ? h('a', { class: 'btn btn-ghost', href: '/app/lesson/' + prev.slug }, '→ ' + prev.title_ar) : h('span'), next ? h('a', { class: 'btn btn-ghost', href: '/app/lesson/' + next.slug }, next.title_ar + ' ←') : h('span'))), toc));
  return { title: L.title_ar, node };
}
