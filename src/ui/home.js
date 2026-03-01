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
    container.innerHTML = '<div class="help-text">No hay equipo seleccionado. ¡Ve a la pestaña Equipo!</div>';
  } else {
    player.team.forEach(kid => {
      const kd = getKnightData(kid);
      if (!kd) return;
      const c = KNIGHT_COLORS[kd.colorIdx];
      const eq = player.equip[kid] || {};
      const arm = eq.armor ? getArmorData(eq.armor) : null;
      const hrs = eq.horse ? getHorseData(eq.horse) : null;
      container.innerHTML += `
        <div class="card" style="border-left: 4px solid ${c.plume}">
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

  const btnJoust = $('#btn-quick-joust');
  btnJoust.disabled = player.team.length < 1;
  if (player.team.length < 1) {
    btnJoust.innerHTML = '⚔ FORMAR ESCUADRÓN';
    btnJoust.onclick = () => switchScreen('team');
  } else {
    btnJoust.innerHTML = '🏇 ¡A JUSTAR!';
    btnJoust.onclick = () => switchScreen('joust');
  }
  
  $('#btn-go-designer').onclick = () => switchScreen('designer');

  $('#btn-story-mode').onclick = () => {
    alert("📖 Modo Historia: PRÓXIMAMENTE\n\nEn desarrollo. Prepárate para forjar la leyenda de tu propia casa real en el lore de las Tierras de Hierro.");
  };

  $('#btn-reset-game').onclick = () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      location.reload();
    }
  };
}
