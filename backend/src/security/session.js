'use strict';
const crypto = require('node:crypto');
const cfg = require('../config');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

function createSession(db, userId, ua, remember) {
  const token = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(24).toString('base64url');
  const ttl = remember ? cfg.session.rememberDays * 864e5 : cfg.session.shortHours * 36e5;
  db.prepare('INSERT INTO sessions(token_hash,user_id,csrf,expires_at,ua,created_at,last_seen) VALUES(?,?,?,?,?,?,?)')
    .run(sha(token), userId, csrf, Date.now() + ttl, String(ua || '').slice(0, 200), Date.now(), Date.now());
  return { token, csrf, maxAge: Math.floor(ttl / 1000) };
}
function getSession(db, token) {
  if (!token) return null;
  const row = db.prepare("SELECT s.csrf, s.expires_at, s.token_hash sid, u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND u.status='active'").get(sha(token));
  if (!row) return null;
  if (row.expires_at < Date.now()) { db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha(token)); return null; }
  return row;
}
module.exports = { sha, createSession, getSession };
