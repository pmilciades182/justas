// ══════════════════════════════════════
// FÍSICA DE COLISIÓN, HP Y ATURDIMIENTO
// ══════════════════════════════════════

import { HIT_TABLE, HP_DAMAGE, LANE_X } from './constants.js';
import { joust } from './state.js';
import { spawnSparks, spawnSplinters, spawnBlood, spawnGroundBlood, spawnGroundSplinters, spawnBrokenLance } from './particles.js';
import { audio } from '../audio.js';
import { knightSay } from './dialogue.js';

export function rollHit(strBonus, defBonus, unhorseProb = 0.05) {
  // 1. Roll for unhorse FIRST based on the new venida rules
  if (Math.random() < unhorseProb) {
    return HIT_TABLE.find(h => h.type === 'unhorse');
  }

  // 2. If not unhorsed, roll for other hits using adjusted weights
  let r = Math.random();
  const strFactor = 1 + (strBonus - 5) * 0.04;
  const defFactor = 1 + (defBonus - 5) * 0.04;

  const adjusted = HIT_TABLE.filter(h => h.type !== 'unhorse').map(h => {
    let p = h.prob;
    if (h.type === 'miss') p *= defFactor / strFactor;
    else if (h.pts >= 3) p *= strFactor / defFactor;
    return { ...h, adjProb: Math.max(0.01, p) };
  });
  const total = adjusted.reduce((s, h) => s + h.adjProb, 0);

  for (const h of adjusted) {
    r -= h.adjProb / total;
    if (r <= 0) return h;
  }
  return adjusted[0];
}

export function getEffectiveStr(k) {
  if (k.frozenT > 0) return 0; // Frozen knights can't hit back effectively

  let str = k.str;
  const hpPct = k.hp / k.maxHp;
  if (hpPct < 0.25) str -= 3;
  else if (hpPct < 0.50) str -= 2;
  else if (hpPct < 0.75) str -= 1;
  if (k.stunned) str -= 2;
  
  // Ability: Shield reduces attack power
  if (k.abilityShieldT > 0) str -= 4; 

  // Ability: Attack (Fury) increases strength significantly
  if (k.abilityAttackT > 0) str += 6;

  return Math.max(1, str);
}

