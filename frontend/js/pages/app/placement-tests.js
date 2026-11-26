import { h, empty } from '../../ui.js';
import { api } from '../../api.js';
import { pageHead } from '../../components/layouts.js';

export default async function () {
  const { tests } = await api.get('/api/placement/tests');
  return { title: 'اختبارات تحديد المستوى', node: h('div', {}, pageHead('اختبارات تحديد المستوى', 'اختر نطاقاً محدداً: مرحلة واحدة، مستوى كامل، أو عدة مستويات معاً.'),
    tests.length ? h('div', { class: 'list' }, tests.map((t) => h('a', { class: 'list-item', href: '/app/placement/tests/' + t.id }, h('b', {}, t.title_ar), h('span', { class: 'spacer' }), h('span', { class: 'pill-row' }, t.stages.map((s) => h('span', { class: 'badge es' }, s)))))) : empty('لا توجد اختبارات إضافية بعد')) };
}
