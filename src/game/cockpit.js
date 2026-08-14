import * as THREE from 'three';

// Elementos simples presos à câmera para reforçar a sensação de "primeira
// pessoa dentro do veículo": capô/painel na parte inferior da visão e
// guidão/volante levemente visível.

function darkMat(color = 0x0d0d0f) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.25 });
}

function buildF1Cockpit(cfg) {
  const g = new THREE.Group();
  const hoodMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.85, metalness: 0.02 });
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.3), hoodMat);
  hood.position.set(0, -0.62, -1.15);
  hood.rotation.x = -0.05;
  g.add(hood);

  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 20, Math.PI * 1.5), darkMat());
  wheelRim.position.set(0, -0.46, -0.65);
  wheelRim.rotation.x = Math.PI / 2.3;
  g.add(wheelRim);

  const mirrors = [-0.5, 0.5].map((x) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.03), darkMat());
    m.position.set(x, -0.25, -0.85);
    return m;
  });
  mirrors.forEach((m) => g.add(m));

  return g;
}

function buildHandlebarCockpit(cfg, opts = {}) {
  const g = new THREE.Group();
  const { width = 0.55, y = -0.42, z = -0.55, thickness = 0.03 } = opts;
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(thickness, thickness, width, 8), darkMat(0x1a1a1a));
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, y, z);
  g.add(bar);

  const grips = [-width / 2, width / 2].map((x) => {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(thickness * 1.6, thickness * 1.6, 0.1, 8), darkMat(0x151515));
    grip.rotation.z = Math.PI / 2;
    grip.position.set(x, y, z);
    return grip;
  });
  grips.forEach((m) => g.add(m));

  return g;
}

function buildBusCockpit(cfg) {
  const g = new THREE.Group();
  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.22), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 }));
  dash.position.set(0, -0.72, -1.25);
  g.add(dash);

  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.024, 8, 20, Math.PI * 1.6), darkMat());
  wheelRim.position.set(-0.32, -0.58, -0.9);
  wheelRim.rotation.x = Math.PI / 2.2;
  g.add(wheelRim);

  return g;
}

const BUILDERS = {
  f1: buildF1Cockpit,
  moto: (cfg) => buildHandlebarCockpit(cfg, { width: 0.5, y: -0.35, z: -0.5 }),
  onibus: buildBusCockpit,
  bicicleta: (cfg) => buildHandlebarCockpit(cfg, { width: 0.42, y: -0.32, z: -0.42, thickness: 0.02 }),
  patinete: (cfg) => buildHandlebarCockpit(cfg, { width: 0.36, y: -0.18, z: -0.32, thickness: 0.018 }),
};

export function buildCockpitOverlay(cfg) {
  const builder = BUILDERS[cfg.id] || buildF1Cockpit;
  return builder(cfg);
}
