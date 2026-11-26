import { h, toast } from '../ui.js';
import { api } from '../api.js';
import { debounce } from '../lib/format.js';

// حارس الاختبار: يمنع النسخ/التحديد/القائمة السياقية، ويسجّل تبديل التبويب/فقدان التركيز، ويعرض عدّاداً تنازلياً عند وجود حد زمني.
export function guardQuiz(container, { lessonSlug, limitMin, onExpire }) {
  let warned = false;
  const warn = () => { if (warned) return; warned = true; toast('النسخ والتحديد غير متاحين أثناء الاختبار', true); setTimeout(() => { warned = false; }, 2000); };
  const block = (e) => { e.preventDefault(); warn(); };
  const flag = debounce((kind) => { api.post(`/api/lessons/${lessonSlug}/cheat-event`, { kind }).catch(() => {}); }, 800);
  const onBlur = () => flag('blur');
  const onVisibility = () => { if (document.hidden) flag('visibility'); };
  // كشف تقريبي بفتح أدوات المطوّر المرسوة (ليس مضموناً 100% ولا يحجب شيئاً فعلياً، فقط يُسجَّل للمراجعة)
  let devtoolsOpen = false;
  const devtoolsCheck = setInterval(() => {
    const open = outerWidth - innerWidth > 160 || outerHeight - innerHeight > 160;
    if (open && !devtoolsOpen) { devtoolsOpen = true; flag('devtools'); } else if (!open) devtoolsOpen = false;
  }, 1500);

  container.classList.add('no-select');
  container.addEventListener('copy', block); container.addEventListener('cut', block);
  container.addEventListener('paste', block); container.addEventListener('contextmenu', block); container.addEventListener('selectstart', block);
  addEventListener('blur', onBlur); document.addEventListener('visibilitychange', onVisibility);

  let timerBox = null, iv = null;
  if (limitMin) {
    const deadline = Date.now() + limitMin * 60000;
    timerBox = h('div', { class: 'badge warn exam-timer', role: 'timer' }, '…');
    const tick = () => {
      const left = Math.max(0, deadline - Date.now()), m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
      timerBox.textContent = `⏱ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      if (left <= 0) { clearInterval(iv); timerBox.textContent = '⏱ انتهى الوقت'; onExpire?.(); }
    };
    tick(); iv = setInterval(tick, 1000);
    container.prepend(timerBox);
  }

  return {
    timerBox,
    detach() {
      container.classList.remove('no-select');
      container.removeEventListener('copy', block); container.removeEventListener('cut', block);
      container.removeEventListener('paste', block); container.removeEventListener('contextmenu', block); container.removeEventListener('selectstart', block);
      removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(devtoolsCheck);
      if (iv) clearInterval(iv);
    },
  };
}
