'use strict';
// مصرّف الأفعال المنتظمة في المضارع (Presente de indicativo)
const PRONOUNS = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes'];
const ENDINGS = { ar: ['o', 'as', 'a', 'amos', 'áis', 'an'], er: ['o', 'es', 'e', 'emos', 'éis', 'en'], ir: ['o', 'es', 'e', 'imos', 'ís', 'en'] };
const VERBS = [['hablar', 'يتحدث'], ['trabajar', 'يعمل'], ['estudiar', 'يدرس'], ['cocinar', 'يطبخ'], ['caminar', 'يمشي'], ['comprar', 'يشتري'], ['escuchar', 'يستمع'], ['cantar', 'يغني'],
  ['comer', 'يأكل'], ['beber', 'يشرب'], ['leer', 'يقرأ'], ['correr', 'يركض'], ['aprender', 'يتعلم'], ['vivir', 'يعيش'], ['escribir', 'يكتب'], ['abrir', 'يفتح'], ['decidir', 'يقرر']];
function conjugate(verb, person) {
  const type = verb.slice(-2), stem = verb.slice(0, -2);
  return stem + ENDINGS[type][person];
}
module.exports = { PRONOUNS, VERBS, conjugate };
