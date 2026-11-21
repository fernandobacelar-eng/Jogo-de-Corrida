// Gera os ícones e a tela de abertura do Android a partir de www/img/logo-mark.svg.
// Uso (na pasta flauta-app): node tools/gerar-icone.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const RES = path.join(__dirname, '../android/app/src/main/res');
const logo = fs.readFileSync(path.join(__dirname, '../www/img/logo-mark.svg'), 'utf8');
const BG = '#0b1020';
// Só o desenho (sem o fundo), para o ícone adaptável
const markOnly = logo.replace(/<rect class="lm-bg"[^>]*\/>/g, '');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  async function shot(html, w, h, file) {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<html><body style="margin:0;background:transparent;width:${w}px;height:${h}px;overflow:hidden">${html}</body></html>`);
    await p.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  }
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dens)) {
    const s = 48 * k, f = 108 * k;
    await shot(`<div style="width:${s}px;height:${s}px">${logo}</div>`, s, s, `${RES}/mipmap-${d}/ic_launcher.png`);
    await shot(`<div style="width:${s}px;height:${s}px;border-radius:50%;overflow:hidden">${logo}</div>`, s, s, `${RES}/mipmap-${d}/ic_launcher_round.png`);
    // Primeiro plano adaptável: desenho ocupando ~60% (área segura de 66/108)
    const inner = Math.round(f * 0.6), off = Math.round((f - inner) / 2);
    await shot(`<div style="position:absolute;left:${off}px;top:${off}px;width:${inner}px;height:${inner}px">${markOnly}</div>`, f, f, `${RES}/mipmap-${d}/ic_launcher_foreground.png`);
  }
  for (const dir of fs.readdirSync(RES).filter((n) => n.startsWith('drawable'))) {
    const file = `${RES}/${dir}/splash.png`;
    if (!fs.existsSync(file)) continue;
    const buf = fs.readFileSync(file);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    const s = Math.round(Math.min(w, h) * 0.32);
    await shot(`<div style="width:${w}px;height:${h}px;background:radial-gradient(circle at 50% 45%, #1b2c66 0%, ${BG} 55%);display:grid;place-items:center"><div style="width:${s}px;height:${s}px">${logo}</div></div>`, w, h, file);
  }
  await b.close();
})();
