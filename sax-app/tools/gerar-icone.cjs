// Gera os ícones e a tela de abertura do Android a partir de assets-src/logo-1024.jpg.
// Uso (na pasta flauta-app): node tools/gerar-icone.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const RES = path.join(__dirname, '../android/app/src/main/res');
const SRC = fs.readFileSync(path.join(__dirname, '../assets-src/logo-1024.jpg')).toString('base64');
const IMG = `data:image/jpeg;base64,${SRC}`;
const BG = '#0b122a'; // cor das bordas da imagem

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  async function shot(html, w, h, file) {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<html><body style="margin:0;background:transparent;width:${w}px;height:${h}px;overflow:hidden">${html}</body></html>`);
    await p.waitForLoadState('load');
    await p.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  }
  const img = (s, style = '') => `<img src="${IMG}" style="width:${s}px;height:${s}px;display:block;${style}">`;
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dens)) {
    const s = 48 * k, f = 108 * k;
    await shot(img(s, `border-radius:${s * 0.22}px`), s, s, `${RES}/mipmap-${d}/ic_launcher.png`);
    await shot(img(s, 'border-radius:50%'), s, s, `${RES}/mipmap-${d}/ic_launcher_round.png`);
    // Ícone adaptável: imagem inteira dentro da área visível, fundo da mesma cor
    const inner = Math.round(f * 0.72), off = Math.round((f - inner) / 2);
    await shot(`<div style="width:${f}px;height:${f}px;background:${BG};position:relative">
      <div style="position:absolute;left:${off}px;top:${off}px">${img(inner)}</div></div>`, f, f, `${RES}/mipmap-${d}/ic_launcher_foreground.png`);
  }
  for (const dir of fs.readdirSync(RES).filter((n) => n.startsWith('drawable'))) {
    const file = `${RES}/${dir}/splash.png`;
    if (!fs.existsSync(file)) continue;
    const buf = fs.readFileSync(file);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    const s = Math.round(Math.min(w, h) * 0.6);
    await shot(`<div style="width:${w}px;height:${h}px;background:${BG};display:grid;place-items:center">
      <div style="width:${s}px;height:${s}px;-webkit-mask:radial-gradient(circle,#000 55%,transparent 71%);mask:radial-gradient(circle,#000 55%,transparent 71%)">${img(s)}</div></div>`, w, h, file);
  }
  await b.close();
})();
