'use strict';
const p = (s) => s.trim();
const LESSONS = [
{ id: 'L-A1.1-001', slug: 'alfabeto', stage: 'A1.1', track: 'phonetics', minutes: 12, ord: 1,
  title_ar: 'الأبجدية الإسبانية', title_es: 'El alfabeto',
  summary: 'الحروف السبعة والعشرون، وكيف تُنطق، وقاعدة الحرف الصامت H.',
  body: p(`
<h2 id="s1">الحروف</h2>
<p>تتكون الأبجدية الإسبانية من <strong>27 حرفاً</strong>، وأغلب الحروف تُنطق كما تُكتب، وهذا ما يجعل القراءة أسهل من الإنجليزية.</p>
<p class="es-block" lang="es" dir="ltr">A a · B b · C c · D d · E e · F f · G g · H h · I i · J j · K k · L l · M m · N n · <b>Ñ ñ</b> · O o · P p · Q q · R r · S s · T t · U u · V v · W w · X x · Y y · Z z</p>
<h2 id="s2">الحروف المتحركة الخمسة</h2>
<p>للإسبانية خمس حركات صافية، وكل واحدة تُنطق دائماً بنفس الطريقة:</p>
<table><thead><tr><th>الحرف</th><th>النطق التقريبي</th><th>مثال</th></tr></thead><tbody>
<tr><td lang="es" dir="ltr">a</td><td>فتحة طويلة «آ»</td><td lang="es" dir="ltr">casa</td></tr>
<tr><td lang="es" dir="ltr">e</td><td>«إي» قصيرة مفتوحة</td><td lang="es" dir="ltr">mesa</td></tr>
<tr><td lang="es" dir="ltr">i</td><td>«ي»</td><td lang="es" dir="ltr">sí</td></tr>
<tr><td lang="es" dir="ltr">o</td><td>«و» مفتوحة</td><td lang="es" dir="ltr">sol</td></tr>
<tr><td lang="es" dir="ltr">u</td><td>«و» مضمومة</td><td lang="es" dir="ltr">uno</td></tr></tbody></table>
<h2 id="s3">أحرف تحتاج انتباهاً</h2>
<ul>
<li><b lang="es">H</b>: حرف صامت لا يُنطق أبداً، مثل <span lang="es" dir="ltr">hola</span> («أولا»).</li>
<li><b lang="es">Ñ</b>: صوت «ني» كما في <span lang="es" dir="ltr">España</span>.</li>
<li><b lang="es">J</b>: صوت يشبه «خ» العربية، مثل <span lang="es" dir="ltr">jamón</span>.</li>
<li><b lang="es">LL</b> و<b lang="es">Y</b>: تُنطقان غالباً «يـ»، مثل <span lang="es" dir="ltr">llamo</span>.</li>
<li><b lang="es">V</b> و<b lang="es">B</b>: تُنطقان عادةً بالصوت نفسه.</li>
</ul>
<div class="callout tip"><b>معلومة:</b> تتفاوت اللهجات الإسبانية في بعض الأصوات (مثل Z وC قبل E وI)، وسنعالج ذلك في مسار الصوتيات.</div>`),
  q: [
    ['q1','single','أي حرف صامت في الإسبانية؟',['H','J','Ñ'],'0','حرف H لا يُنطق، مثل hola.'],
    ['q2','single','كم عدد الحروف في الأبجدية الإسبانية الحالية؟',['24','27','30'],'1','27 حرفاً بما فيها Ñ.'],
    ['q3','single','كيف تُنطق Ñ في España؟',['ن','ني','غ'],'1','Ñ تعطي صوت «ني».'],
    ['q4','tf','حرفا B وV يُنطقان عادةً بالصوت نفسه.',['صح','خطأ'],'0','في أغلب اللهجات نعم.'],
  ]},
{ id: 'L-A1.1-002', slug: 'saludos', stage: 'A1.1', track: 'communication', minutes: 10, ord: 2,
  title_ar: 'التحيات والتعارف', title_es: 'Saludos y presentaciones',
  summary: 'عبارات التحية والتعريف بالنفس في أي موقف يومي.',
  body: p(`
<h2 id="s1">تحيات حسب الوقت</h2>
<table><thead><tr><th>الإسبانية</th><th>المعنى</th></tr></thead><tbody>
<tr><td lang="es" dir="ltr">Hola</td><td>مرحباً</td></tr>
<tr><td lang="es" dir="ltr">Buenos días</td><td>صباح الخير</td></tr>
<tr><td lang="es" dir="ltr">Buenas tardes</td><td>مساء الخير (بعد الظهر)</td></tr>
<tr><td lang="es" dir="ltr">Buenas noches</td><td>مساء الخير / تصبح على خير</td></tr>
<tr><td lang="es" dir="ltr">Adiós / Hasta luego</td><td>وداعاً / إلى اللقاء</td></tr></tbody></table>
<h2 id="s2">التعريف بالنفس</h2>
<div class="dialog" lang="es" dir="ltr">
<p><b>A:</b> ¡Hola! ¿Cómo te llamas?</p>
<p><b>B:</b> Me llamo Samir. ¿Y tú?</p>
<p><b>A:</b> Me llamo Lucía. Mucho gusto.</p>
<p><b>B:</b> Encantado. ¿De dónde eres?</p>
<p><b>A:</b> Soy de Madrid. ¿Y tú?</p>
<p><b>B:</b> Soy de El Cairo.</p></div>
<div class="callout tip"><b>انتبه:</b> تقول المرأة <span lang="es" dir="ltr">encantada</span> والرجل <span lang="es" dir="ltr">encantado</span>.</div>
<h2 id="s3">أنت أم حضرتك؟</h2>
<p>للمخاطب غير الرسمي: <span lang="es" dir="ltr">tú</span> و<span lang="es" dir="ltr">¿Cómo te llamas?</span>. للمخاطب الرسمي: <span lang="es" dir="ltr">usted</span> و<span lang="es" dir="ltr">¿Cómo se llama?</span>.</p>`),
  q: [
    ['q1','single','كيف تقول «صباح الخير»؟',['Buenas noches','Buenos días','Hasta luego'],'1',''],
    ['q2','single','أكمل: «¿Cómo ___ llamas?»',['te','me','se'],'0','مع tú نقول te llamas.'],
    ['q3','fill','أكمل بكلمة واحدة: «Me ___ Lucía.» (اسمي)',[],'llamo','Me llamo = اسمي.'],
    ['q4','single','أي عبارة تناسب موقفاً رسمياً؟',['¿Cómo te llamas?','¿Cómo se llama?','¿Qué tal?'],'1','se llama مع usted.'],
  ]},
{ id: 'L-A1.1-003', slug: 'articulos', stage: 'A1.1', track: 'grammar', minutes: 15, ord: 3,
  title_ar: 'الأسماء والأدوات: المذكر والمؤنث', title_es: 'Sustantivos y artículos',
  summary: 'لكل اسم في الإسبانية جنس؛ تعلّم أدوات التعريف والتنكير.',
  body: p(`
<h2 id="s1">جنس الاسم</h2>
<p>كل اسم في الإسبانية إما <strong>مذكر</strong> أو <strong>مؤنث</strong>، حتى الأشياء. القاعدة العامة: الأسماء المنتهية بـ <b lang="es">-o</b> غالباً مذكرة، والمنتهية بـ <b lang="es">-a</b> غالباً مؤنثة.</p>
<table><thead><tr><th>مذكر</th><th>مؤنث</th></tr></thead><tbody>
<tr><td lang="es" dir="ltr">el libro</td><td lang="es" dir="ltr">la casa</td></tr>
<tr><td lang="es" dir="ltr">el niño</td><td lang="es" dir="ltr">la niña</td></tr>
<tr><td lang="es" dir="ltr">el gato</td><td lang="es" dir="ltr">la mesa</td></tr></tbody></table>
<div class="callout warn"><b>استثناءات شهيرة:</b> <span lang="es" dir="ltr">el día</span> مذكر، و<span lang="es" dir="ltr">la mano</span> مؤنث.</div>
<h2 id="s2">أدوات التعريف</h2>
<table><thead><tr><th></th><th>مذكر</th><th>مؤنث</th></tr></thead><tbody>
<tr><td>مفرد</td><td lang="es" dir="ltr">el</td><td lang="es" dir="ltr">la</td></tr>
<tr><td>جمع</td><td lang="es" dir="ltr">los</td><td lang="es" dir="ltr">las</td></tr></tbody></table>
<h2 id="s3">أدوات التنكير</h2>
<table><thead><tr><th></th><th>مذكر</th><th>مؤنث</th></tr></thead><tbody>
<tr><td>مفرد</td><td lang="es" dir="ltr">un</td><td lang="es" dir="ltr">una</td></tr>
<tr><td>جمع</td><td lang="es" dir="ltr">unos</td><td lang="es" dir="ltr">unas</td></tr></tbody></table>
<h2 id="s4">الجمع</h2>
<p>نضيف <b lang="es">-s</b> إذا انتهى الاسم بحرف متحرك: <span lang="es" dir="ltr">libro → libros</span>. ونضيف <b lang="es">-es</b> إذا انتهى بحرف ساكن: <span lang="es" dir="ltr">ciudad → ciudades</span>.</p>`),
  q: [
    ['q1','single','اختر الأداة الصحيحة: ___ casa',['el','la','los'],'1',''],
    ['q2','single','اختر الأداة الصحيحة: ___ libros',['los','las','un'],'0','libros مذكر جمع.'],
    ['q3','single','جمع ciudad هو:',['ciudads','ciudades','ciudad'],'1','ينتهي بساكن فنضيف -es.'],
    ['q4','tf','كلمة «día» مؤنثة لأنها تنتهي بـ a.',['صح','خطأ'],'1','el día مذكر، وهو من الاستثناءات.'],
    ['q5','fill','اكتب أداة التنكير المؤنثة المفردة:',[],'una',''],
  ]},
{ id: 'L-A1.1-004', slug: 'ser-presente', stage: 'A1.1', track: 'grammar', minutes: 18, ord: 4,
  title_ar: 'الفعل Ser (يكون) في المضارع', title_es: 'El verbo ser',
  summary: 'أهم أفعال الإسبانية للتعريف والجنسية والمهنة والصفات الثابتة.',
  body: p(`
<h2 id="s1">التصريف</h2>
<table><thead><tr><th>الضمير</th><th>Ser</th></tr></thead><tbody>
<tr><td lang="es" dir="ltr">yo</td><td lang="es" dir="ltr"><b>soy</b></td></tr>
<tr><td lang="es" dir="ltr">tú</td><td lang="es" dir="ltr"><b>eres</b></td></tr>
<tr><td lang="es" dir="ltr">él / ella / usted</td><td lang="es" dir="ltr"><b>es</b></td></tr>
<tr><td lang="es" dir="ltr">nosotros / nosotras</td><td lang="es" dir="ltr"><b>somos</b></td></tr>
<tr><td lang="es" dir="ltr">vosotros / vosotras</td><td lang="es" dir="ltr"><b>sois</b></td></tr>
<tr><td lang="es" dir="ltr">ellos / ellas / ustedes</td><td lang="es" dir="ltr"><b>son</b></td></tr></tbody></table>
<h2 id="s2">متى نستخدم Ser؟</h2>
<ul>
<li>الهوية: <span lang="es" dir="ltr">Soy Samir.</span></li>
<li>الجنسية والأصل: <span lang="es" dir="ltr">Somos de Egipto.</span></li>
<li>المهنة: <span lang="es" dir="ltr">Ella es médica.</span></li>
<li>الصفات الأساسية: <span lang="es" dir="ltr">El libro es interesante.</span></li>
<li>الوقت: <span lang="es" dir="ltr">Son las tres.</span></li>
</ul>
<div class="callout tip"><b>تذكّر:</b> الضمير غالباً يُحذف لأن نهاية الفعل تدل عليه: <span lang="es" dir="ltr">Soy estudiante.</span></div>
<h2 id="s3">النفي</h2>
<p>نضع <b lang="es">no</b> قبل الفعل: <span lang="es" dir="ltr">No soy profesor.</span></p>`),
  q: [
    ['q1','single','Nosotros ___ estudiantes.',['soy','somos','son'],'1',''],
    ['q2','single','Ella ___ médica.',['es','eres','son'],'0',''],
    ['q3','fill','Yo ___ de Egipto.',[],'soy',''],
    ['q4','single','كيف نقول «لستُ أستاذاً»؟',['Soy no profesor','No soy profesor','Soy profesor no'],'1','no قبل الفعل.'],
  ]},
{ id: 'L-A1.2-001', slug: 'estar-presente', stage: 'A1.2', track: 'grammar', minutes: 18, ord: 1,
  title_ar: 'الفعل Estar والفرق بينه وبين Ser', title_es: 'Ser y estar',
  summary: 'Estar للمكان والحالة المؤقتة، وSer للهوية والصفات الثابتة.',
  body: p(`
<h2 id="s1">تصريف Estar</h2>
<table><thead><tr><th>الضمير</th><th>Estar</th></tr></thead><tbody>
<tr><td lang="es" dir="ltr">yo</td><td lang="es" dir="ltr"><b>estoy</b></td></tr>
<tr><td lang="es" dir="ltr">tú</td><td lang="es" dir="ltr"><b>estás</b></td></tr>
<tr><td lang="es" dir="ltr">él / ella / usted</td><td lang="es" dir="ltr"><b>está</b></td></tr>
<tr><td lang="es" dir="ltr">nosotros</td><td lang="es" dir="ltr"><b>estamos</b></td></tr>
<tr><td lang="es" dir="ltr">vosotros</td><td lang="es" dir="ltr"><b>estáis</b></td></tr>
<tr><td lang="es" dir="ltr">ellos / ustedes</td><td lang="es" dir="ltr"><b>están</b></td></tr></tbody></table>
<h2 id="s2">متى نستخدم Estar؟</h2>
<ul>
<li>المكان: <span lang="es" dir="ltr">Madrid está en España.</span></li>
<li>الحالة المؤقتة: <span lang="es" dir="ltr">Estoy cansado.</span></li>
<li>الحالة والمزاج: <span lang="es" dir="ltr">Ella está contenta.</span></li>
</ul>
<h2 id="s3">المقارنة</h2>
<table><thead><tr><th>Ser</th><th>Estar</th></tr></thead><tbody>
<tr><td lang="es" dir="ltr">Es aburrido. (طبيعته مملة)</td><td lang="es" dir="ltr">Está aburrido. (يشعر بالملل الآن)</td></tr>
<tr><td lang="es" dir="ltr">Es nervioso. (طبعه عصبي)</td><td lang="es" dir="ltr">Está nervioso. (متوتر الآن)</td></tr></tbody></table>`),
  q: [
    ['q1','single','Mi casa ___ en el centro.',['es','está','son'],'1','المكان يحتاج estar.'],
    ['q2','single','Hoy yo ___ muy cansado.',['soy','estoy','estás'],'1','حالة مؤقتة.'],
    ['q3','single','Ella ___ ingeniera.',['es','está','estar'],'0','المهنة مع ser.'],
    ['q4','fill','Nosotros ___ en casa. (estar)',[],'estamos',''],
  ]},
{ id: 'L-A1.2-002', slug: 'verbos-ar', stage: 'A1.2', track: 'grammar', minutes: 16, ord: 2,
  title_ar: 'الأفعال المنتهية بـ -AR', title_es: 'Verbos regulares en -ar',
  summary: 'القاعدة المنتظمة لتصريف الأفعال المنتهية بـ -ar في المضارع.',
  body: p(`
<h2 id="s1">القاعدة</h2>
<p>نحذف <b lang="es">-ar</b> من المصدر ونضيف النهاية المناسبة. مثال مع <span lang="es" dir="ltr">hablar</span> (يتحدث):</p>
<table><thead><tr><th>الضمير</th><th>النهاية</th><th>hablar</th></tr></thead><tbody>
<tr><td lang="es" dir="ltr">yo</td><td lang="es" dir="ltr">-o</td><td lang="es" dir="ltr">hablo</td></tr>
<tr><td lang="es" dir="ltr">tú</td><td lang="es" dir="ltr">-as</td><td lang="es" dir="ltr">hablas</td></tr>
<tr><td lang="es" dir="ltr">él / ella</td><td lang="es" dir="ltr">-a</td><td lang="es" dir="ltr">habla</td></tr>
<tr><td lang="es" dir="ltr">nosotros</td><td lang="es" dir="ltr">-amos</td><td lang="es" dir="ltr">hablamos</td></tr>
<tr><td lang="es" dir="ltr">vosotros</td><td lang="es" dir="ltr">-áis</td><td lang="es" dir="ltr">habláis</td></tr>
<tr><td lang="es" dir="ltr">ellos</td><td lang="es" dir="ltr">-an</td><td lang="es" dir="ltr">hablan</td></tr></tbody></table>
<h2 id="s2">أفعال تتبع القاعدة نفسها</h2>
<p lang="es" dir="ltr">trabajar · estudiar · cocinar · cantar · caminar · comprar · escuchar</p>
<div class="callout tip">جرّب: <span lang="es" dir="ltr">Yo estudio español. Ellos trabajan en Madrid.</span></div>`),
  q: [
    ['q1','single','Yo ___ español. (hablar)',['hablo','hablas','habla'],'0',''],
    ['q2','single','Tú ___ en una oficina. (trabajar)',['trabajo','trabajas','trabaja'],'1',''],
    ['q3','fill','Nosotros ___ música. (escuchar)',[],'escuchamos',''],
    ['q4','fill','Ellos ___ la comida. (cocinar)',[],'cocinan',''],
  ]},
];

module.exports = { LESSONS };
