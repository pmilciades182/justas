/**
 * Módulo de renderizado de alta fidelidad inspirado en la ilustración de referencia.
 * Perspectiva cenital con anatomía segmentada y detalles heráldicos.
 */

export function drawJoustKnight(ctx, k, t, COL, LANE_X, HORSE_W, HORSE_H, KNIGHT_BW, KNIGHT_BH, LANCE_LEN) {
  if (!k) return;
  ctx.save();
  ctx.translate(k.x, k.y);
  ctx.rotate(k.rotation + k.tilt + k.wobble);

  const bob = k.fallen ? 0 : Math.sin(t * 0.28) * 2;
  const barrierDir = k.x < LANE_X ? 1 : -1;
  const cosR = Math.cos(k.rotation + k.tilt + k.wobble);
  const shieldSide = barrierDir * (cosR >= 0 ? 1 : -1);

  // 1. SOMBRA
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(5, 8, HORSE_W/2 + 8, HORSE_H/2 + 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. EL CABALLO (Inspirado en la imagen: Largo y estilizado)
  ctx.save();
  ctx.translate(bob * 0.4, 0);
  
  // Cuerpo principal (Grupa ancha)
  ctx.fillStyle = k.colors.horse;
  ctx.beginPath();
  ctx.ellipse(0, -5, HORSE_W/2 + 2, HORSE_H/3 + 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Parte delantera y cuello (Se estrecha)
  ctx.beginPath();
  ctx.moveTo(-HORSE_W/2, -5);
  ctx.quadraticCurveTo(0, 20, HORSE_W/2, -5);
  ctx.lineTo(8, 35);
  ctx.lineTo(-8, 35);
  ctx.closePath();
  ctx.fill();

  // Cabeza y Crines
  ctx.fillStyle = '#3b1f0a'; // Color crines oscuro
  ctx.beginPath(); ctx.ellipse(0, 32, 6, 12, 0, 0, Math.PI * 2); ctx.fill(); // Crines frontales
  ctx.fillStyle = k.colors.horse;
  ctx.beginPath(); ctx.ellipse(0, 42, 5, 10, 0, 0, Math.PI * 2); ctx.fill(); // Hocico
  
  // Orejas pequeñas
  ctx.beginPath();
  ctx.moveTo(-3, 35); ctx.lineTo(-5, 40); ctx.lineTo(-1, 38);
  ctx.moveTo(3, 35); ctx.lineTo(5, 40); ctx.lineTo(1, 38);
  ctx.fill();

  // Cola (Pequeño moño atrás)
  ctx.fillStyle = '#3b1f0a';
  ctx.beginPath(); ctx.arc(0, -HORSE_H/2 - 2, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 3. EL CABALLERO (Armadura de Placas Completa)
  ctx.save();
  ctx.translate(bob, 5);

  // Piernas segmentadas (Dobladas)
  [[-1, 1], [1, 1]].forEach(([sx]) => {
    ctx.fillStyle = k.colors.armor;
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5;
    // Muslo
    ctx.beginPath(); ctx.ellipse(sx * 12, -5, 6, 12, sx * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Rodillera y espinilla (Hacia afuera)
    ctx.beginPath(); ctx.ellipse(sx * 18, 5, 5, 10, sx * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Pies (Sabatones puntiagudos)
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(sx * 18, 12); ctx.lineTo(sx * 22, 20); ctx.lineTo(sx * 15, 15);
    ctx.closePath(); ctx.fill();
  });

  // Hombros (Pauldrons circulares grandes como en la imagen)
  const drawArm = (side) => {
    ctx.save();
    const isShieldSide = side === shieldSide;
    const ax = side * 16;
    ctx.translate(ax, -2);
    
    // Hombrera circular
    ctx.fillStyle = k.colors.armor;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    
    // Brazo segmentado
    ctx.beginPath(); ctx.ellipse(side * 4, 12, 5, 10, side * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    
    if (isShieldSide) {
      // Escudo Heater con Cruz
      ctx.save();
      ctx.translate(side * 12, 5);
      ctx.fillStyle = k.colors.shield;
      ctx.beginPath();
      ctx.moveTo(-12, -15); ctx.lineTo(12, -15);
      ctx.lineTo(12, 5); ctx.quadraticCurveTo(0, 25, -12, 5);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      
      // Cruz Heráldica
      ctx.fillStyle = '#fff';
      ctx.fillRect(-2, -8, 4, 16);
      ctx.fillRect(-8, -2, 16, 4);
      ctx.restore();
    } else {
      // Guantelete que sujeta lanza
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.arc(side * 6, 22, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  drawArm(-1);
  drawArm(1);

  // Torso (Peto con relieve)
  ctx.fillStyle = k.colors.armor;
  ctx.beginPath(); ctx.roundRect(-14, -12, 28, 25, 5); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.stroke();
  // Brillo central
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(-2, -10, 4, 20);

  // Cabeza (Yelmo con visor segmentado)
  ctx.fillStyle = k.colors.armor;
  ctx.beginPath(); ctx.arc(0, 18, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
  // Visor (Líneas horizontales)
  ctx.fillStyle = '#111';
  for(let i=0; i<3; i++) ctx.fillRect(-7, 15 + i*3, 14, 1.5);
  // Cresta del yelmo
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 28); ctx.stroke();

  // Penacho heráldico
  ctx.fillStyle = k.colors.plume;
  ctx.beginPath(); ctx.ellipse(0, 28, 6, 12, 0, 0, Math.PI * 2); ctx.fill();

  // 4. LA LANZA (Sale del brazo exterior hacia el centro)
  if (k.lanceIntact) {
    const lSide = -shieldSide;
    const lx = lSide * 22;
    const ly = 25;
    ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(lx, ly - 40); ctx.lineTo(lx, ly); ctx.lineTo(shieldSide * 35, ly + LANCE_LEN); ctx.stroke();
    // Punta de acero
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    const tx = shieldSide * 35, ty = ly + LANCE_LEN;
    ctx.moveTo(tx, ty); ctx.lineTo(tx - shieldSide*8, ty - 12); ctx.lineTo(tx + shieldSide*2, ty - 15);
    ctx.closePath(); ctx.fill();
  } else if (k.lanceStub) {
    const lx = -shieldSide * 22;
    ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(lx, -15); ctx.lineTo(lx + shieldSide*10, 35); ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

export function drawSquire(ctx, sq, t, COL, joustT) {
  if (!sq) return;
  ctx.save();
  ctx.translate(sq.x, sq.y);
  const faceDir = sq.side === 'left' ? 1 : -1;
  const bob = Math.sin(joustT * 0.1) * 2;

  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.ellipse(0, 10, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
  
  ctx.fillStyle = '#8b6040'; // Túnica
  ctx.beginPath(); ctx.roundRect(-10, -12, 20, 24, 4); ctx.fill();
  
  ctx.fillStyle = '#e0b890'; // Hombros
  ctx.beginPath(); ctx.arc(-12, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(12, 0, 5, 0, Math.PI * 2); ctx.fill();
  
  ctx.beginPath(); ctx.arc(0, -15 + bob, 8, 0, Math.PI * 2); ctx.fill(); // Cabeza
  ctx.fillStyle = '#5a3a20';
  ctx.beginPath(); ctx.arc(0, -17 + bob, 6, Math.PI, Math.PI * 2); ctx.fill(); // Pelo

  if (sq.phase !== 'handoff') {
    ctx.strokeStyle = COL.lance; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(faceDir * 14, -20); ctx.lineTo(faceDir * 14, 20); ctx.stroke();
  }
  ctx.restore();
}
