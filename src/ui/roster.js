// ══════════════════════════════════════
// PLANTEL (ROSTER) + MODAL DE EQUIPAMIENTO
// ══════════════════════════════════════

import { player, saveGame, countAvailable } from '../state.js';
import { getKnightData, getArmorData, getHorseData, getSquireData, getShieldData, KNIGHT_COLORS, DB_ARMORS, DB_HORSES, DB_SQUIRES, DB_SHIELDS } from '../data.js';
import { $, $$ , refreshGold } from './nav.js';

let currentEquipTab = 'armor';
let equipKnightId = null;

export function renderRoster() {
  refreshGold();
  const container = $('#roster-list');
  container.innerHTML = '';

  player.knights.forEach(kid => {
    const kd = getKnightData(kid);
    if (!kd) return;
    const c = KNIGHT_COLORS[kd.colorIdx];
    const eq = player.equip[kid] || {};
    const arm = eq.armor ? getArmorData(eq.armor) : null;
    const hrs = eq.horse ? getHorseData(eq.horse) : null;
    const sqr = eq.squire ? getSquireData(eq.squire) : null;
    const shd = eq.shield ? getShieldData(eq.shield) : null;

    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${c.plume}`;
    div.innerHTML = `
      <div class="card-row">
        <div class="card-icon" style="background:#1a110a; color:#fff; font-size:28px">${kd.icon}</div>
        <div class="card-info">
          <div class="card-name">${kd.name}</div>
          <div class="card-stats">
            <span class="stat-badge str">FUE ${kd.str}</span>
            <span class="stat-badge def">DEF ${kd.def}${arm ? '+' + arm.defB : ''}</span>
            <span class="stat-badge hor">MON ${kd.hor}</span>
          </div>
        </div>
      </div>
      
      <div class="roster-equip-preview">
        <div class="mini-slot">
          <div class="icon">${arm ? '🛡' : '➕'}</div>
          <div class="label">${arm ? arm.name : 'Armadura'}</div>
        </div>
        <div class="mini-slot">
          <div class="icon">${hrs ? '🐴' : '➕'}</div>
          <div class="label">${hrs ? hrs.name : 'Caballo'}</div>
        </div>
        <div class="mini-slot">
          <div class="icon">${shd ? '🛡️' : '➕'}</div>
          <div class="label">${shd ? shd.name : 'Escudo'}</div>
        </div>
        <div class="mini-slot">
          <div class="icon">${sqr ? '🧑' : '➕'}</div>
          <div class="label">${sqr ? sqr.name : 'Escudero'}</div>
        </div>
      </div>

      <div class="mt-16">
        <button class="btn btn-gold btn-equip" data-kid="${kid}" style="width:100%; padding:10px; font-size:12px">⚙ GESTIONAR EQUIPO</button>
      </div>`;
    container.appendChild(div);
  });

  container.querySelectorAll('.btn-equip').forEach(btn => {
    btn.addEventListener('click', () => openEquipModal(btn.dataset.kid));
  });
}

export function openEquipModal(knightId) {
  equipKnightId = knightId;
  const kd = getKnightData(knightId);
  $('#modal-equip-title').textContent = `${kd.name}`;
  currentEquipTab = 'armor';
  renderEquipTab();
  $('#modal-equip').classList.add('open');
}

export function renderEquipTab() {
  const container = $('#equip-list');
  container.innerHTML = '';
  const eq = player.equip[equipKnightId] || {};
  const currentId = eq[currentEquipTab] || null;

  let db;
  if (currentEquipTab === 'armor')  { db = DB_ARMORS; }
  else if (currentEquipTab === 'horse')  { db = DB_HORSES; }
  else if (currentEquipTab === 'shield') { db = DB_SHIELDS; }
  else if (currentEquipTab === 'squire') { db = DB_SQUIRES; }

  const grid = document.createElement('div');
  grid.className = 'equip-grid';

  // Opción "Sin Equipar"
  const noneDiv = document.createElement('div');
  noneDiv.className = `equip-item ${currentId === null ? 'selected' : ''}`;
  noneDiv.innerHTML = `
    <div class="item-name">Desequipar</div>
    <div style="font-size:20px; text-align:center; margin:10px 0">❌</div>
  `;
  noneDiv.onclick = () => {
    if (!player.equip[equipKnightId]) player.equip[equipKnightId] = {};
    player.equip[equipKnightId][currentEquipTab] = null;
    saveGame();
    renderEquipTab();
  };
  grid.appendChild(noneDiv);

  db.forEach(item => {
    const avail = countAvailable(currentEquipTab, item.id);
    const isCurrent = currentId === item.id;
    const canEquip = isCurrent || avail > 0;

    const div = document.createElement('div');
    div.className = `equip-item ${isCurrent ? 'selected' : ''} ${!canEquip ? 'disabled' : ''}`;

    let statsHtml = '';
    if (item.defB !== undefined) statsHtml += `<span class="stat-badge def" style="background:#fff">🛡 +${item.defB}</span>`;
    if (item.spdB !== undefined && item.spdB !== 0) statsHtml += `<span class="stat-badge str" style="background:#fff">⚡ ${item.spdB > 0 ? '+' : ''}${item.spdB}</span>`;
    if (item.eff  !== undefined) statsHtml += `<span class="stat-badge hor" style="background:#fff">⭐ ${item.eff}</span>`;
    if (item.duration !== undefined) statsHtml += `<span class="stat-badge spd" style="background:#fff">⏱️ ${(item.duration/1000).toFixed(1)}s</span>`;

    div.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-stats">${statsHtml}</div>
      ${!isCurrent && canEquip ? `<div class="item-avail">Disp: ${avail}</div>` : ''}
      ${isCurrent ? `<div class="item-check">✓</div>` : ''}
    `;

    if (canEquip) {
      div.onclick = () => {
        if (!player.equip[equipKnightId]) player.equip[equipKnightId] = {};
        player.equip[equipKnightId][currentEquipTab] = item.id;
        saveGame();
        renderEquipTab();
      };
    }
    grid.appendChild(div);
  });

  container.appendChild(grid);
}

// Modal bindings
$('#modal-equip-close').addEventListener('click', () => {
  $('#modal-equip').classList.remove('open');
  renderRoster();
});

$$('#equip-tabs .shop-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentEquipTab = tab.dataset.etab;
    $$('#equip-tabs .shop-tab').forEach(t => t.classList.toggle('active', t.dataset.etab === currentEquipTab));
    renderEquipTab();
  });
});
