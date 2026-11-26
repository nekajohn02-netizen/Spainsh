import { h, ic } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { levelColor, levelOfStage } from '../../constants.js';
import { lessonRow } from '../../components/cards.js';

function skillStats(stage) {
  const byTrack = {};
  for (const l of stage.lessons) { const t = (byTrack[l.track] ||= { total: 0, done: 0 }); t.total++; if (['passed', 'mastered'].includes(l.status)) t.done++; }
  return byTrack;
}

export async function curriculumView(base) {
  let data = await api.get('/api/curriculum');
  const levels = data.levels.map((l) => l.code);
  const initial = levels.includes(location.hash.slice(1)) ? location.hash.slice(1) : (levels.includes(levelOfStage(store.user?.stage)) ? levelOfStage(store.user.stage) : levels[0]);
  const expanded = new Set(initial ? [initial] : []);
  const activeTracks = new Set();
  const list = h('div'), trackBar = h('div', { class: 'pill-row', role: 'group', 'aria-label': 'تصفية حسب المسار (المهارة)' });

  const paintTracks = () => {
    trackBar.replaceChildren(...data.tracks.map((t) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(activeTracks.has(t.id)), onclick: async () => {
      activeTracks.has(t.id) ? activeTracks.delete(t.id) : activeTracks.add(t.id);
      data = await api.get('/api/curriculum' + (activeTracks.size ? '?track=' + [...activeTracks].join(',') : ''));
      paintTracks(); paint();
    } }, t.title_ar)));
  };

  function stageCard(s) {
    const cur = store.user?.stage === s.code;
    const skills = activeTracks.size ? [] : Object.entries(skillStats(s)).map(([trackId, st]) => { const t = data.tracks.find((x) => x.id === trackId); return t && h('span', { class: 'skill-bar', style: { '--tc': t.color } }, h('span', { class: 'track-dot' }), `${t.title_ar} ${st.done}/${st.total}`); }).filter(Boolean);
    return h('article', { class: 'stage' + (cur ? ' current' : ''), style: { '--c': s.color || levelColor(s.level) } }, h('div', { class: 'code' }, s.code),
      h('div', { class: 'card' }, h('div', { class: 'row' }, h('h3', {}, s.title_ar), cur && h('span', { class: 'badge warn' }, 'مرحلتك الحالية'), h('span', { class: 'spacer' }), h('span', { class: 'badge' }, ic('clock'), ` ~${s.hours} ساعة (تقدير داخلي)`)),
        h('p', { class: 'muted' }, s.purpose), skills.length ? h('div', { class: 'skill-bars' }, skills) : null,
        s.lessons.length ? s.lessons.map((l) => store.user ? lessonRow(l, base) : h('div', { class: 'lesson-item' }, h('span', { class: 'dot' }), h('b', {}, l.title_ar), h('span', { class: 'spacer' }), h('span', { class: 'badge' }, l.minutes + ' د'))) : h('p', { class: 'badge' }, activeTracks.size ? 'لا دروس بهذا المسار في هذه المرحلة' : 'محتوى هذه المرحلة قيد الإعداد')));
  }

  function paint() {
    list.replaceChildren(...levels.map((lv) => {
      const lvMeta = data.levels.find((l) => l.code === lv), stages = data.stages.filter((s) => s.level === lv), isOpen = expanded.has(lv);
      const head = h('button', { class: 'level-head', type: 'button', id: 'lv-' + lv, 'aria-expanded': String(isOpen), onclick: () => { isOpen ? expanded.delete(lv) : expanded.add(lv); paint(); } },
        h('span', { class: 'lv-code', style: { '--c': levelColor(lv) } }, lv),
        h('div', { style: { flex: 1 } }, h('b', {}, `${lv} — ${lvMeta.title_ar}`), h('div', { class: 'tiny muted' }, `${stages.length} مراحل`)),
        h('span', { class: 'chevron' }, ic('down')));
      return h('div', { class: 'level-group' }, head, isOpen ? h('div', { class: 'level-body' }, lvMeta.cover && h('img', { class: 'about-img', src: lvMeta.cover, alt: '' }), stages.map(stageCard)) : null);
    }));
  }

  paintTracks(); paint();
  if (initial) requestAnimationFrame(() => document.getElementById('lv-' + initial)?.scrollIntoView({ block: 'center' }));
  const hero = h('div', { class: 'path-hero' }, h('span', { class: 'es-sub', lang: 'es', dir: 'ltr' }, 'Spanish Learning Path'), h('h1', {}, 'رحلتك التعليمية في اللغة الإسبانية'), h('span', { class: 'badge info' }, 'CEFR · A1 → C2'));
  const toggleAll = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { expanded.size === levels.length ? expanded.clear() : levels.forEach((lv) => expanded.add(lv)); paint(); } }, 'توسيع/تصغير الكل');
  return h('div', {}, hero, h('p', { class: 'muted center' }, data.note), h('p', { class: 'tiny muted center' }, 'اختر مساراً واحداً أو أكثر (مثل الاستماع، أو المحادثة والاستماع معاً) لمتابعة مهارة واحدة عبر كل المستويات.'),
    h('div', { class: 'row' }, trackBar, h('span', { class: 'spacer' }), toggleAll), list);
}
export default async function () { return { title: 'المنهج', node: h('div', { class: 'container page' }, await curriculumView('/app/lesson')) }; }
