// ══════════════════════════════════════
// OBJETOS RUNTIME: CABALLERO, ESCUDERO
// ══════════════════════════════════════

import { DB_KNIGHTS, DB_ARMORS, DB_HORSES, DB_SQUIRES, KNIGHT_COLORS, getKnightData, getArmorData, getHorseData, getSquireData } from '../data.js';
import { LANE_X, TRACK_TOP, TRACK_BOT, TRACK_W, TRACK_X } from './constants.js';

export function makeJoustKnight(knightId, side, equipData) {
  const kd = getKnightData(knightId);
  const c = KNIGHT_COLORS[kd.colorIdx];
  const arm = equipData.armor ? getArmorData(equipData.armor) : null;
  const hrs = equipData.horse ? getHorseData(equipData.horse) : null;
  const sqr = equipData.squire ? getSquireData(equipData.squire) : null;

  const totalDef = kd.def + (arm ? arm.defB : 0);
  const spdMod = (hrs ? hrs.spdB : 0) + (arm ? arm.spdB : 0);
  const baseSpeed = 2.2 + spdMod * 0.2;

  return {
    id: knightId,
    name: kd.name,
    str: kd.str,
    def: totalDef,
    hor: kd.hor,
    squireEff: sqr ? sqr.eff : 0,
    colors: c,
    icon: kd.icon,
    x: side === 'left' ? LANE_X - 16 : LANE_X + 16,
    y: side === 'left' ? TRACK_TOP + 60 : TRACK_BOT - 60,
    baseDir: side === 'left' ? 1 : -1,
    speed: 0,
    maxSpeed: baseSpeed,
    rotation: side === 'left' ? 0 : Math.PI,
    targetRotation: side === 'left' ? 0 : Math.PI,
    lanceIntact: true,
    lanceStub: false,
    fallen: false,
    tilt: 0,
    wobble: 0,
    wobbleDecay: 0,
    hp: 100,
    maxHp: 100,
    stunned: false,
    stunRounds: 0,
    bloodMarks: [],
    side: side,
    phase: 'charge', // ready | charge | clash | pass | turn | stop
    phaseT: 0,
    guard: 'low',    // high | low
  };
}

export function generateEnemy(count) {
  const pool = [...DB_KNIGHTS];
  const team = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const kd = pool[idx];
    team.push({
      knightId: kd.id,
      equip: {
        armor: DB_ARMORS[Math.min(Math.floor(Math.random() * 3), DB_ARMORS.length - 1)].id,
        horse: DB_HORSES[Math.min(Math.floor(Math.random() * 3), DB_HORSES.length - 1)].id,
        squire: DB_SQUIRES[Math.min(Math.floor(Math.random() * 2), DB_SQUIRES.length - 1)].id,
      },
    });
  }
  return team;
}

export function makeSquire(side, efficiency) {
  const homeX = side === 'left' ? TRACK_X - 24 : TRACK_X + TRACK_W + 24;
  const startY = side === 'left' ? TRACK_TOP + 40 : TRACK_BOT - 40;
  return {
    homeX,
    x: homeX,
    y: startY,
    targetX: side === 'left' ? LANE_X - 16 : LANE_X + 16,
    phase: 'watching',
    timer: 0,
    speed: 1.5 + efficiency * 0.8,
    side,
    eff: efficiency,
    facingTrack: true,
  };
}
