import { h } from '../../ui.js';
import { api } from '../../api.js';
import { fmtDate } from '../../lib/format.js';

// دفاع إضافي: إزالة أي سكربت أو معالج حدث (CSP يمنع تنفيذها أصلاً، والخادم ينقّي المحتوى)
function safeHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,iframe,object,embed,link,style').forEach((n) => n.remove());
  doc.body.querySelectorAll('*').forEach((el) => [...el.attributes].forEach((a) => { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) el.removeAttribute(a.name); }));
  return doc.body.innerHTML;
}
export default async function ({ params }) {
  const { article: A } = await api.get('/api/articles/' + params.slug);
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && (A.seo_description || A.excerpt)) metaDesc.setAttribute('content', A.seo_description || A.excerpt);
  const node = h('article', { class: 'container page prose' },
    h('div', { class: 'crumbs' }, h('a', { href: '/articles' }, 'المقالات'), A.category ? ' / ' + A.category : ''),
    A.cover && h('img', { src: A.cover, alt: '', style: { width: '100%', 'border-radius': 'var(--r)', margin: '1rem 0' } }),
    h('h1', {}, A.title_ar), A.title_es && h('p', { class: 'es muted', style: { 'font-size': '1.2rem' } }, A.title_es),
    h('p', { class: 'muted tiny' }, fmtDate(A.published_at)),
    h('div', { html: safeHtml(A.body) }));
  return { title: A.seo_title || A.title_ar, node };
}
