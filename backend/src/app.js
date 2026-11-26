'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const cfg = require('./config');
const { HttpError } = require('./core/errors');
const { send, parseCookies, readJson, sessionCookie, SECURITY_HEADERS } = require('./core/http');
const router = require('./core/router');
const { getSession } = require('./security/session');
const { getSite } = require('./lib/site');
const { UPLOADS } = require('./modules/admin/site');

for (const m of ['auth', 'profile', 'catalog', 'learning', 'vocab', 'reading', 'articles', 'team', 'events', 'placement', 'gamification', 'notifications', 'transcript', 'dashboard', 'admin']) require(`./modules/${m}/routes`);

// مفاتيح الميزات القابلة للإيقاف من لوحة الإدارة
const FEATURE_PREFIX = [['/api/stories', 'reading'], ['/api/leaderboard', 'leaderboard'], ['/api/placement', 'placement'], ['/api/notes', 'notes'], ['/api/vocab', 'vocab'], ['/api/review', 'vocab'], ['/api/achievements', 'achievements'], ['/api/articles', 'articles'], ['/api/team', 'team'], ['/api/events', 'events']];
const FRONTEND = path.join(__dirname, '..', '..', 'frontend');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

function createApp(db, { secure = cfg.secureCookies } = {}) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x'), ip = req.socket.remoteAddress || '';
    try {
      if (url.pathname.startsWith('/api/')) {
        const m = router.match(req.method, url.pathname);
        if (!m) throw new HttpError(404, 'المسار غير موجود');
        const feat = FEATURE_PREFIX.find(([p]) => url.pathname.startsWith(p));
        if (feat && !getSite(db).features[feat[1]]) throw new HttpError(404, 'هذه الميزة غير مفعّلة');
        const session = getSession(db, parseCookies(req.headers.cookie).sid);
        const { auth, role } = m.route.opts;
        if ((auth || role) && !session) throw new HttpError(401, 'يجب تسجيل الدخول');
        if (role && !(Array.isArray(role) ? role : [role]).includes(session.role)) throw new HttpError(403, 'غير مصرّح');
        if (req.method !== 'GET') { // حماية CSRF: فحص Origin + رمز الجلسة
          const origin = req.headers.origin;
          if (origin && new URL(origin).host !== req.headers.host) throw new HttpError(403, 'مصدر الطلب غير مسموح');
          if (session && req.headers['x-csrf-token'] !== session.csrf) throw new HttpError(403, 'رمز CSRF غير صالح');
        }
        if (session && Date.now() - (session.last_seen || 0) > 6e4) db.prepare('UPDATE sessions SET last_seen=? WHERE token_hash=?').run(Date.now(), session.sid);
        const body = ['GET', 'DELETE'].includes(req.method) ? {} : await readJson(req, m.route.opts.bodyLimit);
        let cookie = null;
        const out = await m.route.handler({ req, res, db, session, params: m.params, body, query: url.searchParams, ip,
          setCookie: (s) => { cookie = sessionCookie(s.token, s.maxAge, secure); }, clearCookie: () => { cookie = sessionCookie('', 0, secure); } });
        return send(res, 200, out, { 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) });
      }
      if (url.pathname.startsWith('/uploads/')) return serveFile(UPLOADS, url.pathname.slice(9), res, true);
      return serveStatic(url.pathname, res);
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message });
      console.error(e); return send(res, 500, { error: 'خطأ غير متوقع في الخادم' });
    }
  });
}
function serveFile(root, rel, res, immutable) {
  const file = path.normalize(path.join(root, decodeURIComponent(rel)));
  if (!file.startsWith(root + path.sep)) return send(res, 403, { error: 'ممنوع' });
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { error: 'غير موجود' });
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache' });
    res.end(data);
  });
}
function serveStatic(pathname, res) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || !path.extname(rel)) rel = '/index.html';
  return serveFile(FRONTEND, rel, res, false);
}
module.exports = { createApp };
