'use strict';
const crypto = require('node:crypto');
const cfg = require('../config');
const today = () => new Date().toISOString().slice(0, 10);
const level = (xp) => Math.floor(Math.sqrt(xp / 50)) + 1;
const getSetting = (db, k, def) => db.prepare('SELECT v FROM settings WHERE k=?').get(k)?.v ?? def;
const passPercent = (db) => +getSetting(db, 'pass_percent', cfg.passPercent) || cfg.passPercent;

function notify(db, userId, title, body = '', kind = 'info') {
  db.prepare('INSERT INTO notifications(user_id,title,body,kind,at) VALUES(?,?,?,?,?)').run(userId, title, body, kind, Date.now());
}
function addActivity(db, userId, { minutes = 0, xp = 0 }) {
  db.prepare(`INSERT INTO activity(user_id,day,minutes,xp) VALUES(?,?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET minutes=minutes+excluded.minutes, xp=xp+excluded.xp`).run(userId, today(), minutes, xp);
  if (xp) db.prepare('UPDATE users SET xp=xp+? WHERE id=?').run(xp, userId);
}
function streak(db, userId) {
  const days = new Set(db.prepare('SELECT day FROM activity WHERE user_id=? ORDER BY day DESC LIMIT 400').all(userId).map((r) => r.day));
  let n = 0; const d = new Date();
  if (!days.has(d.toISOString().slice(0, 10))) d.setUTCDate(d.getUTCDate() - 1);
  while (days.has(d.toISOString().slice(0, 10))) { n++; d.setUTCDate(d.getUTCDate() - 1); }
  return n;
}
function unlock(db, userId, code) {
  const a = db.prepare('SELECT * FROM achievements WHERE code=?').get(code);
  if (!a) return null;
  const info = db.prepare('INSERT OR IGNORE INTO user_achievements(user_id,code,at) VALUES(?,?,?)').run(userId, code, Date.now());
  if (!info.changes) return null;
  if (a.xp) addActivity(db, userId, { xp: a.xp });
  notify(db, userId, `إنجاز جديد: ${a.title_ar}`, a.desc_ar, 'achievement');
  return a;
}
// تقييم الإنجازات بعد أي حدث. تُرجع الإنجازات الجديدة
function checkAchievements(db, userId) {
  const got = [];
  const c = (sql, ...a) => db.prepare(sql).get(userId, ...a).c;
  const rules = {
    first_lesson: () => c("SELECT COUNT(*) c FROM progress WHERE user_id=? AND status!='viewed'") > 0,
    first_pass: () => c("SELECT COUNT(*) c FROM progress WHERE user_id=? AND status IN ('passed','mastered')") > 0,
    perfect: () => c('SELECT COUNT(*) c FROM attempts WHERE user_id=? AND score=total AND total>0') > 0,
    mastery: () => c("SELECT COUNT(*) c FROM progress WHERE user_id=? AND status='mastered'") > 0,
    streak3: () => streak(db, userId) >= 3, streak7: () => streak(db, userId) >= 7,
    vocab10: () => c('SELECT COUNT(*) c FROM srs WHERE user_id=?') >= 10,
    review50: () => c('SELECT COALESCE(SUM(reps),0) c FROM srs WHERE user_id=?') >= 50,
    reader: () => c('SELECT COUNT(*) c FROM story_reads WHERE user_id=?') > 0,
    placement: () => !!db.prepare('SELECT placement_stage p FROM users WHERE id=?').get(userId).p,
    course: () => c('SELECT COUNT(*) c FROM enrollments WHERE user_id=? AND completed_at IS NOT NULL') > 0,
    xp500: () => db.prepare('SELECT xp FROM users WHERE id=?').get(userId).xp >= 500,
  };
  const have = new Set(db.prepare('SELECT code FROM user_achievements WHERE user_id=?').all(userId).map((r) => r.code));
  for (const [code, test] of Object.entries(rules)) if (!have.has(code) && test()) { const a = unlock(db, userId, code); if (a) got.push(a); }
  return got;
}
const { stageOrder } = require('./structure');
function maybeAdvanceStage(db, user) {
  const lessons = db.prepare("SELECT id FROM lessons WHERE stage=? AND status='published'").all(user.stage);
  if (!lessons.length) return null;
  const passed = db.prepare("SELECT COUNT(*) c FROM progress WHERE user_id=? AND status IN ('passed','mastered') AND lesson_id IN (SELECT id FROM lessons WHERE stage=?)").get(user.id, user.stage).c;
  if (passed < lessons.length) return null;
  const all = stageOrder(db), next = all[all.indexOf(user.stage) + 1];
  if (!next) return null;
  db.prepare('UPDATE users SET stage=? WHERE id=?').run(next, user.id);
  notify(db, user.id, `انتقلت إلى المرحلة ${next}`, 'أحسنت! أكملت مرحلتك السابقة.', 'stage');
  return next;
}
function checkCourseCompletion(db, userId, courseId) {
  if (!courseId) return null;
  const enr = db.prepare('SELECT * FROM enrollments WHERE user_id=? AND course_id=?').get(userId, courseId);
  if (!enr || enr.completed_at) return null;
  const total = db.prepare("SELECT COUNT(*) c FROM lessons WHERE course_id=? AND status='published'").get(courseId).c;
  const done = db.prepare("SELECT COUNT(*) c FROM progress WHERE user_id=? AND status IN ('passed','mastered') AND lesson_id IN (SELECT id FROM lessons WHERE course_id=? AND status='published')").get(userId, courseId).c;
  if (!total || done < total) return null;
  const code = 'AE-' + crypto.randomBytes(5).toString('hex').toUpperCase();
  db.prepare('UPDATE enrollments SET completed_at=? WHERE user_id=? AND course_id=?').run(Date.now(), userId, courseId);
  db.prepare('INSERT OR IGNORE INTO certificates(code,user_id,course_id,issued_at) VALUES(?,?,?,?)').run(code, userId, courseId, Date.now());
  const c = db.prepare('SELECT title_ar FROM courses WHERE id=?').get(courseId);
  notify(db, userId, `أكملت مقرر «${c.title_ar}»`, `شهادة الإتمام الداخلية رقم ${code}`, 'certificate');
  return code;
}
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, stage: u.stage, xp: u.xp, level: level(u.xp), goalMin: u.goal_min, hue: u.hue, onboarded: !!u.onboarded });
module.exports = { today, level, getSetting, passPercent, notify, addActivity, streak, unlock, checkAchievements, stageOrder, maybeAdvanceStage, checkCourseCompletion, publicUser };
