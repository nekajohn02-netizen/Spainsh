import { h, ic } from '../../ui.js';
import { api } from '../../api.js';
import { pageHead } from '../../components/layouts.js';
import { fmtDate } from '../../lib/format.js';

export default async function () {
  const { achievements } = await api.get('/api/achievements'), got = achievements.filter((a) => a.unlockedAt).length;
  return { title: 'الإنجازات', node: h('div', {}, pageHead('الإنجازات', `${got} من ${achievements.length} مُنجَز`), h('div', { class: 'grid ach-grid' }, achievements.map((a) => h('article', { class: 'card ach' + (a.unlockedAt ? '' : ' locked') }, h('div', { class: 'medal' }, ic(a.icon)), h('h3', {}, a.title_ar), h('p', { class: 'muted small' }, a.desc_ar), a.unlockedAt ? h('span', { class: 'badge ok' }, 'تحقق ' + fmtDate(a.unlockedAt)) : h('span', { class: 'badge' }, a.xp ? `+${a.xp} XP` : 'مقفل'))))) };
}
