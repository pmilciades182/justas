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

  // HP bars
  _updateHpBar('jhud-k1-hp-fill', 'jhud-k1-hp-text', k1);
  _updateHpBar('jhud-k2-hp-fill', 'jhud-k2-hp-text', k2);

  // Stun indicators
  const s1 = document.getElementById('jhud-k1-stun');
  const s2 = document.getElementById('jhud-k2-stun');
  if (s1) s1.style.visibility = k1.stunned ? 'visible' : 'hidden';
  if (s2) s2.style.visibility = k2.stunned ? 'visible' : 'hidden';

  // Venida
  _set('jhud-venida-val', `${joust.venida}/${MAX_VENIDAS}`);

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

function _updateHpBar(fillId, textId, knight) {
  const fill = document.getElementById(fillId);
  const text = document.getElementById(textId);
  if (!fill) return;

  const pct = Math.max(0, knight.hp / knight.maxHp) * 100;
  fill.style.width = `${pct}%`;

  fill.classList.remove('jhud-hp-green', 'jhud-hp-orange', 'jhud-hp-red');
  if (pct > 60)      fill.classList.add('jhud-hp-green');
  else if (pct > 30) fill.classList.add('jhud-hp-orange');
  else               fill.classList.add('jhud-hp-red');

  if (text) text.textContent = `HP ${knight.hp}/${knight.maxHp}`;
}

function _set(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
