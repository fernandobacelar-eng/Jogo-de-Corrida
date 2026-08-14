import * as THREE from 'three';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function makeAsphaltTexture() {
  const c = canvas(256, 256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2b2c30';
  ctx.fillRect(0, 0, 256, 256);
  // grain / speckle
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const v = 30 + Math.random() * 40;
    ctx.fillStyle = `rgba(${v + 10},${v + 10},${v + 12},${0.15 + Math.random() * 0.25})`;
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  // subtle tire marks
  ctx.strokeStyle = 'rgba(10,10,12,0.25)';
  ctx.lineWidth = 6;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const y = 40 + i * 70 + Math.random() * 20;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(80, y + 10, 160, y - 15, 256, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function makeBuildingTexture(baseColor = '#e8dfc8', windowColor = '#4b6a82') {
  const c = canvas(128, 256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 256);
  const cols = 4;
  const rows = 10;
  const cw = 128 / cols;
  const rh = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let cIdx = 0; cIdx < cols; cIdx++) {
      if (Math.random() < 0.15) continue;
      const lit = Math.random() < 0.25;
      ctx.fillStyle = lit ? '#ffe9a8' : windowColor;
      const pad = 5;
      ctx.fillRect(cIdx * cw + pad, r * rh + pad, cw - pad * 2, rh - pad * 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

