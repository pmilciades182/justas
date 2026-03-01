/**
 * Módulo de renderizado modular para permitir edición y juego.
 */

// Función principal para el juego (Orquestador)
export function drawJoustKnight(ctx, k, t, COL, LANE_X, HORSE_W, HORSE_H, KNIGHT_BW, KNIGHT_BH, LANCE_LEN) {
  if (!k) return;
  ctx.save();
  ctx.translate(k.x, k.y);
  ctx.rotate(k.rotation + k.tilt + k.wobble);

  const bob = k.fallen ? 0 : Math.sin(t * 0.28) * 2;
  const barrierDir = k.x < LANE_X ? 1 : -1;
  const cosR = Math.cos(k.rotation + k.tilt + k.wobble);
  const shieldSide = barrierDir * (cosR >= 0 ? 1 : -1);

  // 1. Sombra (Base)
  drawShadow(ctx, HORSE_W, HORSE_H);

  // 2. Caballo
  ctx.save();
  ctx.translate(bob * 0.4, 0);
  drawHorse(ctx, k.colors.horse, COL.horseDark, t, HORSE_W, HORSE_H);
  ctx.restore();

  // 3. Caballero
  ctx.save();
  ctx.translate(bob, 5);

  // Capa inferior (Piernas)
  drawLegs(ctx, k.colors.armor, '#222', '#4a2810', KNIGHT_BW, KNIGHT_BH);

  // Capa media (Torso y brazos)
  drawTorso(ctx, k.colors.armor, KNIGHT_BW, KNIGHT_BH);
  drawArms(ctx, k.colors.armor, k.colors.shield, shieldSide, KNIGHT_BW);

  // Capa superior (Cabeza y Lanza)
  drawHead(ctx, k.colors.armor, k.colors.plume, KNIGHT_BH);
  drawLance(ctx, k.lanceIntact, k.lanceStub, shieldSide, COL.lance, LANCE_LEN, KNIGHT_BH);

  // Marcas de sangre acumuladas en el cuerpo
  if (k.bloodMarks && k.bloodMarks.length > 0) {
    for (const bm of k.bloodMarks) {
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = '#8b0000';
      ctx.beginPath();
      ctx.arc(bm.x, bm.y, bm.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Estrellas de aturdimiento orbitando el yelmo
  if (k.stunned) {
    const headY = 18; // centro del yelmo en coords locales del sprite
    for (let i = 0; i < 3; i++) {
      const angle = t * 0.10 + (i * Math.PI * 2 / 3);
      const sx = Math.cos(angle) * 16;
      const sy = headY + Math.sin(angle) * 9;
      ctx.globalAlpha = 0.85 + Math.sin(t * 0.18 + i) * 0.15;
      ctx.fillStyle = '#FFD700';
      ctx.font = '11px serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u2605', sx, sy);
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore(); // Fin caballero
  ctx.restore(); // Fin rotación global
}

// === COMPONENTES INDIVIDUALES (Exportados para el Diseñador) ===

export function drawShadow(ctx, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(5, 8, w/2 + 8, h/2 + 15, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawHorse(ctx, colorBody, colorDark, t, w, h) {
  // Patas
  const legKick = Math.sin(t * 0.35) * 6;
  ctx.fillStyle = colorDark;
  [[-13, -18, 0], [13, -18, Math.PI], [-13, 18, Math.PI], [13, 18, 0]].forEach(([lx, ly, ph]) => {
    ctx.beginPath();
    const offset = Math.sin(t * 0.35 + ph) * 6;
    ctx.ellipse(lx, ly + offset, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Cuerpo
  ctx.fillStyle = colorBody;
  ctx.beginPath(); ctx.ellipse(0, -5, w/2 + 2, h/3 + 5, 0, 0, Math.PI * 2); ctx.fill();
  
  // Cuello y parte delantera
  ctx.beginPath();
  ctx.moveTo(-w/2, -5); ctx.quadraticCurveTo(0, 20, w/2, -5);
  ctx.lineTo(8, 35); ctx.lineTo(-8, 35); ctx.closePath(); ctx.fill();

  // Cabeza
  ctx.fillStyle = '#3b1f0a';
  ctx.beginPath(); ctx.ellipse(0, 32, 6, 12, 0, 0, Math.PI * 2); ctx.fill(); // Crines
  ctx.fillStyle = colorBody;
  ctx.beginPath(); ctx.ellipse(0, 42, 5, 10, 0, 0, Math.PI * 2); ctx.fill(); // Hocico
  
  // Orejas
  ctx.beginPath();
  ctx.moveTo(-3, 35); ctx.lineTo(-5, 40); ctx.lineTo(-1, 38);
  ctx.moveTo(3, 35); ctx.lineTo(5, 40); ctx.lineTo(1, 38);
  ctx.fill();

  // Cola
  ctx.fillStyle = colorDark;
  ctx.beginPath(); ctx.arc(0, -h/2 - 2, 5, 0, Math.PI * 2); ctx.fill();
}

export function drawLegs(ctx, colorArmor, colorBoots, colorStrap, bw, bh) {
  [[-1, 1], [1, 1]].forEach(([sx]) => {
    // Estribo
    ctx.strokeStyle = colorStrap; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx * 8, 0); ctx.lineTo(sx * 17, 5); ctx.stroke();

    ctx.fillStyle = colorArmor;
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5;
    // Muslo
    ctx.beginPath(); ctx.ellipse(sx * 12, -5, 6, 12, sx * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Espinilla
    ctx.beginPath(); ctx.ellipse(sx * 18, 5, 5, 10, sx * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Pies
    ctx.fillStyle = colorBoots;
    ctx.beginPath(); ctx.moveTo(sx * 18, 12); ctx.lineTo(sx * 22, 20); ctx.lineTo(sx * 15, 15); ctx.closePath(); ctx.fill();
  });
  
  // Silla
  ctx.fillStyle = colorStrap;
  ctx.beginPath(); ctx.roundRect(-bw/2 - 2, -bh/2 - 2, bw + 4, 10, 4); ctx.fill();
}

export function drawTorso(ctx, colorArmor, bw, bh) {
  ctx.fillStyle = colorArmor;
  ctx.beginPath(); ctx.roundRect(-14, -12, 28, 25, 5); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.stroke();
  // Brillo
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-2, -10, 4, 20);
}

export function drawArms(ctx, colorArmor, colorShield, shieldSide, bw) {
  // Función auxiliar para un brazo
  const drawSingleArm = (side) => {
    ctx.save();
    const ax = side * 16;
    ctx.translate(ax, -2);
    
    // Hombrera
    ctx.fillStyle = colorArmor;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    
    // Brazo
    ctx.beginPath(); ctx.ellipse(side * 4, 12, 5, 10, side * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    
    if (side === shieldSide) {
      // Escudo
      ctx.save();
      ctx.translate(side * 12, 5);
      ctx.fillStyle = colorShield;
      ctx.beginPath();
      ctx.moveTo(-12, -15); ctx.lineTo(12, -15);
      ctx.lineTo(12, 5); ctx.quadraticCurveTo(0, 25, -12, 5);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      // Cruz
      ctx.fillStyle = '#fff';
      ctx.fillRect(-2, -8, 4, 16); ctx.fillRect(-8, -2, 16, 4);
      ctx.restore();
    } else {
      // Mano lanza
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.arc(side * 6, 22, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  drawSingleArm(-1);
  drawSingleArm(1);
}

export function drawHead(ctx, colorArmor, colorPlume, bh) {
  // Yelmo
  ctx.fillStyle = colorArmor;
  ctx.beginPath(); ctx.arc(0, 18, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
  // Visor
  ctx.fillStyle = '#111';
  for(let i=0; i<3; i++) ctx.fillRect(-7, 15 + i*3, 14, 1.5);
  // Cresta
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 28); ctx.stroke();
  // Penacho
  ctx.fillStyle = colorPlume;
  ctx.beginPath(); ctx.ellipse(0, 28, 6, 12, 0, 0, Math.PI * 2); ctx.fill();
}

export function drawLance(ctx, intact, stub, shieldSide, colorLance, len, bh) {
  if (intact) {
    const lSide = -shieldSide;
    const lx = lSide * 22;
    const ly = 25;
    ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(lx, ly - 40); ctx.lineTo(lx, ly); ctx.lineTo(shieldSide * 35, ly + len); ctx.stroke();
    // Punta
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    const tx = shieldSide * 35, ty = ly + len;
    ctx.moveTo(tx, ty); ctx.lineTo(tx - shieldSide*8, ty - 12); ctx.lineTo(tx + shieldSide*2, ty - 15);
    ctx.closePath(); ctx.fill();
  } else if (stub) {
    const lx = -shieldSide * 22;
    ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(lx, -15); ctx.lineTo(lx + shieldSide*10, 35); ctx.stroke();
  }
}

export function drawSquire(ctx, sq, t, COL, joustT) {
  if (!sq) return;
  ctx.save();
  ctx.translate(sq.x, sq.y);
  const faceDir = sq.side === 'left' ? 1 : -1;
  const bob = Math.sin(joustT * 0.1) * 2;

  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.ellipse(0, 10, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
  
  ctx.fillStyle = '#8b6040';
  ctx.beginPath(); ctx.roundRect(-10, -12, 20, 24, 4); ctx.fill();
  
  ctx.fillStyle = '#e0b890';
  ctx.beginPath(); ctx.arc(-12, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(12, 0, 5, 0, Math.PI * 2); ctx.fill();
  
  ctx.beginPath(); ctx.arc(0, -15 + bob, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a3a20';
  ctx.beginPath(); ctx.arc(0, -17 + bob, 6, Math.PI, Math.PI * 2); ctx.fill();

  if (sq.phase !== 'handoff') {
    ctx.strokeStyle = COL.lance; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(faceDir * 14, -20); ctx.lineTo(faceDir * 14, 20); ctx.stroke();
  }
  ctx.restore();
}
