// ══════════════════════════════════════
// RENDERIZADO DEL CANVAS DE JUSTA
// ══════════════════════════════════════

import { drawJoustKnight, drawSquire } from '../knightDrawer.js';
import {
  ctx, W, H, LANE_X, TRACK_X, TRACK_W,
  COL,
  HORSE_W, HORSE_H, KNIGHT_BW, KNIGHT_BH, LANCE_LEN,
  TRACK_TOP, TRACK_BOT, DELIVERY_ZONE_PCT
} from './constants.js';
import { joust } from './state.js';

// ── Ruido de campo generado una sola vez en carga del módulo ───────────────
const TRACK_PEBBLES = Array.from({ length: 90 }, () => ({
  fx:  Math.random(),                            // fracción de TRACK_W
  fy:  Math.random(),                            // fracción de H
  r:   0.5 + Math.random() * 2.5,
  a:   0.06 + Math.random() * 0.12,
  col: Math.random() < 0.35 ? '#9a7840'
     : Math.random() < 0.5  ? '#d8b880' : '#887860',
}));

const GRASS_TUFTS = Array.from({ length: 60 }, () => ({
  side: Math.random() < 0.5 ? 0 : 1,            // 0 = hierba izq, 1 = derecha
  fx:   Math.random(),
  fy:   Math.random(),
  r:    1.5 + Math.random() * 4.5,
  a:    0.10 + Math.random() * 0.18,
  col:  ['#1a4018', '#3d7230', '#4a8840', '#224824'][Math.floor(Math.random() * 4)],
}));

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
  // ── Hierba ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#2d5a27';
  ctx.fillRect(0, 0, W, H);

  // Variaciones de textura en la hierba (manchas de luz/sombra)
  for (const g of GRASS_TUFTS) {
    const gx = g.side === 0
      ? g.fx * TRACK_X
      : TRACK_X + TRACK_W + g.fx * TRACK_X;
    ctx.globalAlpha = g.a;
    ctx.fillStyle = g.col;
    ctx.beginPath();
    ctx.arc(gx, g.fy * H, g.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── Arena / tierra ───────────────────────────────────────────────────────
  ctx.fillStyle = COL.dirt;
  ctx.fillRect(TRACK_X, 0, TRACK_W, H);

  // Carriles gastados donde cabalgan los caballos (LANE_X ± 16)
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#8a6030';
  ctx.fillRect(LANE_X - 25, 0, 18, H);
  ctx.fillRect(LANE_X +  7, 0, 18, H);
  ctx.globalAlpha = 1;

  // Piedrecillas y textura arenosa
  for (const p of TRACK_PEBBLES) {
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.col;
    ctx.beginPath();
    ctx.arc(TRACK_X + p.fx * TRACK_W, p.fy * H, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Líneas horizontales de rodadas (existentes)
  ctx.strokeStyle = 'rgba(150,110,55,0.18)';
  ctx.lineWidth = 1;
  for (let ry = 8; ry < H; ry += 14) {
    ctx.beginPath();
    ctx.moveTo(TRACK_X + 5, ry);
    ctx.lineTo(TRACK_X + TRACK_W - 5, ry);
    ctx.stroke();
  }

  // ── Decales persistentes (antes de la valla) ─────────────────────────────
  drawGroundMarks();

  // ── Zonas de Entrega (Escuderos) ──
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#d4a017';
  const trackH = (TRACK_BOT - TRACK_TOP);
  const zoneH = trackH * DELIVERY_ZONE_PCT;
  
  // Relleno de zona
  ctx.fillRect(TRACK_X, TRACK_TOP, TRACK_W, zoneH);
  ctx.fillRect(TRACK_X, TRACK_BOT - zoneH, TRACK_W, zoneH);
  
  // Líneas divisorias
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#ffd54f';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  // Límites 90%
  ctx.beginPath();
  ctx.moveTo(TRACK_X, TRACK_TOP); ctx.lineTo(TRACK_X + TRACK_W, TRACK_TOP);
  ctx.moveTo(TRACK_X, TRACK_BOT); ctx.lineTo(TRACK_X + TRACK_W, TRACK_BOT);
  ctx.stroke();

  // Límites 20%
  ctx.beginPath();
  ctx.moveTo(TRACK_X, TRACK_TOP + zoneH); ctx.lineTo(TRACK_X + TRACK_W, TRACK_TOP + zoneH);
  ctx.moveTo(TRACK_X, TRACK_BOT - zoneH); ctx.lineTo(TRACK_X + TRACK_W, TRACK_BOT - zoneH);
  ctx.stroke();
  
  ctx.setLineDash([]);
  ctx.restore();

  // ── Valla / palizada ─────────────────────────────────────────────────────
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

function drawGroundMarks() {
  // Manchas de sangre en el suelo
  for (const b of joust.groundBlood) {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    // Mancha exterior (rojo oscuro)
    ctx.fillStyle = '#6b0808';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.r * 1.4, b.r * 0.8, b.angle, 0, Math.PI * 2);
    ctx.fill();
    // Centro seco (más oscuro)
    ctx.fillStyle = '#3d0404';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.r * 0.65, b.r * 0.38, b.angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Astillas de lanza en el suelo
  for (const s of joust.groundSplinters) {
    ctx.save();
    ctx.globalAlpha = s.alpha * 0.85;
    ctx.strokeStyle = s.dark ? '#7a5020' : '#b08040';
    ctx.lineWidth = 1.5 + s.alpha * 0.5;
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.beginPath();
    ctx.moveTo(-s.len / 2, 0);
    ctx.lineTo(s.len / 2, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Huellas de cascos
  for (const h of joust.hoofPrints) {
    ctx.save();
    ctx.globalAlpha = h.alpha;
    ctx.translate(h.x, h.y);
    ctx.rotate(h.angle);
    // Huella principal (forma de riñón)
    ctx.fillStyle = '#7a5828';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Detalle interior
    ctx.fillStyle = '#5a3e1a';
    ctx.beginPath();
    ctx.ellipse(1.2, 0, 2.2, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.globalAlpha = 1;
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

  // 7. Resultado flotante (Eliminado, ahora en HUD ribbons)
  
  // 8. Indicadores de entrega de lanza
  drawDeliveryIndicators(k1);
  drawDeliveryIndicators(k2);
}

function drawDeliveryIndicators(k) {
  if (k.lanceIntact || k.fallen || (k.phase !== 'charge' && k.phase !== 'ready')) return;
  if (k.lanceLoading <= 0) return;

  const cx = k.x;
  const cy = k.y - 45;
  const radius = 10;

  ctx.save();
  // Fondo del círculo
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Arco de progreso
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * k.lanceLoading));
  ctx.strokeStyle = COL.gold || '#d4a017';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}
