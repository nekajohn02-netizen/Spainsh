// طبقة الاتصال بالـ API. كل طلب معدِّل للحالة يحمل رمز CSRF الخاص بالجلسة.
import { store } from './store.js';

export class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }

async function request(method, url, body) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && store.csrf) headers['X-CSRF-Token'] = store.csrf;
  let res;
  try { res = await fetch(url, { method, headers, credentials: 'same-origin', body: body !== undefined ? JSON.stringify(body) : undefined }); }
  catch { throw new ApiError(0, 'تعذّر الاتصال بالخادم، تحقق من الإنترنت'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || 'حدث خطأ غير متوقع');
  return data;
}
export const api = {
  get: (u) => request('GET', u),
  post: (u, b = {}) => request('POST', u, b),
  patch: (u, b = {}) => request('PATCH', u, b),
  put: (u, b = {}) => request('PUT', u, b),
  delete: (u) => request('DELETE', u),
};
