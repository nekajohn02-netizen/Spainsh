import { h } from '../../ui.js';
import { curriculumView } from '../public/curriculum.js';
export default async function () { return { title: 'المنهج', node: h('div', {}, await curriculumView('/app/lesson')) }; }
