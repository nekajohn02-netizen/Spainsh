import { store } from './store.js';
export const STATUS_AR = { new: 'لم يبدأ', viewed: 'تمت المشاهدة', completed: 'اكتملت القراءة', assessed: 'تم التقييم', passed: 'اجتاز الاختبار', mastered: 'متقن' };
// المستويات والمراحل تأتي من الخادم (قابلة للتعديل من لوحة الإدارة)
const FALLBACK = '#9b1b30';
export const levelCodes = () => (store.meta?.levels || []).map((l) => l.code);
export const levelColor = (code) => (store.meta?.levels || []).find((l) => l.code === code)?.color || FALLBACK;
export const levelName = (code) => (store.meta?.levels || []).find((l) => l.code === code)?.title_ar || code;
export const stageColor = (stage) => (store.meta?.stages || []).find((s) => s.code === stage)?.color || FALLBACK;
export const levelOfStage = (stage) => (store.meta?.stages || []).find((s) => s.code === stage)?.level || String(stage).split('.')[0];
export const feature = (k) => store.site?.features?.[k] !== false;
