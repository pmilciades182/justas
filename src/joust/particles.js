// ══════════════════════════════════════
// PARTÍCULAS (chispas, polvo, astillas, sangre)
// ══════════════════════════════════════

import { joust } from './state.js';

export function spawnSparks(x, y, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 2 + Math.random() * 7;
    joust.sparks.push({
      x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
      life: 1, decay: 0.028 + Math.random()*0.018,
      size: 1.5 + Math.random()*4,
      color: Math.random() < 0.55 ? '#f39c12' : (Math.random() < 0.5 ? '#fff' : '#e74c3c'),
    });
  }
}

export function spawnDust(x, y) {
  joust.dust.push({
    x: x+(Math.random()-0.5)*12, y: y+(Math.random()-0.5)*6,
    vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.4,
    size: 4+Math.random()*5, life: 0.7+Math.random()*0.3, decay: 0.035+Math.random()*0.015,
  });
}

export function spawnSplinters(x, y, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random()*Math.PI*2;
    const sp = 2.5 + Math.random()*5;
    joust.splinters.push({
      x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
      angle: Math.random()*Math.PI, spin: (Math.random()-0.5)*0.18,
      len: 7+Math.random()*18, life: 1, decay: 0.014+Math.random()*0.014,
    });
  }
}

export function spawnBlood(x, y, count) {
  for (let i = 0; i < count; i++) {
    const a = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 1.4;
    const sp = 1.5 + Math.random() * 5;
    joust.blood.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.8,
      life: 1, decay: 0.018 + Math.random() * 0.018,
      size: 2 + Math.random() * 3.5,
    });
  }
}

// ── Decales persistentes en el suelo ──────────────────────────────────

export function spawnHoofPrint(knight) {
  if (!knight || knight.fallen) return;
  // Alterna izquierda/derecha para simular los dos cascos
  const side = joust.hoofPrints.length % 2 === 0 ? 1 : -1;
  joust.hoofPrints.push({
    x: knight.x + side * 4 + (Math.random() - 0.5) * 3,
    y: knight.y - knight.baseDir * 28 + (Math.random() - 0.5) * 5,
    angle: (Math.random() - 0.5) * 0.6,
    alpha: 0.42,
  });
}

export function spawnGroundBlood(x, y, count) {
  for (let i = 0; i < count; i++) {
    joust.groundBlood.push({
      x: x + (Math.random() - 0.5) * 18,
      y: y + (Math.random() - 0.5) * 34,
      r: 2.5 + Math.random() * 5.5,
      alpha: 0.50 + Math.random() * 0.32,
      angle: Math.random() * Math.PI,
    });
  }
}

export function spawnGroundSplinters(x, y, count) {
  if (joust.groundSplinters.length > 80) return;
  for (let i = 0; i < count; i++) {
    joust.groundSplinters.push({
      x: x + (Math.random() - 0.5) * 50,
      y: y + (Math.random() - 0.5) * 38,
      angle: Math.random() * Math.PI,
      len: 8 + Math.random() * 14,
      alpha: 0.65 + Math.random() * 0.25,
      dark: Math.random() < 0.4,
    });
  }
}

export function spawnConfetti(count) {
  const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22'];
  for (let i = 0; i < count; i++) {
    joust.confetti.push({
      x: Math.random() * 400, // Roughly canvas width
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 5,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      decay: 0.002 + Math.random() * 0.005,
    });
  }
}

export function spawnRoses(side, count) {
  const isLeft = side === 'left';
  const spawnX = isLeft ? -20 : 420;
  const colors = ['#f1c40f', '#9b59b6', '#fce4ec']; // Yellow, Violet, Light Pink
  for (let i = 0; i < count; i++) {
    joust.roses.push({
      x: spawnX,
      y: Math.random() * 800,
      vx: (isLeft ? 1 : -1) * (2 + Math.random() * 4),
      vy: (Math.random() - 0.5) * 2,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.15,
      life: 1,
      decay: 0.005 + Math.random() * 0.01,
      landed: false,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

export function spawnTrash(side, count) {
  const isLeft = side === 'left';
  const spawnX = isLeft ? -20 : 420;
  for (let i = 0; i < count; i++) {
    const isTomato = Math.random() < 0.6;
    joust.trash.push({
      x: spawnX,
      y: Math.random() * 800,
      vx: (isLeft ? 1 : -1) * (3 + Math.random() * 5),
      vy: (Math.random() - 0.5) * 3,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1,
      decay: 0.008 + Math.random() * 0.015,
      landed: false,
      type: isTomato ? 'tomato' : 'rock',
      color: isTomato ? (Math.random() < 0.5 ? '#7b0000' : '#1a0000') : '#7f8c8d' // Dark Red or Black for rotten tomatoes
    });
  }
}

export function updateParticles() {
  for (const p of joust.sparks) { p.x+=p.vx; p.y+=p.vy; p.vy+=0.09; p.vx*=0.97; p.life-=p.decay; }
  joust.sparks = joust.sparks.filter(p => p.life > 0);
  for (const d of joust.dust) { d.x+=d.vx; d.y+=d.vy; d.size*=1.02; d.life-=d.decay; }
  joust.dust = joust.dust.filter(d => d.life > 0);
  for (const s of joust.splinters) { s.x+=s.vx; s.y+=s.vy; s.vy+=0.12; s.angle+=s.spin; s.life-=s.decay; }
  joust.splinters = joust.splinters.filter(s => s.life > 0);
  for (const b of joust.blood) { b.x+=b.vx; b.y+=b.vy; b.vy+=0.14; b.vx*=0.91; b.life-=b.decay; }
  joust.blood = joust.blood.filter(b => b.life > 0);
  
  // Confetti update
  for (const c of joust.confetti) {
    c.x += c.vx + Math.sin(joust.t * 0.05) * 0.5;
    c.y += c.vy;
    c.r += c.vr;
    c.life -= c.decay;
  }
  joust.confetti = joust.confetti.filter(c => c.life > 0 && c.y < 1000);

  // Roses & Trash update
  [joust.roses, joust.trash].forEach(arr => {
    for (const p of arr) {
      if (!p.landed) {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.vx *= 0.94;
        p.vy *= 0.94;
        if (Math.abs(p.vx) < 0.1) p.landed = true;
      }
    }
  });

  // Huellas de casco se desvanecen lentamente
  for (const h of joust.hoofPrints) { h.alpha = Math.max(0, h.alpha - 0.0010); }
  joust.hoofPrints = joust.hoofPrints.filter(h => h.alpha > 0.02);
}
