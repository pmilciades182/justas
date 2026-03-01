/**
 * Módulo especializado en el renderizado de caballeros y escuderos
 * con perspectiva cenital optimizada.
 */

export function drawJoustKnight(ctx, k, t, COL, LANE_X, HORSE_W, HORSE_H, KNIGHT_BW, KNIGHT_BH, LANCE_LEN) {
  if (!k) return;
  ctx.save();
  ctx.translate(k.x, k.y);
  ctx.rotate(k.rotation + k.tilt + k.wobble);

  const bob = k.fallen ? 0 : Math.sin(t * 0.28) * 2;

  // 1. SOMBRA PROYECTADA
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(4, 6, HORSE_W/2 + 5, HORSE_H/2 + 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. EL CABALLO
  ctx.save();
  ctx.translate(bob * 0.5, 0);
  
  // Patas del caballo (Movimiento de galope cenital)
  const legKick = Math.sin(t * 0.35) * 6;
  ctx.fillStyle = COL.horseDark;
  [[-13, -18, 0], [13, -18, Math.PI], [-13, 18, Math.PI], [13, 18, 0]].forEach(([lx, ly, ph]) => {
    ctx.beginPath();
    const offset = Math.sin(t * 0.35 + ph) * 6;
    ctx.ellipse(lx, ly + offset, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Cuerpo del caballo
  ctx.fillStyle = k.colors.horse;
  ctx.beginPath();
  ctx.ellipse(0, 0, HORSE_W/2, HORSE_H/2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Brillo en el lomo
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath(); ctx.ellipse(0, -5, HORSE_W/4, HORSE_H/3, 0, 0, Math.PI * 2); ctx.fill();

  // Cabeza del Caballo (Anatómica)
  ctx.save();
  ctx.translate(0, HORSE_H/2 - 2);
  ctx.fillStyle = k.colors.horse;
  // Cuello
  ctx.beginPath(); ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Hocico/Cara
  ctx.fillStyle = COL.horseDark;
  ctx.beginPath(); ctx.ellipse(0, 10, 7, 12, 0, 0, Math.PI * 2); ctx.fill();
  // Orejas puntiagudas
  ctx.beginPath();
  ctx.moveTo(-5, 2); ctx.lineTo(-8, -4); ctx.lineTo(-2, 0);
  ctx.moveTo(5, 2); ctx.lineTo(8, -4); ctx.lineTo(2, 0);
  ctx.fill();
  // Crines (Pequeñas marcas)
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1;
  for(let i=-5; i<=5; i+=3) { ctx.beginPath(); ctx.moveTo(i, -2); ctx.lineTo(i, 2); ctx.stroke(); }
  ctx.restore();

  // Cola
  ctx.fillStyle = COL.horseDark;
  ctx.beginPath(); ctx.ellipse(0, -HORSE_H/2 - 5, 6, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 3. EL CABALLERO (Anatomía Humana Optimizada)
  ctx.save();
  ctx.translate(bob, 5);

  // Piernas y Estribos
  [[-17, 0], [17, 0]].forEach(([px, py]) => {
    // Correa del estribo
    ctx.strokeStyle = '#4a2810'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px * 0.5, py); ctx.lineTo(px, py + 5); ctx.stroke();
    // Muslo del caballero
    ctx.fillStyle = k.colors.armor;
    ctx.beginPath(); ctx.ellipse(px * 0.8, py, 7, 14, px > 0 ? 0.3 : -0.3, 0, Math.PI * 2); ctx.fill();
    // Botas/Pies
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.roundRect(px > 0 ? px - 2 : px - 8, py + 10, 10, 5, 2); ctx.fill();
  });

  // Silla de montar (detrás del caballero)
  ctx.fillStyle = '#4a2810';
  ctx.beginPath(); ctx.roundRect(-KNIGHT_BW/2 - 2, -KNIGHT_BH/2 - 2, KNIGHT_BW + 4, 10, 4); ctx.fill();

  // Torso Humano
  ctx.fillStyle = k.colors.armor;
  ctx.beginPath();
  ctx.roundRect(-KNIGHT_BW/2, -KNIGHT_BH/2, KNIGHT_BW, KNIGHT_BH, 10);
  ctx.fill();
  // Brillo metálico en peto
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.roundRect(-KNIGHT_BW/2 + 4, -KNIGHT_BH/2 + 5, 4, KNIGHT_BH - 15, 2); ctx.fill();
  
  // Hombros y Brazos Definidos
  const barrierDir = k.x < LANE_X ? 1 : -1;
  const cosR = Math.cos(k.rotation + k.tilt + k.wobble);
  const shieldSide = barrierDir * (cosR >= 0 ? 1 : -1);

  // Lado de la Lanza
  ctx.save();
  const armX = -shieldSide * (KNIGHT_BW/2 + 3);
  ctx.translate(armX, -5);
  // Hombrera (Pauldrons)
  ctx.fillStyle = k.colors.armor;
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1; ctx.stroke();
  // Antebrazo y Mano
  ctx.beginPath(); ctx.ellipse(shieldSide * 6, 15, 5, 12, shieldSide * 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#444'; // Guantelete
  ctx.beginPath(); ctx.arc(shieldSide * 8, 24, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Lado del Escudo
  ctx.save();
  const sArmX = shieldSide * (KNIGHT_BW/2 + 3);
  ctx.translate(sArmX, -5);
  ctx.fillStyle = k.colors.armor;
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
  ctx.stroke();
  // Brazo que sujeta escudo
  ctx.beginPath(); ctx.ellipse(-shieldSide * 4, 10, 5, 10, -shieldSide * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Escudo (Con relieve)
  ctx.fillStyle = k.colors.shield;
  ctx.beginPath(); ctx.ellipse(shieldSide * (KNIGHT_BW/2 + 10), 2, 11, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
  // Sombra del escudo sobre el cuerpo
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.ellipse(shieldSide * (KNIGHT_BW/2 + 5), 5, 5, 15, 0, 0, Math.PI * 2); ctx.fill();

  // Cabeza / Yelmo (Humana)
  ctx.fillStyle = k.colors.armor;
  ctx.beginPath(); ctx.arc(0, KNIGHT_BH/2 - 6, 12, 0, Math.PI * 2); ctx.fill();
  ctx.stroke();
  // Visor Ranura
  ctx.fillStyle = '#111';
  ctx.fillRect(-8, KNIGHT_BH/2 - 7, 16, 2);
  // Penacho dinámico
  ctx.fillStyle = k.colors.plume;
  ctx.beginPath(); ctx.ellipse(0, KNIGHT_BH/2 + 6, 7, 14, 0, 0, Math.PI * 2); ctx.fill();

  // Manos en las Riendas (Detalle central)
  ctx.fillStyle = '#444';
  ctx.beginPath(); ctx.arc(-4, KNIGHT_BH/2 - 18, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, KNIGHT_BH/2 - 18, 3, 0, Math.PI * 2); ctx.fill();
  // Riendas
  ctx.strokeStyle = '#222'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-4, KNIGHT_BH/2 - 18); ctx.lineTo(-5, KNIGHT_BH/2 + 5);
  ctx.moveTo(4, KNIGHT_BH/2 - 18); ctx.lineTo(5, KNIGHT_BH/2 + 5); ctx.stroke();

  // 4. LA LANZA
  if (k.lanceIntact) {
    const lanceX = -shieldSide * 14;
    const handY = KNIGHT_BH/2 - 10;
    ctx.strokeStyle = COL.lance; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(lanceX, handY); ctx.lineTo(-shieldSide * 38, handY + LANCE_LEN); ctx.stroke();
    // Brillo lanza
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lanceX + 1, handY); ctx.lineTo(-shieldSide * 38 + 1, handY + LANCE_LEN); ctx.stroke();
    // Punta reforzada
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    const tipX = -shieldSide * 38, tipY = handY + LANCE_LEN;
    ctx.arc(tipX, tipY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath(); ctx.arc(tipX, tipY, 3, 0, Math.PI * 2); ctx.fill();
  } else if (k.lanceStub) {
    const lanceX = -shieldSide * 14;
    const handY = KNIGHT_BH/2 - 10;
    ctx.strokeStyle = '#8b4513'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(lanceX, handY); ctx.lineTo(-shieldSide * 20, handY + 18); ctx.stroke();
    // Astillas
    ctx.strokeStyle = '#d2b48c'; ctx.lineWidth = 2;
    [[-2, 2], [2, -2]].forEach(([ox, oy]) => {
      ctx.beginPath(); ctx.moveTo(-shieldSide * 20 + ox, handY + 18 + oy); 
      ctx.lineTo(-shieldSide * 24 + ox, handY + 22 + oy); ctx.stroke();
    });
  }

  ctx.restore();
  ctx.restore();
}

export function drawSquire(ctx, sq, t, COL, joustT) {
  if (!sq) return;
  ctx.save();
  ctx.translate(sq.x, sq.y);

  const isMoving = sq.phase === 'running_in' || sq.phase === 'running_out' || sq.phase === 'running';
  const bob = isMoving ? Math.sin(joustT * 0.5) * 4 : Math.sin(joustT * 0.06) * 1;
  const faceDir = sq.side === 'left' ? 1 : -1;

  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath(); ctx.ellipse(1, 10, 9, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Cuerpo Humano (Hombros anchos)
  ctx.fillStyle = '#8b6040';
  ctx.beginPath(); ctx.ellipse(0, bob * 0.2, 10, 14, 0, 0, Math.PI * 2); ctx.fill();
  
  // Hombros y Brazos
  ctx.fillStyle = '#e0b890';
  ctx.beginPath(); ctx.arc(-10, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, 0, 5, 0, Math.PI * 2); ctx.fill();

  // Cabeza
  ctx.fillStyle = '#e0b890';
  ctx.beginPath(); ctx.arc(0, -14, 8, 0, Math.PI * 2); ctx.fill();
  // Cabello
  ctx.fillStyle = '#5a3a20';
  ctx.beginPath(); ctx.arc(0, -16, 6, Math.PI, Math.PI * 2); ctx.fill();

  // Lanza
  if (sq.phase === 'watching' || sq.phase === 'running') {
    ctx.strokeStyle = COL.lance; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(faceDir * 12, -18); ctx.lineTo(faceDir * 12, 18); ctx.stroke();
  }

  ctx.restore();
}
