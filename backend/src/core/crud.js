'use strict';
// مولّد CRUD للإدارة: قائمة بجدول (بحث/فرز/ترقيم) + جلب + إنشاء + تعديل + حذف
const r = require('./router');
const { notFound, bad } = require('./errors');
const { tableParams, like } = require('./paginate');
const { audit } = require('../lib/audit');

function crud({ path, table, id = 'id', fields, search = [], sortable = [], defSort, filters = [], validate = (x) => x, beforeDelete, afterWrite, role = 'admin', genId, select = '*' }) {
  const cols = Object.keys(fields);
  r.get(`/api/admin/${path}`, ({ db, query }) => {
    const p = tableParams(query, sortable.length ? sortable : cols, defSort || id);
    const where = [], args = [];
    if (p.q && search.length) { where.push('(' + search.map((c) => `${c} LIKE ? ESCAPE '\\'`).join(' OR ') + ')'); search.forEach(() => args.push(like(p.q))); }
    for (const f of filters) { const v = query.get(f); if (v) { where.push(`${f}=?`); args.push(v); } }
    const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const total = db.prepare(`SELECT COUNT(*) c FROM ${table} ${w}`).get(...args).c;
    const rows = db.prepare(`SELECT ${select} FROM ${table} ${w} ORDER BY ${p.sort} ${p.dir} LIMIT ? OFFSET ?`).all(...args, p.size, p.offset);
    return { rows, total, page: p.page, size: p.size };
  }, { role });
  r.get(`/api/admin/${path}/:id`, ({ db, params }) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE ${id}=?`).get(params.id);
    if (!row) throw notFound(); return { row };
  }, { role });
  r.post(`/api/admin/${path}`, ({ db, body, session, ip }) => {
    const v = validate(body, null, db, session); const key = genId ? genId(v, db) : undefined;
    const names = key !== undefined ? [id, ...cols] : cols, vals = key !== undefined ? [key, ...cols.map((c) => v[c] ?? null)] : cols.map((c) => v[c] ?? null);
    const info = db.prepare(`INSERT INTO ${table}(${names.join(',')}) VALUES(${names.map(() => '?').join(',')})`).run(...vals);
    const newId = key !== undefined ? key : info.lastInsertRowid;
    audit(db, session.id, `${table}:create:${newId}`, ip);
    const row = db.prepare(`SELECT * FROM ${table} WHERE ${id}=?`).get(newId); afterWrite?.(db, row, null, session);
    return { row };
  }, { role });
  r.put(`/api/admin/${path}/:id`, ({ db, params, body, session, ip }) => {
    const cur = db.prepare(`SELECT * FROM ${table} WHERE ${id}=?`).get(params.id); if (!cur) throw notFound();
    const v = validate({ ...cur, ...body }, cur, db, session);
    db.prepare(`UPDATE ${table} SET ${cols.map((c) => `${c}=?`).join(',')} WHERE ${id}=?`).run(...cols.map((c) => v[c] ?? null), params.id);
    audit(db, session.id, `${table}:update:${params.id}`, ip);
    const row = db.prepare(`SELECT * FROM ${table} WHERE ${id}=?`).get(params.id); afterWrite?.(db, row, cur, session);
    return { row };
  }, { role });
  r.delete(`/api/admin/${path}/:id`, ({ db, params, session, ip }) => {
    if (!db.prepare(`SELECT 1 FROM ${table} WHERE ${id}=?`).get(params.id)) throw notFound();
    beforeDelete?.(db, params.id);
    db.prepare(`DELETE FROM ${table} WHERE ${id}=?`).run(params.id);
    audit(db, session.id, `${table}:delete:${params.id}`, ip);
    return { ok: true };
  }, { role });
  // حذف جماعي
  r.post(`/api/admin/${path}/bulk-delete`, ({ db, body, session, ip }) => {
    const ids = Array.isArray(body.ids) ? body.ids.slice(0, 200) : []; if (!ids.length) throw bad('لم يتم تحديد عناصر');
    for (const x of ids) { beforeDelete?.(db, x); db.prepare(`DELETE FROM ${table} WHERE ${id}=?`).run(x); }
    audit(db, session.id, `${table}:bulk-delete:${ids.length}`, ip);
    return { deleted: ids.length };
  }, { role });
}
module.exports = { crud };
