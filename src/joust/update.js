// ══════════════════════════════════════
// BUCLE DE ACTUALIZACIÓN DE LA JUSTA
// ══════════════════════════════════════

import { TRACK_TOP, TRACK_BOT, HORSE_H, MAX_VENIDAS, DELIVERY_ZONE_PCT, W, H } from './constants.js';
import { joust, setSubPhase } from './state.js';
import { spawnDust, spawnHoofPrint, updateParticles } from './particles.js';
import { resolveClash } from './physics.js';
import { updateSquireTracking, updateSquireDelivery, activateSquire } from './squire.js';
import { knightSay, updateKnightSpeech } from './dialogue.js';
import { audio } from '../audio.js';
import { handleAbilityTrigger } from './abilities.js';

export function updateJoust() {
  const k1 = joust.k1, k2 = joust.k2;
  updateParticles(); 

  // Handle Music Volume based on UI activity
  const uiOverlay = document.getElementById('joust-overlay');
  const isUIActive = (uiOverlay && uiOverlay.innerHTML.trim() !== "") || joust.subPhase === 'result';
  if (isUIActive) {
    audio.setMusicVolume(0.15); // Lower during menus
  } else {
    audio.setMusicVolume(0.45); // Higher during action
  }

  // Toggle UI Bar visibility
  const bar = document.getElementById('joust-abilities');
  if (bar) {
    const shouldShow = joust.active || joust.subPhase === 'result';
    bar.classList.toggle('show', !!shouldShow);
  }
  
  if (!joust.active) return;
  joust.t++;
  joust.phaseT++;

  // AI Logic
  if (k1 && k2 && !k2.fallen && !k2.stunned && k2.frozenT <= 0) {
    if (k1.abilityActive && k2.aiReactionT === undefined) {
      k2.aiReactionT = 15 + Math.random() * 25; 
    }
    
    if (k2.aiReactionT > 0) {
      k2.aiReactionT--;
    } else {
      updateAIAbilities(k2, k1);
    }
  } else if (k2) {
    k2.aiReactionT = undefined;
  }

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

  // Update Ability Timers
  [k1, k2].forEach(k => {
    if (k.abilityShieldT > 0) k.abilityShieldT = Math.max(0, k.abilityShieldT - 16.6);
    if (k.abilityAttackT > 0) k.abilityAttackT = Math.max(0, k.abilityAttackT - 16.6);
    if (k.abilityHorseT > 0)  k.abilityHorseT  = Math.max(0, k.abilityHorseT - 16.6);
    if (k.abilitySpecialT > 0) k.abilitySpecialT = Math.max(0, k.abilitySpecialT - 16.6);

    if (k.cdShield > 0) k.cdShield = Math.max(0, k.cdShield - 16.6);
    if (k.cdAttack > 0) k.cdAttack = Math.max(0, k.cdAttack - 16.6);
    if (k.cdHorse > 0)  k.cdHorse  = Math.max(0, k.cdHorse - 16.6);
    if (k.cdSpecial > 0) k.cdSpecial = Math.max(0, k.cdSpecial - 16.6);

    k.abilityActive = (k.abilityShieldT > 0 || k.abilityAttackT > 0 || k.abilityHorseT > 0 || k.abilitySpecialT > 0);
    if (k.frozenT > 0) k.frozenT = Math.max(0, k.frozenT - 16.6);
  });

  if (k1 && k1.fallen) k1.speechText = '';
  if (k2 && k2.fallen) k2.speechText = '';
  
  updateKnightSpeech(k1);
  updateKnightSpeech(k2);

  if (joust.t % 300 === 0) {
    [k1, k2].forEach(k => {
      if (k.hp > 0 && !k.fallen) {
        if (k.hp < 30) knightSay(k, 'low_hp');
        else if (k.stunned) knightSay(k, 'stunned');
        else if (Math.random() < 0.3) knightSay(k, 'taunt');
      }
    });
  }

  // CLASH DETECTION
  if (joust.subPhase !== 'clash' && joust.subPhase !== 'result' && !k1.fallen && !k2.fallen) {
    const r1 = k1.lanceIntact ? 95 : 25;
    const r2 = k2.lanceIntact ? 95 : 25;
    const k1Approaching = (k1.baseDir === 1 && k1.y < k2.y) || (k1.baseDir === -1 && k1.y > k2.y);
    const k2Approaching = (k2.baseDir === 1 && k2.y < k1.y) || (k2.baseDir === -1 && k2.y > k1.y);
    const k1FacingFront = Math.abs(Math.sin(k1.rotation)) < 0.5; 
    const k2FacingFront = Math.abs(Math.sin(k2.rotation)) < 0.5;

    let clashTriggered = false;
    if (k1FacingFront && k2FacingFront && (k1.phase === 'charge' || k2.phase === 'charge')) {
      if (k1Approaching) {
        const dist = k1.baseDir === 1 ? (k2.y - k1.y) : (k1.y - k2.y);
        if (dist <= r1) clashTriggered = true;
      }
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
        const needsSquire1 = !k1.lanceIntact && k1.squireEff > 0;
        const needsSquire2 = !k2.lanceIntact && k2.squireEff > 0;
        if ((needsSquire1 && !k1.lanceIntact) || (needsSquire2 && !k2.lanceIntact)) {
           if (joust.subPhase !== 'squire') {
             setSubPhase('squire');
             if (needsSquire1) activateSquire(joust.squire1, k1);
             if (needsSquire2) activateSquire(joust.squire2, k2);
           }
           const sq1Ready = !needsSquire1 || (joust.squire1.phase === 'watching' && k1.lanceIntact);
           const sq2Ready = !needsSquire2 || (joust.squire2.phase === 'watching' && k2.lanceIntact);
           if (sq1Ready && sq2Ready) startNextVenida();
        } else {
          startNextVenida();
        }
      }
    }
  }
}

