'use strict';
const { E, B, table, tip, warn, ex, ul, h2 } = require('./_html');

const LESSONS = [
{ id: 'L-A1.1-005', slug: 'numeros', stage: 'A1.1', track: 'vocabulary', minutes: 12, ord: 5, title_ar: 'الأعداد من 0 إلى 20', title_es: 'Los números del 0 al 20',
  summary: 'تعلّم العدّ الأساسي في الإسبانية واستخدامه في العمر والأسعار.',
  body: h2('s1', 'الأعداد') + table(['العدد', 'الإسبانية', 'العدد', 'الإسبانية'], [
    ['0', '~cero', '11', '~once'], ['1', '~uno', '12', '~doce'], ['2', '~dos', '13', '~trece'], ['3', '~tres', '14', '~catorce'], ['4', '~cuatro', '15', '~quince'],
    ['5', '~cinco', '16', '~dieciséis'], ['6', '~seis', '17', '~diecisiete'], ['7', '~siete', '18', '~dieciocho'], ['8', '~ocho', '19', '~diecinueve'], ['9', '~nueve', '20', '~veinte'], ['10', '~diez', '', '']]) +
    h2('s2', 'العمر') + `<p>نسأل: ${E('¿Cuántos años tienes?')} ونجيب: ${E('Tengo veinte años.')}</p>` +
    tip(`تنبّه: ${E('uno')} يصبح ${E('un')} قبل الاسم المذكر: ${E('un libro')}، و${E('una')} قبل المؤنث: ${E('una casa')}.`) +
    h2('s3', 'الأعداد 16–19') + `<p>تُكتب كلمة واحدة: ${E('dieci')} + العدد، مع تغيّر إملائي: ${E('dieciséis')} (وليس diecisiés).</p>`,
  q: [['q1','single','كيف تُكتب 7؟',['seis','siete','ocho'],'1',''],['q2','single','ما معنى «quince»؟',['5','15','50'],'1',''],['q3','fill','اكتب العدد 3 بالإسبانية:',[],'tres',''],['q4','single','اختر الصحيح: Tengo ___ libro.',['uno','un','una'],'1','يتحول uno إلى un قبل اسم مذكر.']] },
{ id: 'L-A1.2-003', slug: 'tener', stage: 'A1.2', track: 'grammar', minutes: 15, ord: 3, title_ar: 'الفعل Tener (يملك)', title_es: 'El verbo tener',
  summary: 'فعل شاذ كثير الاستعمال للملكية والعمر والتعابير.',
  body: h2('s1', 'التصريف') + table(['الضمير', 'Tener'], [['~yo', '~tengo'], ['~tú', '~tienes'], ['~él / ella / usted', '~tiene'], ['~nosotros', '~tenemos'], ['~vosotros', '~tenéis'], ['~ellos / ustedes', '~tienen']]) +
    h2('s2', 'الاستعمالات') + ul([`الملكية: ${E('Tengo un coche.')}`, `العمر: ${E('Ella tiene diez años.')}`, `الشعور: ${E('Tengo hambre / sed / frío / calor / sueño.')}`, `الوجوب: ${E('Tengo que estudiar.')} (يجب أن أدرس)`]) +
    warn(`في الإسبانية نقول «أملك جوعاً»: ${E('Tengo hambre')} ولا نقول «أنا جائع» بـ ser أو estar.`),
  q: [['q1','single','Ella ___ diez años.',['tiene','tienes','tengo'],'0',''],['q2','single','كيف تقول «أنا جائع»؟',['Soy hambre','Estoy hambre','Tengo hambre'],'2','الجوع يُعبَّر عنه بـ tener.'],['q3','fill','Nosotros ___ un perro. (tener)',[],'tenemos',''],['q4','single','Tengo ___ estudiar.',['de','que','a'],'1','tener que + مصدر = يجب.']] },
{ id: 'L-A1.2-004', slug: 'verbos-er-ir', stage: 'A1.2', track: 'grammar', minutes: 16, ord: 4, title_ar: 'الأفعال المنتهية بـ -ER و -IR', title_es: 'Verbos regulares en -er e -ir',
  summary: 'نهايات الأفعال المنتظمة المنتهية بـ er وir ومقارنتها بـ ar.',
  body: h2('s1', 'الجدول') + table(['الضمير', 'comer (-er)', 'vivir (-ir)'], [['~yo', '~como', '~vivo'], ['~tú', '~comes', '~vives'], ['~él / ella', '~come', '~vive'], ['~nosotros', '~comemos', '~vivimos'], ['~vosotros', '~coméis', '~vivís'], ['~ellos', '~comen', '~viven']]) +
    tip('النهايتان متطابقتان تقريباً، ولا يختلفان إلا في صيغتي nosotros وvosotros.') + h2('s2', 'أفعال تتبع القاعدة') + ex('beber · leer · correr · aprender · escribir · abrir · decidir'),
  q: [['q1','single','Yo ___ pan. (comer)',['como','comes','come'],'0',''],['q2','single','Ellos ___ en Madrid. (vivir)',['vive','viven','vivimos'],'1',''],['q3','fill','Nosotros ___ agua. (beber)',[],'bebemos',''],['q4','fill','Tú ___ un libro. (leer)',[],'lees','']] },
{ id: 'L-A1.3-001', slug: 'gustar', stage: 'A1.3', track: 'communication', minutes: 14, ord: 1, title_ar: 'التعبير عن الإعجاب بالفعل Gustar', title_es: 'El verbo gustar',
  summary: 'كيف نقول «يعجبني» و«لا يعجبني»؛ تركيب مختلف عن العربية والإنجليزية.',
  body: h2('s1', 'الفكرة') + `<p>الفعل ${E('gustar')} يعني حرفياً «يُعجِب». الشيء المُعجِب هو الفاعل، والشخص هو المفعول به:</p>` + ex('Me gusta el café. (القهوة تعجبني)<br>Me gustan los libros. (الكتب تعجبني)') +
    h2('s2', 'الضمائر') + table(['الشخص', 'الضمير', 'مثال'], [['أنا', '~me', '~Me gusta la música.'], ['أنت', '~te', '~Te gusta el té.'], ['هو/هي', '~le', '~Le gusta leer.'], ['نحن', '~nos', '~Nos gusta viajar.'], ['أنتم', '~os', '~Os gusta cantar.'], ['هم', '~les', '~Les gusta correr.']]) +
    h2('s3', 'مفرد أم جمع؟') + `<p>نستعمل ${E('gusta')} مع الاسم المفرد أو المصدر، و${E('gustan')} مع الاسم الجمع.</p>` + warn(`النفي: ${E('No me gusta el pescado.')}`),
  q: [['q1','single','___ gusta el café. (لي)',['Me','Yo','Mi'],'0',''],['q2','single','Me ___ los libros.',['gusta','gustan','gusto'],'1','الاسم جمع.'],['q3','single','Nos gusta ___.',['viajar','viajan','viajo'],'0','نستعمل المصدر.'],['q4','fill','No ___ gusta el pescado. (لك)',[],'te','']] },
{ id: 'L-A1.3-002', slug: 'dias-meses', stage: 'A1.3', track: 'vocabulary', minutes: 10, ord: 2, title_ar: 'أيام الأسبوع والشهور', title_es: 'Los días y los meses',
  summary: 'أسماء الأيام والشهور وطريقة قول التاريخ.',
  body: h2('s1', 'الأيام') + table(['الإسبانية', 'المعنى'], [['~lunes', 'الاثنين'], ['~martes', 'الثلاثاء'], ['~miércoles', 'الأربعاء'], ['~jueves', 'الخميس'], ['~viernes', 'الجمعة'], ['~sábado', 'السبت'], ['~domingo', 'الأحد']]) +
    tip('تبدأ الأيام والشهور بحرف صغير في الإسبانية، ويُعدّ الاثنين أول أيام الأسبوع.') +
    h2('s2', 'الشهور') + ex('enero · febrero · marzo · abril · mayo · junio<br>julio · agosto · septiembre · octubre · noviembre · diciembre') +
    h2('s3', 'التاريخ') + ex('Hoy es lunes, 5 de mayo.') + `<p>نقول ${E('el lunes')} للدلالة على «يوم الاثنين».</p>`,
  q: [['q1','single','ما معنى «viernes»؟',['السبت','الجمعة','الخميس'],'1',''],['q2','single','أي الشهور هو «mayo»؟',['مارس','مايو','يوليو'],'1',''],['q3','fill','اكتب «السبت» بالإسبانية:',[],'sábado',''],['q4','tf','تُكتب أسماء الأيام بحرف كبير في بدايتها في الإسبانية.',['صح','خطأ'],'1','تُكتب بحرف صغير.']] },
{ id: 'L-A1.3-003', slug: 'demostrativos', stage: 'A1.3', track: 'grammar', minutes: 14, ord: 3, title_ar: 'أسماء الإشارة', title_es: 'Los demostrativos',
  summary: 'هذا وذلك: este وese وaquel بحسب القرب من المتكلم.',
  body: h2('s1', 'ثلاث درجات من القرب') + table(['القرب', 'مذكر', 'مؤنث', 'مذكر جمع', 'مؤنث جمع'], [['قريب (هذا)', '~este', '~esta', '~estos', '~estas'], ['متوسط (ذاك)', '~ese', '~esa', '~esos', '~esas'], ['بعيد (ذلك)', '~aquel', '~aquella', '~aquellos', '~aquellas']]) +
    ex('Este libro es mío. · Esa casa es grande. · Aquellos niños juegan.') + tip('يتطابق اسم الإشارة مع الاسم في الجنس والعدد.'),
  q: [['q1','single','___ casa (هذه، قريبة)',['Este','Esta','Esos'],'1',''],['q2','single','___ libros (تلك الكتب، متوسطة)',['Esos','Esas','Ese'],'0',''],['q3','single','أي كلمة تعبّر عن شيء بعيد؟',['este','ese','aquel'],'2','']] },
{ id: 'L-A2.1-001', slug: 'perfecto', stage: 'A2.1', track: 'grammar', minutes: 18, ord: 1, title_ar: 'الماضي التام Pretérito perfecto', title_es: 'El pretérito perfecto',
  summary: 'نتحدث عن أحداث ماضية لها صلة بالحاضر باستخدام haber + اسم المفعول.',
  body: h2('s1', 'البناء') + `<p>${E('haber')} (مضارع) + اسم المفعول:</p>` + table(['الضمير', 'haber'], [['~yo', '~he'], ['~tú', '~has'], ['~él / ella', '~ha'], ['~nosotros', '~hemos'], ['~vosotros', '~habéis'], ['~ellos', '~han']]) +
    h2('s2', 'اسم المفعول') + ul([`${E('-ar')} ← ${E('-ado')}: ${E('hablar → hablado')}`, `${E('-er / -ir')} ← ${E('-ido')}: ${E('comer → comido, vivir → vivido')}`]) +
    ex('Hoy he estudiado mucho.<br>¿Has comido ya?') + warn(`أشهر الأشكال الشاذة: ${E('hacer → hecho')}، ${E('decir → dicho')}، ${E('escribir → escrito')}، ${E('ver → visto')}.`),
  q: [['q1','single','Yo ___ hablado con ella.',['he','has','ha'],'0',''],['q2','single','اسم المفعول من comer:',['comado','comido','comiendo'],'1',''],['q3','fill','Nosotros ___ vivido aquí. (haber)',[],'hemos',''],['q4','single','اسم المفعول من hacer:',['hacido','hecho','hacer'],'1','شاذ.']] },
];
module.exports = { LESSONS };
