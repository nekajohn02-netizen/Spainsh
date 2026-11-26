'use strict';
const DEFAULTS = require('../config/site-defaults');
const clone = (x) => JSON.parse(JSON.stringify(x));
const HEX = /^#[0-9a-fA-F]{6}$/, URL_OK = /^(\/(assets|uploads)\/[\w./-]+|https:\/\/[^\s"'<>]+)?$/;
const ICONS = ['map', 'layers', 'check', 'cards', 'game', 'book', 'star', 'trophy', 'flame', 'bolt', 'chat', 'wave', 'shield', 'award', 'users', 'chart', 'clock', 'zap'];

// تحويل أي مدخل إلى شكل المخطط الافتراضي: مفاتيح غريبة تُحذف، والأنواع تُفرض، والروابط والألوان تُتحقق
function coerce(def, val, key = '') {
  if (typeof def === 'boolean') return val === undefined ? def : !!val;
  if (typeof def === 'number') { const n = Number(val); return Number.isFinite(n) ? Math.min(Math.max(n, key === 'font_scale' ? 0.85 : 0), key === 'font_scale' ? 1.3 : 100) : def; }
  if (typeof def === 'string') {
    if (val === undefined || val === null) return def;
    const s = String(val).trim();
    if (/color|^brand|^gold/.test(key)) return HEX.test(s) ? s : def;
    if (['logo', 'logo_small', 'favicon', 'hero', 'intro', 'auth', 'about', 'empty', 'course_cover'].includes(key)) return URL_OK.test(s) ? s : def;
    if (key === 'icon') return ICONS.includes(s) ? s : def;
    if (key === 'radius') return ['sharp', 'normal', 'round'].includes(s) ? s : def;
    if (key === 'default_mode') return ['system', 'light', 'dark'].includes(s) ? s : def;
    return s.slice(0, key === 'body' || key === 'a' ? 3000 : 300);
  }
  if (Array.isArray(def)) {
    const shape = def[0], list = Array.isArray(val) ? val : def;
    return list.slice(0, 40).map((it) => coerce(shape, it, key));
  }
  if (def && typeof def === 'object') { const src = val && typeof val === 'object' ? val : {}; return Object.fromEntries(Object.keys(def).map((k) => [k, coerce(def[k], src[k], k)])); }
  return def;
}
function getSite(db) {
  const row = db.prepare("SELECT v FROM settings WHERE k='site_config'").get();
  let stored = {}; try { stored = row ? JSON.parse(row.v) : {}; } catch {}
  const site = coerce(clone(DEFAULTS), stored);
  // عناصر القوائم الجديدة (تُضاف مستقبلاً) تُدمج حتى لا تختفي
  for (const k of ['public', 'app']) { const have = new Set(site.nav[k].map((i) => i.id)); for (const d of DEFAULTS.nav[k]) if (!have.has(d.id)) site.nav[k].push(clone(d)); site.nav[k] = site.nav[k].filter((i) => DEFAULTS.nav[k].some((d) => d.id === i.id)); }
  const have = new Set(site.home.sections.map((i) => i.id)); for (const d of DEFAULTS.home.sections) if (!have.has(d.id)) site.home.sections.push(clone(d));
  site.home.sections = site.home.sections.filter((i) => DEFAULTS.home.sections.some((d) => d.id === i.id));
  return site;
}
function saveSite(db, input) {
  const clean = coerce(clone(DEFAULTS), input);
  db.prepare("INSERT INTO settings(k,v) VALUES('site_config',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(JSON.stringify(clean));
  return getSite(db);
}
module.exports = { getSite, saveSite, coerce, DEFAULTS };
