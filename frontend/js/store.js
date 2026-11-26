// حالة التطبيق + السمة (فاتح/داكن)
export const store = { user: null, csrf: null, unread: 0, banner: '', site: null, meta: null };
export const theme = {
  current() { const t = document.documentElement.dataset.theme; return t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); },
  toggle() {
    const next = theme.current() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    return next;
  },
};
