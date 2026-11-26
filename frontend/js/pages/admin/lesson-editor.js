import { h, ic, toast } from '../../ui.js';
import { api } from '../../api.js';
import { buildForm } from '../../components/form.js';
import { pageHead } from '../../components/layouts.js';
import { lookups, STATUS_OPTS } from '../../lib/lookups.js';
import { navigate } from '../../router.js';
import { debounce, fmtDateTime } from '../../lib/format.js';

const SNIPPETS = [['عنوان', '<h2 id="s1">العنوان</h2>\n'], ['فقرة', '<p>النص هنا</p>\n'], ['جدول', '<table><thead><tr><th>الإسبانية</th><th>المعنى</th></tr></thead><tbody>\n<tr><td lang="es" dir="ltr">hola</td><td>مرحباً</td></tr>\n</tbody></table>\n'],
  ['مثال إسباني', '<span lang="es" dir="ltr">Hola</span>'], ['تلميح', '<div class="callout tip"><b>تذكّر:</b> …</div>\n'], ['تحذير', '<div class="callout warn"><b>انتبه:</b> …</div>\n'], ['حوار', '<div class="dialog" lang="es" dir="ltr"><p><b>A:</b> …</p><p><b>B:</b> …</p></div>\n'],
  ['صورة يسار', '<img class="img-left" src="/uploads/" alt="">\n'], ['صورة يمين', '<img class="img-right" src="/uploads/" alt="">\n'], ['صورة وسط', '<img class="img-center" src="/uploads/" alt="">\n']];
export default async function ({ params, query }) {
  const L = await lookups(true), isNew = params.id === 'new';
  const lesson = isNew ? { status: 'draft', stage: 'A1.1', track: 'grammar', minutes: 10, ord: 1, course_id: query.get('course') || '', body: '<h2 id="s1">عنوان</h2>\n<p>ابدأ الكتابة هنا…</p>' } : (await api.get('/api/admin/lessons/' + params.id)).row;
  const modules = lesson.course_id ? (await api.get(`/api/admin/modules?course_id=${lesson.course_id}&size=100&sort=ord&dir=asc`)).rows : [];
  const meta = buildForm([{ name: 'title_ar', label: 'العنوان بالعربية', required: true }, { name: 'title_es', label: 'العنوان بالإسبانية', dir: 'ltr' }, { name: 'slug', label: 'المعرّف (slug)', dir: 'ltr', hint: 'يُولَّد من العنوان إن تُرك فارغاً' }, { name: 'summary', label: 'ملخص قصير' },
    { name: 'stage', label: 'المرحلة', type: 'select', options: L.stages }, { name: 'track', label: 'المسار', type: 'select', options: L.tracks }, { name: 'course_id', label: 'المقرر', type: 'select', options: L.courses, hint: 'احفظ ثم أعد فتح الصفحة لاختيار الوحدة' },
    { name: 'module_id', label: 'الوحدة', type: 'select', options: [['', '— بدون —'], ...modules.map((m) => [m.id, m.title_ar])] },
    { name: 'time_limit_min', label: 'الحد الزمني للاختبار (دقائق)', type: 'number', min: 1, hint: 'اتركه فارغاً لاختبار غير موقوت' }, { name: 'cover', label: 'صورة الدرس (اختياري)', type: 'image', full: true },
    { name: 'ord', label: 'الترتيب', type: 'number', min: 0 }, { name: 'status', label: 'الحالة', type: 'select', options: STATUS_OPTS }], lesson);
  const body = h('textarea', { class: 'input code', id: 'body', dir: 'ltr', 'aria-label': 'محتوى الدرس HTML' }, lesson.body || '');
  const preview = h('div', { class: 'preview prose' });
  const minutesBadge = h('span', { class: 'badge info' }, '⏱ —');
  const estimateMinutes = (html) => Math.min(240, Math.max(3, Math.round(String(html || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length / 130)));
  const paintMinutes = () => { minutesBadge.textContent = `⏱ ${estimateMinutes(body.value)} دقيقة تقريباً (تُحسب تلقائياً من طول المحتوى)`; };
  const doPreview = debounce(async () => { try { const r = await api.post('/api/admin/preview', { html: body.value }); preview.innerHTML = r.html; } catch {} paintMinutes(); }, 350);
  body.addEventListener('input', doPreview); doPreview(); paintMinutes();
  const toolbar = h('div', { class: 'pill-row', style: { 'margin-bottom': '.6rem' } }, SNIPPETS.map(([t, code]) => h('button', { class: 'chip', type: 'button', onclick: () => { const s = body.selectionStart; body.setRangeText(code, s, body.selectionEnd, 'end'); body.focus(); doPreview(); } }, t)));
  async function save(status) {
    if (!meta.valid()) return; const data = { ...meta.read(), body: body.value }; if (status) data.status = status;
    if (data.module_id === '') data.module_id = null; if (data.course_id === '') data.course_id = null;
    try { const r = isNew ? await api.post('/api/admin/lessons', data) : await api.put('/api/admin/lessons/' + lesson.id, data); toast('تم حفظ الدرس'); if (isNew) navigate('/admin/lessons/' + r.row.id, true); else if (status) meta.inputs.status.value = status; } catch (e) { toast(e.message, true); }
  }
  const versions = h('div', { class: 'list' });
  if (!isNew) api.get(`/api/admin/lessons/${lesson.id}/versions`).then(({ versions: vs }) => versions.replaceChildren(...(vs.length ? vs.map((v) => h('div', { class: 'list-item' }, h('b', {}, 'v' + v.version), h('span', { class: 'muted' }, fmtDateTime(v.at)), h('span', { class: 'muted' }, v.by_name || ''), h('span', { class: 'spacer' }), h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => { await api.post(`/api/admin/lessons/${lesson.id}/restore/${v.id}`); toast('تمت الاستعادة'); navigate('/admin/lessons/' + lesson.id, true); } }, ic('history'), 'استعادة'))) : [h('p', { class: 'muted' }, 'لا إصدارات')])));
  const tabs = h('div', { class: 'tabs' }), pane = h('div');
  const panes = { meta: () => meta.root, content: () => h('div', { class: 'split' }, h('div', {}, toolbar, body), h('div', {}, h('h4', {}, 'معاينة (بعد التنقية في الخادم)'), preview)), versions: () => versions };
  let cur = 'content'; const show = (k) => { cur = k; tabs.replaceChildren(...[['meta', 'البيانات'], ['content', 'المحتوى'], ...(isNew ? [] : [['versions', 'الإصدارات']])].map(([key, t]) => h('button', { role: 'tab', 'aria-selected': String(cur === key), onclick: () => show(key) }, t))); pane.replaceChildren(panes[k]()); if (k === 'content') doPreview(); };
  show(isNew ? 'meta' : 'content');
  return { title: isNew ? 'درس جديد' : lesson.title_ar, node: h('div', {}, pageHead(isNew ? 'درس جديد' : lesson.title_ar, isNew ? null : `الإصدار v${lesson.version} · ${lesson.id}`, h('a', { class: 'btn btn-ghost', href: '/admin/lessons' }, 'القائمة'), !isNew && h('a', { class: 'btn btn-ghost', href: '/admin/questions?lesson=' + lesson.id }, ic('help'), 'الأسئلة'),
    h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => save('draft') }, 'حفظ كمسودة'), h('button', { class: 'btn btn-primary', type: 'button', onclick: () => save() }, ic('check'), 'حفظ'), h('button', { class: 'btn btn-primary', type: 'button', onclick: () => save('published') }, 'حفظ ونشر')), tabs, pane) };
}
