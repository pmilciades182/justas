// ══════════════════════════════════════
// SELECCIÓN DE EQUIPO
// ══════════════════════════════════════

import { player, saveGame } from '../state.js';
import { getKnightData } from '../data.js';
import { $, refreshGold } from './nav.js';

export function renderTeam() {
  refreshGold();
  const container = $('#team-slots');
  container.innerHTML = `
    <div class="section-label">TU ESCUADRÓN ACTIVO (MÁX. 4)</div>
    <div class="team-grid" id="squad-grid"></div>
    <div class="section-label">CABALLEROS DISPONIBLES</div>
    <div id="available-knights-grid" class="team-grid"></div>
  `;

  const squadGrid = $('#squad-grid');
  const availableGrid = $('#available-knights-grid');
  const inTeam = new Set(player.team);

  // 1. Render Squad Slots (exactly 4 boxes)
  for (let i = 0; i < 4; i++) {
    const kid = player.team[i] || null;
    const div = document.createElement('div');
    div.className = `team-slot ${kid ? 'filled' : 'empty'}`;
    
    if (kid) {
      const kd = getKnightData(kid);
      div.innerHTML = `
        <div class="slot-remove">✕</div>
        <div class="slot-icon">${kd.icon}</div>
        <div class="slot-name">${kd.name}</div>
      `;
      div.querySelector('.slot-remove').onclick = (e) => {
        e.stopPropagation();
        player.team.splice(i, 1);
        saveGame();
        renderTeam();
      };
    } else {
      div.innerHTML = `
        <div style="font-size:20px; color:var(--gold-dim); opacity:0.4">VACÍO</div>
        <div style="font-size:10px; color:var(--gold-dim); margin-top:4px">AÑADE UNO</div>
      `;
    }
    squadGrid.appendChild(div);
  }

  // 2. Render Available Knights (those NOT in team)
  const availableKnights = player.knights.filter(kid => !inTeam.has(kid));

  if (availableKnights.length === 0) {
    availableGrid.innerHTML = `
      <div style="grid-column: span 3; background:rgba(0,0,0,0.3); padding:20px; text-align:center; border:1px dashed var(--gold-dim); color:var(--text-dim); font-size:12px">
        No tienes más caballeros disponibles.
      </div>`;
  } else {
    availableKnights.forEach(kid => {
      const kd = getKnightData(kid);
      const div = document.createElement('div');
      div.className = 'team-slot filled';
      div.innerHTML = `
        <div class="slot-icon">${kd.icon}</div>
        <div class="slot-name">${kd.name}</div>
      `;
      div.onclick = () => {
        if (player.team.length < 4) {
          player.team.push(kid);
          saveGame();
          renderTeam();
        } else {
          alert("¡Escuadrón lleno! Elimina a un caballero primero.");
        }
      };
      availableGrid.appendChild(div);
    });
  }
}
