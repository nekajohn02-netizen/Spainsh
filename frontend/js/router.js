// موجّه SPA (History API). لكل مسار «شاشة» (shell): public | app | admin
const routes = [];
export const route = (pattern, load, shell = 'public') => {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:([a-z]+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$');
  routes.push({ re, keys, load, shell });
};
let renderFn;
export function start(render) {
  renderFn = render;
  addEventListener('popstate', go);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="/"]');
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || a.hasAttribute('download')) return;
    e.preventDefault(); navigate(a.getAttribute('href'));
  });
  go();
}
export function navigate(to, replace = false) { history[replace ? 'replaceState' : 'pushState'](null, '', to); go(); }
export const refresh = () => go();
async function go() {
  const path = location.pathname;
  for (const r of routes) {
    const m = r.re.exec(path);
    if (m) return renderFn(r, Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])), path);
  }
  renderFn({ load: () => import('./pages/public/notfound.js'), shell: 'public' }, {}, path);
}
