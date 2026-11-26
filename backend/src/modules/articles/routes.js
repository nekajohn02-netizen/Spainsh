'use strict';
const r = require('../../core/router');
const { notFound } = require('../../core/errors');

r.get('/api/articles', ({ db, query }) => {
  const category = query.get('category');
  const where = ["status='published'"], args = [];
  if (category) { where.push('category=?'); args.push(category); }
  return { articles: db.prepare(`SELECT id,slug,title_ar,title_es,excerpt,category,cover,published_at FROM articles WHERE ${where.join(' AND ')} ORDER BY published_at DESC`).all(...args) };
});
r.get('/api/articles/:slug', ({ db, params }) => {
  const a = db.prepare("SELECT * FROM articles WHERE slug=? AND status='published'").get(params.slug); if (!a) throw notFound('المقال غير موجود');
  return { article: a };
});
