'use strict';
// منقّي HTML بقائمة سماح. يُستعمل لمحتوى الدروس القادم من المحرر. لا سكربتات ولا معالجات أحداث ولا روابط خطرة
const TAGS = new Set(['h2', 'h3', 'h4', 'p', 'br', 'hr', 'b', 'strong', 'i', 'em', 'u', 'mark', 'sub', 'sup', 'span', 'div', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre', 'a', 'img', 'details', 'summary', 'small']);
const ATTRS = { '*': new Set(['class', 'id', 'lang', 'dir', 'title']), a: new Set(['href']), img: new Set(['src', 'alt', 'width', 'height']), td: new Set(['colspan', 'rowspan']), th: new Set(['colspan', 'rowspan']) };
const DROP_CONTENT = /<(script|style|iframe|object|embed|svg|math|form|noscript|template)\b[\s\S]*?<\/\1\s*>/gi;
const safeUrl = (u, img) => { const v = u.trim().replace(/[\u0000-\u001f\s]/g, ''); return /^(https?:\/\/|\/|#|mailto:)/i.test(v) && !(img && /^mailto:/i.test(v)); };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function sanitizeHtml(html) {
  let s = String(html || '').replace(/<!--[\s\S]*?-->/g, '').replace(DROP_CONTENT, '');
  return s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (m, tagRaw, attrStr) => {
    const tag = tagRaw.toLowerCase(), closing = m.startsWith('</');
    if (!TAGS.has(tag)) return '';
    if (closing) return `</${tag}>`;
    const attrs = [], re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g; let a;
    while ((a = re.exec(attrStr))) {
      const name = a[1].toLowerCase(), val = a[2] ?? a[3] ?? a[4] ?? '';
      if (!(ATTRS['*'].has(name) || ATTRS[tag]?.has(name))) continue;
      if ((name === 'href' || name === 'src') && !safeUrl(val, tag === 'img')) continue;
      attrs.push(`${name}="${esc(val)}"`);
    }
    if (tag === 'a') attrs.push('rel="noopener noreferrer nofollow"', 'target="_blank"');
    return `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>`;
  }).replace(/<(?![a-zA-Z/])/g, '&lt;');
}
module.exports = { sanitizeHtml };
