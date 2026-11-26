import { h, ic, es, bar } from '../ui.js';
import { store } from '../store.js';
import { STATUS_AR } from '../constants.js';
import { pct } from '../lib/format.js';

export const courseCard = (c, base = '/courses') => h('a', { class: 'card hover ccard', href: `${base}/${c.slug}`, style: { '--c': c.color } },
  h('div', { class: 'cover' }, (c.cover || store.site?.images?.course_cover) && h('img', { src: c.cover || store.site.images.course_cover, alt: '', loading: 'lazy' }), es(c.stage)),
  h('div', { class: 'body' }, h('h3', {}, c.title_ar), h('small', { class: 'es muted' }, c.title_es),
    h('p', { class: 'muted small', style: { margin: 0 } }, (c.description || '').slice(0, 90) + ((c.description || '').length > 90 ? '…' : '')),
    c.enrolled ? h('div', { class: 'course-prog' }, bar(pct(c.done, c.lessons)), h('span', { class: 'tiny muted' }, `${c.done}/${c.lessons} دروس`)) : null,
    h('div', { class: 'meta' }, h('span', { class: 'badge' }, ic('book'), `${c.lessons} دروس`), h('span', { class: 'badge' }, ic('clock'), `${c.hours} ساعة`), h('span', { class: 'badge info' }, `${c.students || 0} طالب`), c.enrolled && h('span', { class: 'badge ok' }, 'مسجّل'))));

export const lessonRow = (l, base = '/app/lesson') => h('a', { class: 'lesson-item', href: `${base}/${l.slug}` },
  h('span', { class: 'dot ' + (l.status || 'new'), title: STATUS_AR[l.status || 'new'] }), h('span', {}, h('b', {}, l.title_ar), h('br'), h('small', { class: 'es muted' }, l.title_es)),
  h('span', { class: 'spacer' }), l.bestScore != null && h('span', { class: 'badge ok' }, l.bestScore + '%'), h('span', { class: 'badge' }, (l.minutes || 0) + ' د'));

export const kpi = (icon, color, value, label) => h('div', { class: 'card kpi' }, h('div', { class: 'ico', style: { '--c': color } }, ic(icon)), h('div', {}, h('b', {}, value), h('span', {}, label)));
