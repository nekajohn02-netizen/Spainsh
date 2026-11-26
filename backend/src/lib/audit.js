'use strict';
const audit = (db, userId, action, ip) => db.prepare('INSERT INTO audit(user_id,action,ip,at) VALUES(?,?,?,?)').run(userId ?? null, action, ip || '', Date.now());
module.exports = { audit };
