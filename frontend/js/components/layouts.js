import { h, ic, avatar } from '../ui.js';
import { store, theme } from '../store.js';
import { api } from '../api.js';
import { navigate } from '../router.js';
import { debounce } from '../lib/format.js';

const cur = (path, href, exact) => ((exact ? path === href : path === href || path.startsWith(href + '/')) ? 'page' : null);
const site = () => store.site;
const on = (k) => site().features[k] !== false;

function themeBtn() {
  const b = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تبديل الوضع الفاتح والداكن' });
  const paint = () => b.replaceChildren(ic(theme.current() === 'dark' ? 'sun' : 'moon'));
  paint(); b.addEventListener('click', () => { theme.toggle(); paint(); }); return b;
}
const logout = () => h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تسجيل الخروج', onclick: async () => { try { await api.post('/api/auth/logout'); } catch {} store.user = null; store.csrf = null; navigate('/'); } }, ic('logout'));
export const brandLink = (href, extra) => { const b = site().brand; return h('a', { class: 'brand', href }, h('img', { src: b.logo_small, alt: b.name_ar, width: 40, height: 40 }), h('span', {}, b.name_ar, extra, h('small', { lang: 'es' }, b.name_es))); };

/* ---------- كتالوج عناصر القوائم (المعرّف ← الرابط والأيقونة والميزة) ---------- */
const PUBLIC_ITEMS = { home: ['/', 'home', true], courses: ['/courses', 'layers', false, 'public_catalog'], curriculum: ['/curriculum', 'map', false, 'public_catalog'], reading: ['/reading', 'book', false, 'reading'], articles: ['/articles', 'file', false, 'articles'], team: ['/team', 'users', false, 'team'], about: ['/about', 'users'], faq: ['/faq', 'help'] };
const APP_ITEMS = { dashboard: ['/app', 'home', 'التعلّم', true], 'my-courses': ['/app/my-courses', 'layers', 'التعلّم'], catalog: ['/app/courses', 'grid', 'التعلّم'], curriculum: ['/app/curriculum', 'map', 'التعلّم'], placement: ['/app/placement', 'chart', 'التعلّم', false, 'placement'],
  reading: ['/app/reading', 'book', 'التدريب', false, 'reading'], vocab: ['/app/vocab', 'cards', 'التدريب', false, 'vocab'], review: ['/app/review', 'zap', 'التدريب', false, 'vocab'], events: ['/app/events', 'flame', 'التدريب', false, 'events'],
  'my-dictionary': ['/app/my-dictionary', 'cards', 'أدواتي الخاصة'], board: ['/app/board', 'layers', 'أدواتي الخاصة'],
  mistakes: ['/app/mistakes', 'x', 'مساحتي'], notes: ['/app/notes', 'edit', 'مساحتي', false, 'notes'], achievements: ['/app/achievements', 'trophy', 'مساحتي', false, 'achievements'], leaderboard: ['/app/leaderboard', 'star', 'مساحتي', false, 'leaderboard'], transcript: ['/app/transcript', 'award', 'مساحتي'] };
const publicNav = () => site().nav.public.filter((i) => i.visible && PUBLIC_ITEMS[i.id] && (!PUBLIC_ITEMS[i.id][3] || on(PUBLIC_ITEMS[i.id][3])));
const appGroups = () => { const out = {}; for (const i of site().nav.app) { const d = APP_ITEMS[i.id]; if (!i.visible || !d || (d[4] && !on(d[4]))) continue; (out[d[2]] ||= []).push([d[0], i.label, d[1], d[3]]); } return [...Object.entries(out), ['الحساب', [['/app/profile', 'الملف الشخصي', 'user'], ['/app/settings', 'الإعدادات والأمان', 'gear']]]]; };

