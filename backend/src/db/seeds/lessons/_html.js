'use strict';
// مساعدات لبناء محتوى الدروس: عناصر إسبانية معزولة الاتجاه وجداول وصناديق
const E = (t) => `<span lang="es" dir="ltr">${t}</span>`;
const B = (t) => `<b lang="es">${t}</b>`;
const cell = (c) => (typeof c === 'string' && c.startsWith('~') ? `<td lang="es" dir="ltr">${c.slice(1)}</td>` : `<td>${c}</td>`);
const table = (head, rows) => `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map(cell).join('')}</tr>`).join('')}</tbody></table>`;
const tip = (t) => `<div class="callout tip">${t}</div>`;
const warn = (t) => `<div class="callout warn">${t}</div>`;
const ex = (t) => `<p class="es-block" lang="es" dir="ltr">${t}</p>`;
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const h2 = (id, t) => `<h2 id="${id}">${t}</h2>`;
module.exports = { E, B, table, tip, warn, ex, ul, h2 };
