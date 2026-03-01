// ══════════════════════════════════════
// LÓGICA DEL ESCUDERO
// ══════════════════════════════════════

import { TRACK_TOP, TRACK_BOT } from './constants.js';

export function updateSquireTracking(sq, knight) {
  if (!sq || !knight) return;
  if (sq.phase === 'watching') {
    const targetY = Math.max(TRACK_TOP + 20, Math.min(TRACK_BOT - 20, knight.y));
    sq.y += (targetY - sq.y) * 0.04;
    sq.x += (sq.homeX - sq.x) * 0.1;
  }
}

export function updateSquireDelivery(sq, knight) {
  if (!sq || sq.phase === 'watching') return;

  if (sq.phase === 'running_in') {
    const dx = knight.x - sq.x;
    const dy = knight.y - sq.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) {
      sq.phase = 'handoff';
      sq.timer = 0;
    } else {
      const spd = sq.speed * 2.2;
      sq.x += (dx / dist) * spd;
      sq.y += (dy / dist) * spd;
    }
  } else if (sq.phase === 'handoff') {
    sq.x += (knight.x - sq.x) * 0.3;
    sq.y += (knight.y - sq.y) * 0.3;
    sq.timer++;
    if (sq.timer > 25) {
      knight.lanceIntact = true;
      knight.lanceStub = false;
      sq.phase = 'running_out';
    }
  } else if (sq.phase === 'running_out') {
    const dx = sq.homeX - sq.x;
    if (Math.abs(dx) < 4) {
      sq.phase = 'watching';
    } else {
      sq.x += (dx > 0 ? 1 : -1) * sq.speed * 2.5;
    }
  }
}

export function activateSquire(sq, knight) {
  sq.phase = 'running_in';
  sq.targetX = knight.x;
}
