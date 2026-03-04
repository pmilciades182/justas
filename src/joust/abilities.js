// ══════════════════════════════════════
// ABILITIES SYSTEM — Manejo de barra inferior y cooldowns
// ══════════════════════════════════════

import { joust } from './state.js';
import { knightSay } from './dialogue.js';

export function initAbilities() {
  const buttons = document.querySelectorAll('.ability-btn');
  buttons.forEach(btn => {
    btn.classList.remove('cooldown');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', (e) => {
      if (!joust.active) return;
      if (joust.subPhase === 'result' || !joust.k1 || joust.k1.fallen) return;
      if (isAbilityOnCooldown(newBtn.id, joust.k1) || joust.k1.abilityActive) return;

      const color = getComputedStyle(newBtn).borderTopColor;
      spawnButtonParticles(e.clientX, e.clientY, color);

      // TRIGGER for player (k1)
      handleAbilityTrigger(newBtn.id, joust.k1);
    });
  });

  requestAnimationFrame(updateAbilityUI);
}

function isAbilityOnCooldown(btnId, k) {
  if (!k) return true;
  if (btnId === 'btn-defensa') return k.cdShield > 0;
  if (btnId === 'btn-ataque') return k.cdAttack > 0;
  if (btnId === 'btn-espolear') return k.cdHorse > 0;
  if (btnId === 'btn-especial') return k.cdSpecial > 0;
  return false;
}

export function handleAbilityTrigger(id, k) {
  if (!k || k.abilityActive || k.fallen) return;

  const isPlayer = (k === joust.k1);

  if (id === 'btn-defensa') {
    if (k.equipStats.shield) {
      k.abilityShieldT = k.equipStats.shield.dur;
      k.cdShield = k.equipStats.shield.cd;
      k.abilityActive = true;
      if (!isPlayer) console.log(`[AI] Defense Activated`);
    }
  } 
  else if (id === 'btn-ataque') {
    if (k.equipStats.lance) {
      k.abilityAttackT = k.equipStats.lance.dur;
      k.cdAttack = k.equipStats.lance.cd;
      k.abilityActive = true;
      if (!isPlayer) console.log(`[AI] Attack Activated`);
    }
  }
  else if (id === 'btn-espolear') {
    if (k.equipStats.horse) {
      k.abilityHorseT = k.equipStats.horse.dur;
      k.cdHorse = k.equipStats.horse.cd;
      k.abilityActive = true;
      if (!isPlayer) console.log(`[AI] Spur Activated`);
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
      } 
      else if (spec === 'freeze') {
        const target = isPlayer ? joust.k2 : joust.k1;
        if (target) {
          target.frozenT = k.equipStats.armor.dur;
          target.abilityShieldT = 0;
          target.abilityAttackT = 0;
          target.abilityHorseT = 0;
          target.abilitySpecialT = 0;
          target.abilityActive = false;
          knightSay(k, "¡CERO ABSOLUTO!", 'prominent');
        }
      }
    }
  }
}

function updateAbilityUI() {
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

    if (isUIActive || (k.abilityActive && !isThisActive)) {
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
