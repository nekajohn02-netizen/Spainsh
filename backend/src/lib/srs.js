'use strict';
function sm2(card, grade, now = Date.now()) {
  let { ease, interval, reps } = card;
  if (grade < 3) { reps = 0; interval = 1; } else { reps += 1; interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ease); }
  ease = Math.max(1.3, ease + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  return { ease, interval, reps, due: now + interval * 864e5 };
}
module.exports = { sm2 };
