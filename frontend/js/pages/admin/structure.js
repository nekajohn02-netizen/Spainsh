import { h } from '../../ui.js';
import { api } from '../../api.js';
import { resourcePage } from '../../components/resource.js';
import { switchCell } from '../../components/datatable.js';
import { pageHead } from '../../components/layouts.js';
import { lookups } from '../../lib/lookups.js';
import { loadSite } from '../../lib/site.js';

const dot = (c) => h('span', { style: { display: 'inline-block', width: '14px', height: '14px', 'border-radius': '50%', background: c, 'vertical-align': 'middle', 'margin-inline-end': '.4rem' } });
export default async function () {
  let lv = [];
  const loadLevels = async () => { lv = (await api.get('/api/admin/levels?size=100&sort=ord&dir=asc')).rows.map((l) => [l.code, `${l.code} · ${l.title_ar}`]); };
  await loadLevels();
  const refresh = () => loadSite().catch(() => {}); // تحديث ألوان المستويات في الواجهة فوراً
  const panes = {
    levels: () => resourcePage({ embedded: true, path: 'levels', sort: 'ord', dir: 'asc', defaults: { color: '#9b1b30', ord: 10, visible: 1 },
      columns: [{ key: 'code', label: 'الكود', sortable: true, render: (r) => h('b', { class: 'es' }, r.code) }, { key: 'title_ar', label: 'الاسم', sortable: true, render: (r) => h('span', {}, dot(r.color), r.title_ar) }, { key: 'title_es', label: 'بالإسبانية' }, { key: 'ord', label: 'الترتيب', sortable: true },
        { key: 'visible', label: 'ظاهر', sortable: true, render: (r) => switchCell(r, '/api/admin/levels/' + r.id, 'visible', refresh) }],
      fields: (row) => [{ name: 'code', label: 'الكود (إنجليزي)', required: true, dir: 'ltr', disabled: !!row, hint: row ? 'لا يمكن تغيير الكود بعد الإنشاء' : 'مثل A1 أو PRE أو DELE' }, { name: 'title_ar', label: 'الاسم بالعربية', required: true }, { name: 'title_es', label: 'الاسم بالإسبانية', dir: 'ltr' },
        { name: 'color', label: 'اللون', type: 'color' }, { name: 'cover', label: 'صورة المستوى (اختياري)', type: 'image', full: true }, { name: 'ord', label: 'الترتيب', type: 'number', min: 0 }, { name: 'visible', label: 'ظاهر للطلاب', type: 'checkbox', full: true }] }),
    stages: () => resourcePage({ embedded: true, path: 'stages', sort: 'level', dir: 'asc', defaults: { idx: 1, hours: 40, visible: 1, level: lv[0]?.[0] }, filters: [{ key: 'level', label: 'المستوى', options: lv }, { key: 'visible', label: 'الظهور', options: [['1', 'ظاهر'], ['0', 'مخفي']] }],
      columns: [{ key: 'code', label: 'الكود', sortable: true, render: (r) => h('b', { class: 'es' }, r.code) }, { key: 'level', label: 'المستوى', sortable: true }, { key: 'idx', label: 'الترتيب', sortable: true }, { key: 'title_ar', label: 'العنوان', sortable: true }, { key: 'hours', label: 'ساعات', sortable: true },
        { key: 'visible', label: 'ظاهرة', sortable: true, render: (r) => switchCell(r, '/api/admin/stages/' + r.id, 'visible', refresh) }],
      fields: (row) => [{ name: 'code', label: 'كود المرحلة', required: true, dir: 'ltr', disabled: !!row, hint: row ? 'لا يمكن تغيير الكود بعد الإنشاء' : 'مثل A1.4 أو PRE.1' }, { name: 'level', label: 'المستوى', type: 'select', options: lv }, { name: 'title_ar', label: 'العنوان بالعربية', required: true }, { name: 'title_es', label: 'بالإسبانية', dir: 'ltr' },
        { name: 'idx', label: 'الترتيب داخل المستوى', type: 'number', min: 0 }, { name: 'hours', label: 'الساعات التقديرية', type: 'number', min: 0 }, { name: 'color', label: 'لون خاص (اختياري)', type: 'color' }, { name: 'visible', label: 'ظاهرة للطلاب', type: 'checkbox' },
        { name: 'purpose', label: 'الهدف التعليمي', type: 'textarea', full: true, rows: 2 }, { name: 'outcomes', label: 'مخرجات التعلّم', type: 'textarea', full: true, rows: 3 }] }),
    tracks: () => resourcePage({ embedded: true, path: 'tracks', sort: 'ord', dir: 'asc', defaults: { icon: 'book', color: '#9b1b30', ord: 10, visible: 1 },
      columns: [{ key: 'id', label: 'الكود', sortable: true, render: (r) => h('code', { dir: 'ltr' }, r.id) }, { key: 'title_ar', label: 'القسم', sortable: true, render: (r) => h('span', {}, dot(r.color), r.title_ar) }, { key: 'lessons', label: 'دروس' }, { key: 'courses', label: 'مقررات' }, { key: 'ord', label: 'الترتيب', sortable: true },
        { key: 'visible', label: 'ظاهر', sortable: true, render: (r) => switchCell(r, '/api/admin/tracks/' + r.id, 'visible', refresh) }],
      fields: (row) => [{ name: 'code', label: 'كود القسم (إنجليزي)', required: true, dir: 'ltr', disabled: !!row, hint: row ? 'لا يمكن تغيير الكود بعد الإنشاء' : 'مثل legal أو business' }, { name: 'title_ar', label: 'الاسم بالعربية', required: true }, { name: 'title_es', label: 'بالإسبانية', dir: 'ltr' },
        { name: 'icon', label: 'الأيقونة', type: 'select', options: ['book', 'wave', 'chat', 'cards', 'map', 'layers', 'game', 'star', 'trophy', 'bolt', 'users', 'chart'].map((i) => [i, i]) }, { name: 'color', label: 'اللون', type: 'color' }, { name: 'ord', label: 'الترتيب', type: 'number', min: 0 }, { name: 'visible', label: 'ظاهر للطلاب', type: 'checkbox' }, { name: 'description', label: 'وصف', type: 'textarea', full: true, rows: 2 }] }),
  };
  const tabs = h('div', { class: 'tabs', role: 'tablist' }), pane = h('div');
  const names = [['levels', 'المستويات'], ['stages', 'المراحل'], ['tracks', 'الأقسام (المسارات)']];
  const show = async (k) => { tabs.replaceChildren(...names.map(([key, t]) => h('button', { role: 'tab', 'aria-selected': String(k === key), onclick: () => show(key) }, t))); await loadLevels(); pane.replaceChildren(panes[k]()); };
  show('stages');
  return { title: 'الهيكل الأكاديمي', node: h('div', {}, pageHead('الهيكل الأكاديمي', 'أضف مستويات ومراحل وأقسام جديدة بحرية، وأظهرها أو أخفِها بنقرة. المخفي يختفي من الطلاب (المنهج، المقررات، الدروس) دون حذف بياناته.'), tabs, pane) };
}
