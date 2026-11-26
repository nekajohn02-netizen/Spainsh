import { h, ic, empty } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { refresh } from '../../router.js';
import { pageHead } from '../../components/layouts.js';
import { ago } from '../../lib/format.js';

export default async function () {
  const { notifications, announcements } = await api.get('/api/notifications');
  const markAll = h('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => { await api.post('/api/notifications/read-all'); store.unread = 0; refresh(); } }, ic('check'), 'تعليم الكل كمقروء');
  return { title: 'الإشعارات', node: h('div', {}, pageHead('الإشعارات', null, markAll),
    announcements.length ? h('div', { style: { 'margin-bottom': '1.5rem' } }, announcements.map((a) => h('div', { class: 'callout' }, h('b', {}, a.title), ' — ', a.body, h('div', { class: 'tiny muted' }, ago(a.at))))) : null,
    notifications.length ? h('div', { class: 'list' }, notifications.map((n) => h('div', { class: 'list-item', style: n.read ? { opacity: .65 } : {} }, ic(n.kind === 'achievement' ? 'trophy' : n.kind === 'certificate' ? 'award' : 'bell'), h('div', { style: { flex: 1 } }, h('b', {}, n.title), n.body && h('div', { class: 'muted small' }, n.body)), h('small', { class: 'muted' }, ago(n.at)), !n.read && h('span', { class: 'badge info' }, 'جديد')))) : empty('لا إشعارات')) };
}
