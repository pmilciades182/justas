// ══════════════════════════════════════
// ABILITIES SYSTEM — Manejo de barra inferior y cooldowns
// ══════════════════════════════════════

import { joust } from './state.js';
import { knightSay } from './dialogue.js';

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
      const spec = k.equipStats.armor.special;
      k.abilitySpecialT = k.equipStats.armor.dur;
      k.cdSpecial = k.equipStats.armor.cd;
      k.abilityActive = true;

      if (spec === 'heal') {
        const healAmt = k.maxHp * 0.3;
        k.hp = Math.min(k.maxHp, k.hp + healAmt);
        k.stunned = false; 
        knightSay(k, "¡RESTAURACIÓN DIVINA!", 'prominent');
        console.log(`[Abilities] Healed for ${healAmt} HP & Removed Stun`);
      } 
      else if (spec === 'freeze') {
        const enemy = joust.k2;
        if (enemy) {
          enemy.frozenT = k.equipStats.armor.dur; // SYNC with equipment dur
          enemy.abilityShieldT = 0;
          enemy.abilityAttackT = 0;
          enemy.abilityHorseT = 0;
          enemy.abilitySpecialT = 0;
          enemy.abilityActive = false;
          knightSay(k, "¡CERO ABSOLUTO!", 'prominent');
          console.log(`[Abilities] Enemy FROZEN for ${enemy.frozenT}ms`);
        }
      }
    }
  }
}

function updateAbilityUI() {
  // Keep loop running if joust screen is active, even if match logic is paused/ended
  const joustScreen = document.getElementById('screen-joust');
  if (!joustScreen || !joustScreen.classList.contains('active')) return;

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
  const k = joust.k1;
  const isThisActive = (id === 'btn-defensa' && k.abilityShieldT > 0) ||
                       (id === 'btn-ataque'  && k.abilityAttackT > 0) ||
                       (id === 'btn-espolear' && k.abilityHorseT > 0) ||
                       (id === 'btn-especial' && k.abilitySpecialT > 0);

  // NEW: Check if any UI overlay is active (Menu, Selection, Intro, Result)
  const uiOverlay = document.getElementById('joust-overlay');
  const isUIActive = (uiOverlay && uiOverlay.innerHTML.trim() !== "") || joust.subPhase === 'result';

  if (current > 0) {
    btn.classList.add('cooldown');
    btn.classList.remove('locked');
    if (overlay && max > 0) {
      const pct = (current / max) * 100;
      overlay.style.transform = `translateY(${100 - pct}%)`; 
      overlay.style.animation = 'none';
    }
  } else {
    btn.classList.remove('cooldown');
    if (overlay) overlay.style.transform = 'translateY(100%)';

    // If NOT on cooldown, check if we should be locked
    // Locked if: ANY other ability is active OR any UI menu is open
    if (isUIActive || (isAnyAbilityActive() && !isThisActive)) {
       btn.classList.add('locked');
    } else {
       btn.classList.remove('locked');
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
