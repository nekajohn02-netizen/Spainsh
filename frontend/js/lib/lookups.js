import { api } from '../api.js';
let cache;
// قوائم مرجعية للنماذج: المراحل والمسارات والمقررات
export async function lookups(force) {
  if (cache && !force) return cache;
  const [cur, courses] = await Promise.all([api.get('/api/curriculum'), api.get('/api/admin/courses?size=100&sort=title_ar&dir=asc')]);
  cache = { stages: cur.stages.map((s) => [s.code, `${s.code} · ${s.title_ar}`]), tracks: cur.tracks.map((t) => [t.id, t.title_ar]), courses: [['', '— بدون مقرر —'], ...courses.rows.map((c) => [c.id, c.title_ar])] };
  return cache;
}
export const STATUS_OPTS = [['published', 'منشور'], ['draft', 'مسودة'], ['archived', 'مؤرشف']];
export const statusBadge = (s) => ({ published: ['ok', 'منشور'], draft: ['warn', 'مسودة'], archived: ['', 'مؤرشف'] }[s] || ['', s]);