/* ---------- الموقع العام ---------- */
export function publicLayout(content, path) {
  const s = site(), items = publicNav();
  const account = store.user
    ? [h('a', { class: 'btn btn-primary btn-sm', href: store.user.role === 'student' ? '/app' : '/admin' }, store.user.role === 'student' ? 'لوحتي' : 'لوحة الإدارة'), logout()]
    : [h('a', { class: 'btn btn-ghost btn-sm', href: '/login' }, 'دخول'), s.features.registration !== false && h('a', { class: 'btn btn-primary btn-sm', href: '/register' }, 'ابدأ مجاناً')];
  const top = h('header', { class: 'topbar' }, h('div', { class: 'container' }, brandLink('/'), h('nav', { class: 'nav', 'aria-label': 'التنقل الرئيسي' }, items.map((i) => h('a', { href: PUBLIC_ITEMS[i.id][0], 'aria-current': cur(path, PUBLIC_ITEMS[i.id][0], PUBLIC_ITEMS[i.id][2]) }, i.label))), h('span', { class: 'spacer' }), ...account, themeBtn()));
  const bottom = h('nav', { class: 'bottomnav', 'aria-label': 'التنقل السفلي' }, [...items.slice(0, 4).map((i) => [PUBLIC_ITEMS[i.id][0], i.label, PUBLIC_ITEMS[i.id][1], PUBLIC_ITEMS[i.id][2]]), [store.user ? '/app' : '/login', store.user ? 'لوحتي' : 'دخول', 'user']].map(([href, t, ico, ex]) => h('a', { href, 'aria-current': cur(path, href, ex) }, ic(ico), t)));
  const f = s.footer, social = [['facebook', 'فيسبوك'], ['instagram', 'إنستغرام'], ['youtube', 'يوتيوب'], ['x', 'X']].filter(([k]) => f[k]);
  const footer = h('footer', { class: 'footer' }, h('div', { class: 'container foot-grid' },
    h('div', {}, brandLink('/'), h('p', { class: 'muted' }, f.text), social.length ? h('div', { class: 'social' }, social.map(([k, t]) => h('a', { href: f[k], target: '_blank', rel: 'noopener noreferrer' }, t))) : null),
    h('div', {}, h('h4', {}, 'التعلّم'), items.filter((i) => ['courses', 'curriculum', 'reading', 'articles'].includes(i.id)).map((i) => h('a', { href: PUBLIC_ITEMS[i.id][0] }, i.label))),
    h('div', {}, h('h4', {}, 'الأكاديمية'), h('a', { href: '/about' }, 'عن الأكاديمية'), h('a', { href: '/faq' }, 'الأسئلة الشائعة'), h('a', { href: '/contact' }, 'تواصل معنا'), f.email && h('span', { class: 'muted small', dir: 'ltr' }, f.email), f.phone && h('span', { class: 'muted small', dir: 'ltr' }, f.phone)),
    h('div', {}, h('h4', {}, 'الحساب'), h('a', { href: '/login' }, 'تسجيل الدخول'), s.features.registration !== false && h('a', { href: '/register' }, 'إنشاء حساب'))),
    h('div', { class: 'container muted small' }, `© ${s.brand.name_ar} — ${f.disclaimer}`));
  return [top, h('main', { id: 'main', tabindex: '-1' }, content), footer, bottom];
}

