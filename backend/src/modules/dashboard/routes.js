'use strict';
const r = require('../../core/router');
const P = require('../../lib/progress');
const S = require('../../lib/structure');

r.get('/api/dashboard', ({ db, session }) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(session.id), uid = u.id;
  const stage = db.prepare('SELECT * FROM stages WHERE code=?').get(u.stage);
  const stageLessons = db.prepare("SELECT id,slug,title_ar,minutes FROM lessons WHERE stage=? AND status='published' ORDER BY ord").all(u.stage);
  const prog = Object.fromEntries(db.prepare('SELECT lesson_id,status FROM progress WHERE user_id=?').all(uid).map((p) => [p.lesson_id, p.status]));
  const passed = (id) => ['passed', 'mastered'].includes(prog[id]);
  const resume = stageLessons.find((l) => !passed(l.id)) || null;
  const week = db.prepare("SELECT day,minutes,xp FROM activity WHERE user_id=? AND day>=date('now','-6 days') ORDER BY day").all(uid);
  const todayMin = db.prepare('SELECT COALESCE(minutes,0) m FROM activity WHERE user_id=? AND day=?').get(uid, P.today())?.m || 0;
  const count = (sql, ...a) => db.prepare(sql).get(uid, ...a).c;
  const lv = P.level(u.xp);
  const courses = db.prepare(`SELECT c.slug,c.title_ar,c.color,c.stage,(SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id AND l.status='published') total,
    (SELECT COUNT(*) FROM progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=e.user_id AND l.course_id=c.id AND p.status IN ('passed','mastered')) done, e.completed_at
    FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.enrolled_at DESC LIMIT 4`).all(uid);
  const recent = db.prepare('SELECT l.slug,l.title_ar,p.status FROM progress p JOIN lessons l ON l.id=p.lesson_id WHERE p.user_id=? ORDER BY p.updated_at DESC LIMIT 4').all(uid);
  const weak = db.prepare('SELECT l.slug,l.title_ar,SUM(m.count) n FROM mistakes m JOIN questions q ON q.id=m.question_id JOIN lessons l ON l.id=q.lesson_id WHERE m.user_id=? GROUP BY l.id ORDER BY n DESC LIMIT 3').all(uid);
  // تحديد أضعف المسارات (المهارات) بناءً على تكرار الأخطاء، مع درس مقترح لتقوية كل مسار
  const weakTracks = db.prepare(`SELECT l.track, t.title_ar track_title, SUM(m.count) n FROM mistakes m JOIN questions q ON q.id=m.question_id JOIN lessons l ON l.id=q.lesson_id
    JOIN tracks t ON t.id=l.track WHERE m.user_id=? GROUP BY l.track ORDER BY n DESC LIMIT 3`).all(uid)
    .map((w) => ({ ...w, nextLesson: db.prepare(`SELECT slug,title_ar FROM lessons WHERE track=? AND status='published' AND id NOT IN (SELECT lesson_id FROM progress WHERE user_id=? AND status IN ('passed','mastered')) ORDER BY CASE WHEN stage=? THEN 0 ELSE 1 END, stage, ord LIMIT 1`).get(w.track, uid, u.stage) || null }));
  const recommended = db.prepare(`SELECT l.slug,l.title_ar,l.stage,l.minutes FROM lessons l WHERE l.status='published' AND ${S.VISIBLE_LESSON} AND l.id NOT IN (SELECT lesson_id FROM progress WHERE user_id=? AND status IN ('passed','mastered')) ORDER BY CASE WHEN l.stage=? THEN 0 ELSE 1 END, l.stage, l.ord LIMIT 3`).all(uid, u.stage);
  const latestAch = db.prepare('SELECT a.title_ar,a.icon,ua.at FROM user_achievements ua JOIN achievements a ON a.code=ua.code WHERE ua.user_id=? ORDER BY ua.at DESC LIMIT 3').all(uid);
  const announcements = db.prepare("SELECT id,title,body,at FROM announcements WHERE audience IN ('all',?) ORDER BY id DESC LIMIT 2").all(u.role);
  return {
    user: P.publicUser(u), stage, stageProgress: { done: stageLessons.filter((l) => passed(l.id)).length, total: stageLessons.length }, resume,
    streak: P.streak(db, uid), week, todayMin, goalMin: u.goal_min, minutesWeek: week.reduce((a, b) => a + b.minutes, 0),
    review: { due: count('SELECT COUNT(*) c FROM srs WHERE user_id=? AND due<=?', Date.now()), saved: count('SELECT COUNT(*) c FROM srs WHERE user_id=?') },
    mistakes: count('SELECT COUNT(*) c FROM mistakes WHERE user_id=?'),
    overall: { done: count("SELECT COUNT(*) c FROM progress WHERE user_id=? AND status IN ('passed','mastered')"), total: db.prepare("SELECT COUNT(*) c FROM lessons WHERE status='published'").get().c },
    xp: { now: u.xp, level: lv, levelStart: 50 * (lv - 1) ** 2, levelEnd: 50 * lv ** 2 },
    courses, recent, weak, weakTracks, recommended, achievements: latestAch, announcements, needsPlacement: !u.placement_stage && !u.onboarded,
  };
}, { auth: true });
