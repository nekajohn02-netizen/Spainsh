'use strict';
// موارد المحتوى: مقررات، وحدات، دروس، أسئلة، قصص، مفردات، إعلانات (CRUD عام)
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const r = require('../../core/router');
const { crud } = require('../../core/crud');
const { str, oneOf, int, slugify } = require('../../core/validate');
const { bad, notFound } = require('../../core/errors');
const { sanitizeHtml } = require('../../lib/sanitize');
const { audit } = require('../../lib/audit');
const { UPLOADS } = require('./site');

const CONTENT = ['admin', 'instructor'];
const STATUS = ['published', 'draft', 'archived'];
const stageOk = (db, s) => { if (!db.prepare('SELECT 1 FROM stages WHERE code=?').get(s)) throw bad('مرحلة غير موجودة'); return s; };
const trackOk = (db, t) => { if (!db.prepare('SELECT 1 FROM tracks WHERE id=?').get(t)) throw bad('مسار غير موجود'); return t; };
const imgUrl = (v) => { const x = String(v || '').trim(); if (x && !/^(\/(assets|uploads)\/[\w./-]+|https:\/\/[^\s"'<>]+)$/.test(x)) throw bad('رابط الصورة غير صالح'); return x; };
const uniq = (db, table, col, val, selfId, idCol = 'id') => { const x = db.prepare(`SELECT ${idCol} i FROM ${table} WHERE ${col}=?`).get(val); if (x && String(x.i) !== String(selfId)) throw bad('القيمة مستخدمة مسبقاً: ' + col); };

// حذف صورة قديمة من مكتبة الوسائط تلقائياً عند تغييرها، فقط إذا لم تعد مستخدمة في أي سجل آخر (الصور مشتركة عبر المكتبة)
const COVER_FIELDS = [['courses', 'cover', 'id'], ['stories', 'cover', 'id'], ['lessons', 'cover', 'id'], ['levels', 'cover', 'code'], ['articles', 'cover', 'id'], ['team_members', 'photo', 'id']];
function cleanupOldImage(db, oldUrl, newUrl, exceptTable, exceptId) {
  if (!oldUrl || oldUrl === newUrl || !oldUrl.startsWith('/uploads/')) return;
  for (const [table, col, idCol] of COVER_FIELDS) {
    const row = table === exceptTable ? db.prepare(`SELECT 1 FROM ${table} WHERE ${col}=? AND ${idCol}!=?`).get(oldUrl, exceptId) : db.prepare(`SELECT 1 FROM ${table} WHERE ${col}=?`).get(oldUrl);
    if (row) return; // لا تزال مستخدمة في سجل آخر
  }
  const filename = oldUrl.slice('/uploads/'.length);
  const m = db.prepare('SELECT id FROM media WHERE filename=?').get(filename); if (!m) return;
  try { fs.unlinkSync(path.join(UPLOADS, filename)); } catch {}
  db.prepare('DELETE FROM media WHERE id=?').run(m.id);
}

crud({ path: 'courses', table: 'courses', id: 'id', role: CONTENT, defSort: 'created_at', search: ['title_ar', 'title_es', 'slug'], sortable: ['title_ar', 'stage', 'track', 'status', 'hours', 'created_at'], filters: ['status', 'track'],
  fields: { slug: 1, title_ar: 1, title_es: 1, description: 1, stage: 1, track: 1, instructor: 1, hours: 1, color: 1, cover: 1, status: 1, created_at: 1 },
  genId: (v) => 'C-' + v.slug.toUpperCase().slice(0, 24) + '-' + crypto.randomBytes(2).toString('hex'),
  select: "*, (SELECT COUNT(*) FROM lessons l WHERE l.course_id=courses.id) lessons, (SELECT COUNT(*) FROM enrollments e WHERE e.course_id=courses.id) students",
  validate: (b, cur, db) => { const slug = slugify(b.slug || b.title_es || b.title_ar); if (!slug) throw bad('المعرّف (slug) مطلوب'); uniq(db, 'courses', 'slug', slug, cur?.id);
    return { slug, title_ar: str(b.title_ar, 'العنوان', { required: true, max: 120 }), title_es: str(b.title_es, 'العنوان بالإسبانية', { max: 120 }), description: str(b.description, 'الوصف', { max: 1500 }),
      stage: stageOk(db, b.stage), track: trackOk(db, b.track), instructor: str(b.instructor, 'المدرّس', { max: 80 }), hours: int(b.hours, 'الساعات', { min: 1, max: 500, def: 10 }),
      color: /^#[0-9a-f]{6}$/i.test(b.color || '') ? b.color : '#9b1b30', cover: imgUrl(b.cover), status: oneOf(b.status || 'draft', STATUS, 'الحالة'), created_at: cur?.created_at || Date.now() }; },
  afterWrite: (db, row, cur) => cleanupOldImage(db, cur?.cover, row.cover, 'courses', row.id),
  beforeDelete: (db, id) => { db.prepare('UPDATE lessons SET course_id=NULL, module_id=NULL WHERE course_id=?').run(id); db.prepare('DELETE FROM enrollments WHERE course_id=?').run(id); } });

crud({ path: 'modules', table: 'modules', role: CONTENT, defSort: 'ord', search: ['title_ar'], sortable: ['title_ar', 'ord', 'course_id'], filters: ['course_id'], fields: { course_id: 1, title_ar: 1, ord: 1 },
  validate: (b, cur, db) => { if (!db.prepare('SELECT 1 FROM courses WHERE id=?').get(b.course_id)) throw bad('مقرر غير موجود'); return { course_id: b.course_id, title_ar: str(b.title_ar, 'العنوان', { required: true, max: 120 }), ord: int(b.ord, 'الترتيب', { min: 0, max: 999, def: 1 }) }; },
  beforeDelete: (db, id) => db.prepare('UPDATE lessons SET module_id=NULL WHERE module_id=?').run(id) });

// الدروس: تنقية HTML في الخادم + سجل إصدارات
// تقدير مدة القراءة تلقائياً من عدد كلمات المحتوى (~130 كلمة/دقيقة لمحتوى تعليمي مُمَزوج بأمثلة)، بدلاً من إدخال يدوي
const WPM = 130;
const estimateMinutes = (html) => { const text = String(html || '').replace(/<[^>]*>/g, ' '); const words = text.split(/\s+/).filter(Boolean).length; return Math.min(240, Math.max(3, Math.round(words / WPM))); };

crud({ path: 'lessons', table: 'lessons', role: CONTENT, defSort: 'updated_at', search: ['title_ar', 'title_es', 'slug'], sortable: ['title_ar', 'stage', 'track', 'status', 'ord', 'updated_at', 'minutes'], filters: ['status', 'stage', 'track', 'course_id'],
  fields: { slug: 1, course_id: 1, module_id: 1, title_ar: 1, title_es: 1, summary: 1, stage: 1, track: 1, minutes: 1, time_limit_min: 1, cover: 1, body: 1, status: 1, ord: 1, version: 1, updated_at: 1 },
  select: "id,slug,course_id,title_ar,title_es,stage,track,minutes,time_limit_min,cover,status,ord,version,updated_at,(SELECT COUNT(*) FROM questions q WHERE q.lesson_id=lessons.id) questions",
  genId: (v) => `L-${v.stage}-${crypto.randomBytes(3).toString('hex')}`,
  validate: (b, cur, db) => { const slug = slugify(b.slug || b.title_es || b.title_ar); if (!slug) throw bad('المعرّف (slug) مطلوب'); uniq(db, 'lessons', 'slug', slug, cur?.id);
    const body = sanitizeHtml(b.body); const changed = cur && cur.body !== body;
    if (b.module_id && !db.prepare('SELECT 1 FROM modules WHERE id=? AND course_id=?').get(b.module_id, b.course_id)) throw bad('الوحدة لا تتبع هذا المقرر');
    return { slug, course_id: b.course_id || null, module_id: b.module_id || null, title_ar: str(b.title_ar, 'العنوان', { required: true, max: 140 }), title_es: str(b.title_es, 'العنوان بالإسبانية', { max: 140 }),
      summary: str(b.summary, 'الملخص', { max: 400 }), stage: stageOk(db, b.stage), track: trackOk(db, b.track), minutes: estimateMinutes(body),
      time_limit_min: b.time_limit_min ? int(b.time_limit_min, 'الحد الزمني للاختبار', { min: 1, max: 180 }) : null, cover: imgUrl(b.cover), body,
      status: oneOf(b.status || 'draft', STATUS, 'الحالة'), ord: int(b.ord, 'الترتيب', { min: 0, max: 999, def: 1 }), version: (cur?.version || 0) + (changed || !cur ? 1 : 0), updated_at: Date.now() }; },
  afterWrite: (db, row, cur, session) => { if (!cur || cur.body !== row.body) db.prepare('INSERT INTO lesson_versions(lesson_id,version,body,at,by_user) VALUES(?,?,?,?,?)').run(row.id, row.version, row.body, Date.now(), session.id);
    cleanupOldImage(db, cur?.cover, row.cover, 'lessons', row.id); },
  beforeDelete: (db, id) => { db.prepare('DELETE FROM progress WHERE lesson_id=?').run(id); db.prepare('DELETE FROM lesson_versions WHERE lesson_id=?').run(id); } });
r.get('/api/admin/lessons/:id/versions', ({ db, params }) => ({ versions: db.prepare('SELECT v.id,v.version,v.at,u.name by_name,length(v.body) size FROM lesson_versions v LEFT JOIN users u ON u.id=v.by_user WHERE v.lesson_id=? ORDER BY v.id DESC LIMIT 30').all(params.id) }), { role: CONTENT });
r.post('/api/admin/lessons/:id/restore/:vid', ({ db, params, session, ip }) => {
  const v = db.prepare('SELECT * FROM lesson_versions WHERE id=? AND lesson_id=?').get(+params.vid, params.id); if (!v) throw notFound();
  const l = db.prepare('SELECT version FROM lessons WHERE id=?').get(params.id); if (!l) throw notFound();
  db.prepare('UPDATE lessons SET body=?, version=version+1, updated_at=? WHERE id=?').run(v.body, Date.now(), params.id);
  db.prepare('INSERT INTO lesson_versions(lesson_id,version,body,at,by_user) VALUES(?,?,?,?,?)').run(params.id, l.version + 1, v.body, Date.now(), session.id);
  audit(db, session.id, `lessons:restore:${params.id}:v${v.version}`, ip); return { ok: true };
}, { role: CONTENT });
r.post('/api/admin/lessons/bulk-status', ({ db, body, session, ip }) => {
  const ids = (Array.isArray(body.ids) ? body.ids : []).slice(0, 200); oneOf(body.status, STATUS, 'الحالة');
  for (const id of ids) db.prepare('UPDATE lessons SET status=?, updated_at=? WHERE id=?').run(body.status, Date.now(), id);
  audit(db, session.id, `lessons:bulk-status:${body.status}:${ids.length}`, ip); return { affected: ids.length };
}, { role: CONTENT });
r.post('/api/admin/preview', ({ body }) => ({ html: sanitizeHtml(body.html) }), { role: CONTENT });

const TYPES = ['single', 'tf', 'fill'];
crud({ path: 'questions', table: 'questions', id: 'id', role: CONTENT, defSort: 'id', search: ['prompt', 'id'], sortable: ['id', 'type', 'stage', 'difficulty', 'bank'], filters: ['bank', 'type', 'stage', 'lesson_id'],
  fields: { lesson_id: 1, bank: 1, type: 1, prompt: 1, options: 1, answer: 1, explain: 1, stage: 1, difficulty: 1 },
  genId: (v) => (v.bank === 'placement' ? 'PL:' : (v.lesson_id || 'Q') + ':') + crypto.randomBytes(3).toString('hex'),
  validate: (b, cur, db) => { const type = oneOf(b.type || 'single', TYPES, 'النوع'), bank = oneOf(b.bank || 'lesson', ['lesson', 'placement'], 'البنك');
    let options = b.options; if (typeof options === 'string') { try { options = JSON.parse(options); } catch { options = String(options).split('\n').map((s) => s.trim()).filter(Boolean); } }
    options = Array.isArray(options) ? options.map(String) : [];
    if (type === 'tf') options = ['صح', 'خطأ'];
    const answer = str(b.answer, 'الإجابة الصحيحة', { required: true, max: 200 });
    if (type !== 'fill') { if (options.length < 2) throw bad('أضف خيارين على الأقل'); if (!(Number.isInteger(+answer) && +answer >= 0 && +answer < options.length)) throw bad('رقم الإجابة الصحيحة خارج الخيارات'); }
    if (bank === 'lesson' && !db.prepare('SELECT 1 FROM lessons WHERE id=?').get(b.lesson_id)) throw bad('اختر درساً صالحاً');
    return { lesson_id: bank === 'lesson' ? b.lesson_id : null, bank, type, prompt: str(b.prompt, 'نص السؤال', { required: true, max: 500 }), options: JSON.stringify(options), answer, explain: str(b.explain, 'الشرح', { max: 500 }),
      stage: b.stage ? stageOk(db, b.stage) : null, difficulty: int(b.difficulty, 'الصعوبة', { min: 1, max: 5, def: 1 }) }; },
  beforeDelete: (db, id) => db.prepare('DELETE FROM mistakes WHERE question_id=?').run(id) });

const jsonField = (v, name, kind) => { let x = v; if (typeof x === 'string') { try { x = JSON.parse(x); } catch { throw bad(`«${name}» ليس JSON صالحاً`); } }
  if (kind === 'array' ? !Array.isArray(x) : (typeof x !== 'object' || Array.isArray(x) || !x)) throw bad(`صيغة «${name}» غير صحيحة`); return JSON.stringify(x); };
crud({ path: 'stories', table: 'stories', role: CONTENT, defSort: 'id', search: ['title_ar', 'title_es', 'slug'], sortable: ['id', 'title_ar', 'stage', 'category', 'status', 'minutes'], filters: ['status', 'stage'],
  fields: { slug: 1, title_ar: 1, title_es: 1, stage: 1, category: 1, minutes: 1, status: 1, cover: 1, body: 1, glossary: 1 }, select: 'id,slug,title_ar,title_es,stage,category,minutes,status',
  validate: (b, cur, db) => { const slug = slugify(b.slug || b.title_es || b.title_ar); if (!slug) throw bad('المعرّف مطلوب'); uniq(db, 'stories', 'slug', slug, cur?.id);
    return { slug, title_ar: str(b.title_ar, 'العنوان', { required: true, max: 120 }), title_es: str(b.title_es, 'العنوان بالإسبانية', { max: 120 }), stage: stageOk(db, b.stage), category: str(b.category, 'التصنيف', { max: 60 }),
      minutes: int(b.minutes, 'المدة', { min: 1, max: 120, def: 5 }), status: oneOf(b.status || 'draft', STATUS, 'الحالة'), cover: imgUrl(b.cover), body: jsonField(b.body ?? '[]', 'نص القصة', 'array'), glossary: jsonField(b.glossary ?? '{}', 'المسرد', 'object') }; },
  afterWrite: (db, row, cur) => cleanupOldImage(db, cur?.cover, row.cover, 'stories', row.id) });

// المقالات: مجلة/بلوج عام للموقع (منفصل عن الدروس والقصص، موجّه لمحتوى SEO عام)
crud({ path: 'articles', table: 'articles', role: CONTENT, defSort: 'updated_at', search: ['title_ar', 'title_es', 'slug'], sortable: ['title_ar', 'category', 'status', 'updated_at'], filters: ['status', 'category'],
  fields: { slug: 1, title_ar: 1, title_es: 1, excerpt: 1, seo_title: 1, seo_description: 1, category: 1, cover: 1, body: 1, status: 1, author: 1, published_at: 1, created_at: 1, updated_at: 1 },
  validate: (b, cur, db, session) => { const slug = slugify(b.slug || b.title_es || b.title_ar); if (!slug) throw bad('المعرّف (slug) مطلوب'); uniq(db, 'articles', 'slug', slug, cur?.id);
    const status = oneOf(b.status || 'draft', STATUS, 'الحالة');
    return { slug, title_ar: str(b.title_ar, 'العنوان', { required: true, max: 140 }), title_es: str(b.title_es, 'العنوان بالإسبانية', { max: 140 }), excerpt: str(b.excerpt, 'المقتطف', { max: 300 }),
      seo_title: str(b.seo_title, 'عنوان SEO', { max: 70 }), seo_description: str(b.seo_description, 'وصف SEO', { max: 160 }), category: str(b.category, 'التصنيف', { max: 60 }), cover: imgUrl(b.cover),
      body: sanitizeHtml(b.body || ''), status, author: cur?.author || session?.id, published_at: status === 'published' ? (cur?.published_at || Date.now()) : (cur?.published_at || null),
      created_at: cur?.created_at || Date.now(), updated_at: Date.now() }; },
  afterWrite: (db, row, cur) => cleanupOldImage(db, cur?.cover, row.cover, 'articles', row.id) });

crud({ path: 'vocab', table: 'vocab', role: CONTENT, defSort: 'id', search: ['es', 'ar', 'topic'], sortable: ['id', 'es', 'ar', 'pos', 'stage', 'topic'], filters: ['stage', 'pos', 'topic'],
  fields: { es: 1, ar: 1, pos: 1, gender: 1, example: 1, example_ar: 1, stage: 1, topic: 1 },
  validate: (b, cur, db) => { const es = str(b.es, 'الكلمة', { required: true, max: 80 }); uniq(db, 'vocab', 'es', es, cur?.id);
    return { es, ar: str(b.ar, 'المعنى', { required: true, max: 120 }), pos: str(b.pos, 'النوع', { max: 30 }), gender: oneOf(b.gender || '', ['', 'مذكر', 'مؤنث'], 'الجنس'), example: str(b.example, 'المثال', { max: 200 }),
      example_ar: str(b.example_ar, 'ترجمة المثال', { max: 200 }), stage: b.stage ? stageOk(db, b.stage) : null, topic: str(b.topic, 'الموضوع', { max: 40 }) }; },
  beforeDelete: (db, id) => db.prepare('DELETE FROM srs WHERE vocab_id=?').run(id) });

crud({ path: 'announcements', table: 'announcements', role: 'admin', defSort: 'id', search: ['title', 'body'], sortable: ['id', 'title', 'audience', 'at'], fields: { title: 1, body: 1, audience: 1, at: 1, author: 1 },
  validate: (b, cur, db, session) => ({ title: str(b.title, 'العنوان', { required: true, max: 120 }), body: str(b.body, 'النص', { required: true, max: 1000 }), audience: oneOf(b.audience || 'all', ['all', 'student', 'instructor', 'admin'], 'الجمهور'), at: cur?.at || Date.now(), author: cur?.author || session?.id }) });

/* ---------- الهيكل الأكاديمي: مستويات ومراحل وأقسام (مسارات) ---------- */
const codeOk = (v) => { const c = String(v || '').trim(); if (!/^[A-Za-z0-9_.-]{1,16}$/.test(c)) throw bad('الكود: أحرف إنجليزية وأرقام فقط (حتى 16)'); return c; };
const stagesListOk = (db, v) => { const list = String(v || '').split(',').map((s) => s.trim()).filter(Boolean); if (!list.length) throw bad('اكتب كود مرحلة واحدة على الأقل مفصولة بفواصل'); for (const s of list) stageOk(db, s); return list.join(','); };
const hex = (v, def) => (/^#[0-9a-f]{6}$/i.test(v || '') ? v : def);
const flag = (v) => (v === false || v === 0 || v === '0' ? 0 : 1);

crud({ path: 'levels', table: 'levels', id: 'code', role: 'admin', defSort: 'ord', select: '*, code AS id', search: ['code', 'title_ar', 'title_es'], sortable: ['code', 'title_ar', 'ord', 'visible'],
  fields: { title_ar: 1, title_es: 1, color: 1, cover: 1, ord: 1, visible: 1 }, genId: (v) => v.code,
  validate: (b, cur, db) => { const code = cur ? cur.code : codeOk(b.code); if (!cur) uniq(db, 'levels', 'code', code, null, 'code');
    return { code, title_ar: str(b.title_ar, 'الاسم', { required: true, max: 60 }), title_es: str(b.title_es, 'الاسم بالإسبانية', { max: 60 }), color: hex(b.color, '#9b1b30'), cover: imgUrl(b.cover), ord: int(b.ord, 'الترتيب', { min: 0, max: 999, def: 0 }), visible: flag(b.visible) }; },
  afterWrite: (db, row, cur) => cleanupOldImage(db, cur?.cover, row.cover, 'levels', row.code),
  beforeDelete: (db, id) => { if (db.prepare('SELECT 1 FROM stages WHERE level=?').get(id)) throw bad('لا يمكن حذف مستوى يحتوي مراحل. احذف مراحله أو أخفِه.'); } });

crud({ path: 'stages', table: 'stages', id: 'code', role: 'admin', defSort: 'level', select: '*, code AS id', search: ['code', 'title_ar', 'title_es'], sortable: ['code', 'level', 'idx', 'title_ar', 'hours', 'visible'], filters: ['level', 'visible'],
  fields: { level: 1, idx: 1, title_ar: 1, title_es: 1, purpose: 1, outcomes: 1, hours: 1, color: 1, visible: 1 }, genId: (v) => v.code,
  validate: (b, cur, db) => { const code = cur ? cur.code : codeOk(b.code); if (!cur) uniq(db, 'stages', 'code', code, null, 'code');
    if (!db.prepare('SELECT 1 FROM levels WHERE code=?').get(b.level)) throw bad('المستوى غير موجود');
    return { code, level: b.level, idx: int(b.idx, 'الترتيب داخل المستوى', { min: 0, max: 99, def: 1 }), title_ar: str(b.title_ar, 'العنوان', { required: true, max: 100 }), title_es: str(b.title_es, 'العنوان بالإسبانية', { max: 100 }),
      purpose: str(b.purpose, 'الهدف', { max: 400 }), outcomes: str(b.outcomes, 'مخرجات التعلّم', { max: 1500 }), hours: int(b.hours, 'الساعات', { min: 0, max: 1000, def: 40 }), color: b.color ? hex(b.color, null) : null, visible: flag(b.visible) }; },
  beforeDelete: (db, id) => { const used = db.prepare('SELECT (SELECT COUNT(*) FROM lessons WHERE stage=?) l, (SELECT COUNT(*) FROM courses WHERE stage=?) c, (SELECT COUNT(*) FROM users WHERE stage=?) u').get(id, id, id);
    if (used.l || used.c || used.u) throw bad(`لا يمكن حذف مرحلة مستخدمة (${used.l} دروس، ${used.c} مقررات، ${used.u} طلاب). أخفِها بدلاً من حذفها.`); } });

const ICONS = ['book', 'wave', 'chat', 'cards', 'map', 'layers', 'game', 'star', 'trophy', 'bolt', 'users', 'chart'];
crud({ path: 'tracks', table: 'tracks', id: 'id', role: 'admin', defSort: 'ord', search: ['id', 'title_ar', 'title_es'], sortable: ['id', 'title_ar', 'ord', 'visible'], fields: { title_ar: 1, title_es: 1, icon: 1, color: 1, ord: 1, description: 1, visible: 1 }, genId: (v) => v.code,
  select: '*, (SELECT COUNT(*) FROM lessons l WHERE l.track=tracks.id) lessons, (SELECT COUNT(*) FROM courses c WHERE c.track=tracks.id) courses',
  validate: (b, cur, db) => { const code = cur ? cur.id : codeOk(b.code); if (!cur) uniq(db, 'tracks', 'id', code, null, 'id');
    return { code, title_ar: str(b.title_ar, 'الاسم', { required: true, max: 60 }), title_es: str(b.title_es, 'الاسم بالإسبانية', { max: 60 }), icon: ICONS.includes(b.icon) ? b.icon : 'book', color: hex(b.color, '#9b1b30'), ord: int(b.ord, 'الترتيب', { min: 0, max: 999, def: 0 }), description: str(b.description, 'الوصف', { max: 300 }), visible: flag(b.visible) }; },
  beforeDelete: (db, id) => { const u = db.prepare('SELECT (SELECT COUNT(*) FROM lessons WHERE track=?) l, (SELECT COUNT(*) FROM courses WHERE track=?) c').get(id, id); if (u.l || u.c) throw bad(`القسم مستخدم في ${u.l} دروس و${u.c} مقررات. أخفِه بدلاً من حذفه.`); } });

/* ---------- اختبارات تحديد المستوى المتعددة: كل اختبار يغطي نطاقاً من المراحل (مرحلة واحدة، مستوى كامل، أو عدة مستويات) ---------- */
crud({ path: 'placement-tests', table: 'placement_tests', role: 'admin', defSort: 'ord', search: ['title_ar', 'title_es'], sortable: ['title_ar', 'ord', 'status'], filters: ['status'],
  fields: { title_ar: 1, title_es: 1, stages: 1, status: 1, ord: 1 }, genId: () => 'PT-' + crypto.randomBytes(4).toString('hex'),
  validate: (b, cur, db) => ({ title_ar: str(b.title_ar, 'العنوان', { required: true, max: 120 }), title_es: str(b.title_es, 'العنوان بالإسبانية', { max: 120 }),
    stages: stagesListOk(db, b.stages), status: oneOf(b.status || 'published', STATUS, 'الحالة'), ord: int(b.ord, 'الترتيب', { min: 0, max: 999, def: 1 }) }) });

/* ---------- فريق العمل: مدرّبون والقائمون على المنصة (صفحة عامة يمكن إخفاؤها بالكامل من مفاتيح الميزات) ---------- */
crud({ path: 'team', table: 'team_members', role: 'admin', defSort: 'ord', search: ['name', 'role_ar'], sortable: ['name', 'ord', 'visible'],
  fields: { name: 1, role_ar: 1, bio: 1, photo: 1, cv_url: 1, email: 1, ord: 1, visible: 1 },
  validate: (b) => ({ name: str(b.name, 'الاسم', { required: true, max: 100 }), role_ar: str(b.role_ar, 'الصفة/الدور', { max: 100 }), bio: str(b.bio, 'نبذة', { max: 600 }),
    photo: imgUrl(b.photo), cv_url: imgUrl(b.cv_url), email: str(b.email, 'البريد', { max: 120 }), ord: int(b.ord, 'الترتيب', { min: 0, max: 999, def: 1 }), visible: flag(b.visible) }),
  afterWrite: (db, row, cur) => cleanupOldImage(db, cur?.photo, row.photo, 'team_members', row.id) });

/* ---------- فعاليات وتحديات أسبوعية بمدة محدّدة ولوحة صدارة خاصة بها ---------- */
crud({ path: 'events', table: 'events', role: 'admin', defSort: 'starts_at', search: ['title_ar', 'title_es'], sortable: ['title_ar', 'starts_at', 'ends_at', 'status'], filters: ['status'],
  fields: { slug: 1, title_ar: 1, title_es: 1, description: 1, starts_at: 1, ends_at: 1, points_note: 1, status: 1, created_at: 1 },
  validate: (b, cur, db) => { const slug = slugify(b.slug || b.title_es || b.title_ar); if (!slug) throw bad('المعرّف (slug) مطلوب'); uniq(db, 'events', 'slug', slug, cur?.id);
    const starts = +b.starts_at, ends = +b.ends_at; if (!starts || !ends) throw bad('حدّد تاريخي البداية والنهاية'); if (ends <= starts) throw bad('نهاية الفعالية يجب أن تكون بعد بدايتها');
    return { slug, title_ar: str(b.title_ar, 'العنوان', { required: true, max: 140 }), title_es: str(b.title_es, 'العنوان بالإسبانية', { max: 140 }), description: str(b.description, 'الوصف', { max: 800 }),
      starts_at: starts, ends_at: ends, points_note: str(b.points_note, 'ملاحظة النقاط', { max: 200 }), status: oneOf(b.status || 'draft', STATUS, 'الحالة'), created_at: cur?.created_at || Date.now() }; } });
