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
  container.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const kid = player.team[i] || null;
    const div = document.createElement('div');
    div.className = `team-slot ${kid ? 'filled' : 'empty'}`;
    div.dataset.slot = i;

    if (kid) {
      const kd = getKnightData(kid);
      const c = KNIGHT_COLORS[kd.colorIdx];
      div.innerHTML = `
        <div class="slot-num">PUESTO ${i + 1}</div>
        <div style="font-size:28px; margin:4px 0">${kd.icon}</div>
        <div class="slot-name" style="color:${c.plume}">${kd.name}</div>
        <button class="btn btn-ghost btn-sm mt-8 btn-remove-slot" data-slot="${i}" style="font-size:10px">Quitar</button>`;
    } else {
      div.innerHTML = `
        <div class="slot-num">PUESTO ${i + 1}</div>
        <div class="slot-empty-text">+ Añadir</div>`;
    }
    container.appendChild(div);
  }

  container.querySelectorAll('.team-slot').forEach(slot => {
    slot.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove-slot')) return;
      const idx = parseInt(slot.dataset.slot);
      if (player.team[idx]) return;
      pickSlotIdx = idx;
      openPickKnightModal();
    });
  });
  container.querySelectorAll('.btn-remove-slot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.slot);
      player.team.splice(idx, 1);
      saveGame();
      renderTeam();
    });
  });

  $('#btn-start-joust').disabled = player.team.length < 1;
}

export function openPickKnightModal() {
  const container = $('#pick-knight-list');
  container.innerHTML = '';
  const inTeam = new Set(player.team);

  player.knights.forEach(kid => {
    if (inTeam.has(kid)) return;
    const kd = getKnightData(kid);
    const c = KNIGHT_COLORS[kd.colorIdx];
    const div = document.createElement('div');
    div.className = 'pick-item';
    div.innerHTML = `
      <span class="pick-icon" style="background:${c.shield}; border-radius:8px; width:40px; height:40px; display:flex; align-items:center; justify-content:center">${kd.icon}</span>
      <div class="pick-info">
        <div class="pick-name">${kd.name}</div>
        <div class="card-stats">
          <span class="stat-badge str">FUE ${kd.str}</span>
          <span class="stat-badge def">DEF ${kd.def}</span>
          <span class="stat-badge hor">MON ${kd.hor}</span>
        </div>
      </div>`;
    div.addEventListener('click', () => {
      while (player.team.length <= pickSlotIdx) player.team.push(null);
      player.team[pickSlotIdx] = kid;
      while (player.team.length > 0 && player.team[player.team.length - 1] === null) player.team.pop();
      saveGame();
      $('#modal-pick-knight').classList.remove('open');
      renderTeam();
    });
    container.appendChild(div);
  });

  if (container.children.length === 0) {
    container.innerHTML = '<p class="text-center text-dim">No hay caballeros disponibles</p>';
  }
  $('#modal-pick-knight').classList.add('open');
}

// Team screen bindings
$('#btn-start-joust').addEventListener('click', () => switchScreen('joust'));

$('#modal-pick-close').addEventListener('click', () => {
  $('#modal-pick-knight').classList.remove('open');
});
