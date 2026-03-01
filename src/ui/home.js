// ══════════════════════════════════════
// PANTALLA CASA (HOME)
// ══════════════════════════════════════

import { player } from '../state.js';
import { getKnightData, getArmorData, getHorseData, KNIGHT_COLORS } from '../data.js';
import { $, switchScreen, refreshGold } from './nav.js';

export function renderHome() {
  refreshGold();
  $('#stat-knights').textContent = player.knights.length;
  $('#stat-wins').textContent = player.wins;
  $('#stat-losses').textContent = player.losses;

  const container = $('#home-team-preview');
  container.innerHTML = '';
  if (player.team.length === 0) {
    container.innerHTML = '<p class="text-center text-dim text-sm">No hay equipo seleccionado</p>';
  } else {
    player.team.forEach(kid => {
      const kd = getKnightData(kid);
      if (!kd) return;
      const c = KNIGHT_COLORS[kd.colorIdx];
      const eq = player.equip[kid] || {};
      const arm = eq.armor ? getArmorData(eq.armor) : null;
      const hrs = eq.horse ? getHorseData(eq.horse) : null;
      container.innerHTML += `
        <div class="card" style="border-left: 3px solid ${c.plume}">
          <div class="card-row">
            <div class="card-icon" style="background:${c.shield}; color:#fff">${kd.icon}</div>
            <div class="card-info">
              <div class="card-name">${kd.name}</div>
              <div class="card-desc">${arm ? arm.name : 'Sin armadura'} · ${hrs ? hrs.name : 'Sin caballo'}</div>
            </div>
          </div>
        </div>`;
    });
  }

  $('#btn-quick-joust').disabled = player.team.length < 1;
  $('#btn-go-designer').onclick = () => switchScreen('designer');
}

$('#btn-quick-joust').onclick = () => switchScreen('joust');
