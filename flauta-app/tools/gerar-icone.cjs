// Gera os ícones e a tela de abertura do Android.
// Uso (na pasta flauta-app): node tools/gerar-icone.cjs android/app/src/main/res /tmp
const { chromium } = require('playwright');
const fs = require('fs');
const RES = process.argv[2], OUT = process.argv[3];
const BG = '#14213d';
// Desenho principal no sistema 108x108 (área segura: círculo de raio 33 no centro)
const art = `
<defs>
  <linearGradient id="tube" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#cfd5de"/><stop offset="1" stop-color="#8a93a1"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#f0a030"/>
  </linearGradient>
</defs>
<g transform="translate(38 41) scale(1.05)">
  <path d="M4 -10 v14" stroke="#f5b041" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M4 -10 q7 2 8 8" fill="none" stroke="#f5b041" stroke-width="2.4" stroke-linecap="round"/>
  <ellipse cx="0.5" cy="5" rx="4.2" ry="3.2" transform="rotate(-20 0.5 5)" fill="#f5b041"/>
</g>
<g transform="translate(57 58) rotate(-35)">
  <rect x="-34" y="-4.5" width="66" height="9" rx="2.5" fill="url(#tube)"/>
  <rect x="-34" y="-4.5" width="10" height="9" rx="2.5" fill="#e9edf2"/>
  <ellipse cx="-29" cy="-4.5" rx="3.5" ry="1.8" fill="#7d8796"/>
  <circle cx="-17" cy="0" r="3.1" fill="#3b7bff"/>
  <circle cx="-9.5" cy="0" r="3.1" fill="#3b7bff"/>
  <circle cx="-2" cy="0" r="3.1" fill="#ffffff" stroke="#6b7482" stroke-width="1"/>
  <circle cx="8" cy="0" r="3.1" fill="#ff8a1f"/>
  <circle cx="15.5" cy="0" r="3.1" fill="#ffffff" stroke="#6b7482" stroke-width="1"/>
  <circle cx="23" cy="0" r="3.1" fill="#ffffff" stroke="#6b7482" stroke-width="1"/>
</g>`;
const svg = (size, kind) => {
  if (kind === 'fg') return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 108 108">${art}</svg>`;
  // ícone legado: recorta a área central (18..90) do desenho de 108
  const shape = kind === 'round' ? `<circle cx="54" cy="54" r="36" fill="${BG}"/>` : `<rect x="18" y="18" width="72" height="72" rx="14" fill="${BG}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="14 14 80 80">${shape}<g transform="translate(54 54) scale(1.18) translate(-54 -54)">${art}</g></svg>`;
};
const splash = (w, h) => { const s = Math.min(w, h) * 0.45; return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${BG}"/><svg x="${(w-s)/2}" y="${(h-s)/2}" width="${s}" height="${s}" viewBox="14 14 80 80">${art}</svg></svg>`; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  async function shot(markup, w, h, file) {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
    await p.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  }
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dens)) {
    await shot(svg(48 * k, 'sq'), 48 * k, 48 * k, `${RES}/mipmap-${d}/ic_launcher.png`);
    await shot(svg(48 * k, 'round'), 48 * k, 48 * k, `${RES}/mipmap-${d}/ic_launcher_round.png`);
    await shot(svg(108 * k, 'fg'), 108 * k, 108 * k, `${RES}/mipmap-${d}/ic_launcher_foreground.png`);
  }
  // splash: mantém as dimensões originais de cada arquivo
  for (const dir of fs.readdirSync(RES).filter(n => n.startsWith('drawable'))) {
    const f = `${RES}/${dir}/splash.png`; if (!fs.existsSync(f)) continue;
    const buf = fs.readFileSync(f); const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    await shot(splash(w, h), w, h, f);
  }
  // prévia
  await shot(`<div style="display:flex;gap:24px;padding:24px;background:#e9e9ee">${svg(192,'sq')}${svg(192,'round')}<div style="width:192px;height:192px;border-radius:50%;overflow:hidden;background:${BG}">${svg(192,'fg').replace('width="192" height="192"','width="192" height="192" style="transform:scale(1.0)"')}</div></div>`, 700, 240, `${OUT}/preview.png`);
  await b.close();
})();
