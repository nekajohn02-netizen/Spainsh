import { h, empty } from '../../ui.js';
import { api } from '../../api.js';
import { courseCard } from '../../components/cards.js';
import { pageHead } from '../../components/layouts.js';

export default async function () {
  const { courses } = await api.get('/api/my/courses');
  return { title: 'مقرراتي', node: h('div', {}, pageHead('مقرراتي', 'المقررات المسجّل فيها وتقدّمك فيها.', h('a', { class: 'btn btn-primary', href: '/app/courses' }, 'تصفّح المزيد')),
    courses.length ? h('div', { class: 'grid cgrid' }, courses.map((c) => courseCard(c, '/app/courses'))) : empty('لا توجد مقررات مسجّلة', 'سجّل في مقرر أو ابدأ أي درس وسنسجّلك تلقائياً.', h('a', { class: 'btn btn-primary', href: '/app/courses' }, 'الكتالوج'))) };
}
