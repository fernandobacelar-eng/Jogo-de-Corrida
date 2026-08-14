import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

import { buildTrack } from './track.js';
import { buildRoadMesh, buildCurbMesh, buildBarriers } from './trackMesh.js';
import { buildSky, buildSea, buildGround, buildMountains, buildCityBlocks, buildTunnelShell, buildLighting } from './environment.js';
import { buildVehicleMesh } from './vehicleMesh.js';
import { buildCockpitOverlay } from './cockpit.js';
import { RaceCar } from './raceCar.js';
import { VEHICLES, VEHICLE_ORDER } from './vehicles.js';

export class RaceScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.88;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2200);

    this.track = buildTrack();
    this.cars = [];
    this.playerCar = null;
    this.cockpitOverlay = null;
    this.elapsed = 0;

    this._buildStaticWorld();
    this._buildComposer();
    this.resize();
  }

  _buildStaticWorld() {
    buildSky(this.scene, this.renderer);
    buildGround(this.scene);
    buildSea(this.scene);
    buildMountains(this.scene);
    buildLighting(this.scene);

    this.scene.add(buildRoadMesh(this.track));
    this.scene.add(buildCurbMesh(this.track));
    this.scene.add(buildBarriers(this.track));
    buildCityBlocks(this.scene, this.track);
    buildTunnelShell(this.scene, this.track);
  }

  _buildComposer() {
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.15, 0.4, 0.94);
    this.composer.addPass(this.bloomPass);

    this.smaaPass = new SMAAPass(1, 1);
    this.composer.addPass(this.smaaPass);

    this.composer.addPass(new OutputPass());
  }

  spawnCars(selectedVehicleId) {
    this.cars = [];
    const laneOffsets = [-3.2, -1.6, 0, 1.6, 3.2];
    let slot = 0;

    for (const id of VEHICLE_ORDER) {
      const cfg = VEHICLES[id];
      const isPlayer = id === selectedVehicleId;
      const car = new RaceCar({
        cfg,
        track: this.track,
        isPlayer,
        laneOffset: laneOffsets[slot],
        startSlot: slot,
      });
      slot++;

      if (!isPlayer) {
        const mesh = buildVehicleMesh(cfg);
        this.scene.add(mesh);
        car.object3D = mesh;
      } else {
        this.playerCar = car;
        this.cockpitOverlay = buildCockpitOverlay(cfg);
        this.camera.add(this.cockpitOverlay);
        if (!this.camera.parent) this.scene.add(this.camera);
      }

      this.cars.push(car);
    }

    return this.cars;
  }

  update(dt, input) {
    this.elapsed += dt;

    for (const car of this.cars) {
      if (car.finished) continue;
      if (car.isPlayer) {
        car.updatePlayer(dt, input);
      } else {
        car.updateAI(dt, this.elapsed);
      }

      const { position, tangent, right, up } = car.getWorldTransform();

      if (car.isPlayer) {
        const cfg = car.cfg;
        const eye = position.clone();
        eye.y += cfg.eyeHeight;
        eye.addScaledVector(tangent, cfg.eyeForward);
        eye.addScaledVector(right, car.steerVisual * 0.12);

        this.camera.position.copy(eye);
        const lookTarget = eye.clone().addScaledVector(tangent, 10);
        lookTarget.addScaledVector(right, car.steerVisual * 2.2);
        lookTarget.y += 0.05;
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(lookTarget);
        // Aplica um leve "roll" via quaternion (rotateZ), nunca mutando
        // .rotation.z diretamente: perto de yaw=90° isso cai em gimbal lock
        // e produz orientações completamente erradas.
        this.camera.rotateZ(-car.steerVisual * 0.03);
      } else if (car.object3D) {
        car.object3D.position.copy(position);
        car.object3D.position.y += 0.02;
        const lookTarget = position.clone().add(tangent);
        car.object3D.lookAt(lookTarget.x, position.y + 0.02, lookTarget.z);
      }
    }
  }

  render() {
    this.composer.render();
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    if (this.smaaPass) this.smaaPass.setSize(w, h);
  }
}
