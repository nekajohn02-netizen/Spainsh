import { h } from '../../ui.js';
import { readingView } from '../public/reading.js';
import { pageHead } from '../../components/layouts.js';
export default async function () { return { title: 'مكتبة القراءة', node: h('div', {}, pageHead('مكتبة القراءة', 'اقرأ قصصاً مدرّجة، وانقر على أي كلمة لمعناها.'), await readingView('/app/reading')) }; }
