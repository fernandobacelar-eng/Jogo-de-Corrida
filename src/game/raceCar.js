import * as THREE from 'three';

const KMH_TO_MS = 1 / 3.6;

export class RaceCar {
  constructor({ cfg, track, isPlayer = false, laneOffset = 0, startSlot = 0 }) {
    this.cfg = cfg;
    this.track = track;
    this.isPlayer = isPlayer;
    this.laneOffset = laneOffset;

    // Grade de largada: carros ligeiramente atrás da linha, lado a lado.
    this.distanceAlong = -(startSlot * 7 + 4);
    this.speedKmh = 0;
    this.lateralOffset = laneOffset;
    this.steerVisual = 0;
    this.offTrackPenaltyTimer = 0;
    this.finished = false;
    this.finishTime = null;
    this.lap = 0;

    this._aiWiggleSeed = Math.random() * 1000;
    this._aiTargetVariance = 0.85 + Math.random() * 0.3;

    this.object3D = null; // atribuído externamente (mesh do veículo)
  }

  get tRaw() {
    return this.distanceAlong / this.track.totalLength;
  }

  get lapProgress() {
    const t = this.tRaw;
    return ((t % 1) + 1) % 1;
  }

  get currentLapDistance() {
    const total = this.track.totalLength;
    return ((this.distanceAlong % total) + total) % total;
  }

  updatePlayer(dt, input) {
    const cfg = this.cfg;
    const accelInput = input.forward ? 1 : 0;
    const brakeInput = input.backward ? 1 : 0;

    if (accelInput) {
      this.speedKmh += cfg.accel * dt;
    } else if (brakeInput) {
      this.speedKmh -= cfg.brake * dt;
    } else {
      const dragForce = (cfg.drag * 60 + 4) * dt;
      if (this.speedKmh > 0) this.speedKmh = Math.max(0, this.speedKmh - dragForce);
      else if (this.speedKmh < 0) this.speedKmh = Math.min(0, this.speedKmh + dragForce);
    }

    const minSpeed = -cfg.topSpeed * 0.25;
    this.speedKmh = THREE.MathUtils.clamp(this.speedKmh, minSpeed, cfg.topSpeed);

    // Penalidade por sair da pista
    const halfWidth = this.track.widthAt(this.lapProgress) / 2 - 0.6;
    const offTrack = Math.abs(this.lateralOffset) > halfWidth;
    if (offTrack) {
      this.speedKmh *= Math.pow(0.35, dt * 10);
    }

    const speedFactor = Math.min(1, Math.abs(this.speedKmh) / (cfg.topSpeed * 0.35));
    const steerInput = (input.left ? -1 : 0) + (input.right ? 1 : 0);
    const steerRate = 5.2 * cfg.grip * (0.35 + 0.65 * speedFactor);
    this.lateralOffset += steerInput * steerRate * dt;

    const maxOffset = this.track.widthAt(this.lapProgress) / 2 + 1.3;
    this.lateralOffset = THREE.MathUtils.clamp(this.lateralOffset, -maxOffset, maxOffset);

    this.steerVisual = THREE.MathUtils.lerp(this.steerVisual, steerInput, Math.min(1, dt * 6));

    const distanceDelta = this.speedKmh * KMH_TO_MS * dt;
    this.distanceAlong += distanceDelta;

    return { offTrack, distanceDelta };
  }

  updateAI(dt, elapsedTime) {
    const cfg = this.cfg;
    const t = this.lapProgress;
    const width = this.track.widthAt(t);

    // Reduz velocidade em trechos estreitos (curvas técnicas)
    const widthFactor = THREE.MathUtils.clamp((width - 7) / 6, 0.35, 1);
    const targetSpeed = cfg.topSpeed * this._aiTargetVariance * (0.55 + 0.45 * widthFactor);

    const accelRate = this.speedKmh < targetSpeed ? cfg.accel * 0.8 : cfg.brake * 0.6;
    const diff = targetSpeed - this.speedKmh;
    this.speedKmh += Math.sign(diff) * Math.min(Math.abs(diff), accelRate * dt);
    this.speedKmh = THREE.MathUtils.clamp(this.speedKmh, 0, cfg.topSpeed);

    // Leve oscilação lateral para dar vida à condução da IA
    const wiggle = Math.sin(elapsedTime * 0.6 + this._aiWiggleSeed) * Math.min(1.4, width * 0.12);
    this.lateralOffset = THREE.MathUtils.lerp(this.lateralOffset, this.laneOffset + wiggle, Math.min(1, dt * 1.5));

    const distanceDelta = this.speedKmh * KMH_TO_MS * dt;
    this.distanceAlong += distanceDelta;
  }

  getWorldTransform() {
    const t = this.lapProgress;
    const frame = this.track.frameAt(t);
    const pos = frame.position.clone().addScaledVector(frame.right, this.lateralOffset);
    return { position: pos, tangent: frame.tangent, right: frame.right, up: frame.up };
  }
}
