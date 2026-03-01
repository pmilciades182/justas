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

export function updateParticles() {
  for (const p of joust.sparks) { p.x+=p.vx; p.y+=p.vy; p.vy+=0.09; p.vx*=0.97; p.life-=p.decay; }
  joust.sparks = joust.sparks.filter(p => p.life > 0);
  for (const d of joust.dust) { d.x+=d.vx; d.y+=d.vy; d.size*=1.02; d.life-=d.decay; }
  joust.dust = joust.dust.filter(d => d.life > 0);
  for (const s of joust.splinters) { s.x+=s.vx; s.y+=s.vy; s.vy+=0.12; s.angle+=s.spin; s.life-=s.decay; }
  joust.splinters = joust.splinters.filter(s => s.life > 0);
  for (const b of joust.blood) { b.x+=b.vx; b.y+=b.vy; b.vy+=0.14; b.vx*=0.91; b.life-=b.decay; }
  joust.blood = joust.blood.filter(b => b.life > 0);
}
