import { h, ic, bar } from '../../ui.js';
import { api } from '../../api.js';
import { barChart } from '../../components/charts.js';
import { pageHead } from '../../components/layouts.js';
import { num } from '../../lib/format.js';

export default async function () {
  const s = await api.get('/api/admin/stats'), t = s.totals;
  const card = (icon, c, v, l) => h('div', { class: 'card stat-card' }, h('div', { class: 'ico', style: { '--c': c } }, ic(icon)), h('div', {}, h('b', {}, num(v)), h('span', {}, l)));
  const maxL = Math.max(1, ...s.stageCoverage.map((x) => x.lessons));
  return { title: 'لوحة التحكم', node: h('div', {}, pageHead('لوحة التحكم', 'نظرة عامة على المنصة.'),
    h('div', { class: 'stat-grid' }, card('users', '#6d4cff', t.users, 'المستخدمون'), card('zap', '#e4572e', t.active7, 'نشطون آخر 7 أيام'), card('layers', '#0e9f8e', t.courses, 'مقررات منشورة'), card('file', '#2f80ed', t.lessons, 'دروس منشورة'), card('help', '#f5a524', t.questions, 'أسئلة'), card('award', '#e0457b', t.certificates, 'شهادات صادرة'), card('check', '#138a5b', t.avgScore + '%', 'متوسط الدرجات'), card('grid', '#8a87a1', t.drafts, 'دروس غير منشورة')),
    h('div', { class: 'split', style: { 'margin-top': '1.5rem' } },
      h('section', { class: 'card' }, h('h3', {}, 'آخر 14 يوماً'), h('div', { class: 'legend' }, h('span', {}, h('i', { style: { background: 'var(--brand)' } }), 'تسجيلات جديدة'), h('span', {}, h('i', { style: { background: 'var(--violet)' } }), 'محاولات اختبار')), barChart(s.series, ['signups', 'attempts'], ['تسجيلات', 'محاولات'])),
      h('section', { class: 'card' }, h('h3', {}, 'تغطية المراحل بالدروس'), h('div', { style: { 'max-height': '260px', overflow: 'auto' } }, s.stageCoverage.map((x) => h('div', { class: 'cov' }, h('b', { class: 'es', style: { width: '3.2rem' } }, x.code), bar((x.lessons / maxL) * 100), h('span', { class: x.lessons ? 'muted' : 'badge warn' }, x.lessons ? x.lessons : 'فارغة')))))),
    h('div', { class: 'split', style: { 'margin-top': '1rem' } },
      h('section', { class: 'card' }, h('h3', {}, 'الأكثر تسجيلاً'), h('div', { class: 'list' }, s.topCourses.map((c) => h('div', { class: 'list-item' }, c.title_ar, h('span', { class: 'spacer' }), h('span', { class: 'badge info' }, c.students + ' طالب')))), h('h3', { style: { 'margin-top': '1.2rem' } }, 'دروس بأدنى متوسط درجات'), h('div', { class: 'list' }, s.hardest.length ? s.hardest.map((c) => h('div', { class: 'list-item' }, c.title_ar, h('span', { class: 'spacer' }), h('span', { class: 'badge bad' }, c.avg + '%'))) : h('p', { class: 'muted' }, 'لا محاولات بعد'))),
      h('section', { class: 'card' }, h('h3', {}, 'تنبيهات اكتمال المنهج'), s.warnings.length ? h('ul', { class: 'checklist' }, s.warnings.slice(0, 10).map((w) => h('li', {}, w)), s.warnings.length > 10 && h('li', { class: 'muted' }, `و${s.warnings.length - 10} أخرى…`)) : h('p', { class: 'muted' }, 'لا تنبيهات')))) };
}
