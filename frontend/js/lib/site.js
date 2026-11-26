import { api } from '../api.js';
import { store } from '../store.js';

export async function loadSite() {
  const d = await api.get('/api/site'); store.site = d.site; store.meta = { levels: d.levels, tracks: d.tracks, stages: d.stages }; applySite(d.site);
}
// تطبيق الهوية والألوان فوراً (CSSOM فقط لتوافق سياسة CSP)
export function applySite(site) {
  const root = document.documentElement, t = site.theme;
  const set = (k, v) => root.style.setProperty(k, v);
  set('--bc-light', t.brand_light); set('--bc2-light', t.brand2_light); set('--gc-light', t.gold_light);
  set('--bc-dark', t.brand_dark); set('--bc2-dark', t.brand2_dark); set('--gc-dark', t.gold_dark);
  if (t.radius === 'normal') delete root.dataset.radius; else root.dataset.radius = t.radius;
  root.style.fontSize = Math.round(t.font_scale * 100) + '%';
  let saved = null; try { saved = localStorage.getItem('theme'); } catch {}
  if (!saved) { if (t.default_mode === 'system') delete root.dataset.theme; else root.dataset.theme = t.default_mode; }
  const fav = document.querySelector('link[rel=icon]'); if (fav && site.brand.favicon) fav.href = site.brand.favicon;
  document.title = site.brand.name_ar + ' | ' + site.brand.tagline;
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', t.brand_light);
}
