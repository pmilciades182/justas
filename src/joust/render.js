// ══════════════════════════════════════
// RENDERIZADO DEL CANVAS DE JUSTA
// ══════════════════════════════════════

import { drawJoustKnight, drawSquire } from '../knightDrawer.js';
import {
  ctx, W, H, LANE_X, TRACK_X, TRACK_W,
  COL,
  HORSE_W, HORSE_H, KNIGHT_BW, KNIGHT_BH, LANCE_LEN,
} from './constants.js';
import { joust } from './state.js';

export function drawJoust() {
  ctx.save();
  if (joust.shakeAmt > 0) {
    ctx.translate((Math.random()-0.5)*joust.shakeAmt, (Math.random()-0.5)*joust.shakeAmt);
  }
  ctx.clearRect(-20, -20, W+40, H+40);

  drawTrack();
  drawSpeedLines();
  drawParticles();

  drawSquire(ctx, joust.squire1, joust.t, COL, joust.t);
  drawSquire(ctx, joust.squire2, joust.t, COL, joust.t);

  drawJoustKnight(ctx, joust.k1, joust.t, COL, LANE_X, HORSE_W, HORSE_H, KNIGHT_BW, KNIGHT_BH, LANCE_LEN);
  drawJoustKnight(ctx, joust.k2, joust.t, COL, LANE_X, HORSE_W, HORSE_H, KNIGHT_BW, KNIGHT_BH, LANCE_LEN);

  if (joust.flashAlpha > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, joust.flashAlpha)})`;
    ctx.fillRect(-20, -20, W+40, H+40);
  }

  drawJoustUI();
  ctx.restore();
}

function drawTrack() {
  ctx.fillStyle = '#2d5a27';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = COL.dirt;
  ctx.fillRect(TRACK_X, 0, TRACK_W, H);

  ctx.strokeStyle = 'rgba(150,110,55,0.2)';
  ctx.lineWidth = 1;
  for (let ry = 8; ry < H; ry += 14) {
    ctx.beginPath();
    ctx.moveTo(TRACK_X + 5, ry);
    ctx.lineTo(TRACK_X + TRACK_W - 5, ry);
    ctx.stroke();
  }

  ctx.strokeStyle = COL.railLine;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(LANE_X, 0); ctx.lineTo(LANE_X, H);
  ctx.stroke();

  ctx.fillStyle = COL.rail;
  for (let py = 24; py < H; py += 50) {
    ctx.fillRect(LANE_X - 6, py - 4, 12, 8);
  }

  ctx.strokeStyle = COL.rail;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(TRACK_X, 0); ctx.lineTo(TRACK_X, H); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(TRACK_X + TRACK_W, 0); ctx.lineTo(TRACK_X + TRACK_W, H); ctx.stroke();
}

function drawParticles() {
  for (const p of joust.sparks) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2);
    ctx.fill();
  }
  for (const d of joust.dust) {
    ctx.globalAlpha = d.life * 0.38;
    ctx.fillStyle = '#c8a87a';
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI*2);
    ctx.fill();
  }
  for (const s of joust.splinters) {
    ctx.save();
    ctx.globalAlpha = s.life;
    ctx.strokeStyle = '#c9a96e';
    ctx.lineWidth = 2.5;
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.beginPath();
    ctx.moveTo(-s.len/2, 0); ctx.lineTo(s.len/2, 0);
    ctx.stroke();
    ctx.restore();
  }
  for (const b of joust.blood) {
    ctx.globalAlpha = b.life * 0.88;
    ctx.fillStyle = b.life > 0.5 ? '#cc1010' : '#7a0a0a';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size * Math.max(0.3, b.life), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSpeedLines() {
  if (joust.subPhase !== 'charge') return;
  const k1 = joust.k1, k2 = joust.k2;
  if (!k1 || !k2) return;
  const dist = Math.abs(k2.y - k1.y);
  if (dist > 300) return;
  const alpha = (1 - dist/300) * 0.25;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const lx = TRACK_X + 10 + Math.random()*(TRACK_W-20);
    const mid = (k1.y + k2.y)/2;
    const y = mid + (Math.random()-0.5)*100;
    ctx.beginPath();
    ctx.moveTo(lx, y); ctx.lineTo(lx+(Math.random()-0.5)*8, y+(Math.random()-0.5)*12);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawJoustUI() {
  const k1 = joust.k1, k2 = joust.k2;
  if (!k1 || !k2) return;

  // 6. Efectos de impacto
  if (joust.subPhase === 'clash') {
    const a = Math.max(0, 1 - joust.phaseT/20);
    if (a > 0) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      const maxPts = Math.max(joust.k1Hit?.pts || 0, joust.k2Hit?.pts || 0);
      let txt = '¡IMPACTO!', col = '#ffd54f';
      if (maxPts >= 10) { txt = '¡DESMONTADO!'; col = '#ff4444'; }
      else if (maxPts >= 3) { txt = '¡GRAN GOLPE!'; col = '#e67e22'; }
      else if (maxPts === 0) { txt = joust.k1Hit?.type === 'miss' ? '¡FALLO!' : '¡TOQUE!'; col = '#a09080'; }

      ctx.font = '52px MedievalSharp';
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillText(txt, W/2 + 4, H/2 + 4);
      ctx.fillStyle = col;
      ctx.fillText(txt, W/2, H/2);

      if (joust.stunEvent) {
        ctx.font = '26px MedievalSharp';
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillText(`** ¡${joust.stunEvent} ATURDIDO! **`, W/2 + 2, H/2 + 52);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`** ¡${joust.stunEvent} ATURDIDO! **`, W/2, H/2 + 50);
      }
      ctx.restore();
    }
  }

  // 7. Resultado flotante
  if ((joust.subPhase === 'pass' || joust.subPhase === 'squire') && joust.k1Hit) {
    const alpha = Math.min(1, joust.phaseT / 20) * (joust.subPhase === 'pass' && joust.phaseT > 100 ? Math.max(0, 1-(joust.phaseT-100)/20) : 1);
    if (alpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = alpha;
      const bw = 340, bh = 55;
      const py = H - 180;
      ctx.fillStyle = '#f4e4bc';
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(W/2 - bw/2, py, bw, bh, 4);
      ctx.fill();
      ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 2;
      ctx.strokeRect(W/2 - bw/2, py, bw, bh);

      ctx.font = 'bold 14px MedievalSharp';
      ctx.fillStyle = '#2c1e16';
      ctx.textAlign = 'center';
      ctx.fillText("RESULTADO DE LA CARRERA", W/2, py + 22);
      ctx.font = 'italic 14px Almendra';
      ctx.fillText(`${joust.k1Hit.label.toUpperCase()} (+${joust.k1Hit.pts})  —  ${joust.k2Hit.label.toUpperCase()} (+${joust.k2Hit.pts})`, W/2, py + 42);
      ctx.restore();
    }
  }
}
