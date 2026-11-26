// رسوم SVG خفيفة. الألوان من متغيرات السمة فتدعم الفاتح والداكن
const NS = 'http://www.w3.org/2000/svg';
export function barChart(series, keys, labels) {
  const W = 560, H = 190, P = { l: 28, r: 8, t: 10, b: 24 }, max = Math.max(1, ...series.flatMap((d) => keys.map((k) => d[k])));
  const bw = (W - P.l - P.r) / series.length, g = bw * .14, w = (bw - g * 2) / keys.length;
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${labels.join(' / ')}">`;
  for (let i = 0; i <= 3; i++) { const y = P.t + (H - P.t - P.b) * (i / 3); svg += `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${y}" y2="${y}"/><text x="${P.l - 5}" y="${y + 3}" text-anchor="end">${Math.round(max * (1 - i / 3))}</text>`; }
  series.forEach((d, i) => {
    keys.forEach((k, j) => { const hgt = ((H - P.t - P.b) * d[k]) / max, x = P.l + i * bw + g + j * w; svg += `<rect class="bar-${j ? 'b' : 'a'}" x="${x}" y="${H - P.b - hgt}" width="${w - 2}" height="${hgt}" rx="3"><title>${d.day}: ${d[k]}</title></rect>`; });
    if (i % 2 === 0) svg += `<text x="${P.l + i * bw + bw / 2}" y="${H - 7}" text-anchor="middle">${d.day.slice(5)}</text>`;
  });
  const wrap = document.createElement('div'); wrap.innerHTML = svg + '</svg>'; return wrap.firstChild;
}
