// ══════════════════════════════════════
// HUD DOM — marcador separado del canvas
// ══════════════════════════════════════

import { joust } from './state.js';
import { MAX_VENIDAS } from './constants.js';

export function updateJoustHUD() {
  const k1 = joust.k1, k2 = joust.k2;
  if (!k1 || !k2) return;

  // Iconos y nombres
  _set('jhud-k1-icon', k1.icon);
  _set('jhud-k2-icon', k2.icon);
  _set('jhud-k1-name', k1.name.toUpperCase());
  _set('jhud-k2-name', k2.name.toUpperCase());

  // Puntuaciones
  _set('jhud-k1-pts', joust.k1Points);
  _set('jhud-k2-pts', joust.k2Points);
  
  // Global Match Score
  _set('jhud-global-p1', joust.playerMatchWins);
  _set('jhud-global-p2', joust.enemyMatchWins);

  // HP bars
  _updateHpBar('jhud-k1-hp-fill', k1);
  _updateHpBar('jhud-k2-hp-fill', k2);

  // Clash Result Ribbons
  const r1 = document.getElementById('jhud-k1-ribbon');
  const r2 = document.getElementById('jhud-k2-ribbon');
  const showRibbon = (joust.subPhase === 'pass' || joust.subPhase === 'squire') && joust.k1Hit;

  if (r1 && r2) {
    if (showRibbon) {
      r1.innerHTML = `<div>${joust.k1Hit.label}</div><div style="font-size:10px; opacity:0.8">+${joust.k1Hit.pts} PTS</div>`;
      r2.innerHTML = `<div>${joust.k2Hit.label}</div><div style="font-size:10px; opacity:0.8">+${joust.k2Hit.pts} PTS</div>`;
      r1.classList.add('show');
      r2.classList.add('show');
    } else {
      r1.classList.remove('show');
      r2.classList.remove('show');
    }
  }

  // Escudos (venidas completadas)
  const shieldsEl = document.getElementById('jhud-shields-row');
  if (shieldsEl) {
    let html = '';
    for (let i = 0; i < MAX_VENIDAS; i++) {
      const cls = i < joust.history.length ? 'done'
                : i === joust.history.length ? 'current'
                : 'pending';
      html += `<div class="jhud-shield ${cls}"></div>`;
    }
    shieldsEl.innerHTML = html;
  }
}

function _updateHpBar(fillId, knight) {
  const fill = document.getElementById(fillId);
  if (!fill) return;

  const pct = Math.max(0, knight.hp / knight.maxHp) * 100;
  fill.style.width = `${pct}%`;

  fill.classList.remove('jhud-hp-green', 'jhud-hp-orange', 'jhud-hp-red');
  if (pct > 60)      fill.classList.add('jhud-hp-green');
  else if (pct > 30) fill.classList.add('jhud-hp-orange');
  else               fill.classList.add('jhud-hp-red');
}

function _set(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
