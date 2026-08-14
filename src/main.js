import './style.css';
import * as THREE from 'three';
import { VEHICLES, VEHICLE_ORDER } from './game/vehicles.js';
import { RaceScene } from './game/scene.js';

if (import.meta.env.DEV) window.__THREE = THREE;

const TOTAL_LAPS = 3;

const els = {
  vehicleSelect: document.getElementById('vehicle-select'),
  startBtn: document.getElementById('start-btn'),
  menuScreen: document.getElementById('menu-screen'),
  countdownScreen: document.getElementById('countdown-screen'),
  countdownNumber: document.getElementById('countdown-number'),
  raceScreen: document.getElementById('race-screen'),
  resultsScreen: document.getElementById('results-screen'),
  resultsList: document.getElementById('results-list'),
  restartBtn: document.getElementById('restart-btn'),
  canvas: document.getElementById('race-canvas'),
  minimap: document.getElementById('minimap-canvas'),
  raceMessage: document.getElementById('race-message'),

  hudLap: document.getElementById('hud-lap'),
  hudTotalLaps: document.getElementById('hud-total-laps'),
  hudPosition: document.getElementById('hud-position'),
  hudTimer: document.getElementById('hud-timer'),
  hudDistance: document.getElementById('hud-distance'),
  hudTotalDistance: document.getElementById('hud-total-distance'),
  hudSpeed: document.getElementById('hud-speed'),
  hudVehicleName: document.getElementById('hud-vehicle-name'),
  speedoArcFill: document.getElementById('speedo-arc-fill'),
};

els.hudTotalLaps.textContent = String(TOTAL_LAPS);

let selectedVehicleId = null;
let raceScene = null;
let animFrameId = null;
let lastTime = 0;
let raceFinished = false;
let raceStartTime = 0;
let trackPolylinePoints = null;

const input = { forward: false, backward: false, left: false, right: false };
if (import.meta.env.DEV) window.__input = input;

// ===================== MENU =====================

function renderVehicleCards() {
  els.vehicleSelect.innerHTML = '';
  for (const id of VEHICLE_ORDER) {
    const cfg = VEHICLES[id];
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.dataset.id = id;
    card.innerHTML = `
      <div class="vehicle-icon">${cfg.icon}</div>
      <div class="vehicle-name">${cfg.name}</div>
      <div class="vehicle-stats">
        ${statRow('Vel.', cfg.stats.speed)}
        ${statRow('Acel.', cfg.stats.accel)}
        ${statRow('Manejo', cfg.stats.handling)}
      </div>
    `;
    card.addEventListener('click', () => selectVehicle(id));
    els.vehicleSelect.appendChild(card);
  }
}

function statRow(label, value) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return `
    <div class="stat-row">
      <span>${label}</span>
      <span class="stat-bar"><span class="stat-bar-fill" style="width:${pct}%"></span></span>
    </div>
  `;
}

function selectVehicle(id) {
  selectedVehicleId = id;
  document.querySelectorAll('.vehicle-card').forEach((el) => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  els.startBtn.disabled = false;
  els.startBtn.textContent = `Corridar de ${VEHICLES[id].name}`.replace('Corridar', 'Correr');
}

els.startBtn.addEventListener('click', () => {
  if (!selectedVehicleId) return;
  startCountdown();
});

els.restartBtn.addEventListener('click', () => {
  showScreen('menu');
});

// ===================== SCREENS =====================

function showScreen(name) {
  els.menuScreen.classList.toggle('hidden', name !== 'menu');
  els.countdownScreen.classList.toggle('hidden', name !== 'countdown');
  els.raceScreen.classList.toggle('hidden', name !== 'race');
  els.resultsScreen.classList.toggle('hidden', name !== 'results');
}

// ===================== COUNTDOWN =====================

function startCountdown() {
  showScreen('countdown');
  let n = 3;
  els.countdownNumber.textContent = String(n);
  els.countdownNumber.style.animation = 'none';
  void els.countdownNumber.offsetWidth;
  els.countdownNumber.style.animation = '';

  const timer = setInterval(() => {
    n -= 1;
    if (n > 0) {
      els.countdownNumber.textContent = String(n);
      els.countdownNumber.style.animation = 'none';
      void els.countdownNumber.offsetWidth;
      els.countdownNumber.style.animation = '';
    } else {
      clearInterval(timer);
      els.countdownNumber.textContent = 'VAI!';
      setTimeout(() => startRace(), 500);
    }
  }, 800);
}

// ===================== RACE =====================

function setupInput() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

function teardownInput() {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
}

function onKeyDown(e) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      input.forward = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      input.backward = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      input.left = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      input.right = true;
      break;
  }
}

function onKeyUp(e) {
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      input.forward = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      input.backward = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      input.left = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      input.right = false;
      break;
  }
}

