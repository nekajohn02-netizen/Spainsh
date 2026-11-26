'use strict';
const r = require('../../core/router');

r.get('/api/admin/stats', ({ db }) => {
  const c = (sql, ...a) => db.prepare(sql).get(...a).c;
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - 13 + i); return d.toISOString().slice(0, 10); });
  const signups = Object.fromEntries(db.prepare("SELECT date(created_at/1000,'unixepoch') d, COUNT(*) c FROM users GROUP BY d").all().map((x) => [x.d, x.c]));
  const attempts = Object.fromEntries(db.prepare("SELECT date(at/1000,'unixepoch') d, COUNT(*) c FROM attempts GROUP BY d").all().map((x) => [x.d, x.c]));
  return {
    totals: { users: c('SELECT COUNT(*) c FROM users'), students: c("SELECT COUNT(*) c FROM users WHERE role='student'"), active7: c("SELECT COUNT(DISTINCT user_id) c FROM activity WHERE day>=date('now','-6 days')"),
      courses: c("SELECT COUNT(*) c FROM courses WHERE status='published'"), lessons: c("SELECT COUNT(*) c FROM lessons WHERE status='published'"), drafts: c("SELECT COUNT(*) c FROM lessons WHERE status!='published'"),
      questions: c("SELECT COUNT(*) c FROM questions WHERE bank='lesson'"), enrollments: c('SELECT COUNT(*) c FROM enrollments'), certificates: c('SELECT COUNT(*) c FROM certificates'),
      attempts: c('SELECT COUNT(*) c FROM attempts'), avgScore: Math.round(db.prepare('SELECT AVG(100.0*score/total) a FROM attempts').get().a || 0) },
    series: days.map((d) => ({ day: d, signups: signups[d] || 0, attempts: attempts[d] || 0 })),
    stageCoverage: db.prepare("SELECT s.code, s.title_ar, COUNT(l.id) lessons FROM stages s LEFT JOIN lessons l ON l.stage=s.code AND l.status='published' GROUP BY s.code ORDER BY s.level, s.idx").all(),
    topCourses: db.prepare('SELECT c.title_ar, COUNT(e.user_id) students FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id GROUP BY c.id ORDER BY students DESC LIMIT 5').all(),
    hardest: db.prepare('SELECT l.title_ar, ROUND(AVG(100.0*a.score/a.total)) avg, COUNT(*) n FROM attempts a JOIN lessons l ON l.id=a.lesson_id GROUP BY l.id HAVING n>=1 ORDER BY avg ASC LIMIT 5').all(),
    warnings: [
      ...db.prepare("SELECT 'درس بلا أسئلة: ' || title_ar t FROM lessons WHERE status='published' AND id NOT IN (SELECT lesson_id FROM questions WHERE lesson_id IS NOT NULL)").all().map((x) => x.t),
      ...db.prepare("SELECT 'مقرر بلا دروس: ' || title_ar t FROM courses WHERE status='published' AND id NOT IN (SELECT course_id FROM lessons WHERE course_id IS NOT NULL)").all().map((x) => x.t),
      ...db.prepare("SELECT 'مرحلة بلا دروس: ' || code t FROM stages WHERE code NOT IN (SELECT stage FROM lessons WHERE status='published')").all().map((x) => x.t),
    ].slice(0, 40),
  };
}, { role: ['admin', 'instructor'] });