/* ---------- تطبيق الطالب والإدارة ---------- */
const ADMIN_NAV = [
  ['نظرة عامة', [['/admin', 'لوحة التحكم', 'chart', true], ['/admin/users', 'المستخدمون', 'users']]],
  ['المحتوى', [['/admin/courses', 'المقررات', 'layers'], ['/admin/lessons', 'الدروس', 'file'], ['/admin/questions', 'بنك الأسئلة', 'help'], ['/admin/placement-tests', 'اختبارات تحديد المستوى', 'chart'], ['/admin/stories', 'القصص', 'book'], ['/admin/articles', 'المقالات', 'file'], ['/admin/vocab', 'المفردات', 'cards']]],
  ['الفعاليات والفريق', [['/admin/events', 'الفعاليات الأسبوعية', 'flame'], ['/admin/team', 'فريق العمل', 'users']]],
  ['التحكم في الموقع', [['/admin/structure', 'الهيكل الأكاديمي', 'map'], ['/admin/site', 'إعدادات الموقع', 'gear'], ['/admin/media', 'مكتبة الصور', 'grid']]],
  ['النظام', [['/admin/announcements', 'الإعلانات', 'bell'], ['/admin/cheat-events', 'سجل الاختبارات المشبوهة', 'shield'], ['/admin/audit', 'سجل التدقيق', 'history'], ['/admin/outbox', 'البريد التجريبي', 'mail']]],
];
const ADMIN_ONLY = ['/admin/users', '/admin/structure', '/admin/site', '/admin/audit', '/admin/outbox', '/admin/announcements', '/admin/cheat-events'];
function sidebar(groups, path, admin) {
  const u = store.user;
  return h('aside', { class: 'sidebar', 'aria-label': 'القائمة الجانبية' }, brandLink(admin ? '/admin' : '/app', admin && h('span', { class: 'tag-admin' }, 'ADMIN')),
    groups.map(([title, items]) => { const vis = items.filter((i) => !(admin && u.role !== 'admin' && ADMIN_ONLY.includes(i[0]))); return vis.length ? h('nav', { class: 'nav-group', 'aria-label': title }, h('h4', {}, title), vis.map(([href, t, i, ex]) => h('a', { class: 'nav-link', href, 'aria-current': cur(path, href, ex) }, ic(i), t))) : null; }),
    h('div', { class: 'me' }, avatar(u.name, u.hue), h('div', {}, h('b', {}, u.name.split(' ')[0]), h('br'), h('small', { class: 'muted' }, admin ? (u.role === 'admin' ? 'مدير' : 'مدرّس') : `المستوى ${u.level} · ${u.xp} XP`)), h('span', { class: 'spacer' }), logout()));
}
function topSearch() {
  const box = h('div', { class: 'results', hidden: true }), input = h('input', { class: 'input', type: 'search', placeholder: 'ابحث في الدروس والمقررات والمفردات…', 'aria-label': 'بحث' });
  input.addEventListener('input', debounce(async () => {
    const q = input.value.trim(); if (q.length < 2) { box.hidden = true; return; }
    const r = await api.get('/api/search?q=' + encodeURIComponent(q)); box.replaceChildren();
    const sec = (t, arr, mk) => arr.length && box.append(h('h5', {}, t), ...arr.map(mk));
    sec('الدروس', r.lessons, (l) => h('a', { href: '/app/lesson/' + l.slug }, l.title_ar, h('span', { class: 'badge es' }, l.stage))); sec('المقررات', r.courses, (c) => h('a', { href: '/app/courses/' + c.slug }, c.title_ar, h('span', { class: 'badge es' }, c.stage))); sec('المفردات', r.vocab, (v) => h('a', { href: '/app/vocab' }, h('span', { class: 'es' }, v.es), v.ar));
    if (!box.children.length) box.append(h('p', { class: 'muted center' }, 'لا نتائج')); box.hidden = false;
  }, 250));
  document.addEventListener('click', (e) => { if (!box.contains(e.target) && e.target !== input) box.hidden = true; }); box.addEventListener('click', () => { box.hidden = true; input.value = ''; });
  return h('div', { class: 'search' }, ic('search'), input, box);
}
function shellLayout(content, path, groups, admin) {
  const u = store.user, shell = h('div', { class: 'shell' + (admin ? ' admin' : '') });
  const bellBtn = h('a', { class: 'icon-btn bell', href: '/app/notifications', 'aria-label': 'الإشعارات' }, ic('bell'), store.unread > 0 && h('span', { class: 'dot-badge' }, store.unread > 9 ? '9+' : store.unread));
  const top = h('div', { class: 'apptop' }, h('button', { class: 'icon-btn menu-btn', type: 'button', 'aria-label': 'القائمة', onclick: () => shell.classList.toggle('open') }, ic('menu')),
    admin ? h('b', {}, 'لوحة الإدارة') : (on('search') ? topSearch() : null), h('span', { class: 'spacer' }), !admin && h('span', { class: 'badge info xp-chip', title: 'نقاط الخبرة' }, ic('star'), ` ${u.xp} XP`),
    h('a', { class: 'btn btn-ghost btn-sm', href: '/', 'aria-label': 'الصفحة الرئيسية' }, ic('home'), admin ? 'عرض الموقع' : null), !admin && bellBtn, themeBtn());
  const quick = admin ? null : groups.flatMap((g) => g[1]).filter((i) => ['/app', '/app/my-courses', '/app/curriculum', '/app/vocab'].includes(i[0])).slice(0, 4);
  const bottom = admin ? null : h('nav', { class: 'bottomnav', 'aria-label': 'التنقل السفلي' }, [...quick.map(([href, t, i, ex]) => [href, t.split(' ')[0], i, ex]), ['/app/profile', 'حسابي', 'user']].map(([href, t, i, ex]) => h('a', { href, 'aria-current': cur(path, href, ex) }, ic(i), t)));
  shell.append(sidebar(groups, path, admin), h('div', { class: 'scrim', onclick: () => shell.classList.remove('open') }), h('div', { class: 'content' }, store.banner && h('div', { class: 'banner' }, store.banner), top, h('main', { id: 'main', class: 'main', tabindex: '-1' }, content)), bottom);
  shell.addEventListener('click', (e) => { if (e.target.closest('.sidebar a')) shell.classList.remove('open'); });
  return [shell];
}
export const appLayout = (c, p) => shellLayout(c, p, appGroups(), false);
export const adminLayout = (c, p) => shellLayout(c, p, ADMIN_NAV, true);
export const pageHead = (title, sub, ...actions) => h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, title), sub && h('p', {}, sub)), h('span', { class: 'spacer' }), ...actions);
