import { h } from '../../ui.js';
import { courseView } from '../public/course.js';
export default async function ({ params }) { return { title: 'المقرر', node: await courseView(params.slug, true) }; }
