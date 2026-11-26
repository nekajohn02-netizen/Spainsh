'use strict';
const { LEVELS, TRACKS } = require('./stages');
const { COURSES } = require('./courses');
const { ACHIEVEMENTS } = require('./achievements');
const { STORIES } = require('./stories');
const { PLACEMENT } = require('./placement');
const { VOCAB: V1 } = require('./vocab-core');
const { VOCAB: V2 } = require('./vocab-more');
const L1 = require('./lessons/a1-core').LESSONS, L2 = require('./lessons/a1-more').LESSONS;
const { hashPassword } = require('../../security/password');

function seed(db) {
  const now = Date.now();
  const LEVEL_META = { A1: ['مبتدئ', 'Principiante', '#0e9f8e'], A2: ['أساسي', 'Elemental', '#2f80ed'], B1: ['متوسط', 'Intermedio', '#6d4cff'], B2: ['فوق المتوسط', 'Intermedio alto', '#d6409f'], C1: ['متقدم', 'Avanzado', '#9b1b30'], C2: ['إتقان', 'Maestría', '#c8962e'] };
  const il0 = db.prepare('INSERT OR IGNORE INTO levels(code,title_ar,title_es,color,ord) VALUES(?,?,?,?,?)');
  Object.keys(LEVELS).forEach((lv, i) => il0.run(lv, ...LEVEL_META[lv], i + 1));
  const is = db.prepare('INSERT OR IGNORE INTO stages(code,level,idx,title_ar,purpose,hours) VALUES(?,?,?,?,?,?)');
  for (const [lv, st] of Object.entries(LEVELS)) st.forEach(([t, p, h], i) => is.run(`${lv}.${i + 1}`, lv, i + 1, t, p, h));
  const it = db.prepare('INSERT OR IGNORE INTO tracks(id,title_ar,title_es,icon,color,ord) VALUES(?,?,?,?,?,?)'); TRACKS.forEach((t) => it.run(...t));

  // المقررات والوحدات وربط الدروس
  const lessonMap = {};
  const ic = db.prepare('INSERT OR IGNORE INTO courses(id,slug,title_ar,title_es,description,stage,track,instructor,hours,color,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  const im = db.prepare('INSERT INTO modules(course_id,title_ar,ord) VALUES(?,?,?)');
  const exists = db.prepare('SELECT 1 FROM courses WHERE id=?');
  for (const c of COURSES) {
    if (exists.get(c.id)) continue;
    ic.run(c.id, c.slug, c.title_ar, c.title_es, c.description, c.stage, c.track, c.instructor, c.hours, c.color, now);
    c.modules.forEach(([title, slugs], mi) => { const m = im.run(c.id, title, mi + 1); slugs.forEach((s, li) => { lessonMap[s] = { course: c.id, module: Number(m.lastInsertRowid), ord: mi * 10 + li + 1 }; }); });
  }
  const il = db.prepare('INSERT OR IGNORE INTO lessons(id,slug,course_id,module_id,title_ar,title_es,summary,stage,track,minutes,body,ord,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');
  const iq = db.prepare('INSERT OR IGNORE INTO questions(id,lesson_id,bank,type,prompt,options,answer,explain,stage) VALUES(?,?,?,?,?,?,?,?,?)');
  for (const l of [...L1, ...L2]) {
    const m = lessonMap[l.slug];
    il.run(l.id, l.slug, m?.course ?? null, m?.module ?? null, l.title_ar, l.title_es, l.summary, l.stage, l.track, l.minutes, l.body, m?.ord ?? l.ord, now);
    l.q.forEach(([id, type, prompt, opts, ans, exp]) => iq.run(`${l.id}:${id}`, l.id, 'lesson', type, prompt, JSON.stringify(opts), ans, exp, l.stage));
  }
  for (const p of PLACEMENT) iq.run(`PL:${p[0]}`, null, 'placement', 'single', p[2], JSON.stringify(p[3]), String(p[4]), '', p[1]);

  const iv = db.prepare('INSERT OR IGNORE INTO vocab(es,ar,pos,gender,example,example_ar,stage,topic) VALUES(?,?,?,?,?,?,?,?)');
  [...V1, ...V2].forEach((v) => iv.run(...v));
  const ia = db.prepare('INSERT OR IGNORE INTO achievements(code,title_ar,desc_ar,icon,xp,ord) VALUES(?,?,?,?,?,?)');
  ACHIEVEMENTS.forEach((a, i) => ia.run(...a, i));
  const is2 = db.prepare('INSERT OR IGNORE INTO stories(slug,title_ar,title_es,stage,category,minutes,body,glossary) VALUES(?,?,?,?,?,?,?,?)');
  STORIES.forEach((s) => is2.run(s.slug, s.title_ar, s.title_es, s.stage, s.category, s.minutes, JSON.stringify(s.body), JSON.stringify(s.glossary)));
  const ist = db.prepare('INSERT OR IGNORE INTO settings(k,v) VALUES(?,?)');
  ist.run('pass_percent', '70'); ist.run('registration_open', '1'); ist.run('announcement_banner', '');

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && !db.prepare('SELECT 1 FROM users WHERE email=?').get(ADMIN_EMAIL.toLowerCase())) {
    db.prepare("INSERT INTO users(email,name,pw_hash,role,onboarded,created_at) VALUES(?,?,?,'admin',1,?)").run(ADMIN_EMAIL.toLowerCase(), 'مدير المنصة', hashPassword(ADMIN_PASSWORD), now);
  }
}
module.exports = { seed };
