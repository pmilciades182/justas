// ══════════════════════════════════════
// RENDERIZADO DEL CANVAS DE JUSTA (Diseño Optimizado - Solid Color)
// ══════════════════════════════════════

import { drawJoustKnight, drawSquire } from '../knightDrawer.js';
import {
  ctx, W, H, LANE_X, TRACK_X, TRACK_W,
  COL,
  HORSE_W, HORSE_H, KNIGHT_BW, KNIGHT_BH, LANCE_LEN,
  TRACK_TOP, TRACK_BOT, DELIVERY_ZONE_PCT
} from './constants.js';
import { joust } from './state.js';

// ── Ruido de campo estático generado una sola vez ─────────────────────────
const TRACK_PEBBLES = Array.from({ length: 90 }, () => ({
  fx:  Math.random(), fy:  Math.random(),
  r:   0.5 + Math.random() * 2.5,
  a:   0.06 + Math.random() * 0.12,
  col: Math.random() < 0.35 ? '#9a7840' : Math.random() < 0.5 ? '#d8b880' : '#887860',
}));

const GRASS_TUFTS = Array.from({ length: 100 }, () => ({
  side: Math.random() < 0.5 ? 0 : 1,
  fx:   Math.random(), fy:   Math.random(),
  r:    2.5 + Math.random() * 5.5,
  a:    0.08 + Math.random() * 0.15,
  col:  ['#1a4018', '#2d5a27', '#3d7230', '#224824'][Math.floor(Math.random() * 4)],
}));

// ── Bordes irregulares del sendero (Pre-calculados para rendimiento) ──────
const EDGE_SAMPLES = 40;
const LEFT_EDGE_NOISE = Array.from({ length: EDGE_SAMPLES + 1 }, () => (Math.random() - 0.5) * 16);
const RIGHT_EDGE_NOISE = Array.from({ length: EDGE_SAMPLES + 1 }, () => (Math.random() - 0.5) * 16);

