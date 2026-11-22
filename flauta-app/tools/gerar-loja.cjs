// Gera o destaque (1024x500) e as capturas de tela da Play Store em flauta-app/loja.
// Uso (na pasta flauta-app, com o app servido em http://localhost:8123):
//   node tools/gerar-loja.cjs <wav-do-La-440> <wav-da-licao-1>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '../loja');
const b64 = (f) => fs.readFileSync(path.join(__dirname, '..', f)).toString('base64');
const [wavLa, wavLicao] = process.argv.slice(2);
const URL = 'http://localhost:8123/';

async function appShot(browser, file, { wav, setup }) {
  const args = wav ? ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${wav}`] : [];
  const b = wav ? await chromium.launch({ args }) : browser;
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, permissions: ['microphone'] });
  const p = await ctx.newPage();
  await p.addInitScript(() => localStorage.setItem('flauta.onboarded', 'true'));
  await p.goto(URL);
  await p.click('#intro');
  await p.waitForTimeout(700);
  await setup(p);
  await p.screenshot({ path: file });
  await ctx.close();
  if (wav) await b.close();
}

(async () => {
  const browser = await chromium.launch();
  const tmp = path.join(OUT, '.tmp');
  fs.mkdirSync(tmp, { recursive: true });
  const shots = [
    { name: 'inicio', caption: 'Seu professor de flauta<br>no bolso', setup: async () => {} },
    { name: 'notas', caption: 'Todas as digitações,<br>tecla por tecla', setup: async (p) => { await p.click('[data-screen=notas]'); await p.waitForTimeout(600); } },
    { name: 'afinar', caption: 'Afine com o Lá<br>de referência', wav: wavLa, setup: async (p) => { await p.click('[data-screen=afinar]'); await p.click('#btn-tuner'); await p.waitForTimeout(2500); await p.evaluate(() => window.scrollTo(0, 230)); await p.waitForTimeout(300); } },
    { name: 'licao', caption: 'O app escuta e confere<br>cada nota', wav: wavLicao, setup: async (p) => { await p.click('[data-screen=licoes]'); await p.click('.lesson-item >> nth=0'); await p.waitForTimeout(5600); } },
    { name: 'descobrir', caption: 'Marque as teclas e<br>descubra a nota', setup: async (p) => { await p.click('[data-screen=descobrir]'); for (const k of ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'Eb']) await p.click(`#desc-flute [data-key=${k}]`); await p.waitForTimeout(500); } },
  ];
  for (const s of shots) await appShot(browser, path.join(tmp, s.name + '.png'), s);

  const page = await browser.newPage();
  const logo = `data:image/jpeg;base64,${b64('assets-src/logo-1024.jpg')}`;
  const fundo = `data:image/jpeg;base64,${b64('www/img/fundo.jpg')}`;
  const font = 'system-ui, -apple-system, Roboto, sans-serif';

  // Capturas 1080x1920 com moldura e legenda
  for (const [i, s] of shots.entries()) {
    const shot = `data:image/png;base64,${fs.readFileSync(path.join(tmp, s.name + '.png')).toString('base64')}`;
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.setContent(`<html><body style="margin:0;width:1080px;height:1920px;overflow:hidden;font-family:${font};
      background:linear-gradient(rgba(8,12,26,.55),rgba(8,12,26,.85)),url(${fundo}) center/cover;color:#fff;position:relative">
      <div style="position:absolute;top:110px;left:0;right:0;text-align:center;font-size:76px;font-weight:800;line-height:1.12;letter-spacing:-1.5px">${s.caption.replace(/(\S+)$/, '$1')}</div>
      <div style="position:absolute;top:330px;left:50%;transform:translateX(-50%);width:3px"></div>
      <div style="position:absolute;left:50%;top:420px;transform:translateX(-50%);width:700px;height:1515px;border-radius:92px;background:#05070f;
        box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 3px #2a3350,0 0 80px rgba(63,123,255,.35);padding:18px">
        <img src="${shot}" style="width:664px;height:1437px;border-radius:76px;display:block;object-fit:cover;object-position:top">
      </div>
      <div style="position:absolute;left:0;right:0;top:${i % 2 ? 300 : 302}px;text-align:center"><span style="display:inline-block;width:90px;height:8px;border-radius:8px;background:linear-gradient(90deg,#3f7bff,#f5a524)"></span></div>
    </body></html>`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `captura-${i + 1}-${s.name}.png`) });
  }

  // Destaque 1024x500
  await page.setViewportSize({ width: 1024, height: 500 });
  await page.setContent(`<html><body style="margin:0;width:1024px;height:500px;overflow:hidden;font-family:${font};color:#fff;
    background:url(data:image/jpeg;base64,${b64('assets-src/destaque-loja.jpg')}) right center/cover;position:relative">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,12,26,.92) 0%,rgba(8,12,26,.6) 45%,transparent 70%)"></div>
    <div style="position:absolute;left:64px;top:50%;transform:translateY(-50%);max-width:520px">
      <div style="display:flex;align-items:center;gap:20px">
        <img src="${logo}" style="width:96px;height:96px;border-radius:24px;box-shadow:0 10px 40px rgba(63,123,255,.5),0 0 0 1px rgba(157,190,255,.25)">
        <div style="font-size:60px;font-weight:800;letter-spacing:-1.5px">Flauta <span style="color:#f5a524">Guia</span></div>
      </div>
      <div style="margin-top:22px;font-size:27px;font-weight:600;line-height:1.3;color:#e6ebf7">Aprenda flauta transversal<br>com quem escuta você</div>
      <div style="margin-top:16px;font-size:18px;color:#9aa6c4;letter-spacing:.3px">Digitações · Afinador · Lições passo a passo</div>
    </div>
  </body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'destaque-1024x500.png') });

  // Ícone 512x512 exigido pela Play Store
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`<body style="margin:0"><img src="${logo}" style="width:512px;height:512px;display:block"></body>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, 'icone-512.png') });

  fs.rmSync(tmp, { recursive: true });
  await browser.close();
})();
