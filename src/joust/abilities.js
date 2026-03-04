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

      // Logic check: Is this ability on cooldown?
      // Logic check: Is ANY ability currently active? (Mutual exclusion)
      if (isAbilityOnCooldown(newBtn.id) || isAnyAbilityActive()) return;

      // Start cooldown
      newBtn.classList.add('cooldown');
      
      // Get button color for particles BEFORE adding cooldown class (to avoid grayscale)
      const color = getComputedStyle(newBtn).borderTopColor;
      spawnButtonParticles(e.clientX, e.clientY, color);

      // TRIGGER GAME MECHANIC
      handleAbilityTrigger(newBtn.id);
    });
  });

  // Start the UI update loop for cooldowns
  requestAnimationFrame(updateAbilityUI);
}

function isAbilityOnCooldown(btnId) {
  const k = joust.k1;
  if (!k) return true;
  if (btnId === 'btn-defensa') return k.cdShield > 0;
  if (btnId === 'btn-ataque') return k.cdAttack > 0;
  if (btnId === 'btn-espolear') return k.cdHorse > 0;
  if (btnId === 'btn-especial') return k.cdSpecial > 0;
  return false;
}

function isAnyAbilityActive() {
  const k = joust.k1;
  if (!k) return false;
  return k.abilityActive; // This flag is true if ANY duration > 0
}

function handleAbilityTrigger(id) {
  const k = joust.k1;
  if (!k) return;

  if (id === 'btn-defensa') {
    if (k.equipStats.shield) {
      k.abilityShieldT = k.equipStats.shield.dur;
      k.cdShield = k.equipStats.shield.cd;
      k.abilityActive = true;
      console.log(`[Abilities] Shield Active: ${k.abilityShieldT}ms`);
    }
  } 
  else if (id === 'btn-ataque') {
    if (k.equipStats.lance) {
      k.abilityAttackT = k.equipStats.lance.dur;
      k.cdAttack = k.equipStats.lance.cd;
      k.abilityActive = true;
      console.log(`[Abilities] Attack Active: ${k.abilityAttackT}ms`);
    }
  }
  else if (id === 'btn-espolear') {
    if (k.equipStats.horse) {
      k.abilityHorseT = k.equipStats.horse.dur;
      k.cdHorse = k.equipStats.horse.cd;
      k.abilityActive = true;
      console.log(`[Abilities] Horse Active: ${k.abilityHorseT}ms`);
    }
  }
  else if (id === 'btn-especial') {
    if (k.equipStats.armor) {
      k.abilitySpecialT = k.equipStats.armor.dur;
      k.cdSpecial = k.equipStats.armor.cd;
      k.abilityActive = true;
      console.log(`[Abilities] Special Active: ${k.abilitySpecialT}ms`);
    }
  }
}

function updateAbilityUI() {
  if (!joust.active) return; // Stop loop if match ends (will restart on initAbilities)

  const k = joust.k1;
  if (k) {
    updateButtonState('btn-defensa', k.cdShield, k.equipStats.shield?.cd);
    updateButtonState('btn-ataque', k.cdAttack, k.equipStats.lance?.cd);
    updateButtonState('btn-espolear', k.cdHorse, k.equipStats.horse?.cd);
    updateButtonState('btn-especial', k.cdSpecial, k.equipStats.armor?.cd);
  }

  requestAnimationFrame(updateAbilityUI);
}

function updateButtonState(id, current, max) {
  const btn = document.getElementById(id);
  if (!btn) return;
  
  const overlay = btn.querySelector('.ability-cooldown-overlay');
  
  if (current > 0) {
    btn.classList.add('cooldown');
    if (overlay && max > 0) {
      // Calculate percentage
      const pct = (current / max) * 100;
      overlay.style.transform = `translateY(${100 - pct}%)`; 
      // Note: CSS animation was 'from 0 to 100', here we manually set it
      // actually, let's just set height or transform manually to match the remaining CD
      // translateY(0%) covers full button (100% waiting)
      // translateY(100%) covers nothing (0% waiting)
      
      // If CD is full (just started), we want full cover -> translateY(0)
      // If CD is near 0, we want no cover -> translateY(100)
      
      // So pct is % remaining (e.g. 90%). We want 90% cover.
      // translate 0% is full cover. translate 100% is no cover.
      // So translate = 100 - pct? 
      // If 100% remaining -> translate 0%. Correct.
      // If 0% remaining -> translate 100%. Correct.
      
      // Disable CSS animation if we are controlling it manually
      overlay.style.animation = 'none';
    }
  } else {
    // If not on cooldown, check if we are locked by another active ability
    if (isAnyAbilityActive()) {
       // Visual feedback for "Locked but ready"? 
       // Maybe just gray it out slightly or keep regular pointer-events-none?
       // For now, let's just rely on the click handler doing nothing, 
       // but maybe add a 'locked' class for visual dimming.
       btn.classList.add('locked');
    } else {
       btn.classList.remove('cooldown');
       btn.classList.remove('locked');
       if (overlay) overlay.style.transform = 'translateY(100%)';
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
