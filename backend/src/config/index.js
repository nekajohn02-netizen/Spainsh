'use strict';
module.exports = {
  port: +process.env.PORT || 3000,
  secureCookies: process.env.NODE_ENV === 'production',
  rateMult: +process.env.RATE_LIMIT_MULT || 1,
  passPercent: 70,
  roles: ['student', 'instructor', 'admin'],
  xp: { lessonComplete: 10, quizPass: 20, review: 2, story: 15, placement: 25 },
  session: { shortHours: 24, rememberDays: 30 },
  resetTokenMinutes: 30,
};
