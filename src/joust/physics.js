// ══════════════════════════════════════
// FÍSICA DE COLISIÓN, HP Y ATURDIMIENTO
// ══════════════════════════════════════

import { HIT_TABLE, HP_DAMAGE, LANE_X } from './constants.js';
import { joust } from './state.js';
import { spawnSparks, spawnSplinters, spawnBlood, spawnGroundBlood, spawnGroundSplinters } from './particles.js';
import { audio } from '../audio.js';

export function rollHit(strBonus, defBonus) {
  let r = Math.random();
  const strFactor = 1 + (strBonus - 5) * 0.04;
  const defFactor = 1 + (defBonus - 5) * 0.04;

  const adjusted = HIT_TABLE.map(h => {
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
  let str = k.str;
  const hpPct = k.hp / k.maxHp;
  if (hpPct < 0.25) str -= 3;
  else if (hpPct < 0.50) str -= 2;
  else if (hpPct < 0.75) str -= 1;
  if (k.stunned) str -= 2;
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
    // Determine who can actually reach whom
    const r1 = k1.lanceIntact ? 95 : 25;
    const r2 = k2.lanceIntact ? 95 : 25;

    // K1's hit attempt
    if (k2.guard === 'low' && k1.guard === 'high' && k1.lanceIntact) {
      h1 = HIT_TABLE.find(h => h.type === 'unhorse');
    } else {
      h1 = (k1.lanceIntact && distY <= r1) ? rollHit(getEffectiveStr(k1), k2.def) : HIT_TABLE.find(h => h.type === 'miss');
    }

    // K2's hit attempt
    if (k1.guard === 'low' && k2.guard === 'high' && k2.lanceIntact) {
      h2 = HIT_TABLE.find(h => h.type === 'unhorse');
    } else {
      h2 = (k2.lanceIntact && distY <= r2) ? rollHit(getEffectiveStr(k2), k1.def) : HIT_TABLE.find(h => h.type === 'miss');
    }
  }

  joust.k1Hit = h1;
  joust.k2Hit = h2;
  joust.k1Points += h1.pts;
  joust.k2Points += h2.pts;
  joust.history.push({ venida: joust.venida, k1Hit: h1, k2Hit: h2 });

  const impactX = LANE_X;
  // Visual impact point should be at the defender's center for more realism
  let impactY = (k1.y + k2.y) / 2;
  if (h1.pts > h2.pts) impactY = k2.y;
  else if (h2.pts > h1.pts) impactY = k1.y;
  
  const maxPts = Math.max(h1.pts, h2.pts);

  // Audio Clash
  audio.playClash(maxPts >= 10 ? 1.5 : (maxPts >= 3 ? 1.0 : 0.5));
  
  // Sonido Metálico Adicional
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

  // BREAKABLE LANCE LOGIC (40% probability if it was a hit)
  const breakProb = 0.40;
  if (h1.type !== 'miss' && h1.type !== 'attaint' && Math.random() < breakProb) {
    k1.lanceIntact = false; k1.lanceStub = true;
  }
  if (h2.type !== 'miss' && h2.type !== 'attaint' && Math.random() < breakProb) {
    k2.lanceIntact = false; k2.lanceStub = true;
  }

  const stunBefore1 = k1.stunned;
  const stunBefore2 = k2.stunned;
  const totalImpactSpeed = k1.speed + k2.speed;
  // Damage multiplier with a max cap of 2.2x to maintain balance
  const damageMult = Math.min(2.2, totalImpactSpeed / 4.5);

  applyHitEffect(h1, k2, damageMult);
  applyHitEffect(h2, k1, damageMult);

  // Check for unhorse fanfare (if player unhorses enemy)
  if (h1.type === 'unhorse') audio.playFanfareUnhorse();

  joust.stunEvent = null;
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
    const defFactor = Math.max(0.3, 1 - (defender.def - 5) * 0.05);
    const dmg = Math.max(1, Math.round(baseDmg * defFactor * damageMult));
    defender.hp = Math.max(0, defender.hp - dmg);

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
  if (stunChance > 0 && !defender.stunned && Math.random() < stunChance) {
    defender.stunned = true;
    const rnd = Math.random();
    if (rnd < 0.60) defender.stunRounds = 1;
    else if (rnd < 0.90) defender.stunRounds = 2;
    else defender.stunRounds = 3;
  }
}
