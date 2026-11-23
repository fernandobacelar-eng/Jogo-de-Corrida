// Gera imagens PROVISÓRIAS da Flauta Doce Guia (logotipo, apresentação e Início).
// Uso (na pasta doce-app): node tools/gerar-provisorias.cjs
const { chromium } = require('playwright');
const path = require('path');
const IMG = path.join(__dirname, '../www/img');
const SRC = path.join(__dirname, '../assets-src');

// Flauta doce estilizada (deitada, bico à esquerda), comprimento 300.
function recorder(colors = {}) {
  const body = colors.body || 'url(#ivory)';
  const holes = colors.holes || [];
  const xs = [118, 146, 174, 214, 242, 266, 288];
  return `
    <path d="M0 -9 q0 -5 7 -6 l40 -4 v38 l-40 -4 q-7 -1 -7 -6z" fill="${body}" stroke="#7a5a32" stroke-width="1"/>
    <rect x="45" y="-17" width="50" height="34" rx="7" fill="${body}" stroke="#7a5a32" stroke-width="1"/>
    <rect x="90" y="-19" width="9" height="38" rx="3" fill="url(#wood)"/>
    <path d="M97 -15 L300 -12 L300 12 L97 15z" fill="${body}" stroke="#7a5a32" stroke-width="1"/>
    <rect x="298" y="-16" width="9" height="32" rx="3" fill="url(#wood)"/>
    <path d="M305 -13 q18 -4 28 -9 v44 q-10 -5 -28 -9z" fill="${body}" stroke="#7a5a32" stroke-width="1"/>
    <rect x="56" y="-6" width="13" height="10" rx="2" fill="#2a1a0b"/>
    ${xs.map((x, i) => `<circle cx="${x}" cy="0" r="${i >= 5 ? 5 : 7}" fill="${holes[i] || '#2a1a0b'}" stroke="#8a6a40" stroke-width="1.4"/>`).join('')}`;
}
const DEFS = `<defs>
  <linearGradient id="ivory" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b89a66"/><stop offset=".25" stop-color="#fbf1da"/><stop offset=".5" stop-color="#efe0bd"/><stop offset="1" stop-color="#a8875a"/></linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b8"/><stop offset=".45" stop-color="#f5b13a"/><stop offset="1" stop-color="#b8740a"/></linearGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a1e"/><stop offset=".35" stop-color="#a0703f"/><stop offset="1" stop-color="#3e2612"/></linearGradient>
  <radialGradient id="bg" cx=".65" cy=".35" r=".9"><stop offset="0" stop-color="#1f3170"/><stop offset=".55" stop-color="#0f1733"/><stop offset="1" stop-color="#070b17"/></radialGradient>
  <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3f7bff" stop-opacity=".55"/><stop offset="1" stop-color="#3f7bff" stop-opacity="0"/></radialGradient>
  <filter id="sh"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".5"/></filter>
</defs>`;
const TAG = `<text x="626" y="350" text-anchor="end" font-family="system-ui,Roboto,sans-serif" font-size="11" fill="#8e98b3" opacity=".7">imagem provisória</text>`;
const BL = '#3f7bff', GD = '#f5a524';
const scene = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">${DEFS}<rect width="640" height="360" fill="url(#bg)"/><circle cx="320" cy="180" r="200" fill="url(#glow)"/>${inner}${TAG}</svg>`;

const scenes = {
  'onb-afinar': scene(`
    <g transform="translate(250 230)"><path d="M-120 0 A120 120 0 0 1 120 0" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="26" stroke-linecap="round"/>
    <path d="M-120 0 A120 120 0 0 1 120 0" fill="none" stroke="#34d399" stroke-width="8" stroke-dasharray="40 400" stroke-dashoffset="-168" stroke-linecap="round"/>
    <path d="M-120 0 A120 120 0 0 1 120 0" fill="none" stroke="#3f7bff" stroke-width="5" opacity=".6"/>
    <line x1="0" y1="0" x2="10" y2="-104" stroke="url(#gold)" stroke-width="6" stroke-linecap="round"/><circle r="12" fill="#1c2542" stroke="#f5a524" stroke-width="3"/></g>
    <g transform="translate(400 300) rotate(-62) scale(.8)" filter="url(#sh)">${recorder()}</g>`),
  'onb-digitacao': scene(`<g transform="translate(150 180) scale(1.1)" filter="url(#sh)">${recorder({ holes: [BL, BL, BL, GD, GD] })}</g>
    <g font-family="system-ui,Roboto,sans-serif" font-weight="800" font-size="13" fill="#fff" text-anchor="middle"><text x="280" y="185">1</text><text x="311" y="185">2</text><text x="341" y="185">3</text><text x="385" y="185">1</text><text x="416" y="185">2</text></g>`),
  'onb-escuta': scene(`<g transform="translate(150 290) rotate(-55) scale(.75)" filter="url(#sh)">${recorder()}</g>
    <g fill="none" stroke-linecap="round"><path d="M300 150 a40 40 0 0 1 0 60" stroke="#3f7bff" stroke-width="6"/><path d="M325 130 a70 70 0 0 1 0 100" stroke="#9dbeff" stroke-width="5" opacity=".7"/><path d="M350 112 a100 100 0 0 1 0 136" stroke="#f5a524" stroke-width="4" opacity=".6"/></g>
    <rect x="400" y="90" width="110" height="200" rx="18" fill="#141c35" stroke="#5e6678" stroke-width="3" filter="url(#sh)"/><rect x="410" y="104" width="90" height="172" rx="10" fill="#1d2a52"/>
    <path d="M436 170 l14 14 l28 -30" fill="none" stroke="#34d399" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`),
  'onb-musicas': scene(`<g transform="translate(60 0)"><g stroke="rgba(220,230,255,.55)" stroke-width="2" fill="none">${[0, 1, 2, 3, 4].map((i) => `<path d="M20 ${120 + i * 14} C 160 ${70 + i * 14}, 300 ${190 + i * 14}, 470 ${110 + i * 14}"/>`).join('')}</g>
    ${[[70, 128], [130, 112], [190, 138], [250, 150], [310, 136], [370, 118], [430, 112]].map(([x, y], i) => `<g fill="${i < 4 ? GD : '#e8ecf6'}"><ellipse cx="${x}" cy="${y}" rx="9" ry="7" transform="rotate(-20 ${x} ${y})"/><rect x="${x + 7}" y="${y - 40}" width="3" height="40"/></g>`).join('')}</g>
    <g transform="translate(330 330) rotate(-35) scale(.72)" filter="url(#sh)">${recorder()}</g>`),
  'onb-ritmo': scene(`<g filter="url(#sh)"><path d="M250 60 h80 l45 220 h-170z" fill="#1d2a5a" stroke="#9dbeff" stroke-opacity=".4" stroke-width="2"/><rect x="215" y="230" width="150" height="10" rx="5" fill="rgba(255,255,255,.1)"/>
    <line x1="290" y1="250" x2="330" y2="90" stroke="url(#gold)" stroke-width="7" stroke-linecap="round"/><rect x="310" y="128" width="22" height="18" rx="4" fill="url(#gold)" transform="rotate(14 321 137)"/><circle cx="290" cy="250" r="10" fill="#f5a524"/></g>
    <g fill="none" stroke="#f5a524" stroke-linecap="round" opacity=".6"><path d="M390 110 a60 60 0 0 1 0 90" stroke-width="5"/><path d="M415 90 a95 95 0 0 1 0 130" stroke-width="4" opacity=".6"/></g>
    <g transform="translate(150 330) rotate(-12) scale(.75)" filter="url(#sh)">${recorder()}</g>`),
  'onb-leitura': scene(`<g stroke="rgba(230,236,255,.7)" stroke-width="2.4">${[0, 1, 2, 3, 4].map((i) => `<line x1="150" x2="490" y1="${90 + i * 22}" y2="${90 + i * 22}"/>`).join('')}</g>
    <g fill="url(#gold)"><ellipse cx="340" cy="135" rx="24" ry="17" transform="rotate(-20 340 135)"/><rect x="359" y="40" width="6" height="96"/></g>
    <path d="M340 155 L300 260 L380 260 Z" fill="#f5a524" opacity=".12"/>
    <g transform="translate(160 290) scale(.95)" filter="url(#sh)">${recorder({ holes: [BL, BL] })}</g>`),
  'inicio-hero': scene(`<g fill="none" stroke-linecap="round">${[60, 95, 130, 165].map((r, i) => `<circle cx="470" cy="190" r="${r}" stroke="${i % 2 ? '#f5a524' : '#3f7bff'}" stroke-width="2" opacity="${0.6 - i * 0.1}"/>`).join('')}</g>
    <g transform="translate(330 320) rotate(-28) scale(.9)" filter="url(#sh)">${recorder()}</g>`),
};

const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 512 512">${DEFS}
  <rect width="512" height="512" fill="url(#bg)"/><circle cx="330" cy="170" r="230" fill="url(#glow)"/>
  <g fill="none" stroke="#f5a524" stroke-linecap="round"><path d="M352 92 a60 60 0 0 1 60 60" stroke-width="16"/><path d="M362 52 a100 100 0 0 1 100 100" stroke-width="12" opacity=".6"/></g>
  <g transform="translate(110 400) rotate(-45) scale(1.15)" filter="url(#sh)">${recorder({ body: 'url(#gold)' })}</g>
  <text x="500" y="500" text-anchor="end" font-family="system-ui,Roboto,sans-serif" font-size="13" fill="#8e98b3" opacity=".6">provisório</text></svg>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [name, svg] of Object.entries(scenes)) {
    await p.setViewportSize({ width: 640, height: 360 });
    await p.setContent(`<body style="margin:0">${svg}</body>`);
    await p.screenshot({ path: path.join(IMG, name + '.png'), clip: { x: 0, y: 0, width: 640, height: 360 } });
  }
  await p.setViewportSize({ width: 1024, height: 1024 });
  await p.setContent(`<body style="margin:0">${logo}</body>`);
  await p.screenshot({ path: path.join(SRC, 'logo-1024.jpg'), type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1024, height: 1024 } });
  await b.close();
})();
