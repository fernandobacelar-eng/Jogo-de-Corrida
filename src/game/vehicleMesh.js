import * as THREE from 'three';

function wheel(radius = 0.32, width = 0.24) {
  const geo = new THREE.CylinderGeometry(radius, radius, width, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.8 });
  const m = new THREE.Mesh(geo, mat);
  m.rotation.z = Math.PI / 2;
  m.castShadow = true;
  return m;
}

function buildF1(cfg) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.35, metalness: 0.4 });
  const accentMat = new THREE.MeshStandardMaterial({ color: cfg.accentColor, roughness: 0.4, metalness: 0.3 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 4.2), bodyMat);
  body.position.y = 0.35;
  body.castShadow = true;
  g.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.4, 8), bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.3, 2.5);
  nose.castShadow = true;
  g.add(nose);

  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshStandardMaterial({ color: 0x111111 }));
  cockpit.scale.set(1, 0.6, 1.3);
  cockpit.position.set(0, 0.6, 0.3);
  g.add(cockpit);

  const rearWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.5), accentMat);
  rearWing.position.set(0, 0.85, -2.1);
  rearWing.castShadow = true;
  g.add(rearWing);

  const frontWing = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.5), accentMat);
  frontWing.position.set(0, 0.18, 2.7);
  g.add(frontWing);

  const wheelPositions = [
    [-0.75, 0.32, 1.55],
    [0.75, 0.32, 1.55],
    [-0.8, 0.32, -1.55],
    [0.8, 0.32, -1.55],
  ];
  for (const [x, y, z] of wheelPositions) {
    const w = wheel(0.34, 0.3);
    w.position.set(x, y, z);
    g.add(w);
  }

  return g;
}

function buildMoto(cfg) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.4, metalness: 0.5 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 1.6), bodyMat);
  body.position.y = 0.62;
  body.castShadow = true;
  g.add(body);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.7), new THREE.MeshStandardMaterial({ color: 0x111111 }));
  seat.position.set(0, 0.85, -0.2);
  g.add(seat);

  const handlebar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.1), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  handlebar.position.set(0, 0.98, 0.7);
  g.add(handlebar);

  const wheelPositions = [
    [0, 0.34, 0.85],
    [0, 0.34, -0.85],
  ];
  for (const [x, y, z] of wheelPositions) {
    const w = wheel(0.35, 0.18);
    w.position.set(x, y, z);
    g.add(w);
  }
  return g;
}

function buildBus(cfg) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.55, metalness: 0.15 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x8fbfe0, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.75 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.6, 10.5), bodyMat);
  body.position.y = 1.55;
  body.castShadow = true;
  g.add(body);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.2, 0.1), glassMat);
  windshield.position.set(0, 1.9, 5.2);
  g.add(windshield);

  for (let i = -1; i <= 1; i++) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.9, 2.2), glassMat);
    win.position.set(0, 1.9, i * 3);
    g.add(win);
  }

  const wheelPositions = [
    [-1.25, 0.5, 3.6],
    [1.25, 0.5, 3.6],
    [-1.25, 0.5, -3.6],
    [1.25, 0.5, -3.6],
  ];
  for (const [x, y, z] of wheelPositions) {
    const w = wheel(0.5, 0.35);
    w.position.set(x, y, z);
    g.add(w);
  }
  return g;
}

function buildBike(cfg) {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.5, metalness: 0.6 });

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.1), frameMat);
  frame.position.set(0, 0.55, 0);
  frame.castShadow = true;
  g.add(frame);

  const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), frameMat);
  seatPost.position.set(0, 0.78, -0.45);
  g.add(seatPost);

  const handlebar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.03), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  handlebar.position.set(0, 0.95, 0.55);
  g.add(handlebar);

  const wheelPositions = [
    [0, 0.34, 0.55],
    [0, 0.34, -0.55],
  ];
  for (const [x, y, z] of wheelPositions) {
    const w = wheel(0.34, 0.05);
    w.position.set(x, y, z);
    g.add(w);
  }
  return g;
}

function buildScooter(cfg) {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.4, metalness: 0.6 });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.55), frameMat);
  deck.position.set(0, 0.2, 0);
  deck.castShadow = true;
  g.add(deck);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6), frameMat);
  pole.position.set(0, 0.65, 0.28);
  g.add(pole);

  const handlebar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.03), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  handlebar.position.set(0, 1.08, 0.28);
  g.add(handlebar);

  const wheelPositions = [
    [0, 0.1, 0.28],
    [0, 0.1, -0.28],
  ];
  for (const [x, y, z] of wheelPositions) {
    const w = wheel(0.1, 0.04);
    w.position.set(x, y, z);
    g.add(w);
  }
  return g;
}

const BUILDERS = {
  f1: buildF1,
  moto: buildMoto,
  onibus: buildBus,
  bicicleta: buildBike,
  patinete: buildScooter,
};

export function buildVehicleMesh(cfg) {
  const builder = BUILDERS[cfg.id] || buildF1;
  const mesh = builder(cfg);
  mesh.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
    }
  });
  return mesh;
}
