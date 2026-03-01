// ══════════════════════════════════════
// LÓGICA DEL ESCUDERO
// ══════════════════════════════════════

import { TRACK_TOP, TRACK_BOT, TRACK_X, TRACK_W } from './constants.js';

export function updateSquireTracking(sq, knight) {
  if (!sq || !knight) return;

  // Si el caballero está esperando lanza, el escudero se acerca
  if (!knight.lanceIntact && knight.phase === 'ready' && knight.hp > 0) {
    const tx = knight.x + (knight.side === 'left' ? 12 : -12);
    const ty = knight.y;
    sq.x += (tx - sq.x) * 0.15;
    sq.y += (ty - sq.y) * 0.15;
    sq.facingTrack = false;
  } else {
    // Comportamiento normal: seguir al caballero desde la valla
    const targetY = Math.max(TRACK_TOP + 20, Math.min(TRACK_BOT - 20, knight.y));
    sq.y += (targetY - sq.y) * 0.04;
    sq.x += (sq.homeX - sq.x) * 0.1;
    sq.facingTrack = true;
  }
}

// updateSquireDelivery is now obsolete as loading is handled in updateKnight
// but we keep it for API compatibility if needed, or empty it.
export function updateSquireDelivery(sq, knight) {}

export function activateSquire(sq, knight) {
  // Manual activation no longer strictly needed but could trigger a state if desired
}
