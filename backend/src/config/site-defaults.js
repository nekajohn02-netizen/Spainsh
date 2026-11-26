'use strict';
// الإعدادات الافتراضية للموقع. كل ما هنا قابل للتعديل من لوحة الإدارة، وبنية هذا الكائن هي المخطط الوحيد المسموح به
module.exports = {
  brand: { name_ar: 'أكاديميا إسبانيولا', name_es: 'Academia Española', tagline: 'تعلّم الإسبانية بالعربية', logo: '/assets/logo-256.webp', logo_small: '/assets/logo-96.webp', favicon: '/assets/favicon-64.png' },
  theme: { brand_light: '#9b1b30', brand2_light: '#c93a4f', gold_light: '#c8962e', brand_dark: '#ff7a8a', brand2_dark: '#ffa0ab', gold_dark: '#f2c14e', radius: 'normal', font_scale: 1, default_mode: 'system' },
  home: {
    hero_banner: true, hero_badge: 'منصة عربية لتعلّم الإسبانية', hero_title: 'افتح لنفسك عالماً يتحدث', hero_accent: 'español',
    hero_sub: 'نظام تعلّم متكامل بالعربية: مقررات منظمة، تمارين تفاعلية، قصص، ومفردات تثبت في الذاكرة.', cta_primary: 'ابدأ مجاناً', cta_secondary: 'استعرض المقررات',
    intro_title: 'أكاديمية متكاملة لتعلّم الإسبانية', intro_text: 'من الحروف الأولى إلى الحوار الواثق: منهج بالعربية يجمع القواعد والمفردات والمحادثة والثقافة الإسبانية في رحلة واحدة منظمة.',
    intro_points: [{ title: 'القواعد', desc: 'شرح عربي واضح مع أمثلة إسبانية.' }, { title: 'المفردات', desc: 'بطاقات بالتكرار المتباعد.' }, { title: 'المحادثة', desc: 'حوارات ومواقف يومية.' }, { title: 'الثقافة الإسبانية', desc: 'قصص ونصوص من قلب إسبانيا.' }],
    features_title: 'كل ما تحتاجه في مكان واحد', features_sub: 'منصة تعلّم متكاملة بأدوات للطالب ولوحة إدارة كاملة للمحتوى.',
    courses_title: 'ابدأ بمقرر', courses_sub: 'اختر مقرراً يناسب مستواك وسجّل فيه بنقرة واحدة.', courses_count: 3,
    journey_title: 'خريطة رحلتك', journey_sub: 'كل مستوى ينقسم إلى مراحل متدرجة قابلة للقياس.',
    cta_title: 'جاهز لأول كلمة؟', cta_sub: 'أنشئ حسابك في أقل من دقيقة وابدأ بدرس الأبجدية.', cta_button: 'ابدأ الآن',
    sections: [{ id: 'stats', label: 'الإحصاءات', visible: true }, { id: 'intro', label: 'التعريف بالأكاديمية (البانر الثاني)', visible: true }, { id: 'features', label: 'المميزات', visible: true }, { id: 'courses', label: 'المقررات', visible: true }, { id: 'journey', label: 'خريطة المستويات', visible: true }, { id: 'cta', label: 'دعوة للبدء', visible: true }],
    features: [
      { icon: 'map', color: '#6d4cff', title: 'منهج منظم', desc: 'مستويات ومراحل داخلية متدرجة لتعرف أين أنت وما التالي.', visible: true },
      { icon: 'layers', color: '#9b1b30', title: 'مقررات ووحدات ودروس', desc: 'مقررات بوحدات ودروس واختبارات وشهادات إتمام داخلية.', visible: true },
      { icon: 'check', color: '#0e9f8e', title: 'اختبارات موثوقة', desc: 'التصحيح في الخادم ولا يُمنح الإتقان إلا بدليل أداء حقيقي.', visible: true },
      { icon: 'cards', color: '#c8962e', title: 'مفردات بالتكرار المتباعد', desc: 'بطاقات ذكية بخوارزمية SM-2 تعرض الكلمة قبل أن تنساها.', visible: true },
      { icon: 'game', color: '#e0457b', title: 'ألعاب تعليمية', desc: 'مطابقة وتصريف وأدوات وترتيب جمل، مع نقاط ومستويات.', visible: true },
      { icon: 'book', color: '#2f80ed', title: 'مكتبة قراءة', desc: 'قصص مدرّجة بترجمة وقاموس بالنقر على أي كلمة.', visible: true },
    ],
  },
  nav: {
    public: [{ id: 'home', label: 'الرئيسية', visible: true }, { id: 'courses', label: 'المقررات', visible: true }, { id: 'curriculum', label: 'المنهج', visible: true }, { id: 'reading', label: 'القراءة', visible: true }, { id: 'articles', label: 'المقالات', visible: true }, { id: 'team', label: 'فريق العمل', visible: false }, { id: 'about', label: 'عن الأكاديمية', visible: true }, { id: 'faq', label: 'الأسئلة الشائعة', visible: true }],
    app: [{ id: 'dashboard', label: 'لوحتي', visible: true }, { id: 'my-courses', label: 'مقرراتي', visible: true }, { id: 'catalog', label: 'كتالوج المقررات', visible: true }, { id: 'curriculum', label: 'المنهج والمراحل', visible: true }, { id: 'placement', label: 'تحديد المستوى', visible: true },
      { id: 'reading', label: 'مكتبة القراءة', visible: true }, { id: 'vocab', label: 'قاموس المفردات', visible: true }, { id: 'review', label: 'مراجعة البطاقات', visible: true }, { id: 'events', label: 'الفعاليات', visible: true },
      { id: 'my-dictionary', label: 'قاموسي الخاص', visible: true }, { id: 'board', label: 'لوحتي ومخططاتي الذهنية', visible: true },
      { id: 'mistakes', label: 'دفتر الأخطاء', visible: true }, { id: 'notes', label: 'ملاحظاتي', visible: true }, { id: 'achievements', label: 'الإنجازات', visible: true }, { id: 'leaderboard', label: 'لوحة الصدارة', visible: true }, { id: 'transcript', label: 'السجل الأكاديمي', visible: true }],
  },
  features: { reading: true, articles: true, placement: true, leaderboard: true, notes: true, achievements: true, vocab: true, certificates: true, public_catalog: true, search: true, events: true, team: false },
  about: { title: 'عن أكاديميا إسبانيولا', subtitle: 'أكاديمية رقمية مخصصة للناطقين بالعربية، مبنية على إطار CEFR.', body: 'نؤمن بأن تعلّم الإسبانية لا يجب أن يمرّ عبر لغة وسيطة. لذلك نشرح كل شيء بالعربية، ونعرض الأمثلة الإسبانية بشكل واضح ومعزول الاتجاه.\nينقسم كل مستوى رئيسي إلى مراحل داخلية متدرجة. هذه المراحل تقسيم خاص بالمنصة، وليست تصنيفاً رسمياً من CEFR.' },
  faq: [
    { q: 'هل المنصة مجانية؟', a: 'نعم، التسجيل والتعلّم الأساسي مجانيان.', visible: true },
    { q: 'هل أحصل على شهادة رسمية؟', a: 'نمنح شهادات إتمام داخلية للمقررات يمكن التحقق منها برقمها، لكنها ليست شهادة CEFR ولا اعتماداً أكاديمياً رسمياً.', visible: true },
    { q: 'ما هي المراحل مثل A1.1؟', a: 'هي تقسيم داخلي للمنصة لكل مستوى رئيسي لتسهيل التقدّم.', visible: true },
    { q: 'كيف يعمل اختبار تحديد المستوى؟', a: 'اختبار قصير للقواعد والمفردات يعطي تقديراً مبدئياً لنقطة البداية، وهو غير شامل لكل المهارات.', visible: true },
    { q: 'هل بياناتي آمنة؟', a: 'كلمات المرور مشفّرة بـ Argon2id، والجلسات محمية، ويمكنك تصدير بياناتك أو حذف حسابك في أي وقت.', visible: true },
  ],
  footer: { text: 'أكاديمية رقمية لتعلّم الإسبانية للناطقين بالعربية.', disclaimer: 'المراحل الداخلية وساعات الدراسة تقديرية وليست شهادة CEFR أو اعتماد ECTS رسمياً.', email: '', phone: '', whatsapp: '', facebook: '', instagram: '', youtube: '', x: '' },
  images: { hero: '', intro: '', auth: '', about: '', empty: '', course_cover: '' },
};
