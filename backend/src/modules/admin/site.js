'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const r = require('../../core/router');
const { bad, notFound } = require('../../core/errors');
const { getSite, saveSite, DEFAULTS } = require('../../lib/site');
const { audit } = require('../../lib/audit');

r.get('/api/admin/site', ({ db }) => ({ site: getSite(db), defaults: DEFAULTS }), { role: 'admin' });
r.put('/api/admin/site', ({ db, body, session, ip }) => { const site = saveSite(db, body.site); audit(db, session.id, 'site:update', ip); return { site }; }, { role: 'admin' });
r.post('/api/admin/site/reset', ({ db, session, ip }) => { db.prepare("DELETE FROM settings WHERE k='site_config'").run(); audit(db, session.id, 'site:reset', ip); return { site: getSite(db) }; }, { role: 'admin' });

/* ---------- مكتبة الوسائط ---------- */
const UPLOADS = path.join(__dirname, '..', '..', '..', 'uploads');
const SIGS = [['image/png', Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'png'], ['image/jpeg', Buffer.from([0xff, 0xd8, 0xff]), 'jpg'], ['image/gif', Buffer.from('GIF8'), 'gif']];
function detect(buf) {
  for (const [mime, sig, ext] of SIGS) if (buf.subarray(0, sig.length).equals(sig)) return { mime, ext };
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  return null; // SVG وغيره مرفوض عمداً: قد يحمل سكربتات
}
// تحويل اختياري إلى WebP لتقليل المساحة؛ إن لم تكن حزمة sharp مثبّتة (npm install sharp) تُحفظ الصورة بصيغتها الأصلية بدون كسر الرفع
let sharp = null; try { sharp = require('sharp'); } catch {}
async function toWebp(buf, t) {
  if (!sharp || t.ext === 'gif') return { buf, t }; // نترك GIF المتحرك كما هو
  try { const out = await sharp(buf).webp({ quality: 82 }).toBuffer(); return { buf: out, t: { mime: 'image/webp', ext: 'webp' } }; }
  catch { return { buf, t }; }
}
r.get('/api/admin/media', ({ db }) => ({ rows: db.prepare('SELECT * FROM media ORDER BY id DESC LIMIT 300').all().map((m) => ({ ...m, url: '/uploads/' + m.filename })) }), { role: ['admin', 'instructor'] });
r.post('/api/admin/media', async ({ db, body, session, ip }) => {
  const m = /^data:[\w/+.-]+;base64,([A-Za-z0-9+/=]+)$/.exec(String(body.data || '')); if (!m) throw bad('ملف غير صالح');
  let buf = Buffer.from(m[1], 'base64'); if (buf.length > 5 * 1024 * 1024) throw bad('الحد الأقصى 5 ميغابايت');
  let t = detect(buf); if (!t) throw bad('الأنواع المسموحة: PNG وJPG وWEBP وGIF');
  ({ buf, t } = await toWebp(buf, t));
  fs.mkdirSync(UPLOADS, { recursive: true });
  const filename = crypto.randomBytes(8).toString('hex') + '.' + t.ext; fs.writeFileSync(path.join(UPLOADS, filename), buf);
  const info = db.prepare('INSERT INTO media(filename,original,mime,size,at,by_user) VALUES(?,?,?,?,?,?)').run(filename, String(body.name || '').slice(0, 120), t.mime, buf.length, Date.now(), session.id);
  audit(db, session.id, `media:upload:${filename}`, ip); return { id: Number(info.lastInsertRowid), url: '/uploads/' + filename, converted: !!sharp };
}, { role: ['admin', 'instructor'], bodyLimit: 8_000_000 });
r.delete('/api/admin/media/:id', ({ db, params, session, ip }) => {
  const m = db.prepare('SELECT * FROM media WHERE id=?').get(+params.id); if (!m) throw notFound();
  try { fs.unlinkSync(path.join(UPLOADS, m.filename)); } catch {}
  db.prepare('DELETE FROM media WHERE id=?').run(m.id); audit(db, session.id, `media:delete:${m.filename}`, ip); return { ok: true };
}, { role: 'admin' });
module.exports = { UPLOADS };
