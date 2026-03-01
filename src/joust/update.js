// ══════════════════════════════════════
// BUCLE DE ACTUALIZACIÓN DE LA JUSTA
// ══════════════════════════════════════

import { TRACK_TOP, TRACK_BOT, HORSE_H, MAX_VENIDAS, DELIVERY_ZONE_PCT } from './constants.js';
import { joust, setSubPhase } from './state.js';
import { spawnDust, spawnHoofPrint, updateParticles } from './particles.js';
import { resolveClash } from './physics.js';
import { updateSquireTracking, updateSquireDelivery, activateSquire } from './squire.js';

export function updateJoust() {
  if (!joust.active) return;
  joust.t++;
  joust.phaseT++;

  const k1 = joust.k1, k2 = joust.k2;

  // Decay shake & flash
  if (joust.shakeAmt > 0.3) joust.shakeAmt *= 0.85; else joust.shakeAmt = 0;
  if (joust.flashAlpha > 0) joust.flashAlpha -= 0.045;

  // Decay wobble
  for (const k of [k1, k2]) {
    if (k && !k.fallen && Math.abs(k.wobble) > 0.001) {
      k.wobble *= (1 - k.wobbleDecay);
      if (Math.abs(k.wobble) < 0.002) k.wobble = 0;
    }
  }

  // Smooth rotation
  for (const k of [k1, k2]) {
    if (!k) continue;
    const diff = k.targetRotation - k.rotation;
    if (Math.abs(diff) > 0.01) {
      k.rotation += diff * 0.06;
    } else {
      k.rotation = k.targetRotation;
    }
  }

  // Update Squires
  updateSquireTracking(joust.squire1, k1);
  updateSquireTracking(joust.squire2, k2);

  // Individual Knight Logic
  updateKnight(k1, joust.squire1);
  updateKnight(k2, joust.squire2);

  // CLASH DETECTION (When they cross paths or meet)
  if (joust.subPhase !== 'clash' && joust.subPhase !== 'result' && !k1.fallen && !k2.fallen) {
    const distY = Math.abs(k1.y - k2.y);
    // Mandatory distance check: must be within lance range (~80px, using 60px for safety)
    const nearEnough = distY < 60;
    // Check if they have crossed each other's Y position
    const crossed = (k1.baseDir === 1) ? (k1.y >= k2.y) : (k1.y <= k2.y);
    
    if (nearEnough && crossed && (k1.phase === 'charge' || k2.phase === 'charge')) {
      resolveClash();
      setSubPhase('clash');
      k1.phase = 'clash'; k1.phaseT = 0;
      k2.phase = 'clash'; k2.phaseT = 0;
    }
  }

  // Global Sync / Match Flow
  if (joust.subPhase === 'clash') {
    if (joust.phaseT > 20) {
      setSubPhase('pass');
      if (!k1.fallen) { k1.phase = 'pass'; k1.phaseT = 0; }
      if (!k2.fallen) { k2.phase = 'pass'; k2.phaseT = 0; }
    }
  }

  if (joust.subPhase === 'pass' || joust.subPhase === 'squire') {
    const k1Done = k1.fallen || k1.phase === 'turn' || k1.phase === 'ready';
    const k2Done = k2.fallen || k2.phase === 'turn' || k2.phase === 'ready';

    if (k1Done && k2Done) {
      if (k1.fallen || k2.fallen || joust.venida >= MAX_VENIDAS) {
        setSubPhase('result');
      } else {
        // If lances are broken, we might be in 'squire' subPhase
        const needsSquire1 = !k1.lanceIntact && k1.squireEff > 0;
        const needsSquire2 = !k2.lanceIntact && k2.squireEff > 0;
        
        if ((needsSquire1 && !k1.lanceIntact) || (needsSquire2 && !k2.lanceIntact)) {
           if (joust.subPhase !== 'squire') {
             setSubPhase('squire');
             if (needsSquire1) activateSquire(joust.squire1, k1);
             if (needsSquire2) activateSquire(joust.squire2, k2);
           }
           
           // Check if squires finished
           const sq1Ready = !needsSquire1 || (joust.squire1.phase === 'watching' && k1.lanceIntact);
           const sq2Ready = !needsSquire2 || (joust.squire2.phase === 'watching' && k2.lanceIntact);
           
           if (sq1Ready && sq2Ready) {
             startNextVenida();
           }
        } else {
          startNextVenida();
        }
      }
    }
  }

  updateParticles();
}

