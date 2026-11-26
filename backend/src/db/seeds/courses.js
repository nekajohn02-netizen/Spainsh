'use strict';
// المقررات والوحدات وربط الدروس بها
const COURSES = [
  { id: 'C-A1-GRAM', slug: 'fundamentos-gramatica', title_ar: 'أسس القواعد الإسبانية', title_es: 'Fundamentos de gramática', stage: 'A1.1', track: 'grammar', instructor: 'فريق الأكاديمية', hours: 12, color: '#e4572e',
    description: 'رحلة منظمة عبر أساسيات القواعد: الأسماء والأدوات، الأفعال الأساسية، التصريف المنتظم، والتعبير عن الإعجاب والإشارة.',
    modules: [['الأسماء والأدوات', ['articulos']], ['الأفعال الأساسية', ['ser-presente', 'estar-presente', 'tener']], ['الأفعال المنتظمة', ['verbos-ar', 'verbos-er-ir']], ['الإشارة والتفضيل', ['demostrativos', 'gustar']]] },
  { id: 'C-A1-SOUND', slug: 'alfabeto-y-pronunciacion', title_ar: 'الأبجدية والنطق', title_es: 'Alfabeto y pronunciación', stage: 'A1.1', track: 'phonetics', instructor: 'فريق الأكاديمية', hours: 3, color: '#6d4cff',
    description: 'ابدأ من الصفر: الحروف والأصوات والحروف المتحركة والأحرف التي تحتاج انتباهاً.', modules: [['الحروف والأصوات', ['alfabeto']]] },
  { id: 'C-A1-COM', slug: 'comunicacion-diaria', title_ar: 'التواصل اليومي والمفردات الأولى', title_es: 'Comunicación diaria', stage: 'A1.1', track: 'communication', instructor: 'فريق الأكاديمية', hours: 5, color: '#0e9f8e',
    description: 'التحيات والتعارف والأعداد والأيام والشهور، كل ما تحتاجه لأول محادثة.', modules: [['التحيات والتعارف', ['saludos']], ['الأعداد والوقت', ['numeros', 'dias-meses']]] },
  { id: 'C-A2-GRAM', slug: 'pasado-y-mas', title_ar: 'الماضي القريب', title_es: 'El pasado cercano', stage: 'A2.1', track: 'grammar', instructor: 'فريق الأكاديمية', hours: 8, color: '#2f80ed',
    description: 'مقرر مدخلي للحديث عن الماضي بالزمن التام (Pretérito perfecto).', modules: [['الماضي التام', ['perfecto']]] },
];
module.exports = { COURSES };
