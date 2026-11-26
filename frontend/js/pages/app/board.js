import { h, ic, toast } from '../../ui.js';
import { pageHead } from '../../components/layouts.js';

// لوحة ملاحظات/خريطة ذهنية شخصية بالسحب والإفلات — تُحفظ في متصفح الطالب فقط، لا تصل لخادمنا أبداً.
const KEY = 'my_board_v1';
const COLORS = ['#f5d58b', '#9adbd2', '#c9b8ff', '#ffb3c6', '#a8d8ff'];
const load = () => { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); return d && d.cards ? d : { cards: [], links: [] }; } catch { return { cards: [], links: [] }; } };
const save = (state) => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { toast('تعذّر الحفظ في متصفحك', true); } };
const download = (filename, text, mime = 'application/json') => { const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: mime })), download: filename }); document.body.append(a); a.click(); a.remove(); };

export default function () {
  const state = load();
  let linkMode = false, linkFrom = null;
  const W = 1400, H = 800;
  const svg = h('svg', { class: 'board-links', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
  const cardsLayer = h('div', { class: 'board-cards', style: { width: W + 'px', height: H + 'px' } });
  const canvas = h('div', { class: 'board-canvas' }, svg, cardsLayer);
  const center = (c) => [c.x + c.w / 2, c.y + c.h / 2];
  const cardEl = {};

  function paintLinks() {
    svg.replaceChildren(...state.links.map(([a, b], i) => { const ca = state.cards.find((c) => c.id === a), cb = state.cards.find((c) => c.id === b); if (!ca || !cb) return null;
      const [x1, y1] = center(ca), [x2, y2] = center(cb);
      const line = h('line', { x1, y1, x2, y2, class: 'board-link' });
      line.addEventListener('dblclick', () => { state.links.splice(i, 1); save(state); paintLinks(); toast('تم فصل الرابط'); });
      return line; }));
  }
  function makeCard(c) {
    const head = h('div', { class: 'board-card-head' }, ic('layers'), h('span', { class: 'spacer' }), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'حذف البطاقة', onclick: () => { state.cards = state.cards.filter((x) => x.id !== c.id); state.links = state.links.filter(([a, b]) => a !== c.id && b !== c.id); delete cardEl[c.id]; el.remove(); save(state); paintLinks(); } }, ic('trash')));
    const text = h('div', { class: 'board-card-text', contenteditable: 'plaintext-only', spellcheck: 'false' }, c.text);
    text.addEventListener('input', () => { c.text = text.textContent; save(state); });
    const el = h('div', { class: 'board-card', style: { left: c.x + 'px', top: c.y + 'px', width: c.w + 'px', '--bc': c.color } }, head, text);
    el.addEventListener('click', (e) => { if (!linkMode || e.target.closest('.board-card-head') || e.target === text) return;
      if (!linkFrom) { linkFrom = c.id; el.classList.add('linking'); }
      else if (linkFrom !== c.id) { state.links.push([linkFrom, c.id]); save(state); paintLinks(); cardEl[linkFrom]?.classList.remove('linking'); linkFrom = null; }
    });
    head.addEventListener('pointerdown', (e) => {
      e.preventDefault(); const sx = e.clientX, sy = e.clientY, ox = c.x, oy = c.y;
      const onMove = (ev) => { c.x = Math.max(0, ox + (ev.clientX - sx)); c.y = Math.max(0, oy + (ev.clientY - sy)); el.style.left = c.x + 'px'; el.style.top = c.y + 'px'; paintLinks(); };
      const onUp = () => { removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); save(state); };
      addEventListener('pointermove', onMove); addEventListener('pointerup', onUp);
    });
    cardEl[c.id] = el; return el;
  }
  function paintCards() { cardsLayer.replaceChildren(...state.cards.map(makeCard)); }

  const addCard = () => { const c = { id: Date.now(), x: 40 + Math.random() * 200, y: 40 + Math.random() * 120, w: 180, color: COLORS[state.cards.length % COLORS.length], text: 'بطاقة جديدة' }; state.cards.push(c); save(state); paintCards(); paintLinks(); };
  const linkBtn = h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { linkMode = !linkMode; linkFrom && cardEl[linkFrom]?.classList.remove('linking'); linkFrom = null; linkBtn.classList.toggle('btn-primary', linkMode); linkBtn.classList.toggle('btn-ghost', !linkMode); toast(linkMode ? 'اختر بطاقتين لربطهما (نقرتان بالترتيب)' : 'أُلغي وضع الربط'); } }, ic('bolt'), 'وضع الربط');
  const importInput = h('input', { type: 'file', accept: 'application/json', hidden: true });
  importInput.addEventListener('change', async () => { const f = importInput.files[0]; if (!f) return;
    try { const d = JSON.parse(await f.text()); if (!d.cards) throw 0; state.cards = d.cards; state.links = d.links || []; save(state); paintCards(); paintLinks(); toast('تم الاستيراد'); } catch { toast('ملف غير صالح', true); } importInput.value = ''; });
  const exportPng = () => {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2;
    for (const [a, b] of state.links) { const ca = state.cards.find((x) => x.id === a), cb = state.cards.find((x) => x.id === b); if (!ca || !cb) continue;
      const [x1, y1] = center(ca), [x2, y2] = center(cb); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    for (const card of state.cards) { ctx.fillStyle = card.color; ctx.fillRect(card.x, card.y, card.w, 70); ctx.strokeStyle = '#00000022'; ctx.strokeRect(card.x, card.y, card.w, 70);
      ctx.fillStyle = '#1a1a1a'; ctx.font = '14px sans-serif'; wrapText(ctx, card.text, card.x + 10, card.y + 25, card.w - 20, 18); }
    const a = h('a', { href: c.toDataURL('image/png'), download: 'my-board.png' }); document.body.append(a); a.click(); a.remove();
  };
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) { const words = String(text || '').split(' '); let line = '', ly = y;
    for (const w of words) { const test = line + w + ' '; if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, ly); line = w + ' '; ly += lineHeight; } else line = test; } ctx.fillText(line, x, ly); }

  paintCards(); paintLinks();
  const toolbar = h('div', { class: 'row' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: addCard }, ic('plus'), 'بطاقة جديدة'), linkBtn, h('span', { class: 'spacer' }),
    h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => download('my-board.json', JSON.stringify(state, null, 2)) }, ic('down'), 'تحميل JSON'),
    h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => exportPng() }, ic('down'), 'تصدير صورة'),
    h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => importInput.click() }, ic('plus'), 'استيراد'), importInput,
    h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { if (!confirm('مسح كل البطاقات والروابط؟')) return; state.cards = []; state.links = []; save(state); paintCards(); paintLinks(); } }, ic('trash'), 'مسح الكل'));
  return { title: 'لوحتي ومخططاتي الذهنية', node: h('div', {}, pageHead('لوحتي ومخططاتي الذهنية', 'بطاقات قابلة للسحب والربط لبناء خريطة ذهنية خاصة بك — تُحفظ في متصفحك فقط على هذا الجهاز ولا تُرفع لخادم الموقع.'), toolbar, canvas) };
}
