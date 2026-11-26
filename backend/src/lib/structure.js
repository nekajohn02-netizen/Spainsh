'use strict';
// الهيكل الأكاديمي القابل للتحكم: المستويات والمراحل والأقسام (المسارات)، مع الإظهار والإخفاء
const VISIBLE_LESSON = "l.stage IN (SELECT s.code FROM stages s JOIN levels v ON v.code=s.level WHERE s.visible=1 AND v.visible=1) AND l.track IN (SELECT id FROM tracks WHERE visible=1)";
const levels = (db, all = false) => db.prepare(`SELECT * FROM levels ${all ? '' : 'WHERE visible=1'} ORDER BY ord, code`).all();
const stages = (db, all = false) => db.prepare(`SELECT s.*, COALESCE(s.color, v.color) color_eff FROM stages s JOIN levels v ON v.code=s.level ${all ? '' : 'WHERE s.visible=1 AND v.visible=1'} ORDER BY v.ord, v.code, s.idx, s.code`).all();
const tracks = (db, all = false) => db.prepare(`SELECT * FROM tracks ${all ? '' : 'WHERE visible=1'} ORDER BY ord, id`).all();
const stageOrder = (db) => stages(db).map((s) => s.code);
const lessonVisible = (db, slug) => !!db.prepare(`SELECT 1 FROM lessons l WHERE l.slug=? AND ${VISIBLE_LESSON}`).get(slug);
module.exports = { VISIBLE_LESSON, levels, stages, tracks, stageOrder, lessonVisible };
