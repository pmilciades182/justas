// ══════════════════════════════════════
// BUCLE DE ACTUALIZACIÓN DE LA JUSTA
// ══════════════════════════════════════

import { TRACK_TOP, TRACK_BOT, HORSE_H, MAX_VENIDAS, DELIVERY_ZONE_PCT } from './constants.js';
import { joust, setSubPhase } from './state.js';
import { spawnDust, spawnHoofPrint, updateParticles } from './particles.js';
import { resolveClash } from './physics.js';
import { updateSquireTracking, updateSquireDelivery, activateSquire } from './squire.js';
import { knightSay, updateKnightSpeech } from './dialogue.js';
import { audio } from '../audio.js';

export function updateJoust() {
  const k1 = joust.k1, k2 = joust.k2;
  updateParticles(); // Always update particles (confetti, blood, etc)
  
  if (!joust.active) return;
  joust.t++;
  joust.phaseT++;

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

  // Update Ability Timers (assuming ~60fps, so ~16.6ms per frame)
  [k1, k2].forEach(k => {
    if (k.abilityShieldT > 0) {
      k.abilityShieldT = Math.max(0, k.abilityShieldT - 16.6);
    }
  });
  
  // Robustness: Fallen knights stop speaking
  if (k1.fallen) k1.speechText = '';
  if (k2.fallen) k2.speechText = '';
  
  updateKnightSpeech(k1);
  updateKnightSpeech(k2);

  // Trigger random dialogues
  if (joust.t % 300 === 0) {
    [k1, k2].forEach(k => {
      if (k.hp > 0 && !k.fallen) {
        if (k.hp < 30) knightSay(k, 'low_hp');
        else if (k.stunned) knightSay(k, 'stunned');
        else if (Math.random() < 0.3) knightSay(k, 'taunt');
      }
    });
  }

  // CLASH DETECTION (Tip-to-Center Precision with Orientation Check)
  if (joust.subPhase !== 'clash' && joust.subPhase !== 'result' && !k1.fallen && !k2.fallen) {
    const lanceReach = 95;
    const bodyReach = 25;
    
    const r1 = k1.lanceIntact ? lanceReach : bodyReach;
    const r2 = k2.lanceIntact ? lanceReach : bodyReach;

    // Approaching check: must be moving towards each other
    const k1Approaching = (k1.baseDir === 1 && k1.y < k2.y) || (k1.baseDir === -1 && k1.y > k2.y);
    const k2Approaching = (k2.baseDir === 1 && k2.y < k1.y) || (k2.baseDir === -1 && k2.y > k1.y);

    // Orientation check: rotation must match direction (0/PI with small tolerance for wobble)
    const k1FacingFront = Math.abs(Math.sin(k1.rotation)) < 0.5; 
    const k2FacingFront = Math.abs(Math.sin(k2.rotation)) < 0.5;

    let clashTriggered = false;

    if (k1FacingFront && k2FacingFront && (k1.phase === 'charge' || k2.phase === 'charge')) {
      // Check if K1's lance/body reaches K2's center
      if (k1Approaching) {
        const dist = k1.baseDir === 1 ? (k2.y - k1.y) : (k1.y - k2.y);
        if (dist <= r1) clashTriggered = true;
      }
      
      // Check if K2's lance/body reaches K1's center
      if (!clashTriggered && k2Approaching) {
        const dist = k2.baseDir === 1 ? (k1.y - k2.y) : (k2.y - k1.y);
        if (dist <= r2) clashTriggered = true;
      }
    }
    
    if (clashTriggered) {
      resolveClash();
      setSubPhase('clash');
      k1.phase = 'clash'; k1.phaseT = 0;
      k2.phase = 'clash'; k2.phaseT = 0;
    }
  }

  // Global Sync / Match Flow
  if (joust.subPhase === 'clash') {
    if (joust.phaseT > 80) {
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
        if (joust.t % 120 === 0 && Math.random() < 0.4) knightSay(k, 'waiting');
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
      // HORSE MECHANICS: Triple progressive acceleration based on position
      const trackLen = TRACK_BOT - TRACK_TOP;
      const distFromStart = k.baseDir === 1 ? (k.y - TRACK_TOP) : (TRACK_BOT - k.y);
      const progress = Math.max(0, Math.min(1, distFromStart / trackLen));
      
      const baseAcc = k.stunned ? 0.075 : 0.18;
      const currentAcc = baseAcc + (progress * 0.12); 
      
      // Fatigue affects max speed, but with a safety floor (min 40% of base maxSpeed)
      const fatigueFactor = Math.max(0.4, 1 - (k.fatigue / 100) * 0.5);
      const cap = (k.stunned ? k.maxSpeed * 0.42 : k.maxSpeed) * fatigueFactor;
      
      k.speed = Math.min(k.speed + currentAcc, cap);
      k.y += k.speed * k.baseDir;

      // Gallop sound update
      audio.updateGallop(k.speed);
      
      // MAXIMUM ADVANCE LIMIT (Past the other end) - Adjusted for high speed overlap
      const trackLimit = k.baseDir === 1 ? TRACK_BOT - 30 : TRACK_TOP + 30;
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

      // Gallop sound update during pass
      audio.updateGallop(k.speed);

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
