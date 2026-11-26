import { h, ic } from '../../ui.js';
import { store } from '../../store.js';
import { api } from '../../api.js';
import { courseCard } from '../../components/cards.js';
import { banner } from '../../components/banner.js';

export default async function () {
  const S = store.site, H = S.home, cur = await api.get('/api/curriculum'), { courses } = S.features.public_catalog === false ? { courses: [] } : await api.get('/api/courses');
  const go = store.user ? (store.user.role === 'student' ? '/app' : '/admin') : '/register';
  const stats = [[courses.length, 'مقررات'], [cur.stages.length, 'مرحلة داخلية'], ['RTL', 'عربي أولاً']].filter(Boolean);
  const SECTIONS = {
    stats: () => h('div', { class: 'container' }, h('div', { class: 'stats' }, stats.map(([n, l]) => h('div', { class: 'card stat' }, h('b', {}, n), l)))),
    intro: () => h('section', { class: 'section container intro' }, banner({ name: 'intro', custom: S.images.intro, alt: `${S.brand.name_ar} — ${S.brand.tagline}`, className: 'pbanner-card' }),
      h('div', { class: 'section-head intro-head' }, h('h2', {}, H.intro_title), h('p', { class: 'muted' }, H.intro_text)),
      H.intro_points.length ? h('div', { class: 'grid intro-points' }, H.intro_points.map((p, i) => h('div', { class: 'card hover' }, h('span', { class: 'badge info' }, i + 1), h('h3', {}, p.title), h('p', { class: 'muted' }, p.desc)))) : null),
    features: () => { const f = H.features.filter((x) => x.visible); return f.length ? h('section', { class: 'section container' }, h('div', { class: 'section-head' }, h('h2', {}, H.features_title), h('p', { class: 'muted' }, H.features_sub)),
      h('div', { class: 'grid features' }, f.map((x) => h('article', { class: 'card hover feature' }, h('div', { class: 'ico', style: { '--c': x.color } }, ic(x.icon)), h('h3', {}, x.title), h('p', { class: 'muted' }, x.desc))))) : null; },
    courses: () => (courses.length ? h('section', { class: 'section container' }, h('div', { class: 'section-head' }, h('h2', {}, H.courses_title), h('p', { class: 'muted' }, H.courses_sub)), h('div', { class: 'grid cgrid' }, courses.slice(0, H.courses_count || 3).map((c) => courseCard(c))), h('p', { class: 'center', style: { 'margin-top': '1.5rem' } }, h('a', { class: 'btn btn-ghost', href: '/courses' }, 'كل المقررات'))) : null),
    journey: () => (cur.levels.length ? h('section', { class: 'section container' }, h('div', { class: 'section-head' }, h('h2', {}, H.journey_title), h('p', { class: 'muted' }, H.journey_sub)),
      h('div', { class: 'journey', style: { '--n': Math.min(cur.levels.length, 6) } }, cur.levels.map((lv) => h('a', { class: 'jlevel', href: '/curriculum#' + lv.code, style: { '--c': lv.color } }, h('div', { class: 'pill' }, lv.code), h('div', { class: 'dots' }, h('i'), h('i'), h('i')), h('b', {}, lv.title_ar))))) : null),
    cta: () => h('div', { class: 'container' }, h('section', { class: 'cta' }, h('h2', {}, H.cta_title), h('p', {}, H.cta_sub), h('a', { class: 'btn btn-primary btn-lg', href: go }, H.cta_button))),
  };
  const node = h('div', {},
    H.hero_banner !== false && banner({ name: 'hero', custom: S.images.hero, alt: `${S.brand.name_ar} — ${S.brand.tagline}`, eager: true, className: 'pbanner-hero' }),
    h('section', { class: 'hero hero-text' }, h('div', { class: 'container' },
      H.hero_badge && h('span', { class: 'eyebrow' }, h('i'), H.hero_badge), h('h1', {}, H.hero_title, H.hero_accent && h('em', { lang: 'es', dir: 'ltr' }, H.hero_accent)), h('p', { class: 'lead' }, H.hero_sub),
      h('div', { class: 'row' }, h('a', { class: 'btn btn-primary btn-lg', href: go }, store.user ? 'تابع التعلّم' : H.cta_primary, ic('arrow')), S.features.public_catalog !== false && h('a', { class: 'btn btn-ghost btn-lg', href: '/courses' }, H.cta_secondary)))),
    ...H.sections.filter((x) => x.visible).map((x) => SECTIONS[x.id]?.()));
  return { title: '', node };
}