function startRace() {
  showScreen('race');
  raceFinished = false;
  raceStartTime = performance.now();

  if (!raceScene) {
    raceScene = new RaceScene(els.canvas);
    window.addEventListener('resize', () => raceScene.resize());
  }

  raceScene.spawnCars(selectedVehicleId);
  if (import.meta.env.DEV) window.__raceScene = raceScene;
  els.hudVehicleName.textContent = `${VEHICLES[selectedVehicleId].icon} ${VEHICLES[selectedVehicleId].name}`;
  buildMinimapPolyline();
  setupInput();

  lastTime = performance.now();
  animFrameId = requestAnimationFrame(loop);
}

function buildMinimapPolyline() {
  const track = raceScene.track;
  const N = 200;
  const pts = [];
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = track.curve.getPointAt(t);
    pts.push(p);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z);
    maxZ = Math.max(maxZ, p.z);
  }
  trackPolylinePoints = { pts, minX, maxX, minZ, maxZ };
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (!raceFinished) {
    raceScene.update(dt, input);
    checkRaceProgress();
  }

  raceScene.render();
  updateHud();
  drawMinimap();

  animFrameId = requestAnimationFrame(loop);
}

function checkRaceProgress() {
  const player = raceScene.playerCar;
  if (!player) return;
  const lapsCompleted = player.distanceAlong / raceScene.track.totalLength;
  if (lapsCompleted >= TOTAL_LAPS) {
    finishRace();
  }
}

function getStandings() {
  return [...raceScene.cars].sort((a, b) => b.distanceAlong - a.distanceAlong);
}

function finishRace() {
  raceFinished = true;
  const elapsedMs = performance.now() - raceStartTime;
  els.raceMessage.textContent = 'CHEGADA!';
  els.raceMessage.classList.remove('hidden');

  setTimeout(() => {
    teardownInput();
    cancelAnimationFrame(animFrameId);
    els.raceMessage.classList.add('hidden');
    showResults(elapsedMs);
  }, 1800);
}

function showResults(elapsedMs) {
  const standings = getStandings();
  els.resultsList.innerHTML = '';
  standings.forEach((car, idx) => {
    const li = document.createElement('li');
    if (car.isPlayer) li.classList.add('player');
    const timeStr = car.isPlayer ? formatTime(elapsedMs) : '—';
    li.innerHTML = `
      <span class="rank">${idx + 1}º</span>
      <span class="rname">${car.cfg.icon} ${car.cfg.name}${car.isPlayer ? ' (Você)' : ''}</span>
      <span class="rtime">${timeStr}</span>
    `;
    els.resultsList.appendChild(li);
  });
  showScreen('results');
}

// ===================== HUD =====================

function formatTime(ms) {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
}

const SPEEDO_ARC_LEN = 267;

function updateHud() {
  const player = raceScene.playerCar;
  if (!player) return;

  const speed = Math.max(0, player.speedKmh);
  els.hudSpeed.textContent = Math.round(speed);

  const frac = Math.min(1, speed / player.cfg.topSpeed);
  els.speedoArcFill.style.strokeDashoffset = String(SPEEDO_ARC_LEN * (1 - frac));
  const hue = 130 - frac * 130; // verde -> vermelho
  els.speedoArcFill.style.stroke = `hsl(${hue}, 85%, 55%)`;

  const lap = Math.min(TOTAL_LAPS, Math.floor(player.distanceAlong / raceScene.track.totalLength) + 1);
  els.hudLap.textContent = String(lap);

  els.hudDistance.textContent = Math.round(player.currentLapDistance);
  els.hudTotalDistance.textContent = Math.round(raceScene.track.totalLength);

  const elapsedMs = performance.now() - raceStartTime;
  els.hudTimer.textContent = formatTime(elapsedMs);

  const standings = getStandings();
  const rank = standings.findIndex((c) => c.isPlayer) + 1;
  els.hudPosition.textContent = `${rank}º`;
}

function drawMinimap() {
  if (!trackPolylinePoints) return;
  const canvas = els.minimap;
  const ctx = canvas.getContext('2d');
  const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
  const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
  ctx.clearRect(0, 0, w, h);

  const { pts, minX, maxX, minZ, maxZ } = trackPolylinePoints;
  const pad = 14 * devicePixelRatio;
  const scaleX = (w - pad * 2) / (maxX - minX || 1);
  const scaleZ = (h - pad * 2) / (maxZ - minZ || 1);
  const scale = Math.min(scaleX, scaleZ);

  const toCanvas = (x, z) => [
    pad + (x - minX) * scale,
    pad + (z - minZ) * scale,
  ];

  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 3 * devicePixelRatio;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach((p, i) => {
    const [cx, cy] = toCanvas(p.x, p.z);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.closePath();
  ctx.stroke();

  for (const car of raceScene.cars) {
    const { position } = car.getWorldTransform();
    const [cx, cy] = toCanvas(position.x, position.z);
    ctx.beginPath();
    ctx.fillStyle = car.isPlayer ? '#ffcc33' : '#e10600';
    ctx.arc(cx, cy, (car.isPlayer ? 4.5 : 3.2) * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
    if (car.isPlayer) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.4 * devicePixelRatio;
      ctx.stroke();
    }
  }
}

// ===================== INIT =====================

renderVehicleCards();
showScreen('menu');
