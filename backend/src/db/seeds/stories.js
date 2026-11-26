'use strict';
// قصص مدرّجة. body: فقرات {es, ar}. glossary: كلمات تظهر عند النقر.
const STORIES = [
  { slug: 'un-dia-en-madrid', title_ar: 'يوم في مدريد', title_es: 'Un día en Madrid', stage: 'A1.2', category: 'قصص للمبتدئين', minutes: 4,
    body: [
      { es: 'Me llamo Lucía y vivo en Madrid. Tengo veinte años y soy estudiante.', ar: 'اسمي لوسيا وأعيش في مدريد. عمري عشرون عاماً وأنا طالبة.' },
      { es: 'Por la mañana bebo un café y como pan. Después camino a la universidad.', ar: 'في الصباح أشرب قهوة وآكل خبزاً. ثم أمشي إلى الجامعة.' },
      { es: 'En clase estudio español e inglés. Mis amigos trabajan conmigo.', ar: 'في الصف أدرس الإسبانية والإنجليزية. أصدقائي يعملون معي.' },
      { es: 'Por la noche escucho música y leo un libro. Me gusta mi vida.', ar: 'في المساء أستمع إلى الموسيقى وأقرأ كتاباً. تعجبني حياتي.' }],
    glossary: { vivo: 'أعيش', estudiante: 'طالبة/طالب', mañana: 'صباح', camino: 'أمشي', universidad: 'جامعة', clase: 'صف', amigos: 'أصدقاء', noche: 'ليل', escucho: 'أستمع', leo: 'أقرأ', vida: 'حياة' } },
  { slug: 'la-familia-de-samir', title_ar: 'عائلة سمير', title_es: 'La familia de Samir', stage: 'A1.2', category: 'حوارات', minutes: 3,
    body: [
      { es: 'Samir tiene una familia grande. Su padre es médico y su madre es profesora.', ar: 'لدى سمير عائلة كبيرة. أبوه طبيب وأمه أستاذة.' },
      { es: 'Tiene dos hermanos y una hermana. Todos viven en El Cairo.', ar: 'عنده أخوان وأخت. كلهم يعيشون في القاهرة.' },
      { es: 'Los domingos comen juntos y hablan mucho. La familia es muy importante para Samir.', ar: 'أيام الأحد يأكلون معاً ويتحدثون كثيراً. العائلة مهمة جداً لسمير.' }],
    glossary: { familia: 'عائلة', grande: 'كبيرة', padre: 'أب', madre: 'أم', médico: 'طبيب', hermanos: 'إخوة', juntos: 'معاً', domingos: 'أيام الأحد', importante: 'مهمة' } },
  { slug: 'el-viaje-de-ana', title_ar: 'رحلة آنا', title_es: 'El viaje de Ana', stage: 'A2.1', category: 'مغامرة', minutes: 5,
    body: [
      { es: 'Esta semana Ana ha viajado a Sevilla. Nunca ha visitado el sur de España.', ar: 'هذا الأسبوع سافرت آنا إلى إشبيلية. لم تزر جنوب إسبانيا من قبل.' },
      { es: 'Ya ha comido tapas y ha caminado por el centro. Le gusta mucho la ciudad.', ar: 'لقد أكلت التاباس بالفعل ومشت في وسط المدينة. تعجبها المدينة كثيراً.' },
      { es: 'Mañana va a escribir una carta a su familia y a comprar un regalo.', ar: 'غداً ستكتب رسالة لعائلتها وتشتري هدية.' }],
    glossary: { viajado: 'سافرت', nunca: 'أبداً', sur: 'جنوب', tapas: 'مقبلات إسبانية', centro: 'وسط', carta: 'رسالة', regalo: 'هدية', ciudad: 'مدينة' } },
  { slug: 'el-cafe-del-barrio', title_ar: 'مقهى الحي', title_es: 'El café del barrio', stage: 'A1.3', category: 'مواقف يومية', minutes: 3,
    body: [
      { es: '—Buenos días. ¿Qué desea?', ar: '— صباح الخير. ماذا تريد؟' },
      { es: '—Un café con leche y una manzana, por favor.', ar: '— قهوة بالحليب وتفاحة، من فضلك.' },
      { es: '—Son tres euros. ¿Algo más?', ar: '— ثلاثة يورو. أي شيء آخر؟' },
      { es: '—No, gracias. Aquí tiene. Hasta luego.', ar: '— لا، شكراً. تفضل. إلى اللقاء.' }],
    glossary: { desea: 'تريد (رسمي)', leche: 'حليب', manzana: 'تفاحة', euros: 'يورو', algo: 'شيء', más: 'أكثر', tiene: 'تفضل/لديك' } },
];
module.exports = { STORIES };
