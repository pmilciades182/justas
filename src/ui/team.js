// ══════════════════════════════════════
// SELECCIÓN DE EQUIPO
// ══════════════════════════════════════

import { player, saveGame } from '../state.js';
import { getKnightData, KNIGHT_COLORS } from '../data.js';
import { $, switchScreen, refreshGold } from './nav.js';

let pickSlotIdx = -1;

export function renderTeam() {
  refreshGold();
  const container = $('#team-slots');
  container.innerHTML = `
    <div class="section-label">TU ESCUADRÓN (Máx. 4)</div>
    <div class="team-grid" id="squad-grid"></div>
    <div class="section-label">CABALLEROS DISPONIBLES</div>
    <div id="available-knights-grid" class="team-grid"></div>
  `;

  const squadGrid = $('#squad-grid');
  const availableGrid = $('#available-knights-grid');
  const inTeam = new Set(player.team);

  // Render Squad Slots (exactly 4)
  for (let i = 0; i < 4; i++) {
    const kid = player.team[i] || null;
    const div = document.createElement('div');
    div.className = `team-slot ${kid ? 'filled' : 'empty'}`;
    
    if (kid) {
      const kd = getKnightData(kid);
      div.innerHTML = `
        <div class="slot-icon">${kd.icon}</div>
        <div class="slot-name">${kd.name}</div>
        <div class="slot-remove" data-idx="${i}">✕</div>
      `;
      div.querySelector('.slot-remove').onclick = (e) => {
        e.stopPropagation();
        player.team.splice(i, 1);
        saveGame();
        renderTeam();
      };
    } else {
      div.innerHTML = `<div style="font-size:24px; color:var(--gold-dim); opacity:0.5">+</div>`;
    }
    squadGrid.appendChild(div);
  }

  // Render Available Knights
  player.knights.forEach(kid => {
    if (inTeam.has(kid)) return;
    const kd = getKnightData(kid);
    const div = document.createElement('div');
    div.className = 'team-slot filled';
    div.style.borderStyle = 'solid';
    div.innerHTML = `
      <div class="slot-icon">${kd.icon}</div>
      <div class="slot-name">${kd.name}</div>
    `;
    div.onclick = () => {
      if (player.team.length < 4) {
        player.team.push(kid);
        saveGame();
        renderTeam();
      }
    };
    availableGrid.appendChild(div);
  });

  if (availableGrid.children.length === 0 && player.knights.length > player.team.length) {
    // Should not happen with current logic but for safety
  } else if (availableGrid.children.length === 0 && player.team.length === player.knights.length) {
     availableGrid.innerHTML = '<div style="grid-column: span 3; font-size: 11px; color: var(--text-dim); text-align: center; padding: 10px;">Todos tus caballeros están en el escuadrón</div>';
  }
}

// Remove old modal logic as it's no longer needed with the inline grid
export function openPickKnightModal() {} 

$('#modal-pick-close').addEventListener('click', () => {
  $('#modal-pick-knight').classList.remove('open');
});
