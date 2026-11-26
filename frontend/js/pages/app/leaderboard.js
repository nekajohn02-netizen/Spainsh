import { h, avatar, toast, empty } from '../../ui.js';
import { api } from '../../api.js';
import { navigate, refresh } from '../../router.js';
import { pageHead } from '../../components/layouts.js';

const PERIODS = [['week', 'هذا الأسبوع'], ['month', 'هذا الشهر'], ['year', 'هذه السنة'], ['all', 'الإجمالي']];

export default async function () {
  let period = 'all', data = await api.get('/api/leaderboard');
  const toggle = h('button', { class: 'btn ' + (data.optedIn ? 'btn-ghost' : 'btn-primary'), type: 'button', onclick: async () => { await api.patch('/api/profile', { publicProfile: !data.optedIn }); toast(data.optedIn ? 'تم إخفاء ملفك من الصدارة' : 'أصبح ملفك ظاهراً في الصدارة'); refresh(); } }, data.optedIn ? 'اخفِ ملفي من الصدارة' : 'اظهر في الصدارة');
  const tabs = h('div', { class: 'lv-tabs', role: 'tablist' }), list = h('div');
  const paintList = () => { list.replaceChildren(data.rows.length ? h('div', { class: 'list' }, data.rows.map((r) => h('div', { class: 'list-item' }, h('span', { class: 'rank' + (r.rank === 1 ? ' r1' : '') + (r.me ? ' me' : '') }, r.rank), avatar(r.name, r.hue), h('b', {}, r.name), h('span', { class: 'badge es' }, r.stage), h('span', { class: 'spacer' }), h('span', { class: 'badge info' }, `المستوى ${r.level}`), h('b', {}, r.xp + ' XP')))) : empty('لا أحد في الصدارة لهذه الفترة بعد', 'كن أول من يفعّل ظهور ملفه ويجمع نقاطاً.')); };
  const paintTabs = () => tabs.replaceChildren(...PERIODS.map(([k, t]) => h('button', { class: 'chip', role: 'tab', 'aria-pressed': String(k === period), onclick: async () => { period = k; data = await api.get('/api/leaderboard?period=' + k); paintTabs(); paintList(); } }, t)));
  paintTabs(); paintList();
  return { title: 'لوحة الصدارة', node: h('div', {}, pageHead('لوحة الصدارة', 'اختيارية بالكامل: يظهر فيها من فعّل ظهور ملفه فقط.', toggle), tabs, list) };
}
