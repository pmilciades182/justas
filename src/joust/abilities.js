// ══════════════════════════════════════
// ABILITIES SYSTEM — Manejo de barra inferior y cooldowns
// ══════════════════════════════════════

import { joust } from './state.js';

export function initAbilities() {
  const buttons = document.querySelectorAll('.ability-btn');
  buttons.forEach(btn => {
    // Reset any previous cooldowns
    btn.classList.remove('cooldown');
    
    // Remove old listeners to avoid duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', (e) => {
      // ONLY active during game
      if (!joust.active) return;
      
      // Allow in all phases except results, as long as k1 exists and is not fallen
      if (joust.subPhase === 'result' || !joust.k1 || joust.k1.fallen) return;

      if (newBtn.classList.contains('cooldown')) return;

      // Start cooldown
      newBtn.classList.add('cooldown');
      
      // Get button color for particles BEFORE adding cooldown class (to avoid grayscale)
      const color = getComputedStyle(newBtn).borderTopColor;
      spawnButtonParticles(e.clientX, e.clientY, color);

      // TRIGGER GAME MECHANIC
      handleAbilityTrigger(newBtn.id);

      // Remove cooldown after 3 seconds
      setTimeout(() => {
        newBtn.classList.remove('cooldown');
      }, 3000);
    });
  });
}

function handleAbilityTrigger(id) {
  console.log(`[Abilities] Triggering: ${id}`);
  if (id === 'btn-defensa') {
    if (joust.k1) {
      if (joust.k1.shield) {
        // Activate shield
        joust.k1.abilityShieldT = joust.k1.shield.duration || 2000;
        console.log(`[Abilities] Shield activated for ${joust.k1.name}. Duration: ${joust.k1.abilityShieldT}ms`);
      } else {
        console.warn(`[Abilities] Knight ${joust.k1.name} has no shield equipped!`);
        // Fallback for testing
        joust.k1.abilityShieldT = 2000;
        console.log(`[Abilities] Shield activated (FALLBACK) for 2000ms`);
      }
    } else {
      console.error("[Abilities] No player knight (k1) found in joust state!");
    }
  }
}

function spawnButtonParticles(x, y, color) {
  const container = document.getElementById('app');
  const count = 45; 
  
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 12;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = 4 + Math.random() * 8;
    
    const rect = container.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    Object.assign(p.style, {
      position: 'absolute',
      left: `${localX}px`,
      top: `${localY}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '100',
      boxShadow: `0 0 12px ${color}, 0 0 20px ${color}`
    });

    container.appendChild(p);

    let life = 1;
    let curX = localX;
    let curY = localY;
    const gravity = 0.15;
    const decay = 0.015 + Math.random() * 0.02;

    const anim = () => {
      life -= decay;
      curX += vx;
      curY += vy + (1 - life) * gravity * 10;
      
      p.style.opacity = life;
      p.style.transform = `translate(${curX - localX}px, ${curY - localY}px) scale(${life * 1.5})`;

      if (life > 0) {
        requestAnimationFrame(anim);
      } else {
        p.remove();
      }
    };
    requestAnimationFrame(anim);
  }
}
