// Áudio: detecção de altura (algoritmo YIN) pelo microfone e síntese de som de referência.

let ctx = null;

export function audioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ---------- Detecção de altura ----------

// YIN (de Cheveigné & Kawahara, 2002). Retorna { freq, clarity } ou null.
export function yin(buf, sampleRate, minFreq = 200, maxFreq = 2600, threshold = 0.15) {
  const n = buf.length;
  const w = Math.floor(n / 2);
  const tauMin = Math.max(2, Math.floor(sampleRate / maxFreq));
  const tauMax = Math.min(w - 1, Math.ceil(sampleRate / minFreq));
  const d = new Float32Array(tauMax + 2);

  for (let tau = 1; tau <= tauMax + 1; tau++) {
    let sum = 0;
    for (let i = 0; i < w; i++) {
      const diff = buf[i] - buf[i + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }
  // Diferença média normalizada cumulativa
  const cmnd = new Float32Array(tauMax + 2);
  cmnd[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    running += d[tau];
    cmnd[tau] = running > 0 ? (d[tau] * tau) / running : 1;
  }

  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (cmnd[t] < threshold) {
      while (t + 1 <= tauMax && cmnd[t + 1] < cmnd[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau === -1) return null;

  // Interpolação parabólica para precisão sub-amostra
  const x0 = cmnd[tau - 1], x1 = cmnd[tau], x2 = cmnd[tau + 1];
  const denom = x0 + x2 - 2 * x1;
  const shift = denom !== 0 ? (x0 - x2) / (2 * denom) : 0;
  const better = tau + Math.max(-1, Math.min(1, shift));
  return { freq: sampleRate / better, clarity: 1 - x1 };
}

export class PitchListener {
  constructor() {
    this.stream = null;
    this.analyser = null;
    this.source = null;
    this.buf = null;
    this.running = false;
    this.mutedUntil = 0;
    this.onPitch = null; // callback({ freq, clarity, rms } | null)
    this.onLevel = null; // callback(rms, tempo em ms) a cada quadro
    this._history = [];
    this._raf = 0;
  }

  async start() {
    if (this.running) return;
    const ac = audioContext();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Este aparelho não permite acesso ao microfone.');
    }
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    this.source = ac.createMediaStreamSource(this.stream);
    this.analyser = ac.createAnalyser();
    this.analyser.fftSize = 2048;
    this.source.connect(this.analyser);
    this.buf = new Float32Array(this.analyser.fftSize);
    this.running = true;
    this._loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this._raf);
    if (this.source) this.source.disconnect();
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    this.stream = this.source = this.analyser = null;
    this._history = [];
  }

  // Ignora o microfone por um tempo (enquanto o próprio app toca um som).
  mute(ms) {
    this.mutedUntil = Math.max(this.mutedUntil, performance.now() + ms);
    this._history = [];
  }

  _loop() {
    if (!this.running) return;
    this._raf = requestAnimationFrame(() => this._loop());
    const a = this.analyser;
    if (!a) return;
    a.getFloatTimeDomainData(this.buf);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i];
    const rms = Math.sqrt(sum / this.buf.length);
    if (this.onLevel) this.onLevel(rms, performance.now());

    let result = null;
    if (performance.now() >= this.mutedUntil && rms > 0.01) {
      const r = yin(this.buf, a.context.sampleRate);
      if (r && r.clarity > 0.8) result = { ...r, rms };
    }
    // Suavização: mediana das últimas leituras válidas
    if (result) {
      this._history.push(result.freq);
      if (this._history.length > 5) this._history.shift();
      const sorted = [...this._history].sort((x, y) => x - y);
      const med = sorted[Math.floor(sorted.length / 2)];
      // estável se todas as leituras estão a menos de meio semitom da mediana
      const stable = this._history.length >= 3 &&
        this._history.every((f) => Math.abs(12 * Math.log2(f / med)) < 0.5);
      result = { freq: med, clarity: result.clarity, rms, stable };
    } else {
      this._history = [];
    }
    if (this.onPitch) this.onPitch(result);
  }
}

// ---------- Síntese ----------

let flutWave = null;
function fluteWave(ac) {
  if (!flutWave) {
    // Harmônicos aproximados de uma flauta (fundamental forte, poucos harmônicos)
    const real = new Float32Array([0, 1, 0.32, 0.12, 0.06, 0.03]);
    const imag = new Float32Array(real.length);
    flutWave = ac.createPeriodicWave(real, imag);
  }
  return flutWave;
}

// Toca uma nota. Retorna função para parar (útil para som contínuo).
export function playTone(freq, { duration = 1.5, pure = false, volume = 0.25, when = 0, dest = null } = {}) {
  const ac = audioContext();
  const out = dest || ac.destination;
  const now = Math.max(ac.currentTime, when);
  const osc = ac.createOscillator();
  if (pure) osc.type = 'sine';
  else osc.setPeriodicWave(fluteWave(ac));
  osc.frequency.value = freq;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.08);
  osc.connect(gain).connect(out);

  // Leve ruído de sopro no ataque (só no timbre de flauta)
  if (!pure) {
    const len = Math.floor(ac.sampleRate * 0.25);
    const nb = ac.createBuffer(1, len, ac.sampleRate);
    const data = nb.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const noise = ac.createBufferSource();
    noise.buffer = nb;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq * 2;
    bp.Q.value = 1.5;
    const ng = ac.createGain();
    ng.gain.value = volume * 0.25;
    noise.connect(bp).connect(ng).connect(out);
    noise.start(now);
  }

  osc.start(now);
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    const t = ac.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.12);
    osc.stop(t + 0.15);
  };
  if (duration > 0) {
    gain.gain.setValueAtTime(volume, now + duration - 0.15);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    osc.stop(now + duration + 0.05);
    stopped = true;
  }
  return stop;
}

// Clique do metrônomo (acento no primeiro tempo do compasso).
export function click(when, accent = false) {
  const ac = audioContext();
  const t = Math.max(ac.currentTime, when);
  const osc = ac.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = accent ? 1760 : 1100;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(accent ? 0.5 : 0.32, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}
