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

  // 2. Aura de Habilidad (detrás del caballero)
  if (k.abilityShieldT > 0 && !k.fallen) {
    drawShieldAura(ctx, k.abilityShieldT, k.colors.shield, t);
  }
  
  if (k.abilityHorseT > 0 && !k.fallen) {
    drawHorseAura(ctx, k.abilityHorseT, t, k.baseDir);
  }

  if (k.abilityAttackT > 0 && !k.fallen) {
    drawAttackAura(ctx, k.abilityAttackT, t, k.baseDir);
  }

  if (k.abilitySpecialT > 0 && !k.fallen) {
    drawSpecialAura(ctx, k.abilitySpecialT, t, k.equipStats.armor?.special);
  }

  // 3. Caballo
  ctx.save();
  ctx.translate(bob * 0.4, 0);
  drawHorse(ctx, k.colors.horse, COL.horseDark, t, HORSE_W, HORSE_H);
  ctx.restore();

  // Status Effect Overlay: Frozen
  if (k.frozenT > 0) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#add8e6';
    ctx.beginPath();
    ctx.roundRect(-HORSE_W/2 - 10, -HORSE_H/2 - 20, HORSE_W + 20, HORSE_H + 40, 12);
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    // Some ice shine
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-20, -40, 40, 5);
    ctx.restore();
  }

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
    const headY = 18; 
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

  ctx.restore(); 
  ctx.restore(); 
}

// === COMPONENTES INDIVIDUALES ===

