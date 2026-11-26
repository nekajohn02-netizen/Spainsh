'use strict';
// قراءة معاملات الجدول: ?q=&page=&size=&sort=&dir=
function tableParams(query, sortable, defSort) {
  const page = Math.max(1, parseInt(query.get('page')) || 1);
  const size = Math.min(100, Math.max(1, parseInt(query.get('size')) || 10));
  const sort = sortable.includes(query.get('sort')) ? query.get('sort') : defSort;
  const dir = query.get('dir') === 'asc' ? 'ASC' : 'DESC';
  return { page, size, offset: (page - 1) * size, sort, dir, q: (query.get('q') || '').trim() };
}
const like = (q) => `%${q.replace(/[%_\\]/g, (c) => '\\' + c)}%`;
module.exports = { tableParams, like };
