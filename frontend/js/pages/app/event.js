import { h, avatar, toast, empty } from '../../ui.js';
import { api } from '../../api.js';
import { pageHead } from '../../components/layouts.js';
import { fmtDateTime } from '../../lib/format.js';

const STATE_AR = { upcoming: ['info', 'ستبدأ قريباً'], live: ['ok', 'جارية الآن'], ended: ['', 'انتهت'] };

export default async function ({ params }) {
  let { event: E, joined, state, leaderboard } = await api.get('/api/events/' + params.slug);
  const [k, t] = STATE_AR[state];
  const board = h('div');
  const paintBoard = () => board.replaceChildren(leaderboard.length ? h('div', { class: 'list' }, leaderboard.map((r) => h('div', { class: 'list-item' }, h('span', { class: 'rank' + (r.rank === 1 ? ' r1' : '') + (r.me ? ' me' : '') }, r.rank), avatar(r.name, r.hue), h('b', {}, r.name), h('span', { class: 'spacer' }), h('b', {}, r.xp + ' XP')))) : empty('لا مشاركين بعد', 'انضم الآن وابدأ التدريب لتظهر في الصدارة.'));
  paintBoard();
  const joinBtn = h('button', { class: 'btn btn-primary', type: 'button', disabled: joined || state === 'ended', onclick: async () => {
    try { await api.post(`/api/events/${params.slug}/join`); joined = true; toast('انضممت للفعالية! تدرّب الآن لتتصدّر لوحتها'); joinBtn.textContent = 'أنت مشترك'; joinBtn.disabled = true; } catch (err) { toast(err.message, true); }
  } }, joined ? 'أنت مشترك' : state === 'ended' ? 'انتهت الفعالية' : 'انضم للفعالية');
  return { title: E.title_ar, node: h('div', {}, pageHead(E.title_ar, `${fmtDateTime(E.starts_at)} ← ${fmtDateTime(E.ends_at)}`, h('span', { class: 'badge ' + k }, t), joinBtn),
    E.description && h('p', { class: 'muted' }, E.description), E.points_note && h('div', { class: 'callout tip' }, E.points_note),
    h('h3', { style: { 'margin-top': '1.5rem' } }, 'لوحة صدارة الفعالية'), board) };
}
