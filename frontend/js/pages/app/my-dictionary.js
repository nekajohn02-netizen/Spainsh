import { h, ic, toast, empty } from '../../ui.js';
import { pageHead } from '../../components/layouts.js';

// قاموس شخصي بالكامل داخل متصفح الطالب فقط — لا يُحفظ في خادمنا، ولا يُزامن بين الأجهزة.
// الهدف: السماح بتنظيم مفردات خاصة دون استهلاك مساحة قاعدة بيانات الموقع.
const KEY = 'my_dictionary_v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const save = (rows) => { try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch { toast('تعذّر الحفظ في متصفحك (قد تكون المساحة ممتلئة)', true); } };
const download = (filename, text, mime = 'application/json') => { const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: mime })), download: filename }); document.body.append(a); a.click(); a.remove(); };

export default function () {
  let rows = load(), q = '';
  const list = h('div'), es = h('input', { class: 'input', dir: 'ltr', lang: 'es', placeholder: 'الكلمة بالإسبانية' }), ar = h('input', { class: 'input', placeholder: 'المعنى بالعربية' }), note = h('input', { class: 'input', placeholder: 'ملاحظة (اختياري)' });
  const search = h('input', { class: 'input', placeholder: 'بحث في قاموسك…', 'aria-label': 'بحث' });
  const paint = () => {
    const filtered = q ? rows.filter((r) => (r.es + r.ar + (r.note || '')).toLowerCase().includes(q.toLowerCase())) : rows;
    list.replaceChildren(filtered.length ? h('div', { class: 'list' }, filtered.map((r) => h('div', { class: 'list-item' }, h('b', { class: 'es' }, r.es), h('span', {}, r.ar), r.note && h('span', { class: 'tiny muted' }, r.note), h('span', { class: 'spacer' }),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'حذف', onclick: () => { rows = rows.filter((x) => x.id !== r.id); save(rows); paint(); } }, ic('trash'))))) : empty(rows.length ? 'لا نتائج' : 'قاموسك فاضي لسه', 'أضف أول كلمة من الفورم بالأعلى.'));
  };
  const form = h('form', { class: 'card' }, h('div', { class: 'form-grid' }, h('div', { class: 'field' }, h('label', {}, 'الإسبانية'), es), h('div', { class: 'field' }, h('label', {}, 'المعنى'), ar), h('div', { class: 'field' }, h('label', {}, 'ملاحظة'), note)),
    h('button', { class: 'btn btn-primary', type: 'submit' }, ic('plus'), 'أضف للقاموس'));
  form.addEventListener('submit', (e) => { e.preventDefault(); if (!es.value.trim() || !ar.value.trim()) return toast('اكتب الكلمة والمعنى', true);
    rows.unshift({ id: Date.now(), es: es.value.trim(), ar: ar.value.trim(), note: note.value.trim() }); save(rows); es.value = ar.value = note.value = ''; es.focus(); paint(); });
  search.addEventListener('input', () => { q = search.value; paint(); });
  const importInput = h('input', { type: 'file', accept: 'application/json', hidden: true });
  importInput.addEventListener('change', async () => { const f = importInput.files[0]; if (!f) return;
    try { const incoming = JSON.parse(await f.text()); if (!Array.isArray(incoming)) throw 0;
      const ids = new Set(rows.map((r) => r.id)); for (const r of incoming) if (r && r.es && r.ar && !ids.has(r.id)) rows.push({ id: r.id || Date.now() + Math.random(), es: r.es, ar: r.ar, note: r.note || '' });
      save(rows); paint(); toast('تم الاستيراد'); } catch { toast('ملف غير صالح', true); } importInput.value = ''; });
  const toolbar = h('div', { class: 'row' }, search, h('span', { class: 'spacer' }),
    h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => download('my-dictionary.json', JSON.stringify(rows, null, 2)) }, ic('down'), 'تحميل JSON'),
    h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => download('my-dictionary.csv', 'es,ar,note\n' + rows.map((r) => `"${r.es}","${r.ar}","${(r.note || '').replace(/"/g, "'")}"`).join('\n'), 'text/csv') }, ic('down'), 'تحميل CSV'),
    h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => importInput.click() }, ic('plus'), 'استيراد'), importInput);
  paint();
  return { title: 'قاموسي الخاص', node: h('div', {}, pageHead('قاموسي الخاص', 'قاموس شخصي يبقى محفوظاً في متصفحك فقط على هذا الجهاز — نزّله بين حين وآخر كنسخة احتياطية، فهو لا يُرفع لخادم الموقع ولا يظهر على جهاز آخر.'), form, h('div', { class: 'row', style: { 'margin-top': '1rem' } }, toolbar), h('div', { style: { 'margin-top': '1rem' } }, list)) };
}
