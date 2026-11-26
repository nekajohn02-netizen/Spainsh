import { h, empty, ic } from '../../ui.js';
import { api } from '../../api.js';
import { fmtDateTime } from '../../lib/format.js';

const STATE_AR = { upcoming: ['info', 'قريباً'], live: ['ok', 'جارية الآن'], ended: ['', 'انتهت'] };

export default async function () {
  const { events } = await api.get('/api/events');
  return { title: 'الفعاليات الأسبوعية', node: h('div', {},
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'الفعاليات الأسبوعية'), h('p', {}, 'تحديات محدودة بمدة، بتقييم ونقاط ولوحة صدارة خاصة بكل فعالية.'))),
    events.length ? h('div', { class: 'list' }, events.map((e) => { const [k, t] = STATE_AR[e.state];
      return h('a', { class: 'list-item', href: '/app/events/' + e.slug }, h('div', { style: { flex: 1 } }, h('b', {}, e.title_ar), h('div', { class: 'tiny muted' }, `${fmtDateTime(e.starts_at)} ← ${fmtDateTime(e.ends_at)}`)),
        e.joined && h('span', { class: 'badge ok' }, ic('check'), 'مشترك'), h('span', { class: 'badge ' + k }, t)); })) : empty('لا توجد فعاليات حالياً', 'تابعنا، فعاليات جديدة تُضاف كل أسبوع.')) };
}
