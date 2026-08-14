import * as THREE from 'three';
import { makeBuildingTexture } from './textures.js';
import { sampleTrack } from './trackMesh.js';

const BUILDING_PALETTE = [
  ['#e8dfc8', '#4b6a82'],
  ['#f0e6d2', '#5b7a92'],
  ['#e3d3b8', '#3d5a70'],
  ['#f5ede0', '#40607a'],
  ['#ecd9b8', '#557088'],
];

export function buildSky(scene, renderer) {
  scene.background = new THREE.Color(0x9fc8e8);
  scene.fog = new THREE.Fog(0xbfdcee, 300, 1500);

  const DOME_RADIUS = 1900;
  const geo = new THREE.SphereGeometry(DOME_RADIUS, 24, 16);
  const colorTop = new THREE.Color(0x3f7fd6);
  const colorHorizon = new THREE.Color(0xdcecf2);
  const colors = [];
  const posAttr = geo.getAttribute('position');
  for (let i = 0; i < posAttr.count; i++) {
    const y = posAttr.getY(i) / DOME_RADIUS;
    const t = THREE.MathUtils.clamp(y + 0.05, 0, 1);
    const c = colorHorizon.clone().lerp(colorTop, Math.pow(t, 0.55));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false });
  const dome = new THREE.Mesh(geo, mat);
  dome.renderOrder = -1;
  scene.add(dome);
}

export function buildSea(scene) {
  const geo = new THREE.PlaneGeometry(1200, 700, 1, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1c6fa8,
    roughness: 0.35,
    metalness: 0.25,
  });
  const sea = new THREE.Mesh(geo, mat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(330, -2.2, -140);
  sea.receiveShadow = true;
  scene.add(sea);
  return sea;
}

export function buildGround(scene) {
  const geo = new THREE.PlaneGeometry(3000, 3000);
  const mat = new THREE.MeshStandardMaterial({ color: 0x6f7a5c, roughness: 1 });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.receiveShadow = true;
  scene.add(ground);
}

export function buildMountains(scene) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x9aa8ac,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });
  // Cadeia de montanhas distante, baixa e larga, apenas como pano de fundo
  // acima da linha do horizonte (referência: pré-alpes atrás de Monte Carlo).
  const positions = [
    [-650, 190, -950, 420, 9],
    [50, 240, -1150, 520, 10],
    [750, 200, -980, 460, 8],
    [-1050, 160, -600, 380, 8],
    [1050, 170, -650, 400, 9],
  ];
  for (const [x, h, z, r, seg] of positions) {
    const geo = new THREE.ConeGeometry(r, h, seg);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, h / 2 - 15, z);
    m.rotation.y = Math.random() * Math.PI;
    m.castShadow = false;
    m.receiveShadow = false;
    group.add(m);
  }
  scene.add(group);
}

function centroidOf(track) {
  const samples = sampleTrack(track);
  const c = new THREE.Vector3();
  for (const s of samples) c.add(s.position);
  c.divideScalar(samples.length);
  return c;
}

export function buildCityBlocks(scene, track) {
  const group = new THREE.Group();
  const samples = sampleTrack(track);
  const centroid = centroidOf(track);
  const step = 14;

  const startClearSamples = 35; // sem prédios perto da grid de largada

  for (let i = 0; i < samples.length; i += step) {
    if (i < startClearSamples || i > samples.length - startClearSamples) continue;

    const s = samples[i];
    const toCentroid = centroid.clone().sub(s.position);
    const outward = Math.sign(-toCentroid.dot(s.right)) || 1;

    // Só constrói em ~60% dos pontos para deixar vãos (praças, vista do mar)
    if (Math.random() < 0.42) continue;

    const dist = 18 + Math.random() * 12;
    const base = s.position.clone().addScaledVector(s.right, outward * (s.w / 2 + dist));
    const height = 12 + Math.random() * 30;
    const width = 8 + Math.random() * 10;
    const depth = 8 + Math.random() * 10;

    const [baseColor, windowColor] = BUILDING_PALETTE[Math.floor(Math.random() * BUILDING_PALETTE.length)];
    const tex = makeBuildingTexture(baseColor, windowColor);
    tex.repeat.set(Math.max(1, Math.round(width / 6)), Math.max(1, Math.round(height / 8)));
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });

    const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
    building.position.set(base.x, height / 2 - 1, base.z);
    building.lookAt(s.position.x, height / 2 - 1, s.position.z);
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);
  }

  scene.add(group);
  return group;
}

export function buildTunnelShell(scene, track) {
  // Cobre o trecho do túnel com um arco (referência: túnel do Fairmont em Monte Carlo)
  const samples = sampleTrack(track);
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xb9a37a, roughness: 0.7, side: THREE.BackSide });
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfff3c4,
    emissive: 0xffdd77,
    emissiveIntensity: 1.4,
  });

  const start = Math.floor(samples.length * 0.585);
  const end = Math.floor(samples.length * 0.675);

  const pts = [];
  for (let i = start; i <= end; i++) pts.push(samples[i]);
  if (pts.length < 2) return group;

  const path = new THREE.CatmullRomCurve3(pts.map((p) => p.position.clone().add(new THREE.Vector3(0, 4.2, 0))));
  const tubeGeo = new THREE.TubeGeometry(path, pts.length, 6.5, 12, false);
  const tube = new THREE.Mesh(tubeGeo, mat);
  tube.receiveShadow = true;
  group.add(tube);

  for (let i = 0; i < pts.length; i += 6) {
    const p = pts[i].position;
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), lightMat);
    light.position.set(p.x, p.y + 6.4, p.z);
    group.add(light);
  }

  scene.add(group);
  return group;
}

export function buildLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x59543f, 0.65);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff2d9, 1.6);
  sun.position.set(180, 220, 120);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -260;
  sun.shadow.camera.right = 260;
  sun.shadow.camera.top = 260;
  sun.shadow.camera.bottom = -260;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 700;
  sun.shadow.bias = -0.0003;
  scene.add(sun);
  scene.add(sun.target);

  return { hemi, sun };
}
