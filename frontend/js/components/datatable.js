import { h, ic, toast } from '../ui.js';
import { api } from '../api.js';
import { debounce, qs } from '../lib/format.js';
import { confirmBox } from './modal.js';

/* جدول بيانات متكامل: بحث، مرشحات، فرز، ترقيم، تحديد وإجراءات جماعية
   cfg: { url, columns:[{key,label,sortable,render(row)}], filters:[{key,label,options:[[v,l]]}], search:true, selectable:true,
          bulk:[{label, danger, run(ids)}], actions(row)->[nodes], size, empty } */
export function dataTable(cfg) {
  const state = { q: '', page: 1, size: cfg.size || 10, sort: cfg.sort || '', dir: cfg.dir || 'desc', filters: { ...(cfg.initialFilters || {}) }, selected: new Set(), rows: [], total: 0 };
  const root = h('div', { class: 'dt' }), bar = h('div', { class: 'dt-bar' }), bulk = h('div', { class: 'bulkbar', hidden: true }), scroll = h('div', { class: 'dt-scroll' }), foot = h('div', { class: 'dt-foot' });
  root.append(bar, bulk, scroll, foot);

  if (cfg.search !== false) bar.append(h('input', { class: 'input grow', type: 'search', placeholder: 'بحث…', 'aria-label': 'بحث', oninput: debounce((e) => { state.q = e.target.value.trim(); state.page = 1; load(); }) }));
  for (const f of cfg.filters || []) bar.append(h('select', { class: 'input', 'aria-label': f.label, onchange: (e) => { state.filters[f.key] = e.target.value; state.page = 1; load(); } },
    h('option', { value: '' }, f.label + ': الكل'), f.options.map(([v, l]) => h('option', { value: v }, l))));
  if (cfg.toolbar) bar.append(...[].concat(cfg.toolbar));

  async function load() {
    scroll.style.setProperty('opacity', '.5');
    try {
      const data = await api.get(cfg.url + (cfg.url.includes('?') ? '&' : '?') + qs({ q: state.q, page: state.page, size: state.size, sort: state.sort, dir: state.dir === 'asc' ? 'asc' : 'desc', ...state.filters }));
      state.rows = data.rows; state.total = data.total; state.selected.clear(); paint();
    } catch (e) { toast(e.message, true); } finally { scroll.style.removeProperty('opacity'); }
  }
  const reload = () => load();

  function paint() {
    const cols = cfg.columns, sel = cfg.selectable !== false && (cfg.bulk || []).length;
    const head = h('tr', {}, sel ? h('th', { style: { width: '40px' } }, h('input', { type: 'checkbox', 'aria-label': 'تحديد الكل', checked: state.rows.length && state.selected.size === state.rows.length, onchange: (e) => { state.rows.forEach((r) => e.target.checked ? state.selected.add(r.id) : state.selected.delete(r.id)); paint(); } })) : null,
      cols.map((c) => h('th', { class: c.sortable ? 'sortable' : '', 'aria-sort': state.sort === c.key ? (state.dir === 'asc' ? 'ascending' : 'descending') : null, onclick: c.sortable ? () => { if (state.sort === c.key) state.dir = state.dir === 'asc' ? 'desc' : 'asc'; else { state.sort = c.key; state.dir = 'asc'; } load(); } : null },
        c.label, state.sort === c.key && h('span', { class: 'arrow' }, state.dir === 'asc' ? '▲' : '▼'))), cfg.actions ? h('th', {}, '') : null);
    const body = state.rows.map((r) => h('tr', { class: state.selected.has(r.id) ? 'sel' : '' },
      sel ? h('td', {}, h('input', { type: 'checkbox', 'aria-label': 'تحديد الصف', checked: state.selected.has(r.id), onchange: (e) => { e.target.checked ? state.selected.add(r.id) : state.selected.delete(r.id); paint(); } })) : null,
      cols.map((c) => h('td', {}, c.render ? c.render(r) : String(r[c.key] ?? '—'))), cfg.actions ? h('td', {}, h('div', { class: 'row-actions' }, cfg.actions(r, reload))) : null));
    scroll.replaceChildren(h('table', {}, h('thead', {}, head), h('tbody', {}, body.length ? body : h('tr', {}, h('td', { colspan: cols.length + 2, class: 'center muted' }, cfg.empty || 'لا توجد نتائج')))));

    bulk.hidden = !state.selected.size;
    bulk.replaceChildren(h('span', {}, `${state.selected.size} محدّد`), ...(cfg.bulk || []).map((b) => h('button', { class: 'btn btn-sm ' + (b.danger ? 'btn-danger' : 'btn-ghost'), type: 'button', onclick: async () => {
      if (b.confirm && !(await confirmBox(b.confirm.replace('{n}', state.selected.size), { danger: b.danger }))) return;
      try { const r = await b.run([...state.selected]); toast(r?.message || 'تم التنفيذ'); load(); } catch (e) { toast(e.message, true); } } }, b.label)));

    const pages = Math.max(1, Math.ceil(state.total / state.size));
    const nums = []; for (let p = Math.max(1, state.page - 2); p <= Math.min(pages, state.page + 2); p++) nums.push(p);
    foot.replaceChildren(h('span', {}, state.total ? `${(state.page - 1) * state.size + 1}–${Math.min(state.total, state.page * state.size)} من ${state.total}` : '0 نتيجة'),
      h('div', { class: 'row' }, h('select', { class: 'input', style: { 'min-height': '36px', padding: '.2rem 2rem .2rem .6rem', width: 'auto' }, 'aria-label': 'عدد الصفوف', onchange: (e) => { state.size = +e.target.value; state.page = 1; load(); } }, [10, 25, 50].map((n) => h('option', { value: n, selected: n === state.size }, n + ' / صفحة'))),
        h('div', { class: 'pager' }, h('button', { type: 'button', disabled: state.page <= 1, 'aria-label': 'السابق', onclick: () => { state.page--; load(); } }, '›'),
          nums.map((p) => h('button', { type: 'button', 'aria-current': p === state.page ? 'true' : null, onclick: () => { state.page = p; load(); } }, p)),
          h('button', { type: 'button', disabled: state.page >= pages, 'aria-label': 'التالي', onclick: () => { state.page++; load(); } }, '‹'))));
  }
  load();
  return { node: root, reload };
}
export const actionBtn = (iconName, label, onclick, danger) => h('button', { class: 'icon-btn', type: 'button', title: label, 'aria-label': label, onclick, style: danger ? { color: 'var(--bad)' } : {} }, ic(iconName));

// مفتاح تشغيل/إيقاف داخل الجدول (إظهار/إخفاء)
export function switchCell(row, url, key = 'visible', after) {
  const input = h('input', { type: 'checkbox', checked: !!Number(row[key]), 'aria-label': 'ظاهر', onchange: async (e) => {
    try { await api.put(url, { [key]: e.target.checked }); row[key] = e.target.checked ? 1 : 0; toast(e.target.checked ? 'أصبح ظاهراً' : 'تم الإخفاء'); after?.(); } catch (er) { e.target.checked = !e.target.checked; toast(er.message, true); } } });
  return h('label', { class: 'switch' }, input, h('span'));
}
