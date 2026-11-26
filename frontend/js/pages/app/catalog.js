import { h } from '../../ui.js';
import { catalog } from '../public/courses.js';
import { pageHead } from '../../components/layouts.js';
export default async function () { return { title: 'كتالوج المقررات', node: h('div', {}, pageHead('كتالوج المقررات', 'سجّل بنقرة واحدة وتابع تقدّمك.'), await catalog('/app/courses')) }; }
