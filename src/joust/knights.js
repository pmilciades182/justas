// ══════════════════════════════════════
// OBJETOS RUNTIME: CABALLERO, ESCUDERO
// ══════════════════════════════════════

import { DB_KNIGHTS, DB_ARMORS, DB_HORSES, DB_SQUIRES, DB_SHIELDS, DB_LANCES, KNIGHT_COLORS, getKnightData, getArmorData, getHorseData, getSquireData, getShieldData, getLanceData, ENEMY_SQUADS } from '../data.js';
import { LANE_X, TRACK_TOP, TRACK_BOT, TRACK_W, TRACK_X } from './constants.js';

export function makeJoustKnight(knightId, side, equipData, customData = null) {
  const kd = customData || getKnightData(knightId);
  const c = KNIGHT_COLORS[kd.colorIdx];
  const arm = equipData.armor ? getArmorData(equipData.armor) : null;
  const hrs = equipData.horse ? getHorseData(equipData.horse) : null;
  const sqr = equipData.squire ? getSquireData(equipData.squire) : null;
  const shd = equipData.shield ? getShieldData(equipData.shield) : null;
  const lnc = equipData.lance ? getLanceData(equipData.lance) : null;

  const totalDef = kd.def + (shd ? shd.def : 0); // Shield adds to base def now
  const totalStr = kd.str + (lnc ? lnc.str : 0);
  const spdMod = (hrs ? hrs.spd : 0);
  const baseSpeed = 2.2 + spdMod * 0.2;

  // Equipment objects for reference (cooldowns/durations)
  const equipStats = {
    lance: lnc || getLanceData('l1'),
    shield: shd || getShieldData('s1'),
    horse: hrs || getHorseData('h1'),
    armor: arm || getArmorData('a1')
  };

  return {
    id: kd.id || 'custom',
    name: kd.name,
    str: totalStr,
    def: totalDef,
    hor: kd.hor,
    squireEff: sqr ? sqr.eff : (kd.squireEff || 0),
    equipStats: equipStats,
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
    maxHp: 100 + (arm ? arm.hp : 0),
    fatigue: 0,      
    stunned: false,
    stunRounds: 0,
    bloodMarks: [],
    side: side,
    phase: 'charge', 
    phaseT: 0,
    guard: 'low',
    speechText: '',
    speechTimer: 0,
    speechType: 'normal',
    
    // Ability Runtime State
    // Active Durations (>0 means active)
    abilityShieldT: 0,
    abilityAttackT: 0,
    abilityHorseT: 0,
    abilitySpecialT: 0,
    
    // Current Cooldowns (>0 means waiting)
    cdShield: 0,
    cdAttack: 0,
    cdHorse: 0,
    cdSpecial: 0,
    
    // Global lock flag
    abilityActive: false,
    
    // External status effects
    frozenT: 0
  };
}

export function generateEnemy(count) {
  const squad = ENEMY_SQUADS[Math.floor(Math.random() * ENEMY_SQUADS.length)];
  const squadColorIdx = 8 + Math.floor(Math.random() * 4); // Fallback color range check needed, but okay for now
  const squadIcon = squad.knights[0].icon;

  const knights = squad.knights.map(k => ({
    knightId: 'enemy_' + k.name.replace(/\s/g, '_'),
    hp: 100,
    maxHp: 100,
    fatigue: 0,
    customData: { ...k, colorIdx: k.colorIdx || squadColorIdx, icon: k.icon || squadIcon },
    equip: {
      armor: k.equip?.armor || 'a1',
      horse: k.equip?.horse || 'h1',
      squire: k.equip?.squire || 'sq1',
      shield: k.equip?.shield || 's1',
      lance: k.equip?.lance || 'l1'
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
