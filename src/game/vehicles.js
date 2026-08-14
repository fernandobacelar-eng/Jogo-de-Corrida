// Dados de cada veículo: velocidade máxima (km/h), aceleração, frenagem,
// aderência (handling) em curvas, altura da câmera (visão em primeira pessoa)
// e paleta de cores usada na modelagem 3D low-poly de cada veículo.

export const VEHICLES = {
  f1: {
    id: 'f1',
    name: 'Fórmula 1',
    icon: '🏎️',
    topSpeed: 330, // km/h
    accel: 46, // km/h por segundo
    brake: 70,
    grip: 1.0, // multiplicador de aderência (afeta o quanto pode desviar em alta velocidade)
    drag: 0.055,
    eyeHeight: 0.72,
    eyeForward: 0.35,
    width: 1.9,
    length: 5.5,
    color: 0xe10600,
    accentColor: 0xffcc33,
    stats: { speed: 1.0, accel: 1.0, handling: 0.95 },
  },
  moto: {
    id: 'moto',
    name: 'Moto',
    icon: '🏍️',
    topSpeed: 300,
    accel: 42,
    brake: 55,
    grip: 0.88,
    drag: 0.05,
    eyeHeight: 1.15,
    eyeForward: 0.5,
    width: 0.9,
    length: 2.1,
    color: 0x1560bd,
    accentColor: 0xffffff,
    stats: { speed: 0.95, accel: 0.98, handling: 0.75 },
  },
  onibus: {
    id: 'onibus',
    name: 'Ônibus',
    icon: '🚌',
    topSpeed: 110,
    accel: 12,
    brake: 22,
    grip: 0.55,
    drag: 0.09,
    eyeHeight: 2.35,
    eyeForward: 2.6,
    width: 2.55,
    length: 12,
    color: 0xffa500,
    accentColor: 0x222222,
    stats: { speed: 0.32, accel: 0.28, handling: 0.35 },
  },
  bicicleta: {
    id: 'bicicleta',
    name: 'Bicicleta',
    icon: '🚲',
    topSpeed: 48,
    accel: 9,
    brake: 14,
    grip: 0.8,
    drag: 0.12,
    eyeHeight: 1.35,
    eyeForward: 0.4,
    width: 0.6,
    length: 1.7,
    color: 0x2ecc71,
    accentColor: 0x111111,
    stats: { speed: 0.14, accel: 0.2, handling: 0.6 },
  },
  patinete: {
    id: 'patinete',
    name: 'Patinete',
    icon: '🛴',
    topSpeed: 28,
    accel: 6,
    brake: 10,
    grip: 0.7,
    drag: 0.14,
    eyeHeight: 1.25,
    eyeForward: 0.25,
    width: 0.45,
    length: 1.1,
    color: 0x9b59b6,
    accentColor: 0xffffff,
    stats: { speed: 0.08, accel: 0.13, handling: 0.5 },
  },
};

export const VEHICLE_ORDER = ['f1', 'moto', 'onibus', 'bicicleta', 'patinete'];

export function otherVehicles(selectedId) {
  return VEHICLE_ORDER.filter((id) => id !== selectedId).map((id) => VEHICLES[id]);
}
