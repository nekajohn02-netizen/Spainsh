import { h, ic, toast } from '../../ui.js';
import { api } from '../../api.js';
import { buildForm } from '../../components/form.js';
import { pageHead } from '../../components/layouts.js';
import { STATUS_OPTS } from '../../lib/lookups.js';
import { navigate } from '../../router.js';
import { debounce } from '../../lib/format.js';

const SNIPPETS = [['عنوان فرعي', '<h2>عنوان فرعي</h2>\n'], ['فقرة', '<p>النص هنا</p>\n'], ['مثال إسباني', '<span lang="es" dir="ltr">Hola</span>'],
  ['صورة يسار', '<img class="img-left" src="/uploads/" alt="">\n'], ['صورة يمين', '<img class="img-right" src="/uploads/" alt="">\n'], ['صورة وسط', '<img class="img-center" src="/uploads/" alt="">\n']];

export default async function ({ params }) {
  const isNew = params.id === 'new';
  const article = isNew ? { status: 'draft', category: '', body: '<p>ابدأ الكتابة هنا…</p>' } : (await api.get('/api/admin/articles/' + params.id)).row;
  const meta = buildForm([{ name: 'title_ar', label: 'العنوان بالعربية', required: true }, { name: 'title_es', label: 'العنوان بالإسبانية', dir: 'ltr' },
    { name: 'slug', label: 'المعرّف (slug)', dir: 'ltr', hint: 'يُولَّد من العنوان إن تُرك فارغاً' }, { name: 'excerpt', label: 'مقتطف قصير يظهر في القائمة' },
    { name: 'category', label: 'التصنيف' }, { name: 'cover', label: 'صورة الغلاف (اختياري)', type: 'image', full: true },
    { name: 'seo_title', label: 'عنوان SEO (اختياري)', hint: 'يُستخدم إن تُرك العنوان الرئيسي طويلاً' }, { name: 'seo_description', label: 'وصف SEO (اختياري)', type: 'textarea' },
    { name: 'status', label: 'الحالة', type: 'select', options: STATUS_OPTS }], article);
  const body = h('textarea', { class: 'input code', id: 'body', dir: 'ltr', 'aria-label': 'محتوى المقال HTML' }, article.body || '');
  const preview = h('div', { class: 'preview prose' });
  const doPreview = debounce(async () => { try { const r = await api.post('/api/admin/preview', { html: body.value }); preview.innerHTML = r.html; } catch {} }, 350);
  body.addEventListener('input', doPreview); doPreview();
  const toolbar = h('div', { class: 'pill-row', style: { 'margin-bottom': '.6rem' } }, SNIPPETS.map(([t, code]) => h('button', { class: 'chip', type: 'button', onclick: () => { const s = body.selectionStart; body.setRangeText(code, s, body.selectionEnd, 'end'); body.focus(); doPreview(); } }, t)));
  async function save(status) {
    if (!meta.valid()) return; const data = { ...meta.read(), body: body.value }; if (status) data.status = status;
    try { const r = isNew ? await api.post('/api/admin/articles', data) : await api.put('/api/admin/articles/' + article.id, data); toast('تم حفظ المقال'); if (isNew) navigate('/admin/articles/' + r.row.id, true); else if (status) meta.inputs.status.value = status; } catch (e) { toast(e.message, true); }
  }
  const tabs = h('div', { class: 'tabs' }), pane = h('div');
  const panes = { meta: () => meta.root, content: () => h('div', { class: 'split' }, h('div', {}, toolbar, body), h('div', {}, h('h4', {}, 'معاينة (بعد التنقية في الخادم)'), preview)) };
  let cur = 'content'; const show = (k) => { cur = k; tabs.replaceChildren(...[['meta', 'البيانات'], ['content', 'المحتوى']].map(([key, t]) => h('button', { role: 'tab', 'aria-selected': String(cur === key), onclick: () => show(key) }, t))); pane.replaceChildren(panes[k]()); if (k === 'content') doPreview(); };
  show(isNew ? 'meta' : 'content');
  return { title: isNew ? 'مقال جديد' : article.title_ar, node: h('div', {}, pageHead(isNew ? 'مقال جديد' : article.title_ar, null, h('a', { class: 'btn btn-ghost', href: '/admin/articles' }, 'القائمة'),
    h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => save('draft') }, 'حفظ كمسودة'), h('button', { class: 'btn btn-primary', type: 'button', onclick: () => save() }, ic('check'), 'حفظ'), h('button', { class: 'btn btn-primary', type: 'button', onclick: () => save('published') }, 'حفظ ونشر')), tabs, pane) };
}
