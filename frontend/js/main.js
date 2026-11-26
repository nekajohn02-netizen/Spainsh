import { api } from './api.js';
import { store } from './store.js';
import { route, start, navigate } from './router.js';
import { publicLayout, appLayout, adminLayout } from './components/layouts.js';
import { spinner, h, setTitle } from './ui.js';
import { loadSite } from './lib/site.js';
import { feature } from './constants.js';

const P = (f) => () => import(`./pages/${f}.js`);
// عام
route('/', P('public/home')); route('/courses', P('public/courses')); route('/courses/:slug', P('public/course')); route('/curriculum', P('public/curriculum'));
route('/reading', P('public/reading')); route('/articles', P('public/articles')); route('/articles/:slug', P('public/article')); route('/team', P('public/team')); route('/about', P('public/about')); route('/faq', P('public/faq')); route('/contact', P('public/contact'));
route('/certificate/:code', P('public/certificate'));
// مصادقة
route('/login', P('auth/login')); route('/register', P('auth/register')); route('/forgot', P('auth/forgot')); route('/reset/:token', P('auth/reset'));
// تطبيق الطالب
const A = (pattern, f) => route(pattern, P('app/' + f), 'app');
A('/app', 'dashboard'); A('/app/my-courses', 'my-courses'); A('/app/courses', 'catalog'); A('/app/courses/:slug', 'course'); A('/app/curriculum', 'curriculum');
A('/app/lesson/:slug', 'lesson'); A('/app/placement', 'placement'); A('/app/placement/tests', 'placement-tests'); A('/app/placement/tests/:id', 'placement-test'); A('/app/reading', 'reading'); A('/app/reading/:slug', 'story');
A('/app/events', 'events'); A('/app/events/:slug', 'event'); A('/app/my-dictionary', 'my-dictionary'); A('/app/board', 'board');
A('/app/vocab', 'vocab'); A('/app/review', 'review'); A('/app/mistakes', 'mistakes'); A('/app/notes', 'notes'); A('/app/achievements', 'achievements'); A('/app/leaderboard', 'leaderboard');
A('/app/transcript', 'transcript'); A('/app/profile', 'profile'); A('/app/settings', 'settings'); A('/app/notifications', 'notifications'); A('/app/welcome', 'welcome');
// الإدارة
const D = (pattern, f) => route(pattern, P('admin/' + f), 'admin');
D('/admin', 'overview'); D('/admin/users', 'users'); D('/admin/courses', 'courses'); D('/admin/courses/:id', 'course-manage'); D('/admin/lessons', 'lessons'); D('/admin/lessons/:id', 'lesson-editor');
D('/admin/questions', 'questions'); D('/admin/stories', 'stories'); D('/admin/articles', 'articles'); D('/admin/articles/:id', 'article-editor'); D('/admin/cheat-events', 'cheat-events'); D('/admin/vocab', 'vocab'); D('/admin/announcements', 'announcements'); D('/admin/audit', 'audit'); D('/admin/outbox', 'outbox'); D('/admin/structure', 'structure'); D('/admin/site', 'site'); D('/admin/media', 'media'); D('/admin/settings', 'site');
D('/admin/placement-tests', 'placement-tests'); D('/admin/team', 'team'); D('/admin/events', 'events');

const app = document.getElementById('app');
const LAYOUTS = { public: publicLayout, app: appLayout, admin: adminLayout };
let ticket = 0;
// مسارات مرتبطة بمفاتيح ميزات يمكن إيقافها من الإعدادات
const GATES = [['/app/reading', 'reading'], ['/reading', 'reading'], ['/app/placement', 'placement'], ['/app/leaderboard', 'leaderboard'], ['/app/notes', 'notes'], ['/app/vocab', 'vocab'], ['/app/review', 'vocab'], ['/app/achievements', 'achievements'], ['/courses', 'public_catalog'], ['/curriculum', 'public_catalog'], ['/articles', 'articles'], ['/team', 'team'], ['/app/events', 'events']];

async function render(r, params, path) {
  const mine = ++ticket; window.scrollTo(0, 0);
  const gate = GATES.find(([p]) => path === p || path.startsWith(p + '/'));
  if (gate && !feature(gate[1]) && !(gate[1] === 'public_catalog' && store.user)) return navigate(store.user ? '/app' : '/', true);
  if (path === '/register' && !feature('registration')) return navigate('/login', true);
  if (r.shell !== 'public' && !store.user) return navigate('/login?next=' + encodeURIComponent(path), true);
  if (r.shell === 'admin' && !['admin', 'instructor'].includes(store.user.role)) return navigate('/app', true);
  const layout = LAYOUTS[r.shell];
  app.replaceChildren(...layout(spinner(), path));
  try {
    const mod = await r.load();
    if (mod.guest && store.user) return navigate(store.user.role === 'student' ? '/app' : '/admin', true);
    const page = await mod.default({ params, user: store.user, query: new URLSearchParams(location.search) });
    if (mine !== ticket) return;
    if (page.title !== undefined) setTitle(page.title);
    const shell = page.shell || r.shell;
    app.replaceChildren(...LAYOUTS[shell](page.node, path));
    page.after?.();
  } catch (e) {
    if (mine !== ticket) return;
    if (e.status === 401) { store.user = null; return navigate('/login', true); }
    app.replaceChildren(...layout(h('div', { class: 'container page empty' }, h('h2', {}, 'تعذّر تحميل الصفحة'), h('p', {}, e.message), h('button', { class: 'btn btn-primary', onclick: () => navigate(location.pathname + location.search, true) }, 'إعادة المحاولة')), path));
  }
}
(async () => {
  try { await loadSite(); } catch { document.getElementById('app').textContent = 'تعذّر الاتصال بالخادم'; return; }
  try { const me = await api.get('/api/auth/me'); store.user = me.user; store.csrf = me.csrf; store.unread = me.unread; store.banner = me.banner; } catch {}
  start(render);
})();