export function resolveClash() {
  const k1 = joust.k1, k2 = joust.k2;
  const distY = Math.abs(k1.y - k2.y);
  
  let h1, h2;

  // MECÁNICA: 10% Punta contra Punta, 90% Choque contra cuerpo/escudo
  const isTipToTip = Math.random() < 0.10 && k1.lanceIntact && k2.lanceIntact;

  if (isTipToTip) {
    const lt = HIT_TABLE.find(h => h.type === 'lanceTip');
    h1 = lt; h2 = lt;
  } else {
    const r1 = k1.lanceIntact ? 95 : 25;
    const r2 = k2.lanceIntact ? 95 : 25;

    const unhorseProbs = { 1: 0.05, 2: 0.10, 3: 0.35, 4: 0.50 };
    
    // K1's attempt
    let prob1 = unhorseProbs[joust.venida] || 0.05;
    const hpBonus2 = (1 - (k2.hp / k2.maxHp)) * 0.25;
    const tierH1 = k1.equipStats.horse?.tier || 1;
    const rpsBonus1 = (k1.abilityHorseT > 0 && k2.abilityShieldT > 0) ? (0.10 + tierH1 * 0.04) : 0;
    const isAtkVsDef1 = (k1.abilityAttackT > 0 && k2.abilityShieldT > 0);
    const finalProb1 = prob1 + hpBonus2 + (isAtkVsDef1 ? 0 : rpsBonus1);
    if (rpsBonus1 > 0 && !isAtkVsDef1) knightSay(k1, `¡PERFORAR T${tierH1}!`, 'prominent');

    if (k2.guard === 'low' && k1.guard === 'high' && k1.lanceIntact && Math.random() < finalProb1) {
      h1 = HIT_TABLE.find(h => h.type === 'unhorse');
    } else {
      h1 = (k1.lanceIntact && distY <= r1 && k1.frozenT <= 0) ? rollHit(getEffectiveStr(k1), k2.def, finalProb1) : HIT_TABLE.find(h => h.type === 'miss');
    }

    // K2's attempt
    let prob2 = unhorseProbs[joust.venida] || 0.05;
    const hpBonus1 = (1 - (k1.hp / k1.maxHp)) * 0.25;
    const tierH2 = k2.equipStats.horse?.tier || 1;
    const rpsBonus2 = (k2.abilityHorseT > 0 && k1.abilityShieldT > 0) ? (0.10 + tierH2 * 0.04) : 0;
    const isAtkVsDef2 = (k2.abilityAttackT > 0 && k1.abilityShieldT > 0);
    const finalProb2 = prob2 + hpBonus1 + (isAtkVsDef2 ? 0 : rpsBonus2);
    if (rpsBonus2 > 0 && !isAtkVsDef2) knightSay(k2, `¡PERFORAR T${tierH2}!`, 'prominent');

    if (k1.guard === 'low' && k2.guard === 'high' && k2.lanceIntact && Math.random() < finalProb2) {
      h2 = HIT_TABLE.find(h => h.type === 'unhorse');
    } else {
      h2 = (k2.lanceIntact && distY <= r2 && k2.frozenT <= 0) ? rollHit(getEffectiveStr(k2), k1.def, finalProb2) : HIT_TABLE.find(h => h.type === 'miss');
    }
  }

  joust.k1Hit = h1;
  joust.k2Hit = h2;
  joust.k1Points += h1.pts;
  joust.k2Points += h2.pts;
  joust.history.push({ venida: joust.venida, k1Hit: h1, k2Hit: h2 });

  const impactX = LANE_X;
  let impactY = (k1.y + k2.y) / 2;
  if (h1.pts > h2.pts) impactY = k2.y;
  else if (h2.pts > h1.pts) impactY = k1.y;
  
  const maxPts = Math.max(h1.pts, h2.pts);

  audio.playClash(maxPts >= 10 ? 1.5 : (maxPts >= 3 ? 1.0 : 0.5));
  
  if (h1.type === 'helmet' || h1.type === 'shield' || h2.type === 'helmet' || h2.type === 'shield') {
    audio.playMetalHit(maxPts >= 3 ? 1.2 : 0.8);
  }

  if (maxPts === 0 && h1.type === 'miss' && h2.type === 'miss') {
    joust.shakeAmt = 0; joust.flashAlpha = 0;
  } else if (maxPts === 0) {
    spawnSparks(impactX, impactY, 8); joust.shakeAmt = 3;
  } else if (maxPts <= 2) {
    spawnSparks(impactX, impactY, 18); spawnSplinters(impactX, impactY, 14);
    joust.shakeAmt = 8; joust.flashAlpha = 0.3;
  } else if (maxPts <= 5) {
    spawnSparks(impactX, impactY, 35); spawnSplinters(impactX, impactY, 28);
    joust.shakeAmt = 14; joust.flashAlpha = 0.6;
  } else {
    spawnSparks(impactX, impactY, 50); spawnSplinters(impactX, impactY, 35);
    joust.shakeAmt = 20; joust.flashAlpha = 0.9;
  }

  // BREAKABLE LANCE LOGIC 
  const baseBreakProb = 0.40;
  const b1 = k1.abilityAttackT > 0 ? baseBreakProb * 1.5 : baseBreakProb;
  const b2 = k2.abilityAttackT > 0 ? baseBreakProb * 1.5 : baseBreakProb;

  if (h1.type !== 'miss' && h1.type !== 'attaint' && Math.random() < b1) {
    k1.lanceIntact = false; k1.lanceStub = true;
    spawnBrokenLance(impactX, impactY, 'left');
  }
  if (h2.type !== 'miss' && h2.type !== 'attaint' && Math.random() < b2) {
    k2.lanceIntact = false; k2.lanceStub = true;
    spawnBrokenLance(impactX, impactY, 'right');
  }

  const totalImpactSpeed = k1.speed + k2.speed;
  
  // RPS Synergy: Attack > Speed (Scales with Tier: 30% + Tier*10%)
  let dmgMult1 = Math.min(2.2, totalImpactSpeed / 4.5);
  let dmgMult2 = Math.min(2.2, totalImpactSpeed / 4.5);
  
  if (k1.abilityAttackT > 0 && k2.abilityHorseT > 0) {
    const tierA1 = k1.equipStats.lance?.tier || 1;
    dmgMult1 *= (1.3 + tierA1 * 0.1);
    knightSay(k1, `¡CASTIGAR T${tierA1}!`, 'prominent');
  }
  if (k2.abilityAttackT > 0 && k1.abilityHorseT > 0) {
    const tierA2 = k2.equipStats.lance?.tier || 1;
    dmgMult2 *= (1.3 + tierA2 * 0.1);
    knightSay(k2, `¡CASTIGAR T${tierA2}!`, 'prominent');
  }

  applyHitEffect(h1, k2, dmgMult1);
  applyHitEffect(h2, k1, dmgMult2);

  if (h1.type === 'unhorse') audio.playFanfareUnhorse();

  joust.stunEvent = null;
  const stunBefore1 = k1.stunned;
  const stunBefore2 = k2.stunned;
  if (!stunBefore2 && k2.stunned) joust.stunEvent = k2.name;
  else if (!stunBefore1 && k1.stunned) joust.stunEvent = k1.name;

  if (h1.pts > 0) {
    spawnBlood(k2.x, k2.y, Math.min(h1.pts * 4, 22));
    spawnGroundBlood(k2.x, k2.y, Math.min(Math.ceil(h1.pts * 1.2), 7));
  }
  if (h2.pts > 0) {
    spawnBlood(k1.x, k1.y, Math.min(h2.pts * 4, 22));
    spawnGroundBlood(k1.x, k1.y, Math.min(Math.ceil(h2.pts * 1.2), 7));
  }
  if (maxPts >= 2) spawnGroundSplinters(impactX, impactY, 4 + Math.min(maxPts, 7));
}

