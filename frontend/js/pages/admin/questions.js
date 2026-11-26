import { h } from '../../ui.js';
import { resourcePage } from '../../components/resource.js';
import { lookups } from '../../lib/lookups.js';

export default async function ({ query }) {
  const L = await lookups(true), lessonFilter = query.get('lesson');
  const lessons = (await (await import('../../api.js')).api.get('/api/admin/lessons?size=100&sort=title_ar&dir=asc')).rows.map((l) => [l.id, l.title_ar]);
  const TYPES = [['single', 'اختيار من متعدد'], ['tf', 'صح / خطأ'], ['fill', 'إكمال']];
  return { title: 'بنك الأسئلة', node: resourcePage({ title: 'بنك الأسئلة', sub: lessonFilter ? 'أسئلة الدرس المحدد.' : 'أسئلة الدروس وأسئلة اختبار تحديد المستوى.', path: 'questions', sort: 'id', dir: 'asc', initialFilters: lessonFilter ? { lesson_id: lessonFilter } : {}, wide: true,
    defaults: { type: 'single', bank: 'lesson', difficulty: 1, lesson_id: lessonFilter || '' },
    filters: [{ key: 'bank', label: 'البنك', options: [['lesson', 'أسئلة الدروس'], ['placement', 'تحديد المستوى']] }, { key: 'type', label: 'النوع', options: TYPES }],
    columns: [{ key: 'prompt', label: 'السؤال', render: (q) => h('span', { dir: 'auto' }, q.prompt.slice(0, 70)) }, { key: 'type', label: 'النوع', sortable: true, render: (q) => TYPES.find((t) => t[0] === q.type)?.[1] || q.type }, { key: 'bank', label: 'البنك', sortable: true }, { key: 'stage', label: 'المرحلة', sortable: true, render: (q) => h('span', { class: 'es' }, q.stage || '—') }, { key: 'difficulty', label: 'الصعوبة', sortable: true }],
    toForm: (q) => ({ ...q, options: (() => { try { return JSON.parse(q.options || '[]').join('\n'); } catch { return ''; } })() }),
    fields: () => [{ name: 'bank', label: 'البنك', type: 'select', options: [['lesson', 'أسئلة الدروس'], ['placement', 'تحديد المستوى']] }, { name: 'lesson_id', label: 'الدرس (لأسئلة الدروس)', type: 'select', options: [['', '—'], ...lessons] },
      { name: 'type', label: 'النوع', type: 'select', options: TYPES }, { name: 'stage', label: 'المرحلة', type: 'select', options: [['', '—'], ...L.stages] },
      { name: 'prompt', label: 'نص السؤال', type: 'textarea', full: true, required: true, rows: 2, hint: 'للاختبارات الرسمية الموقوتة، يُفضَّل كتابة نص السؤال بالإسبانية بالكامل ليبدو احترافياً (يُعرض تلقائياً باتجاه LTR لدروس الاختبار الموقوتة).' },
      { name: 'options', label: 'الخيارات (سطر لكل خيار)', type: 'textarea', full: true, rows: 4, hint: 'اتركها فارغة لسؤال الإكمال أو صح/خطأ' }, { name: 'answer', label: 'الإجابة الصحيحة', required: true, hint: 'رقم الخيار الصحيح (يبدأ من 0)، أو النص لأسئلة الإكمال', dir: 'ltr' },
      { name: 'difficulty', label: 'الصعوبة (1-5)', type: 'number', min: 1, max: 5 }, { name: 'explain', label: 'شرح الإجابة', full: true }] }) };
}