export function drawJoust() {
  ctx.save();
  if (joust.shakeAmt > 0) {
    ctx.translate((Math.random()-0.5)*joust.shakeAmt, (Math.random()-0.5)*joust.shakeAmt);
  }
  ctx.clearRect(-20, -20, W+40, H+40);

  drawTrack();
  drawParticles();
  drawRoses();
  drawTrash();
  drawConfetti();

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
  // 1. Hierba base (Color sólido)
  ctx.fillStyle = '#2d5a27'; // Un verde bosque profundo
  ctx.fillRect(0, 0, W, H);

  // 2. Variaciones sutiles de color en la hierba (Manchas estáticas)
  for (const g of GRASS_TUFTS) {
    const gx = g.side === 0 ? g.fx * TRACK_X : TRACK_X + TRACK_W + g.fx * (W - (TRACK_X + TRACK_W));
    ctx.globalAlpha = g.a;
    ctx.fillStyle = g.col;
    ctx.beginPath(); ctx.arc(gx, g.fy * H, g.r * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 3. Tierra con bordes irregulares
  ctx.beginPath();
  // Borde izquierdo (hacia abajo)
  for (let i = 0; i <= EDGE_SAMPLES; i++) {
    const y = (i / EDGE_SAMPLES) * H;
    ctx.lineTo(TRACK_X + LEFT_EDGE_NOISE[i], y);
  }
  // Borde derecho (hacia arriba)
  for (let i = EDGE_SAMPLES; i >= 0; i--) {
    const y = (i / EDGE_SAMPLES) * H;
    ctx.lineTo(TRACK_X + TRACK_W + RIGHT_EDGE_NOISE[i], y);
  }
  ctx.closePath();
  
  // Rellenar tierra base
  ctx.fillStyle = COL.dirt;
  ctx.fill();

  // Rellenar degradado de surcos sobre el mismo camino irregular
  ctx.save();
  ctx.clip(); // Limitar el degradado al área irregular de tierra
  const trackGradient = ctx.createLinearGradient(TRACK_X, 0, TRACK_X + TRACK_W, 0);
  trackGradient.addColorStop(0, 'rgba(0,0,0,0.12)');
  trackGradient.addColorStop(0.3, 'rgba(0,0,0,0.28)'); // Surco izq
  trackGradient.addColorStop(0.5, 'rgba(0,0,0,0.35)'); // Centro
  trackGradient.addColorStop(0.7, 'rgba(0,0,0,0.28)'); // Surco der
  trackGradient.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = trackGradient;
  ctx.fillRect(TRACK_X - 20, 0, TRACK_W + 40, H);

  // 4. Piedrecillas (también dentro del clip)
  for (const p of TRACK_PEBBLES) {
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.col;
    ctx.beginPath(); ctx.arc(TRACK_X + p.fx * TRACK_W, p.fy * H, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // 5. Decales (Sangre y astillas en el suelo)
  drawGroundMarks();

  // 6. Zonas de Entrega (Respetando bordes irregulares)
  ctx.save();
  // Usar el mismo path irregular para recortar las zonas de entrega
  ctx.beginPath();
  for (let i = 0; i <= EDGE_SAMPLES; i++) {
    ctx.lineTo(TRACK_X + LEFT_EDGE_NOISE[i], (i / EDGE_SAMPLES) * H);
  }
  for (let i = EDGE_SAMPLES; i >= 0; i--) {
    ctx.lineTo(TRACK_X + TRACK_W + RIGHT_EDGE_NOISE[i], (i / EDGE_SAMPLES) * H);
  }
  ctx.closePath();
  ctx.clip();

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#d4a017';
  const zoneH = (TRACK_BOT - TRACK_TOP) * DELIVERY_ZONE_PCT;
  ctx.fillRect(TRACK_X - 20, TRACK_TOP, TRACK_W + 40, zoneH);
  ctx.fillRect(TRACK_X - 20, TRACK_BOT - zoneH, TRACK_W + 40, zoneH);
  
  // Líneas divisorias de zona (Horizontales)
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#ffd54f';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(TRACK_X - 20, TRACK_TOP); ctx.lineTo(TRACK_X+TRACK_W+20, TRACK_TOP);
  ctx.moveTo(TRACK_X - 20, TRACK_BOT); ctx.lineTo(TRACK_X+TRACK_W+20, TRACK_BOT);
  ctx.moveTo(TRACK_X - 20, TRACK_TOP+zoneH); ctx.lineTo(TRACK_X+TRACK_W+20, TRACK_TOP+zoneH);
  ctx.moveTo(TRACK_X - 20, TRACK_BOT-zoneH); ctx.lineTo(TRACK_X+TRACK_W+20, TRACK_BOT-zoneH);
  ctx.stroke();
  ctx.restore();

  // 7. Valla / palizada Mejorada
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(LANE_X + 2, 0, 6, H); // Sombra valla central

  // Valla central (Recta por construcción)
  ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(LANE_X, 0); ctx.lineTo(LANE_X, H); ctx.stroke();

  ctx.fillStyle = '#3e2723';
  for (let py = 24; py < H; py += 50) {
    ctx.fillRect(LANE_X - 7, py - 4, 14, 8);
    ctx.fillStyle = '#7f8c8d'; ctx.fillRect(LANE_X - 1, py - 1, 2, 2); // Clavo
    ctx.fillStyle = '#3e2723';
  }

  // Rieles laterales IRREGULARES (Siguen el ruido del borde)
  ctx.setLineDash([]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#8b6914';
  
  // Riel Izquierdo
  ctx.beginPath();
  for (let i = 0; i <= EDGE_SAMPLES; i++) {
    ctx.lineTo(TRACK_X + LEFT_EDGE_NOISE[i], (i / EDGE_SAMPLES) * H);
  }
  ctx.stroke();

  // Riel Derecho
  ctx.beginPath();
  for (let i = 0; i <= EDGE_SAMPLES; i++) {
    ctx.lineTo(TRACK_X + TRACK_W + RIGHT_EDGE_NOISE[i], (i / EDGE_SAMPLES) * H);
  }
  ctx.stroke();
  
  ctx.restore();
}

function drawGroundMarks() {
  for (const b of joust.groundBlood) {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = '#6b0808';
    ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * 1.4, b.r * 0.8, b.angle, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  for (const s of joust.groundSplinters) {
    ctx.save();
    ctx.globalAlpha = s.alpha * 0.8;
    ctx.strokeStyle = s.dark ? '#7a5020' : '#b08040';
    ctx.lineWidth = 1.5;
    ctx.translate(s.x, s.y); ctx.rotate(s.angle);
    ctx.beginPath(); ctx.moveTo(-s.len / 2, 0); ctx.lineTo(s.len / 2, 0); ctx.stroke();
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of joust.sparks) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI*2); ctx.fill();
  }
  for (const b of joust.blood) {
    ctx.globalAlpha = b.life * 0.88;
    ctx.fillStyle = '#cc1010';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.size * Math.max(0.3, b.life), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawConfetti() {
  for (const c of joust.confetti) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, c.life * 2);
    ctx.translate(c.x, c.y);
    ctx.rotate(c.r);
    ctx.fillStyle = c.color;
    ctx.fillRect(-2, -2, 4, 4);
    ctx.restore();
  }
}

function drawRoses() {
  for (const r of joust.roses) {
    ctx.save();
    ctx.translate(r.x, r.y); ctx.rotate(r.r);
    ctx.fillStyle = r.color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.arc(Math.cos(angle) * 2, Math.sin(angle) * 2, 2, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }
}

function drawTrash() {
  for (const t of joust.trash) {
    ctx.save();
    ctx.translate(t.x, t.y); ctx.rotate(t.r);
    ctx.fillStyle = t.type === 'tomato' ? t.color : '#7f8c8d';
    ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function drawJoustUI() {
  const k1 = joust.k1, k2 = joust.k2;
  if (!k1 || !k2) return;

  if (joust.subPhase === 'clash') {
    const a = Math.max(0, 1 - joust.phaseT/80);
    if (a > 0) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      const maxPts = Math.max(joust.k1Hit?.pts || 0, joust.k2Hit?.pts || 0);
      let txt = '¡IMPACTO!'; let col = '#ffd54f';
      if (maxPts >= 10) { txt = '¡DESMONTADO!'; col = '#ff4444'; }
      else if (maxPts >= 3) { txt = '¡GRAN GOLPE!'; col = '#e67e22'; }
      
      // Shadow layer
      ctx.font = 'bold 56px MedievalSharp';
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillText(txt, W/2 + 4, H/2 + 4);
      
      // Main text
      ctx.fillStyle = col;
      ctx.fillText(txt, W/2, H/2);
      
      if (joust.stunEvent) {
        ctx.font = 'bold 28px MedievalSharp';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillText(`** ¡${joust.stunEvent} ATURDIDO! **`, W/2 + 2, H/2 + 52);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`** ¡${joust.stunEvent} ATURDIDO! **`, W/2, H/2 + 50);
      }
      ctx.restore();
    }
  }
  
  drawDeliveryIndicators(k1);
  drawDeliveryIndicators(k2);
  drawSpeechBubble(k1);
  drawSpeechBubble(k2);
}

function drawSpeechBubble(k) {
  if (!k.speechText || k.speechTimer <= 0) return;
  const isProminent = k.speechType === 'prominent';
  ctx.save();
  ctx.font = isProminent ? 'bold 14px MedievalSharp' : 'italic 9px Almendra';
  const textWidth = ctx.measureText(k.speechText).width;
  const bw = textWidth + 18;
  const bh = isProminent ? 32 : 18;
  let bx = k.x - bw / 2;
  let by = k.y - (isProminent ? 70 : 55);
  if (by < 10) by = k.y + 35;
  bx = Math.max(10, Math.min(W - bw - 10, bx));

  ctx.fillStyle = isProminent ? '#ffd54f' : '#fff9e6';
  ctx.strokeStyle = isProminent ? '#8e1616' : '#d4a017';
  ctx.lineWidth = isProminent ? 2.5 : 1.2;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
  
  ctx.fillStyle = isProminent ? '#8e1616' : '#2c1e16';
  ctx.textAlign = 'center';
  ctx.fillText(k.speechText, bx + bw/2, by + (isProminent ? 21 : 12));
  ctx.restore();
}

function drawDeliveryIndicators(k) {
  if (k.lanceIntact || k.fallen || (k.phase !== 'charge' && k.phase !== 'ready')) return;
  if (k.lanceLoading <= 0) return;

  ctx.save();
  const cx = k.x;
  const cy = k.y - 45;
  const radius = 12; // Larger radius

  // Outer Glow / Pulse
  const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
  ctx.shadowBlur = 10 * pulse;
  ctx.shadowColor = '#ffd54f';

  // Background Circle (High Contrast)
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fill();

  // Progress Arc (Thick and Bright)
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * k.lanceLoading));
  ctx.strokeStyle = '#ffd54f';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // "Sun" rays effect when loading
  ctx.globalAlpha = 0.4 * pulse;
  ctx.strokeStyle = '#d4a017';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + (Date.now() * 0.002);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * (radius + 4), cy + Math.sin(angle) * (radius + 4));
    ctx.lineTo(cx + Math.cos(angle) * (radius + 8), cy + Math.sin(angle) * (radius + 8));
    ctx.stroke();
  }

  ctx.restore();
}
