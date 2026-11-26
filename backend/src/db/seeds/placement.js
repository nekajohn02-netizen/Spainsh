'use strict';
// اختبار تحديد المستوى: [id, stage, prompt, options, answerIndex, type]
// تنبيه: نتيجته تقدير مبدئي للقواعد والمفردات فقط، وليس تقييماً شاملاً لمستوى CEFR.
const PLACEMENT = [
  ['p1', 'A1.1', 'Yo ___ estudiante.', ['soy', 'eres', 'son'], 0], ['p2', 'A1.1', '___ casa es grande.', ['El', 'La', 'Los'], 1],
  ['p3', 'A1.1', 'ما معنى «gracias»؟', ['مرحباً', 'شكراً', 'وداعاً'], 1], ['p4', 'A1.1', 'Dos ___', ['libro', 'libros', 'libra'], 1],
  ['p5', 'A1.2', 'Ella ___ en Madrid. (مكان)', ['es', 'está', 'son'], 1], ['p6', 'A1.2', 'Nosotros ___ español. (hablar)', ['hablo', 'hablamos', 'hablan'], 1],
  ['p7', 'A1.3', 'Me ___ los libros.', ['gusta', 'gustan', 'gusto'], 1], ['p8', 'A1.3', '___ libro (هذا)', ['Esta', 'Este', 'Estos'], 1],
  ['p9', 'A2.1', 'Hoy he ___ mucho. (estudiar)', ['estudiado', 'estudiaba', 'estudio'], 0], ['p10', 'A2.1', 'اسم المفعول من «hacer»:', ['hacido', 'hecho', 'haciendo'], 1],
  ['p11', 'A2.2', 'Ayer ___ al cine. (ir – pretérito indefinido)', ['voy', 'fui', 'iba'], 1], ['p12', 'A2.2', 'Mañana ___ a visitar a mi abuela.', ['voy', 'fui', 'iba'], 0],
  ['p13', 'B1.1', 'Cuando era niño, ___ en el campo. (imperfecto)', ['vivo', 'viví', 'vivía'], 2], ['p14', 'B1.3', 'Espero que ___ pronto. (venir – subjuntivo)', ['vienes', 'vengas', 'vendrás'], 1],
  ['p15', 'B2.1', 'Si tuviera tiempo, ___ más. (condicional)', ['viajaré', 'viajaría', 'viajo'], 1], ['p16', 'B2.2', 'Es la casa ___ vivo.', ['donde', 'que', 'quien'], 0],
];
// عتبات التوصية (نسبة الإجابات الصحيحة إجمالاً → مرحلة البداية المقترحة)
const BANDS = [[0, 'A1.1'], [4, 'A1.2'], [6, 'A1.3'], [8, 'A2.1'], [10, 'A2.2'], [12, 'B1.1'], [14, 'B1.3'], [16, 'B2.1']];
module.exports = { PLACEMENT, BANDS };