export function drawShadow(ctx, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(5, 8, w/2 + 8, h/2 + 15, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawHorse(ctx, colorBody, colorDark, t, w, h) {
  const legKick = Math.sin(t * 0.35) * 6;
  ctx.fillStyle = colorDark;
  [[-13, -18, 0], [13, -18, Math.PI], [-13, 18, Math.PI], [13, 18, 0]].forEach(([lx, ly, ph]) => {
    ctx.beginPath();
    const offset = Math.sin(t * 0.35 + ph) * 6;
    ctx.ellipse(lx, ly + offset, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = colorBody;
  ctx.beginPath(); ctx.ellipse(0, -5, w/2 + 2, h/3 + 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-w/2, -5); ctx.quadraticCurveTo(0, 20, w/2, -5);
  ctx.lineTo(8, 35); ctx.lineTo(-8, 35); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3b1f0a';
  ctx.beginPath(); ctx.ellipse(0, 32, 6, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = colorBody;
  ctx.beginPath(); ctx.ellipse(0, 42, 5, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-3, 35); ctx.lineTo(-5, 40); ctx.lineTo(-1, 38);
  ctx.moveTo(3, 35); ctx.lineTo(5, 40); ctx.lineTo(1, 38);
  ctx.fill();
  ctx.fillStyle = colorDark;
  ctx.beginPath(); ctx.arc(0, -h/2 - 2, 5, 0, Math.PI * 2); ctx.fill();
}

export function drawLegs(ctx, colorArmor, colorBoots, colorStrap, bw, bh) {
  [[-1, 1], [1, 1]].forEach(([sx]) => {
    ctx.strokeStyle = colorStrap; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx * 8, 0); ctx.lineTo(sx * 17, 5); ctx.stroke();
    ctx.fillStyle = colorArmor;
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(sx * 12, -5, 6, 12, sx * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(sx * 18, 5, 5, 10, sx * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = colorBoots;
    ctx.beginPath(); ctx.moveTo(sx * 18, 12); ctx.lineTo(sx * 22, 20); ctx.lineTo(sx * 15, 15); ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = colorStrap;
  ctx.beginPath(); ctx.roundRect(-bw/2 - 2, -bh/2 - 2, bw + 4, 10, 4); ctx.fill();
}

export function drawTorso(ctx, colorArmor, bw, bh) {
  ctx.fillStyle = colorArmor;
  ctx.beginPath(); ctx.roundRect(-14, -12, 28, 25, 5); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-2, -10, 4, 20);
}

export function drawArms(ctx, colorArmor, colorShield, shieldSide, bw) {
  const drawSingleArm = (side) => {
    ctx.save();
    const ax = side * 16;
    ctx.translate(ax, -2);
    ctx.fillStyle = colorArmor;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(side * 4, 12, 5, 10, side * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (side === shieldSide) {
      ctx.save();
      ctx.translate(side * 12, 5);
      ctx.fillStyle = colorShield;
      ctx.beginPath();
      ctx.moveTo(-12, -15); ctx.lineTo(12, -15);
      ctx.lineTo(12, 5); ctx.quadraticCurveTo(0, 25, -12, 5);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-2, -8, 4, 16); ctx.fillRect(-8, -2, 16, 4);
      ctx.restore();
    } else {
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.arc(side * 6, 22, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };
  drawSingleArm(-1);
  drawSingleArm(1);
}

export function drawHead(ctx, colorArmor, colorPlume, bh) {
  ctx.fillStyle = colorArmor;
  ctx.beginPath(); ctx.arc(0, 18, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#111';
  for(let i=0; i<3; i++) ctx.fillRect(-7, 15 + i*3, 14, 1.5);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 28); ctx.stroke();
  ctx.fillStyle = colorPlume;
  ctx.beginPath(); ctx.ellipse(0, 28, 6, 12, 0, 0, Math.PI * 2); ctx.fill();
}

export function drawLance(ctx, intact, stub, shieldSide, colorLance, len, bh) {
  const lSide = -shieldSide; 
  const gripX = lSide * 18;
  const gripY = 15;
  if (intact) {
    ctx.save();
    ctx.translate(gripX, gripY);
    const lanceAngle = (shieldSide === 1 ? -0.4 : 0.4); 
    ctx.rotate(lanceAngle);
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 1; ctx.stroke();
    const gradient = ctx.createLinearGradient(-4, 0, 4, 0);
    gradient.addColorStop(0, '#5d4037'); gradient.addColorStop(0.5, '#8d6e63'); gradient.addColorStop(1, '#5d4037');
    ctx.fillStyle = gradient;
    ctx.fillRect(-3, -25, 6, 25);
    ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.lineTo(1.5, len); ctx.lineTo(-1.5, len); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath(); ctx.moveTo(-1.5, len); ctx.lineTo(1.5, len); ctx.lineTo(0, len + 12); ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (stub) {
    ctx.save();
    ctx.translate(gripX, gripY);
    ctx.rotate(shieldSide === 1 ? -0.3 : 0.3);
    ctx.fillStyle = '#5d4037';
    ctx.beginPath(); ctx.moveTo(-3, -20); ctx.lineTo(3, -20); ctx.lineTo(4, 15);
    ctx.lineTo(1, 12); ctx.lineTo(0, 18); ctx.lineTo(-2, 10); ctx.lineTo(-3, 15); ctx.closePath(); ctx.fill();
    ctx.restore();
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

// ── ABILITY AURAS (EXAGGERATED) ──

export function drawShieldAura(ctx, shieldT, color, t) {
  ctx.save();
  const cy = -10; 
  const baseRadius = 75; 
  const alpha = Math.min(0.7, shieldT / 500);
  const auraColor = '#3498db'; 
  const darkBlue = '#2980b9';

  for (let i = 0; i < 14; i++) {
    const angle = (t * 0.03) + (i * Math.PI * 2 / 14);
    const sharedPulse = Math.sin(t * 0.06);
    const orbitDist = (baseRadius * 0.3) + sharedPulse * 15;
    const px = Math.cos(angle) * orbitDist;
    const py = cy + Math.sin(angle) * orbitDist;
    const waveOffset = Math.sin(t * 0.1 + i * 0.5) * 8; 
    const pRadius = (baseRadius * 0.75) + Math.cos(t * 0.04) * 12 + waveOffset;

    ctx.beginPath();
    ctx.arc(px, py, pRadius, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? auraColor : darkBlue;
    ctx.globalAlpha = alpha * 0.3;
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.globalAlpha = alpha * 0.2;
    ctx.stroke();
  }

  [0, 6, -6, 12].forEach((offset, idx) => {
    ctx.beginPath();
    const r = baseRadius + offset + Math.sin(t * 0.1 + idx) * 5;
    ctx.arc(0, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx === 0 ? '#fff' : auraColor;
    ctx.lineWidth = idx === 0 ? 4 : 1.5;
    ctx.globalAlpha = alpha * (0.5 - idx * 0.1);
    ctx.stroke();
  });

  const iconCount = 8;
  for (let i = 0; i < iconCount; i++) {
    ctx.save();
    const sAngle = (t * 0.04) + (i * Math.PI * 2 / iconCount);
    ctx.translate(Math.cos(sAngle)*(baseRadius+25), cy+Math.sin(sAngle)*(baseRadius+25));
    ctx.rotate(sAngle + Math.PI/2);
    drawMiniShield(ctx, '#fff', auraColor, alpha);
    ctx.restore();
    ctx.save();
    const cAngle = (-t * 0.06) + (i * Math.PI * 2 / iconCount);
    ctx.translate(Math.cos(cAngle)*(baseRadius-15), cy+Math.sin(cAngle)*(baseRadius-15));
    ctx.rotate(-t * 0.1);
    drawMiniCross(ctx, '#fff', alpha);
    ctx.restore();
  }
  ctx.restore();
}

function drawMiniShield(ctx, stroke, fill, alpha) {
  ctx.globalAlpha = alpha * 0.8; ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-6,-8); ctx.lineTo(6,-8); ctx.lineTo(6,2); ctx.quadraticCurveTo(0,10,-6,2); ctx.closePath();
  ctx.fill(); ctx.stroke();
}

function drawMiniCross(ctx, color, alpha) {
  ctx.globalAlpha = alpha * 0.9; ctx.fillStyle = color;
  ctx.fillRect(-1.5, -7, 3, 14); ctx.fillRect(-5, -2, 10, 3);
}

export function drawHorseAura(ctx, horseT, t, dir) {
  ctx.save();
  const baseRadius = 60;
  const alpha = Math.min(0.7, horseT / 400);
  const color = '#f1c40f';

  for(let j=0; j<2; j++) {
    const ringT = ((t + j*10) * 0.05) % 1;
    ctx.beginPath(); ctx.arc(0, -20, baseRadius * (1 + ringT*1.5), 0, Math.PI * 2);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.globalAlpha = alpha * (1 - ringT) * 0.4; ctx.stroke();
  }

  for (let i = 0; i < 15; i++) {
    const seed = (i * 137.5);
    const x = ((seed % 100) - 50);
    const speed = 20 + (seed % 15);
    const len = 40 + (seed % 60);
    const yPos = -80 + ((t * speed + seed) % 250);
    if (yPos > -100 && yPos < 150) {
      ctx.globalAlpha = alpha * 0.5; ctx.fillStyle = '#fff'; ctx.fillRect(x, yPos, 2, len);
    }
  }

  for (let i = 0; i < 10; i++) {
    const offsetT = (t * 0.15 + i * 2) % 10;
    const progress = offsetT / 10;
    const x = ((i * 25) % 90) - 45;
    const y = -50 + progress * 180;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI/2); ctx.globalAlpha = alpha * Math.sin(progress*Math.PI);
    ctx.fillStyle = color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(0,-8); ctx.lineTo(0,-4); ctx.lineTo(-12,-4); ctx.lineTo(-12,4); ctx.lineTo(0,4); ctx.lineTo(0,8); ctx.closePath();
    ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

export function drawAttackAura(ctx, attackT, t, dir) {
  ctx.save();
  const baseRadius = 65;
  const alpha = Math.min(0.7, attackT / 400);
  const color = '#e74c3c';

  [20, 40, 60].forEach(off => {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius + off);
    grad.addColorStop(0, 'rgba(231, 76, 60, 0.4)'); grad.addColorStop(1, 'rgba(231, 76, 60, 0)');
    ctx.beginPath(); ctx.arc(0, 0, baseRadius + off, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.globalAlpha = alpha * 0.5; ctx.fill();
  });

  for (let i = 0; i < 10; i++) {
    const offsetT = (t * 0.18 + i * 1.5) % 10;
    const progress = offsetT / 10;
    const x = ((i * 35) % 100) - 50;
    const y = -60 + progress * 200;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI/2); ctx.globalAlpha = alpha * Math.sin(progress*Math.PI);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(15,0); ctx.lineTo(0,-4); ctx.lineTo(0,4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillRect(0,-6,2,12); ctx.fillRect(-5,-1.5,5,3); ctx.restore();
  }

  for (let i = 0; i < 15; i++) {
    const sx = (Math.random()-0.5)*130; const sy = (Math.random()-0.5)*130;
    ctx.globalAlpha = alpha * 0.8; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx+(Math.random()-0.5)*20, sy+(Math.random()-0.5)*20); ctx.stroke();
  }
  ctx.restore();
}

export function drawSpecialAura(ctx, specialT, t, type) {
  ctx.save();
  const cy = 10;
  const baseRadius = 100; // Balanced from 140
  const alpha = Math.min(0.8, specialT / 500);
  const purple = '#9b59b6';

  // 1. Massive Pulsing Glow
  const grad = ctx.createRadialGradient(0, cy, 0, 0, cy, baseRadius * 1.5);
  grad.addColorStop(0, 'rgba(155, 89, 182, 0.4)');
  grad.addColorStop(0.7, 'rgba(155, 89, 182, 0.1)');
  grad.addColorStop(1, 'rgba(155, 89, 182, 0)');
  ctx.beginPath(); ctx.arc(0, cy, baseRadius * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = grad; ctx.globalAlpha = alpha; ctx.fill();

  // 2. Multiple Ornate Concentric Circles
  [1, 0.85, 0.7, 1.15, 1.3].forEach((m, idx) => {
    ctx.beginPath();
    const r = baseRadius * m + Math.sin(t * 0.04 + idx) * 8;
    ctx.arc(0, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx % 2 === 0 ? purple : '#fff';
    ctx.lineWidth = idx === 0 ? 4 : 1.5;
    ctx.globalAlpha = alpha * (0.4 - idx * 0.05);
    ctx.stroke();
  });

  // 3. The Great Pentagram (Layered)
  [1, 0.6].forEach((m, idx) => {
    ctx.save();
    ctx.translate(0, cy);
    ctx.rotate(t * (idx === 0 ? 0.015 : -0.025)); 
    ctx.beginPath();
    const pts = 5;
    const r = baseRadius * m;
    for (let i = 0; i <= pts * 2; i++) {
      const radius = i % 2 === 0 ? r : r * 0.38;
      const currAng = (i * Math.PI) / pts;
      ctx.lineTo(Math.cos(currAng) * radius, Math.sin(currAng) * radius);
    }
    ctx.closePath();
    ctx.strokeStyle = idx === 0 ? '#fff' : purple;
    ctx.lineWidth = idx === 0 ? 5 : 3;
    ctx.globalAlpha = alpha * 0.7;
    ctx.stroke();
    if(idx === 0) {
      ctx.fillStyle = purple; ctx.globalAlpha = alpha * 0.15; ctx.fill();
    }
    ctx.restore();
  });

  // 4. Sacred Geometry Layer (Hexagons)
  ctx.save();
  ctx.translate(0, cy);
  ctx.rotate(t * -0.01);
  for(let j=0; j<3; j++) {
    ctx.beginPath();
    const r = baseRadius * (0.5 + j * 0.2);
    for(let s=0; s<=6; s++) {
      const sa = (s * Math.PI * 2) / 6;
      ctx.lineTo(Math.cos(sa)*r, Math.sin(sa)*r);
    }
    ctx.strokeStyle = purple; ctx.lineWidth = 1; ctx.globalAlpha = alpha * 0.3;
    ctx.stroke();
  }
  ctx.restore();

  // 5. Array of Rotating Runes (Increased to 12)
  const runeCount = 12;
  for (let i = 0; i < runeCount; i++) {
    const ang = (t * -0.025) + (i * Math.PI * 2 / runeCount);
    ctx.save();
    ctx.translate(Math.cos(ang) * (baseRadius + 25), cy + Math.sin(ang) * (baseRadius + 25));
    ctx.rotate(t * 0.06 + i);
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = i % 2 === 0 ? '#fff' : purple;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const sides = (i % 3) + 3; // Triangles, Squares, Pentagons
    for(let s=0; s<=sides; s++) {
      const sa = (s * Math.PI * 2) / sides;
      ctx.lineTo(Math.cos(sa)*10, Math.sin(sa)*10);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 6. Massive Particle Storm (Heal/Freeze)
  if (type === 'heal') {
    for(let i=0; i<18; i++) {
      const offT = (t * 0.08 + i*3.5) % 15;
      const prog = offT / 15;
      ctx.save();
      ctx.translate((Math.sin(i*1.5)*100), cy - 100 + prog * 200);
      ctx.globalAlpha = alpha * Math.sin(prog*Math.PI);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(-3, -10, 6, 20); ctx.fillRect(-10, -3, 20, 6); // Larger crosses
      ctx.restore();
    }
  } else if (type === 'freeze') {
    for(let i=0; i<18; i++) {
      const ang = (t * 0.035) + (i * Math.PI * 2 / 18);
      const rDist = (baseRadius * 0.4) + Math.sin(t*0.05 + i)*40;
      ctx.save();
      ctx.translate(Math.cos(ang)*rDist, cy+Math.sin(ang)*rDist);
      ctx.rotate(t*0.08);
      ctx.globalAlpha = alpha * 0.9;
      ctx.strokeStyle = '#34e7e4'; ctx.lineWidth = 2.5;
      for(let j=0; j<3; j++) {
        ctx.rotate(Math.PI/3);
        ctx.beginPath(); ctx.moveTo(-10,0); ctx.lineTo(10,0); ctx.stroke();
      }
      ctx.restore();
    }
  }

  ctx.restore();
}
