'use strict';
const norm = (s) => String(s ?? '').trim().toLowerCase().normalize('NFC');
function grade(questions, answers) {
  let score = 0;
  const results = questions.map((q) => {
    const given = answers?.[q.id];
    const correct = norm(given) === norm(q.answer);
    if (correct) score++;
    return { id: q.id, correct, given: given ?? null, answer: q.answer, explain: q.explain || '' };
  });
  return { score, total: questions.length, results };
}
module.exports = { grade, norm };
