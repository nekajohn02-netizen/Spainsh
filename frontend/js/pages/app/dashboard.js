import { h, ic, ring, bar, es, avatar, empty } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { kpi } from '../../components/cards.js';
import { levelColor } from '../../constants.js';
import { pct, ago } from '../../lib/format.js';

const DAYS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
function weekChart(week) {
  const map = Object.fromEntries(week.map((w) => [w.day, w.minutes])), max = Math.max(15, ...Object.values(map));
  const chart = h('div', { class: 'week', role: 'img', 'aria-label': 'دقائق الدراسة خلال الأسبوع' }), bars = [];
  for (let i = 0; i < 7; i++) { const d = new Date(); d.setUTCDate(d.getUTCDate() - 6 + i); const m = map[d.toISOString().slice(0, 10)] || 0, el = h('i', { style: { '--h': '4%' } });
    chart.append(h('div', { class: 'col' + (m ? '' : ' zero') + (i === 6 ? ' today' : '') }, h('b', {}, m || ''), el, h('span', {}, DAYS[d.getUTCDay()]))); bars.push([el, Math.max(6, (m / max) * 100)]); }
  requestAnimationFrame(() => requestAnimationFrame(() => bars.forEach(([e, p]) => e.style.setProperty('--h', p + '%')))); return chart;
}
export default async function () {
  const d = await api.get('/api/dashboard'), c = levelColor(d.stage.level);
  store.user.xp = d.user.xp;
  const sp = pct(d.stageProgress.done, d.stageProgress.total), xpPct = ((d.xp.now - d.xp.levelStart) / (d.xp.levelEnd - d.xp.levelStart)) * 100, goalPct = Math.min(100, pct(d.todayMin, d.goalMin));
  const node = h('div', { class: 'dash' },
    h('section', { class: 'card welcome w8' }, h('span', { class: 'badge', style: { '--c': c } }, 'المرحلة الحالية'), h('h2', {}, `أهلاً ${d.user.name.split(' ')[0]} 👋`),
      h('p', { class: 'muted' }, h('b', { class: 'es' }, d.stage.code), ' · ', d.stage.title_ar, ' — ', d.stage.purpose), bar(sp),
      h('p', { class: 'muted', style: { 'margin-top': '.5rem' } }, d.stageProgress.total ? `${d.stageProgress.done} من ${d.stageProgress.total} دروس مُجتازة في هذه المرحلة` : 'محتوى هذه المرحلة قيد الإعداد'),
      h('div', { class: 'row' }, d.resume ? h('a', { class: 'btn btn-primary', href: '/app/lesson/' + d.resume.slug }, 'تابع: ' + d.resume.title_ar, ic('arrow')) : h('a', { class: 'btn btn-primary', href: '/app/curriculum' }, 'استعرض المنهج', ic('arrow')),
        d.needsPlacement && h('a', { class: 'btn btn-ghost', href: '/app/placement' }, 'حدّد مستواك'))),
    h('section', { class: 'card center' }, h('h3', {}, `المستوى ${d.xp.level}`), ring(xpPct, d.xp.now + ''), h('p', { class: 'muted' }, `${d.xp.levelEnd - d.xp.now} XP للمستوى التالي`)),
    kpi('flame', '#e4572e', d.streak, 'يوم متتالٍ'), kpi('clock', '#6d4cff', `${d.todayMin}/${d.goalMin}`, 'دقائق اليوم (الهدف)'), kpi('trophy', '#0e9f8e', `${d.overall.done}/${d.overall.total}`, 'دروس مُجتازة'),
    h('section', { class: 'card w8' }, h('div', { class: 'row' }, h('h3', {}, 'نشاطك هذا الأسبوع'), h('span', { class: 'spacer' }), h('span', { class: 'badge info' }, `${d.minutesWeek} دقيقة`)), weekChart(d.week), h('p', { class: 'hint' }, 'هدف اليوم'), bar(goalPct)),
    h('section', { class: 'card' }, h('h3', {}, 'مراجعة المفردات'), d.review.saved === 0 ? h('div', { class: 'empty' }, h('p', {}, 'لم تحفظ كلمات بعد.'), h('a', { class: 'btn btn-ghost', href: '/app/vocab' }, 'تصفّح المفردات')) : h('div', {}, h('p', {}, d.review.due ? `لديك ${d.review.due} بطاقة مستحقة اليوم.` : 'لا بطاقات مستحقة الآن، أحسنت!'), d.review.due ? h('a', { class: 'btn btn-primary', href: '/app/review' }, 'ابدأ المراجعة') : h('a', { class: 'btn btn-ghost', href: '/app/curriculum' }, 'استعرض المنهج'))),
    h('section', { class: 'card w8' }, h('div', { class: 'row' }, h('h3', {}, 'مقرراتي'), h('span', { class: 'spacer' }), h('a', { href: '/app/my-courses' }, 'الكل')),
      d.courses.length ? h('div', { class: 'list' }, d.courses.map((x) => h('a', { class: 'list-item', href: '/app/courses/' + x.slug }, h('span', { class: 'avatar', style: { '--h': 0, background: x.color } }, x.stage), h('div', { style: { flex: 1 } }, h('b', {}, x.title_ar), bar(pct(x.done, x.total))), h('span', { class: 'badge' }, `${x.done}/${x.total}`)))) : empty('لم تسجّل في مقرر بعد', 'اختر مقرراً لتبدأ رحلة منظمة.', h('a', { class: 'btn btn-primary', href: '/app/courses' }, 'تصفّح المقررات'))),
    h('section', { class: 'card' }, h('h3', {}, 'إنجازات حديثة'), d.achievements.length ? h('div', { class: 'list' }, d.achievements.map((a) => h('div', { class: 'list-item' }, ic('trophy'), h('b', {}, a.title_ar), h('span', { class: 'spacer' }), h('small', { class: 'muted' }, ago(a.at))))) : h('p', { class: 'muted' }, 'أكمل درساً لتحصل على أول إنجاز.'), h('a', { href: '/app/achievements' }, 'كل الإنجازات')),
    h('section', { class: 'card w6' }, h('h3', {}, 'مقترحة لك'), h('div', { class: 'list' }, d.recommended.map((l) => h('a', { class: 'list-item', href: '/app/lesson/' + l.slug }, h('b', {}, l.title_ar), h('span', { class: 'spacer' }), h('span', { class: 'badge es' }, l.stage), h('span', { class: 'badge' }, l.minutes + ' د')))) ),
    h('section', { class: 'card w6' }, h('h3', {}, 'نقاط تحتاج مراجعة'), d.weak.length ? h('div', { class: 'list' }, d.weak.map((l) => h('a', { class: 'list-item', href: '/app/lesson/' + l.slug }, h('b', {}, l.title_ar), h('span', { class: 'spacer' }), h('span', { class: 'badge bad' }, l.n + ' أخطاء')))) : h('p', { class: 'muted' }, 'لا أخطاء مسجّلة. أجرِ اختباراً لتظهر نقاط تحسينك هنا.'), d.mistakes ? h('a', { href: '/app/mistakes' }, 'دفتر الأخطاء') : null),
    h('section', { class: 'card w6' }, h('h3', {}, 'أضعف مهاراتك'), d.weakTracks.length ? h('div', { class: 'list' }, d.weakTracks.map((w) => h('div', { class: 'list-item' }, h('b', {}, w.track_title), h('span', { class: 'spacer' }), h('span', { class: 'badge bad' }, w.n + ' أخطاء'),
      w.nextLesson ? h('a', { class: 'btn btn-ghost btn-sm', href: '/app/lesson/' + w.nextLesson.slug }, 'تدرّب الآن') : h('a', { class: 'btn btn-ghost btn-sm', href: '/app/curriculum#' + d.stage.level }, 'استعرض المسار')))) : h('p', { class: 'muted' }, 'لا توجد مهارة ضعيفة واضحة بعد — تابع التدريب لتظهر هنا تحليلات أدق.')),
    d.announcements.length ? h('section', { class: 'card w12' }, h('h3', {}, 'إعلانات الأكاديمية'), d.announcements.map((a) => h('div', { class: 'callout' }, h('b', {}, a.title), ' — ', a.body))) : null);
  return { title: 'لوحتي', node };
}
