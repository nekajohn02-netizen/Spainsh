'use strict';
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const bad = (m) => new HttpError(400, m), unauth = (m = 'يجب تسجيل الدخول') => new HttpError(401, m),
  forbid = (m = 'غير مصرّح') => new HttpError(403, m), notFound = (m = 'غير موجود') => new HttpError(404, m), conflict = (m) => new HttpError(409, m);
module.exports = { HttpError, bad, unauth, forbid, notFound, conflict };
