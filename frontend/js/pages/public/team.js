import { h, avatar, empty } from '../../ui.js';
import { api } from '../../api.js';

export default async function () {
  const { members } = await api.get('/api/team');
  return { title: 'فريق العمل', node: h('div', { class: 'container page' }, h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'فريق العمل'), h('p', {}, 'المدرّبون والقائمون على الأكاديمية.'))),
    members.length ? h('div', { class: 'grid cgrid' }, members.map((m) => h('div', { class: 'card' }, m.photo ? h('img', { src: m.photo, alt: '', class: 'about-img', style: { 'max-height': '180px' } }) : avatar(m.name, 30),
      h('h3', {}, m.name), m.role_ar && h('p', { class: 'badge' }, m.role_ar), m.bio && h('p', { class: 'muted' }, m.bio), m.cv_url && h('a', { class: 'btn btn-ghost btn-sm', href: m.cv_url, target: '_blank', rel: 'noopener noreferrer' }, 'السيرة الذاتية')))) : empty('سيتم عرض فريق العمل قريباً')) };
}