function updateKnight(k, sq) {
  if (!k) return;
  k.phaseT++;

  // GUARD STATUS: High guard only if enough speed and not stunned
  // Guardia Baja if: stunned OR speed < 70% of max
  if (k.stunned || k.speed < k.maxSpeed * 0.7) {
    k.guard = 'low';
  } else {
    k.guard = 'high';
  }

  switch (k.phase) {
    case 'ready':
      // Knights MUST wait for delivery if they don't have a lance
      if (!k.lanceIntact) {
        // Squire efficiency affects delivery speed - Reduced by 20%
        const deliverySpeed = (0.015 + (k.squireEff / 10) * 0.035) * 0.8;
        k.lanceLoading = Math.min(1, k.lanceLoading + deliverySpeed);
        if (k.lanceLoading >= 1) {
          k.lanceIntact = true;
          k.lanceStub = false;
        }
      }

      // Transition to charge only if we have a lance and match is active
      const canCharge = k.lanceIntact && (joust.subPhase === 'charge' || joust.subPhase === 'pass' || joust.subPhase === 'turn');
      if (canCharge) {
         k.phase = 'charge';
         k.phaseT = 0;
      }
      break;

    case 'charge':
      const acc = k.stunned ? 0.032 : 0.08;
      const cap = k.stunned ? k.maxSpeed * 0.42 : k.maxSpeed;
      k.speed = Math.min(k.speed + acc, cap);
      k.y += k.speed * k.baseDir;
      
      // MAXIMUM ADVANCE LIMIT (Past the other end)
      const trackLimit = k.baseDir === 1 ? TRACK_BOT - 40 : TRACK_TOP + 40;
      const reachedLimit = k.baseDir === 1 ? (k.y >= trackLimit) : (k.y <= trackLimit);
      if (reachedLimit && joust.subPhase === 'charge') {
         k.phase = 'pass';
         k.phaseT = 0;
      }

      if (joust.t % 3 === 0) spawnDust(k.x, k.y - k.baseDir * (HORSE_H/2 + 4));
      if (joust.t % 16 === 0) spawnHoofPrint(k);
      break;

    case 'clash':
      k.y += k.speed * k.baseDir * 0.5;
      if (k.fallen) {
        k.tilt += 0.05 * (k.side === 'left' ? -1 : 1);
        k.x += (k.side === 'left' ? -1.5 : 1.5);
      }
      break;

    case 'pass':
      if (k.fallen) {
        if (k.phaseT < 50) {
          k.tilt += 0.02 * (k.side === 'left' ? -1 : 1);
          k.x += (k.side === 'left' ? -0.5 : 0.5);
        }
        return;
      }
      const endY = k.baseDir === 1 ? TRACK_BOT - 25 : TRACK_TOP + 25;
      const distToEnd = Math.abs(endY - k.y);

      if (distToEnd > 80) {
        k.speed = Math.max(k.maxSpeed * 0.6, k.speed - 0.008);
      } else {
        k.speed = Math.max(0, k.speed - 0.07);
      }
      k.y += k.speed * k.baseDir;
      k.y = Math.max(TRACK_TOP + 10, Math.min(TRACK_BOT - 10, k.y));

      if (k.speed > 0.5 && joust.t % 4 === 0) spawnDust(k.x, k.y - k.baseDir * (HORSE_H / 2 + 4));
      if (k.speed > 0.5 && joust.t % 16 === 0) spawnHoofPrint(k);

      if (k.speed < 0.08) {
        k.phase = 'turn';
        k.phaseT = 0;
        k.targetRotation = k.rotation + Math.PI;
      }
      break;

    case 'turn':
      if (k.phaseT > 70) {
        k.baseDir *= -1;
        k.rotation = k.targetRotation;
        k.phase = 'ready';
        k.phaseT = 0;
        
        // Aturdimiento decrece al terminar de girar (fin de su venida)
        if (k.stunned) {
          k.stunRounds--;
          if (k.stunRounds <= 0) k.stunned = false;
        }
      }
      break;
  }
}

function startNextVenida() {
  joust.venida++;
  joust.k1Hit = null;
  joust.k2Hit = null;
  setSubPhase('charge');
}
