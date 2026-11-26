const AR_DIGITS = false;
export const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
export const fmtDateTime = (ms) => (ms ? new Date(ms).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
export const ago = (ms) => {
  const s = Math.max(1, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return 'الآن'; const m = Math.round(s / 60); if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.round(m / 60); if (h < 24) return `منذ ${h} ساعة`; const d = Math.round(h / 24); return d < 30 ? `منذ ${d} يوم` : fmtDate(ms);
};
export const initials = (name = '?') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
export const num = (n) => (typeof n === 'number' || /^\d+$/.test(String(n)) ? Number(n || 0).toLocaleString('en-US') : String(n));
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
export const debounce = (fn, ms = 300) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const qs = (obj) => { const p = new URLSearchParams(); for (const [k, v] of Object.entries(obj)) if (v !== '' && v != null) p.set(k, v); return p.toString(); };
