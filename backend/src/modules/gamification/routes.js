'use strict';
const r = require('../../core/router');
const P = require('../../lib/progress');

r.get('/api/achievements', ({ db, session }) => {
  const got = Object.fromEntries(db.prepare('SELECT code,at FROM user_achievements WHERE user_id=?').all(session.id).map((a) => [a.code, a.at]));
  return { achievements: db.prepare('SELECT * FROM achievements ORDER BY ord').all().map((a) => ({ ...a, unlockedAt: got[a.code] || null })) };
}, { auth: true });
// لوحة الصدارة اختيارية: لا يظهر إلا من فعّل ملفه العام. تدعم فترات أسبوعية/شهرية/سنوية إلى جانب الإجمالي
const PERIOD_DAYS = { week: 7, month: 30, year: 365 };
r.get('/api/leaderboard', ({ db, session, query }) => {
  const period = ['week', 'month', 'year'].includes(query.get('period')) ? query.get('period') : 'all';
  let rows;
  if (period === 'all') {
    rows = db.prepare("SELECT id,name,hue,xp,stage FROM users WHERE public_profile=1 AND status='active' ORDER BY xp DESC LIMIT 20").all()
      .map((u, i) => ({ rank: i + 1, name: u.name, hue: u.hue, xp: u.xp, level: P.level(u.xp), stage: u.stage, me: u.id === session.id }));
  } else {
    const since = new Date(Date.now() - PERIOD_DAYS[period] * 86400000).toISOString().slice(0, 10);
    rows = db.prepare(`SELECT u.id,u.name,u.hue,u.stage, COALESCE(SUM(a.xp),0) period_xp FROM users u JOIN activity a ON a.user_id=u.id
      WHERE u.public_profile=1 AND u.status='active' AND a.day>=? GROUP BY u.id HAVING period_xp>0 ORDER BY period_xp DESC LIMIT 20`).all(since)
      .map((u, i) => ({ rank: i + 1, name: u.name, hue: u.hue, xp: u.period_xp, level: P.level(u.period_xp), stage: u.stage, me: u.id === session.id }));
  }
  return { rows, period, optedIn: !!session.public_profile };
}, { auth: true });
