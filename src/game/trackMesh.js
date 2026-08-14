import * as THREE from 'three';
import { makeAsphaltTexture } from './textures.js';

const SAMPLES = 900;

function sampleTrack(track) {
  const samples = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) % 1;
    const frame = track.frameAt(t);
    const w = track.widthAt(t);
    samples.push({ t, ...frame, w });
  }
  return samples;
}

function buildRibbon({ samples, offsetFn, uvRepeatV = 1, textureLenRepeat = 1, colorFn = null }) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const colors = [];
  const indices = [];

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    // offsetFn retorna deslocamentos COM SINAL ao longo de s.right (não magnitudes).
    const [offsetA, offsetB] = offsetFn(s);
    const left = s.position.clone().addScaledVector(s.right, offsetA);
    const rightP = s.position.clone().addScaledVector(s.right, offsetB);
    positions.push(left.x, left.y, left.z);
    positions.push(rightP.x, rightP.y, rightP.z);
    normals.push(0, 1, 0, 0, 1, 0);
    const v = (i / (samples.length - 1)) * textureLenRepeat;
    uvs.push(0, v, uvRepeatV, v);
    if (colorFn) {
      const [r, g, b] = colorFn(s, i);
      colors.push(r, g, b, r, g, b);
    }
  }

  for (let i = 0; i < samples.length - 1; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = i * 2 + 2;
    const d = i * 2 + 3;
    indices.push(a, c, b, b, c, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (colorFn) geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function buildRoadMesh(track) {
  const samples = sampleTrack(track);
  const geo = buildRibbon({
    samples,
    offsetFn: (s) => [-s.w / 2, s.w / 2],
    textureLenRepeat: track.totalLength / 8,
  });

  const asphalt = makeAsphaltTexture();
  asphalt.repeat.set(1, track.totalLength / 8);
  const mat = new THREE.MeshStandardMaterial({
    map: asphalt,
    roughness: 0.92,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.position.y += 0.01;
  return mesh;
}

const CURB_RED = [0.75, 0.03, 0.03];
const CURB_WHITE = [0.9, 0.9, 0.9];
const CURB_STRIPE_LEN_M = 4; // metros por faixa vermelha/branca

function curbColorFn(track) {
  return (s) => {
    const stripeIndex = Math.floor((s.t * track.totalLength) / CURB_STRIPE_LEN_M);
    return stripeIndex % 2 === 0 ? CURB_RED : CURB_WHITE;
  };
}

export function buildCurbMesh(track) {
  const samples = sampleTrack(track);
  const curbWidth = 0.9;
  const colorFn = curbColorFn(track);

  const leftGeo = buildRibbon({
    samples,
    offsetFn: (s) => [-(s.w / 2 + curbWidth), -s.w / 2],
    colorFn,
  });
  const rightGeo = buildRibbon({
    samples,
    offsetFn: (s) => [s.w / 2, s.w / 2 + curbWidth],
    colorFn,
  });

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, side: THREE.DoubleSide });

  const left = new THREE.Mesh(leftGeo, mat);
  const right = new THREE.Mesh(rightGeo, mat);
  left.position.y += 0.02;
  right.position.y += 0.02;
  left.receiveShadow = true;
  right.receiveShadow = true;

  const group = new THREE.Group();
  group.add(left, right);
  return group;
}

export function buildBarriers(track) {
  const samples = sampleTrack(track);
  const group = new THREE.Group();
  const barrierMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.55, side: THREE.DoubleSide });
  const postMat = new THREE.MeshStandardMaterial({ color: 0x8a0000, roughness: 0.7 });

  const railHeight = 0.5;
  const railThickness = 0.1;
  const clearance = 2.2;

  for (const side of [-1, 1]) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const offset = side * (s.w / 2 + clearance);
      const base = s.position.clone().addScaledVector(s.right, offset);
      const top = base.clone();
      top.y += railHeight;
      positions.push(base.x, base.y, base.z, top.x, top.y, top.z);
      const n = s.right.clone().multiplyScalar(-side);
      normals.push(n.x, n.y, n.z, n.x, n.y, n.z);
      const v = i / (samples.length - 1);
      uvs.push(v * 40, 0, v * 40, 1);
    }
    for (let i = 0; i < samples.length - 1; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    const rail = new THREE.Mesh(geo, barrierMat);
    rail.castShadow = true;
    rail.receiveShadow = true;
    group.add(rail);
  }

  // Postes em instanced mesh (baixo custo de desenho)
  const postStep = 8;
  const postCount = Math.floor(samples.length / postStep) * 2;
  const postGeo = new THREE.CylinderGeometry(0.06, 0.06, railHeight + 0.35, 6);
  const posts = new THREE.InstancedMesh(postGeo, postMat, postCount);
  posts.castShadow = true;
  const dummy = new THREE.Object3D();
  let idx = 0;
  for (let i = 0; i < samples.length; i += postStep) {
    const s = samples[i];
    for (const side of [-1, 1]) {
      const offset = side * (s.w / 2 + clearance);
      const base = s.position.clone().addScaledVector(s.right, offset);
      dummy.position.set(base.x, base.y + (railHeight + 0.35) / 2, base.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      posts.setMatrixAt(idx++, dummy.matrix);
    }
  }
  posts.count = idx;
  posts.instanceMatrix.needsUpdate = true;
  group.add(posts);

  return group;
}

export { sampleTrack };
