// ══════════════════════════════════════
// PANTALLA CASA (HOME)
// ══════════════════════════════════════

import { player } from '../state.js';
import { getKnightData, KNIGHT_COLORS } from '../data.js';
import { $, switchScreen, refreshGold } from './nav.js';

export function renderHome() {
  refreshGold();
  
  // Update stats bar
  $('#stat-knights').textContent = player.knights.length;
  $('#stat-wins').textContent = player.wins;
  $('#stat-losses').textContent = player.losses;

  // Update Mini Team Preview
  const container = $('#home-team-preview');
  container.innerHTML = '';
  
  if (player.team.length === 0) {
    container.innerHTML = '<div class="help-text" style="width:100%">No hay escuadrón activo.</div>';
  } else {
    player.team.forEach(kid => {
      const kd = getKnightData(kid);
      if (!kd) return;
      const c = KNIGHT_COLORS[kd.colorIdx];
      
      const div = document.createElement('div');
      div.className = 'mini-knight-card';
      div.innerHTML = `
        <div class="icon">${kd.icon}</div>
        <div class="name">${kd.name}</div>
      `;
      container.appendChild(div);
    });
  }

  // Joust Button Logic
  const btnJoust = $('#btn-quick-joust');
  if (player.team.length < 1) {
    btnJoust.innerHTML = '⚔ FORMAR ESCUADRÓN';
    btnJoust.onclick = () => switchScreen('team');
  } else {
    btnJoust.innerHTML = '🏇 ¡A JUSTAR!';
    btnJoust.onclick = () => switchScreen('joust');
  }
  
  $('#btn-go-designer').onclick = () => switchScreen('designer');

  $('#btn-story-mode').onclick = () => {
    alert("📖 Modo Historia: PRÓXIMAMENTE\n\nEn desarrollo. Prepárate para forjar la leyenda de tu propia casa real.");
  };

  $('#btn-reset-game').onclick = () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos?')) {
      localStorage.clear();
      location.reload();
    }
  };
}
