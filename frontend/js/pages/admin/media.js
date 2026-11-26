import { h } from '../../ui.js';
import { mediaGrid } from '../../components/media.js';
import { pageHead } from '../../components/layouts.js';

export default async function () {
  return { title: 'مكتبة الصور', node: h('div', {}, pageHead('مكتبة الصور', 'ارفع صورك هنا ثم اخترها لأي مقرر أو قصة أو مكان في الموقع (إعدادات الموقع ← الصور).'), await mediaGrid({})) };
}
