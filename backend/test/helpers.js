'use strict';
process.env.RATE_LIMIT_MULT = '1000';
process.env.ADMIN_EMAIL = 'admin@test.io'; process.env.ADMIN_PASSWORD = 'AdminPass12345';
const { init } = require('../src/db/init');
const { createApp } = require('../src/app');

async function boot() {
  const db = init(':memory:'), srv = createApp(db);
  await new Promise((r) => srv.listen(0, r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const client = () => {
    let cookie = '', csrf = '';
    return { async call(method, path, body) {
      const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }), ...(csrf && { 'X-CSRF-Token': csrf }) }, body: body && JSON.stringify(body) });
      const sc = res.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
      const json = await res.json().catch(() => ({})); if (json.csrf) csrf = json.csrf; return { status: res.status, json, headers: res.headers };
    } };
  };
  let n = 0;
  const reg = async (email) => { const c = client(); email ||= `u${++n}@t.io`; const r = await c.call('POST', '/api/auth/register', { name: 'سمير علي', email, password: 'Secret12345', confirm: 'Secret12345', terms: true }); return { c, email, r }; };
  const admin = async () => { const c = client(); await c.call('POST', '/api/auth/login', { email: 'admin@test.io', password: 'AdminPass12345' }); return c; };
  return { db, srv, base, client, reg, admin, close: () => srv.close() };
}
module.exports = { boot };
