import { h, ic, toast } from '../../ui.js';
import { api } from '../../api.js';
import { store } from '../../store.js';
import { buildForm, listEditor } from '../../components/form.js';
import { confirmBox } from '../../components/modal.js';
import { pageHead } from '../../components/layouts.js';
import { applySite } from '../../lib/site.js';
import { refresh } from '../../router.js';

const ICONS = ['map', 'layers', 'check', 'cards', 'game', 'book', 'star', 'trophy', 'flame', 'bolt', 'chat', 'wave', 'shield', 'award', 'users', 'chart', 'clock', 'zap'].map((i) => [i, i]);
const FEATURES = [['reading', 'مكتبة القراءة'], ['placement', 'اختبار تحديد المستوى'], ['leaderboard', 'لوحة الصدارة'], ['notes', 'الملاحظات الشخصية'], ['achievements', 'الإنجازات'], ['vocab', 'المفردات والمراجعة'], ['certificates', 'الشهادات'], ['public_catalog', 'عرض المقررات والمنهج للزوار'], ['search', 'البحث العام'], ['articles', 'المقالات'], ['team', 'فريق العمل'], ['events', 'الفعاليات الأسبوعية']];

export default async function () {
  const { site } = await api.get('/api/admin/site'), { settings } = await api.get('/api/admin/settings');
  const S = JSON.parse(JSON.stringify(site)), tab = {};
  const F = (fields, vals) => buildForm(fields, vals);

  // ---- عام (قبل: صفحة الإعدادات) ----
  const general = F([{ name: 'pass_percent', label: 'نسبة النجاح في الاختبارات (%)', type: 'number', min: 40, max: 100, hint: 'تُطبَّق على الاجتياز والتقدّم بين المراحل' }, { name: 'announcement_banner', label: 'شريط إعلان أعلى المنصة', full: true, hint: 'اتركه فارغاً لإخفائه' }, { name: 'registration_open', label: 'السماح بالتسجيل الجديد', type: 'checkbox', full: true }],
    { pass_percent: +settings.pass_percent, announcement_banner: settings.announcement_banner, registration_open: settings.registration_open === '1' });
  // ---- الهوية ----
  const brand = F([{ name: 'name_ar', label: 'اسم الأكاديمية (عربي)', required: true }, { name: 'name_es', label: 'الاسم بالإسبانية', dir: 'ltr' }, { name: 'tagline', label: 'الشعار النصي', full: true },
    { name: 'logo', label: 'الشعار الكبير (للصفحة الرئيسية وتسجيل الدخول)', type: 'image', full: true }, { name: 'logo_small', label: 'الشعار الصغير (القوائم)', type: 'image', full: true }, { name: 'favicon', label: 'أيقونة المتصفح', type: 'image', full: true }], S.brand);
  // ---- المظهر ----
  const themeF = F([{ name: 'brand_light', label: 'اللون الأساسي (الفاتح)', type: 'color' }, { name: 'brand2_light', label: 'الأساسي الثانوي (الفاتح)', type: 'color' }, { name: 'gold_light', label: 'اللون الذهبي (الفاتح)', type: 'color' },
    { name: 'brand_dark', label: 'اللون الأساسي (الداكن)', type: 'color' }, { name: 'brand2_dark', label: 'الأساسي الثانوي (الداكن)', type: 'color' }, { name: 'gold_dark', label: 'اللون الذهبي (الداكن)', type: 'color' },
    { name: 'radius', label: 'شكل الزوايا', type: 'select', options: [['sharp', 'حادة'], ['normal', 'عادية'], ['round', 'دائرية']] }, { name: 'font_scale', label: 'حجم الخط العام', type: 'number', min: 0.85, max: 1.3, hint: '1 = الحجم الطبيعي (من 0.85 إلى 1.3)' },
    { name: 'default_mode', label: 'الوضع الافتراضي للزوار', type: 'select', options: [['system', 'حسب جهاز الزائر'], ['light', 'فاتح'], ['dark', 'داكن']] }], S.theme);
  const livePreview = () => { const t = themeF.read(); applySite({ ...S, theme: { ...S.theme, ...t, font_scale: +t.font_scale || 1 }, brand: S.brand }); };
  themeF.root.addEventListener('input', livePreview); themeF.root.addEventListener('change', livePreview);
  // ---- الصفحة الرئيسية ----
  const home = F([{ name: 'hero_banner', label: 'إظهار البانر الرئيسي أعلى الصفحة', type: 'checkbox', full: true }, { name: 'hero_badge', label: 'الشارة العلوية', full: true }, { name: 'hero_title', label: 'العنوان الرئيسي' }, { name: 'hero_accent', label: 'العبارة المميّزة (إسبانية)', dir: 'ltr' }, { name: 'hero_sub', label: 'النص التعريفي', type: 'textarea', full: true, rows: 2 },
    { name: 'cta_primary', label: 'زر البدء' }, { name: 'cta_secondary', label: 'الزر الثاني' }, { name: 'features_title', label: 'عنوان قسم المميزات' }, { name: 'features_sub', label: 'وصفه' }, { name: 'courses_title', label: 'عنوان قسم المقررات' }, { name: 'courses_sub', label: 'وصفه' }, { name: 'courses_count', label: 'عدد المقررات المعروضة', type: 'number', min: 1, max: 12 },
    { name: 'intro_title', label: 'عنوان قسم التعريف' }, { name: 'intro_text', label: 'نصه', type: 'textarea', rows: 2, full: true }, { name: 'journey_title', label: 'عنوان خريطة المستويات' }, { name: 'journey_sub', label: 'وصفها' }, { name: 'cta_title', label: 'عنوان الدعوة الختامية' }, { name: 'cta_sub', label: 'نصها' }, { name: 'cta_button', label: 'زرها' }], S.home);
  const sections = listEditor([{ key: 'label', label: 'القسم', type: 'text' }, { key: 'visible', label: 'ظاهر', type: 'checkbox' }], S.home.sections.map((x) => ({ ...x })), {});
  // اسم القسم ثابت (للعرض فقط)
  const features = listEditor([{ key: 'title', label: 'العنوان' }, { key: 'icon', label: 'الأيقونة', type: 'select', options: ICONS }, { key: 'color', label: 'اللون', type: 'color' }, { key: 'desc', label: 'الوصف', type: 'textarea', wide: true }, { key: 'visible', label: 'ظاهرة', type: 'checkbox' }], S.home.features,
    { canAdd: true, canRemove: true, newItem: () => ({ icon: 'star', color: '#9b1b30', title: 'ميزة جديدة', desc: '', visible: true }) });
  const introPts = listEditor([{ key: 'title', label: 'العنوان' }, { key: 'desc', label: 'الوصف', wide: true }], S.home.intro_points, { canAdd: true, canRemove: true, newItem: () => ({ title: 'عنوان', desc: '' }) });
  // ---- القوائم ----
  const navPub = listEditor([{ key: 'label', label: 'الاسم الظاهر' }, { key: 'visible', label: 'ظاهر', type: 'checkbox' }], S.nav.public, {});
  const navApp = listEditor([{ key: 'label', label: 'الاسم الظاهر' }, { key: 'visible', label: 'ظاهر', type: 'checkbox' }], S.nav.app, {});
  // ---- الميزات ----
  const feat = F(FEATURES.map(([k, l]) => ({ name: k, label: l, type: 'checkbox' })), S.features);
  // ---- من نحن + FAQ ----
  const about = F([{ name: 'title', label: 'عنوان الصفحة' }, { name: 'subtitle', label: 'عنوان فرعي', full: true }, { name: 'body', label: 'النص (كل سطر فقرة)', type: 'textarea', rows: 8, full: true }], S.about);
  const faq = listEditor([{ key: 'q', label: 'السؤال', wide: true }, { key: 'a', label: 'الإجابة', type: 'textarea', wide: true }, { key: 'visible', label: 'ظاهر', type: 'checkbox' }], S.faq, { canAdd: true, canRemove: true, newItem: () => ({ q: 'سؤال جديد', a: '', visible: true }) });
  // ---- التذييل والتواصل ----
  const footer = F([{ name: 'text', label: 'نص التذييل', full: true }, { name: 'disclaimer', label: 'إخلاء المسؤولية', type: 'textarea', rows: 2, full: true }, { name: 'email', label: 'البريد', dir: 'ltr' }, { name: 'phone', label: 'الهاتف', dir: 'ltr' }, { name: 'whatsapp', label: 'واتساب', dir: 'ltr' },
    { name: 'facebook', label: 'رابط فيسبوك', dir: 'ltr' }, { name: 'instagram', label: 'رابط إنستغرام', dir: 'ltr' }, { name: 'youtube', label: 'رابط يوتيوب', dir: 'ltr' }, { name: 'x', label: 'رابط X', dir: 'ltr' }], S.footer);
  // ---- الصور ----
  const images = F([{ name: 'hero', label: 'بانر الصفحة الرئيسية (يستبدل بانر الوضعين الافتراضي)', type: 'image', full: true, hint: 'يُفضّل 1600×440 بنسبة 3.6:1. اتركه فارغاً لاستعمال البانر الافتراضي بنسختيه الفاتحة والداكنة' }, { name: 'intro', label: 'بانر قسم التعريف بالأكاديمية', type: 'image', full: true }, { name: 'auth', label: 'صورة صفحات الدخول والتسجيل (بدل الشعار)', type: 'image', full: true }, { name: 'about', label: 'صورة صفحة عن الأكاديمية', type: 'image', full: true },
    { name: 'empty', label: 'رسم الحالات الفارغة (بدل الأيقونة)', type: 'image', full: true }, { name: 'course_cover', label: 'غلاف افتراضي للمقررات', type: 'image', full: true }], S.images);

  const tabs = [
    ['general', 'عام', () => general.root], ['brand', 'الهوية', () => brand.root], ['theme', 'الألوان والمظهر', () => h('div', {}, h('p', { class: 'hint' }, 'التغييرات تظهر فوراً للمعاينة، وتُحفظ عند الضغط على «حفظ الكل».'), themeF.root)],
    ['home', 'الصفحة الرئيسية', () => h('div', {}, home.root, h('h3', {}, 'ترتيب الأقسام وإظهارها'), sections.node, h('h3', { style: { 'margin-top': '1.5rem' } }, 'نقاط قسم التعريف'), introPts.node, h('h3', { style: { 'margin-top': '1.5rem' } }, 'بطاقات المميزات'), features.node)],
    ['nav', 'القوائم', () => h('div', { class: 'split' }, h('div', {}, h('h3', {}, 'قائمة الموقع العام'), navPub.node), h('div', {}, h('h3', {}, 'قائمة تطبيق الطالب'), navApp.node))],
    ['features', 'الميزات', () => h('div', {}, h('p', { class: 'hint' }, 'إيقاف الميزة يخفيها من القوائم ويمنع الوصول إليها في الخادم أيضاً.'), feat.root)],
    ['pages', 'من نحن والأسئلة', () => h('div', {}, about.root, h('h3', {}, 'الأسئلة الشائعة'), faq.node)], ['footer', 'التذييل والتواصل', () => footer.root], ['images', 'الصور', () => h('div', {}, h('p', { class: 'hint' }, 'ارفع صورك من «مكتبة الصور» ثم اخترها هنا. الحقل الفارغ يعني الاستعمال الافتراضي.'), images.root)],
  ];
  const bar = h('div', { class: 'tabs', role: 'tablist' }), pane = h('div'); let cur = 'general';
  const show = (k) => { cur = k; bar.replaceChildren(...tabs.map(([key, t]) => h('button', { role: 'tab', 'aria-selected': String(k === key), onclick: () => show(key) }, t))); pane.replaceChildren(tabs.find((t) => t[0] === k)[2]()); };
  show('general');

  async function saveAll() {
    const out = { ...S, brand: { ...S.brand, ...brand.read() }, theme: { ...S.theme, ...themeF.read(), font_scale: +themeF.read().font_scale || 1 }, home: { ...S.home, ...home.read(), sections: sections.read(), features: features.read(), intro_points: introPts.read() }, nav: { public: navPub.read(), app: navApp.read() },
      features: feat.read(), about: about.read(), faq: faq.read(), footer: footer.read(), images: images.read() };
    out.home.courses_count = +out.home.courses_count || 3;
    try {
      const g = general.read(); await api.put('/api/admin/settings', { pass_percent: g.pass_percent, registration_open: g.registration_open, announcement_banner: g.announcement_banner }); store.banner = g.announcement_banner;
      const r = await api.put('/api/admin/site', { site: out }); store.site = r.site; applySite(r.site); toast('تم حفظ كل الإعدادات'); refresh();
    } catch (e) { toast(e.message, true); }
  }
  const reset = async () => { if (!(await confirmBox('إعادة كل إعدادات الموقع (الهوية والألوان والنصوص والقوائم) إلى الافتراضي؟', { danger: true, okText: 'إعادة الضبط' }))) return; const r = await api.post('/api/admin/site/reset'); store.site = r.site; applySite(r.site); toast('تمت إعادة الضبط'); refresh(); };
  return { title: 'إعدادات الموقع', node: h('div', {}, pageHead('إعدادات الموقع', 'تحكم شامل في الهوية والألوان والصفحة الرئيسية والقوائم والميزات والنصوص.', h('button', { class: 'btn btn-ghost', type: 'button', onclick: reset }, ic('history'), 'إعادة الضبط'), h('button', { class: 'btn btn-primary', type: 'button', onclick: saveAll }, ic('check'), 'حفظ الكل')), bar, h('div', { class: 'card' }, pane)) };
}
