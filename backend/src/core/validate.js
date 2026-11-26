'use strict';
const { bad } = require('./errors');
const str = (v, name, { min = 0, max = 500, required = false } = {}) => {
  const s = String(v ?? '').trim();
  if (required && !s) throw bad(`الحقل «${name}» مطلوب`);
  if (s.length < min) throw bad(`الحقل «${name}» قصير جداً`);
  if (s.length > max) throw bad(`الحقل «${name}» طويل جداً`);
  return s;
};
const oneOf = (v, list, name) => { if (!list.includes(v)) throw bad(`قيمة غير صالحة للحقل «${name}»`); return v; };
const int = (v, name, { min = 0, max = 1e9, def } = {}) => {
  if ((v === undefined || v === '') && def !== undefined) return def;
  const n = Number(v); if (!Number.isInteger(n) || n < min || n > max) throw bad(`قيمة غير صالحة للحقل «${name}»`); return n;
};
const slugify = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
module.exports = { str, oneOf, int, slugify };
