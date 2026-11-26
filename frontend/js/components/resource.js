import { h, ic, toast } from '../ui.js';
import { api } from '../api.js';
import { dataTable, actionBtn } from './datatable.js';
import { buildForm } from './form.js';
import { openModal, confirmBox } from './modal.js';
import { pageHead } from './layouts.js';

/* صفحة CRUD إدارية عامة: جدول + نافذة إنشاء/تعديل + حذف فردي وجماعي
   cfg: { title, sub, path, columns, filters, fields(rowOrNull) -> حقول النموذج, toForm(row), extraActions(row, reload), canDelete } */
export function resourcePage(cfg) {
  const base = `/api/admin/${cfg.path}`;
  async function openForm(row, reload) {
    const full = row ? (await api.get(`${base}/${encodeURIComponent(row.id)}`)).row : null;
    const f = buildForm(cfg.fields(full), cfg.toForm ? cfg.toForm(full || {}) : full || cfg.defaults || {});
    openModal({ title: row ? 'تعديل' : 'إضافة جديد', wide: cfg.wide, body: f.root,
      footer: (close) => [h('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'إلغاء'), h('button', { class: 'btn btn-primary', type: 'button', onclick: async () => {
        if (!f.valid()) return; const data = cfg.fromForm ? cfg.fromForm(f.read()) : f.read();
        try { if (row) await api.put(`${base}/${encodeURIComponent(row.id)}`, data); else await api.post(base, data); toast('تم الحفظ'); close(); reload(); } catch (e) { toast(e.message, true); } } }, 'حفظ')] });
  }
  const dt = dataTable({ url: base, initialFilters: cfg.initialFilters, columns: cfg.columns, filters: cfg.filters, sort: cfg.sort, dir: cfg.dir || 'desc', selectable: true,
    bulk: [{ label: 'حذف المحدّد', danger: true, confirm: 'سيتم حذف {n} عنصر نهائياً. متابعة؟', run: async (ids) => { const r = await api.post(`${base}/bulk-delete`, { ids }); return { message: `تم حذف ${r.deleted}` }; } }, ...(cfg.bulk || [])],
    toolbar: h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: () => openForm(null, () => dt.reload()) }, ic('plus'), 'جديد'),
    actions: (row, reload) => [...(cfg.extraActions ? cfg.extraActions(row, reload) : []), actionBtn('edit', 'تعديل', () => openForm(row, reload)), actionBtn('trash', 'حذف', async () => { if (await confirmBox('هل تريد حذف هذا العنصر؟', { danger: true, okText: 'حذف' })) { try { await api.delete(`${base}/${encodeURIComponent(row.id)}`); toast('تم الحذف'); reload(); } catch (e) { toast(e.message, true); } } }, true)] });
  return cfg.embedded ? dt.node : h('div', {}, pageHead(cfg.title, cfg.sub), dt.node);
}
