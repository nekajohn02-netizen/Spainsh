'use strict';
const r = require('../../core/router');
const { notFound } = require('../../core/errors');
const S = require('../../lib/structure');

// السجل الأكاديمي الداخلي. الساعات تقدير داخلي وليست اعتماداً رسمياً (ECTS) ولا شهادة CEFR
r.get('/api/transcript', ({ db, session }) => {
  const stages = S.stages(db).map((s) => {
    const total = db.prepare("SELECT COUNT(*) c FROM lessons WHERE stage=? AND status='published'").get(s.code).c;
    const done = db.prepare("SELECT COUNT(*) c FROM progress WHERE user_id=? AND status IN ('passed','mastered') AND lesson_id IN (SELECT id FROM lessons WHERE stage=?)").get(session.id, s.code).c;
    return { code: s.code, title: s.title_ar, hours: s.hours, total, done, complete: total > 0 && done >= total };
  });
  const courses = db.prepare(`SELECT c.title_ar, c.hours, c.stage, e.enrolled_at, e.completed_at, (SELECT code FROM certificates WHERE user_id=e.user_id AND course_id=c.id) certificate FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.enrolled_at DESC`).all(session.id);
  const minutes = db.prepare('SELECT COALESCE(SUM(minutes),0) m FROM activity WHERE user_id=?').get(session.id).m;
  const results = db.prepare(`SELECT l.title_ar, l.stage, p.best_score, p.status FROM progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=? AND p.status IN ('passed','mastered','assessed') ORDER BY p.updated_at DESC`).all(session.id);
  const completedHours = courses.filter((c) => c.completed_at).reduce((a, c) => a + c.hours, 0);
  return { student: { name: session.name, email: session.email, stage: session.stage, joined: session.created_at }, stages, courses, results, studyMinutes: minutes, completedHours,
    disclaimer: 'سجل داخلي للمنصة. الساعات تقديرية وليست اعتماداً أكاديمياً رسمياً أو شهادة CEFR.' };
}, { auth: true });
// التحقق العام من شهادة
r.get('/api/certificates/:code', ({ db, params }) => {
  const c = db.prepare('SELECT c.code,c.issued_at,u.name,co.title_ar course,co.title_es,co.hours,co.stage FROM certificates c JOIN users u ON u.id=c.user_id JOIN courses co ON co.id=c.course_id WHERE c.code=?').get(params.code);
  if (!c) throw notFound('شهادة غير معروفة'); return { certificate: c };
});