function updateAIAbilities(k, opponent) {
  if (!k || !opponent || k.abilityActive || k.fallen) return;
  const distY = Math.abs(k.y - opponent.y);
  if (k.hp < 35 && k.cdSpecial <= 0 && k.equipStats.armor?.special === 'heal') {
    handleAbilityTrigger('btn-especial', k);
    return;
  }
  if (opponent.abilityAttackT > 0 && k.cdShield <= 0 && distY < 250) {
    handleAbilityTrigger('btn-defensa', k);
    return;
  }
  if (opponent.abilityShieldT > 0 && k.cdHorse <= 0 && distY < 250) {
    handleAbilityTrigger('btn-espolear', k);
    return;
  }
  if (opponent.abilityHorseT > 0 && k.cdAttack <= 0 && distY < 200) {
    handleAbilityTrigger('btn-ataque', k);
    return;
  }
  if (k.equipStats.armor?.special === 'freeze' && k.cdSpecial <= 0) {
    if (distY < 250 && (opponent.abilityActive || Math.random() < 0.2)) {
      handleAbilityTrigger('btn-especial', k);
      return;
    }
  }
  if (k.cdShield <= 0 && k.hp < 60 && distY < 180) {
    handleAbilityTrigger('btn-defensa', k);
    return;
  }
  if (k.cdAttack <= 0 && distY < 120) {
    handleAbilityTrigger('btn-ataque', k);
    return;
  }
  if (k.cdHorse <= 0 && k.phase === 'charge' && k.speed < k.maxSpeed) {
    const trackLen = TRACK_BOT - TRACK_TOP;
    const distFromStart = k.baseDir === 1 ? (k.y - TRACK_TOP) : (TRACK_BOT - k.y);
    if (distFromStart < trackLen * 0.4) {
      handleAbilityTrigger('btn-espolear', k);
      return;
    }
  }
}

function updateKnight(k, sq) {
  if (!k) return;
  if (k.frozenT > 0) {
    audio.updateGallop(0);
    return;
  }
  k.phaseT++;
  if (k.stunned || k.speed < k.maxSpeed * 0.7) k.guard = 'low'; else k.guard = 'high';

  switch (k.phase) {
    case 'ready':
      if (!k.lanceIntact) {
        if (joust.t % 120 === 0 && Math.random() < 0.4) knightSay(k, 'waiting');
        const deliverySpeed = (0.015 + (k.squireEff / 10) * 0.035) * 0.8;
        k.lanceLoading = Math.min(1, k.lanceLoading + deliverySpeed);
        if (k.lanceLoading >= 1) { k.lanceIntact = true; k.lanceStub = false; }
      }
      const canCharge = k.lanceIntact && (joust.subPhase === 'charge' || joust.subPhase === 'pass' || joust.subPhase === 'turn');
      if (canCharge) { k.phase = 'charge'; k.phaseT = 0; }
      break;

    case 'charge':
      let abilitySpeedBoost = k.abilityHorseT > 0 ? 1.8 : 1.0;
      const trackLen = TRACK_BOT - TRACK_TOP;
      const distFromStart = k.baseDir === 1 ? (k.y - TRACK_TOP) : (TRACK_BOT - k.y);
      const progress = Math.max(0, Math.min(1, distFromStart / trackLen));
      const baseAcc = k.stunned ? 0.075 : 0.18;
      const currentAcc = (baseAcc + (progress * 0.12)) * (k.abilityHorseT > 0 ? 1.5 : 1.0); 
      const fatigueFactor = Math.max(0.4, 1 - (k.fatigue / 100) * 0.5);
      const cap = (k.stunned ? k.maxSpeed * 0.42 : k.maxSpeed) * fatigueFactor * abilitySpeedBoost;
      k.speed = Math.min(k.speed + currentAcc, cap);
      k.y += k.speed * k.baseDir;
      audio.updateGallop(k.speed);
      const trackLimit = k.baseDir === 1 ? TRACK_BOT - 30 : TRACK_TOP + 30;
      const reachedLimit = k.baseDir === 1 ? (k.y >= trackLimit) : (k.y <= trackLimit);
      if (reachedLimit && joust.subPhase === 'charge') { k.phase = 'pass'; k.phaseT = 0; }
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
      if (distToEnd > 80) k.speed = Math.max(k.maxSpeed * 0.6, k.speed - 0.008);
      else k.speed = Math.max(0, k.speed - 0.07);
      k.y += k.speed * k.baseDir;
      k.y = Math.max(TRACK_TOP + 10, Math.min(TRACK_BOT - 10, k.y));
      if (k.speed > 0.5 && joust.t % 4 === 0) spawnDust(k.x, k.y - k.baseDir * (HORSE_H / 2 + 4));
      if (k.speed > 0.5 && joust.t % 16 === 0) spawnHoofPrint(k);
      audio.updateGallop(k.speed);
      if (k.speed < 0.08) { k.phase = 'turn'; k.phaseT = 0; k.targetRotation = k.rotation + Math.PI; }
      break;

    case 'turn':
      if (k.phaseT > 70) {
        k.baseDir *= -1;
        k.rotation = k.targetRotation;
        k.phase = 'ready';
        k.phaseT = 0;
        if (k.stunned && k.hp > 0) { k.stunRounds--; if (k.stunRounds <= 0) k.stunned = false; }
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
