import { h, ic, bar } from '../../ui.js';
import { api } from '../../api.js';
import { pageHead } from '../../components/layouts.js';
import { fmtDate, pct } from '../../lib/format.js';

export default async function () {
  const t = await api.get('/api/transcript');
  const table = (head, rows) => h('div', { class: 'table-wrap' }, h('table', {}, h('thead', {}, h('tr', {}, head.map((x) => h('th', {}, x)))), h('tbody', {}, rows.length ? rows : h('tr', {}, h('td', { colspan: head.length, class: 'center muted' }, 'لا بيانات')))));
  return { title: 'السجل الأكاديمي', node: h('div', {}, pageHead('السجل الأكاديمي الداخلي', t.disclaimer, h('button', { class: 'btn btn-ghost no-print', type: 'button', onclick: () => print() }, ic('print'), 'طباعة')),
    h('div', { class: 'stat-grid' }, [['الاسم', t.student.name], ['المرحلة الحالية', t.student.stage], ['ساعات الدراسة المسجّلة', Math.round(t.studyMinutes / 60 * 10) / 10 + ' ساعة'], ['ساعات مقررات مكتملة (تقدير)', t.completedHours + ' ساعة']].map(([l, v]) => h('div', { class: 'card stat-card' }, h('div', {}, h('b', { class: l === 'المرحلة الحالية' ? 'es' : '' }, v), h('span', {}, l))))),
    h('h2', { style: { 'margin-top': '2rem' } }, 'المقررات'), table(['المقرر', 'المرحلة', 'الساعات', 'التسجيل', 'الإتمام', 'الشهادة'], t.courses.map((c) => h('tr', {}, h('td', {}, c.title_ar), h('td', { class: 'es' }, c.stage), h('td', {}, c.hours), h('td', {}, fmtDate(c.enrolled_at)), h('td', {}, c.completed_at ? fmtDate(c.completed_at) : '—'), h('td', {}, c.certificate ? h('a', { href: '/certificate/' + c.certificate }, c.certificate) : '—')))),
    h('h2', { style: { 'margin-top': '2rem' } }, 'المراحل'), table(['المرحلة', 'العنوان', 'الإنجاز', 'الساعات التقديرية'], t.stages.filter((s) => s.total).map((s) => h('tr', {}, h('td', { class: 'es' }, s.code), h('td', {}, s.title), h('td', {}, h('div', { class: 'cov' }, bar(pct(s.done, s.total)), h('span', {}, `${s.done}/${s.total}`), s.complete && h('span', { class: 'badge ok' }, 'مكتملة'))), h('td', {}, s.hours)))),
    h('h2', { style: { 'margin-top': '2rem' } }, 'نتائج التقييم'), table(['الدرس', 'المرحلة', 'أفضل نتيجة', 'الحالة'], t.results.map((r) => h('tr', {}, h('td', {}, r.title_ar), h('td', { class: 'es' }, r.stage), h('td', {}, r.best_score + '%'), h('td', {}, r.status))))) };
}