export function applyHitEffect(hit, defender, damageMult = 1.0) {
  const s = defender.side === 'left' ? -1 : 1;
  switch (hit.type) {
    case 'arm':      defender.wobble = 0.08 * s; defender.wobbleDecay = 0.015; break;
    case 'shield':   defender.wobble = 0.12 * s; defender.wobbleDecay = 0.012; break;
    case 'helmet':   defender.wobble = 0.22 * s; defender.wobbleDecay = 0.010; break;
    case 'lanceTip': defender.wobble = 0.15 * s; defender.wobbleDecay = 0.012; break;
    case 'unhorse':  
      defender.fallen = true; 
      defender.hp = 0;
      defender.speed *= 0.2;
      defender.tilt = 0.4 * s;
      defender.wobble = 0.6 * s;
      break;
  }

  const baseDmg = HP_DAMAGE[hit.type] || 0;
  if (baseDmg > 0) {
    let effectiveDef = defender.def;
    let finalDmgMult = damageMult;

    if (defender.abilityShieldT > 0) {
      effectiveDef += 8;
      finalDmgMult *= 0.5;
    }

    const defFactor = Math.max(0.3, 1 - (effectiveDef - 5) * 0.05);
    const dmg = Math.max(1, Math.round(baseDmg * defFactor * finalDmgMult));
    defender.hp = Math.max(0, defender.hp - dmg);

    if (defender.hp <= 0) {
      defender.stunned = true;
      defender.stunRounds = 99;
    }

    const markX = s * (6 + Math.random() * 16);
    const markY = -10 + Math.random() * 30;
    if (defender.bloodMarks.length < 10) {
      defender.bloodMarks.push({ x: markX, y: markY, r: 2 + Math.random() * 3 });
    }
  }

  let stunChance = 0;
  if (hit.type === 'helmet')   stunChance = 0.30;
  else if (hit.type === 'lanceTip') stunChance = 0.20;
  const hpPct = defender.hp / defender.maxHp;
  if (hpPct < 0.50) stunChance += 0.15;
  if (hpPct < 0.25) stunChance += 0.20;
  
  if (defender.abilityShieldT > 0) stunChance = 0;

  // RPS Synergy: Defense > Attack (Recoil Stun) - Scales with Tier
  const attacker = (defender === joust.k1) ? joust.k2 : joust.k1;
  if (defender.abilityShieldT > 0 && attacker.abilityAttackT <= 0 && attacker.abilityHorseT <= 0) {
    const tierS = defender.equipStats.shield?.tier || 1;
    attacker.stunned = true;
    attacker.stunRounds = (tierS <= 2) ? 1 : (tierS <= 4 ? 2 : 3);
    knightSay(defender, `¡CONTRA-T${tierS}!`, 'prominent');
  }

  if (stunChance > 0 && !defender.stunned && Math.random() < stunChance) {
    defender.stunned = true;
    const rnd = Math.random();
    if (rnd < 0.60) defender.stunRounds = 1;
    else if (rnd < 0.90) defender.stunRounds = 2;
    else defender.stunRounds = 3;
  }
}
