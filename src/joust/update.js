// ══════════════════════════════════════
// BUCLE DE ACTUALIZACIÓN DE LA JUSTA
// ══════════════════════════════════════

import { TRACK_TOP, TRACK_BOT, HORSE_H, MAX_VENIDAS } from './constants.js';
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

  // Countdown del aturdimiento
  for (const k of [k1, k2]) {
    if (k && k.stunned && k.stunTimer > 0) {
      k.stunTimer--;
      if (k.stunTimer <= 0) k.stunned = false;
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

  // Squires always track their knight
  updateSquireTracking(joust.squire1, k1);
  updateSquireTracking(joust.squire2, k2);

  // ── CHARGE ──
  if (joust.subPhase === 'charge') {
    const k1Acc = k1.stunned ? 0.032 : 0.08;
    const k2Acc = k2.stunned ? 0.032 : 0.08;
    const k1Cap = k1.stunned ? k1.maxSpeed * 0.42 : k1.maxSpeed;
    const k2Cap = k2.stunned ? k2.maxSpeed * 0.42 : k2.maxSpeed;
    k1.speed = Math.min(k1.speed + k1Acc, k1Cap);
    k2.speed = Math.min(k2.speed + k2Acc, k2Cap);

    k1.y += k1.speed * k1.baseDir;
    k2.y += k2.speed * k2.baseDir;

    if (joust.t % 3 === 0) {
      spawnDust(k1.x, k1.y - k1.baseDir * (HORSE_H/2 + 4));
      spawnDust(k2.x, k2.y - k2.baseDir * (HORSE_H/2 + 4));
    }
    if (joust.t % 16 === 0) {
      spawnHoofPrint(k1);
      spawnHoofPrint(k2);
    }

    if (k1.baseDir === 1 && k1.y >= k2.y - 20) {
      resolveClash(); setSubPhase('clash');
    } else if (k1.baseDir === -1 && k1.y <= k2.y + 20) {
      resolveClash(); setSubPhase('clash');
    }
  }

  // ── CLASH ──
  if (joust.subPhase === 'clash') {
    k1.y += k1.speed * k1.baseDir * 0.5;
    k2.y += k2.speed * k2.baseDir * 0.5;

    if (k1.fallen && joust.phaseT > 3) {
      k1.tilt += 0.05 * (k1.side === 'left' ? -1 : 1);
      k1.x += (k1.side === 'left' ? -1.5 : 1.5);
    }
    if (k2.fallen && joust.phaseT > 3) {
      k2.tilt += 0.05 * (k2.side === 'left' ? -1 : 1);
      k2.x += (k2.side === 'left' ? -1.5 : 1.5);
    }

    if (joust.phaseT > 20) setSubPhase('pass');
  }

  // ── PASS ──
  if (joust.subPhase === 'pass') {
    for (const k of [k1, k2]) {
      if (k.fallen) {
        if (joust.phaseT < 50) {
          k.tilt += 0.02 * (k.side === 'left' ? -1 : 1);
          k.x += (k.side === 'left' ? -0.5 : 0.5);
        }
        continue;
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

      if (k.speed > 0.5 && joust.t % 4 === 0) {
        spawnDust(k.x, k.y - k.baseDir * (HORSE_H / 2 + 4));
      }
      if (k.speed > 0.5 && joust.t % 16 === 0) {
        spawnHoofPrint(k);
      }
    }

    const k1Done = k1.fallen || k1.speed < 0.08;
    const k2Done = k2.fallen || k2.speed < 0.08;

    if (k1Done && k2Done && joust.phaseT > 20) {
      if (k1.fallen || k2.fallen) {
        setSubPhase('result');
      } else if (joust.venida >= MAX_VENIDAS) {
        setSubPhase('result');
      } else if (!k1.lanceIntact || !k2.lanceIntact) {
        setSubPhase('squire');
        if (!k1.lanceIntact && k1.squireEff > 0) activateSquire(joust.squire1, k1);
        if (!k2.lanceIntact && k2.squireEff > 0) activateSquire(joust.squire2, k2);
      } else {
        setSubPhase('turn');
      }
    }
  }

  // ── SQUIRE ──
  if (joust.subPhase === 'squire') {
    updateSquireDelivery(joust.squire1, k1);
    updateSquireDelivery(joust.squire2, k2);

    if (joust.phaseT > 60) {
      if (!k1.lanceIntact && joust.squire1.phase === 'watching') {
        k1.lanceIntact = true; k1.lanceStub = false;
      }
      if (!k2.lanceIntact && joust.squire2.phase === 'watching') {
        k2.lanceIntact = true; k2.lanceStub = false;
      }
    }

    const sq1Done = joust.squire1.phase === 'watching';
    const sq2Done = joust.squire2.phase === 'watching';
    if ((sq1Done && sq2Done && k1.lanceIntact && k2.lanceIntact) || joust.phaseT > 160) {
      k1.lanceIntact = true; k1.lanceStub = false;
      k2.lanceIntact = true; k2.lanceStub = false;
      joust.squire1.phase = 'watching';
      joust.squire2.phase = 'watching';
      setSubPhase('turn');
    }
  }

  // ── TURN ──
  if (joust.subPhase === 'turn') {
    if (joust.phaseT === 1) {
      k1.targetRotation = k1.rotation + Math.PI;
      k2.targetRotation = k2.rotation + Math.PI;
    }
    if (joust.phaseT > 70) {
      k1.baseDir *= -1;
      k2.baseDir *= -1;
      k1.rotation = k1.targetRotation;
      k2.rotation = k2.targetRotation;
      setSubPhase('pause');
    }
  }

  // ── PAUSE ──
  if (joust.subPhase === 'pause') {
    if (joust.phaseT > 30) {
      if (joust.venida >= MAX_VENIDAS) {
        setSubPhase('result');
      } else {
        joust.venida++;
        joust.k1Hit = null;
        joust.k2Hit = null;
        k1.speed = 0;
        k2.speed = 0;
        setSubPhase('charge');
      }
    }
  }

  // ── RESULT ── (handled by overlay button via gameLoop)

  updateParticles();
}
