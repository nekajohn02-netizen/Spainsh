'use strict';
const crypto = require('node:crypto');
const PARAMS = { parallelism: 1, tagLength: 32, memory: 19456, passes: 2 }; // توصية OWASP لـ Argon2id

function hashPassword(pw) {
  const nonce = crypto.randomBytes(16);
  const tag = crypto.argon2Sync('argon2id', { message: pw, nonce, ...PARAMS });
  return `argon2id$${PARAMS.memory}$${PARAMS.passes}$${nonce.toString('base64')}$${tag.toString('base64')}`;
}
function verifyPassword(pw, stored) {
  try {
    const [alg, mem, passes, n, t] = stored.split('$');
    if (alg !== 'argon2id') return false;
    const expected = Buffer.from(t, 'base64');
    const tag = crypto.argon2Sync('argon2id', { message: pw, nonce: Buffer.from(n, 'base64'), parallelism: 1, tagLength: expected.length, memory: +mem, passes: +passes });
    return crypto.timingSafeEqual(tag, expected);
  } catch { return false; }
}
let _dummy; const dummyHash = () => (_dummy ||= hashPassword('dummy-password-for-timing'));
function validatePassword(pw) {
  if (typeof pw !== 'string' || pw.length < 10) return 'كلمة المرور يجب ألا تقل عن 10 أحرف';
  if (pw.length > 200) return 'كلمة المرور طويلة جداً';
  if (!/[a-zA-Z؀-ۿ]/.test(pw) || !/\d/.test(pw)) return 'يجب أن تحتوي كلمة المرور على حروف وأرقام';
  return null;
}
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
module.exports = { hashPassword, verifyPassword, dummyHash, validatePassword, EMAIL_RE };
