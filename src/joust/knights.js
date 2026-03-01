// ══════════════════════════════════════
// OBJETOS RUNTIME: CABALLERO, ESCUDERO
// ══════════════════════════════════════

import { DB_KNIGHTS, DB_ARMORS, DB_HORSES, DB_SQUIRES, KNIGHT_COLORS, getKnightData, getArmorData, getHorseData, getSquireData, ENEMY_SQUADS } from '../data.js';
import { LANE_X, TRACK_TOP, TRACK_BOT, TRACK_W, TRACK_X } from './constants.js';

export function makeJoustKnight(knightId, side, equipData, customData = null) {
  const kd = customData || getKnightData(knightId);
  const c = KNIGHT_COLORS[kd.colorIdx];
  const arm = equipData.armor ? getArmorData(equipData.armor) : null;
  const hrs = equipData.horse ? getHorseData(equipData.horse) : null;
  const sqr = equipData.squire ? getSquireData(equipData.squire) : null;

  const totalDef = kd.def + (arm ? arm.defB : 0);
  const spdMod = (hrs ? hrs.spdB : 0) + (arm ? arm.spdB : 0);
  const baseSpeed = 2.2 + spdMod * 0.2;

  return {
    id: kd.id || 'custom',
    name: kd.name,
    str: kd.str,
    def: totalDef,
    hor: kd.hor,
    squireEff: sqr ? sqr.eff : (kd.squireEff || 0),
    colors: c,
    icon: kd.icon,
    x: side === 'left' ? LANE_X - 16 : LANE_X + 16,
    y: side === 'left' ? TRACK_TOP + 60 : TRACK_BOT - 60,
    baseDir: side === 'left' ? 1 : -1,
    speed: 0,
    maxSpeed: baseSpeed,
    rotation: side === 'left' ? 0 : Math.PI,
    targetRotation: side === 'left' ? 0 : Math.PI,
    lanceIntact: false,
    lanceStub: false,
    lanceLoading: 0,
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
    speechText: '',
    speechTimer: 0,
  };
}

export function generateEnemy(count) {
  // Pick one random themed squad from ENEMY_SQUADS
  const squad = ENEMY_SQUADS[Math.floor(Math.random() * ENEMY_SQUADS.length)];
  
  const knights = squad.knights.map(k => ({
    knightId: 'enemy_' + k.name.replace(/\s/g, '_'),
    hp: 100,
    maxHp: 100,
    customData: k, // Pass the predefined knight data directly
    equip: {
      armor: k.armor,
      horse: k.horse,
      squire: k.squire
    }
  }));

  return { knights, squadData: { name: squad.name, origin: squad.origin } };
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
    speed: (1.5 + efficiency * 0.8) * 0.8,
    side,
    eff: efficiency,
    facingTrack: true,
  };
}
