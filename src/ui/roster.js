// ══════════════════════════════════════
// PLANTEL (ROSTER) + MODAL DE EQUIPAMIENTO
// ══════════════════════════════════════

import { player, saveGame, countAvailable } from '../state.js';
import { getKnightData, getArmorData, getHorseData, getSquireData, KNIGHT_COLORS, DB_ARMORS, DB_HORSES, DB_SQUIRES } from '../data.js';
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

    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `3px solid ${c.plume}`;
    div.innerHTML = `
      <div class="card-row">
        <div class="card-icon" style="background:${c.shield}; color:#fff; font-size:28px">${kd.icon}</div>
        <div class="card-info">
          <div class="card-name">${kd.name}</div>
          <div class="card-stats">
            <span class="stat-badge str">FUE ${kd.str}</span>
            <span class="stat-badge def">DEF ${kd.def}${arm ? '+' + arm.defB : ''}</span>
            <span class="stat-badge hor">MON ${kd.hor}</span>
          </div>
          <div class="card-desc mt-8">
            🛡 ${arm ? arm.name : '—'}
            &nbsp;·&nbsp; 🐴 ${hrs ? hrs.name : '—'}
            &nbsp;·&nbsp; 🧑 ${sqr ? sqr.name : '—'}
          </div>
        </div>
      </div>
      <div class="mt-8 flex-center">
        <button class="btn btn-ghost btn-sm btn-equip" data-kid="${kid}">Equipar</button>
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
  $('#modal-equip-title').textContent = `Equipar: ${kd.name}`;
  currentEquipTab = 'armor';
  renderEquipTab();
  $('#modal-equip').classList.add('open');
}

export function renderEquipTab() {
  const container = $('#equip-list');
  container.innerHTML = '';
  const eq = player.equip[equipKnightId] || {};
  const currentId = eq[currentEquipTab] || null;

  let db, invKey;
  if (currentEquipTab === 'armor')  { db = DB_ARMORS;  invKey = 'armors'; }
  if (currentEquipTab === 'horse')  { db = DB_HORSES;  invKey = 'horses'; }
  if (currentEquipTab === 'squire') { db = DB_SQUIRES; invKey = 'squires'; }

  const noneDiv = document.createElement('div');
  noneDiv.className = `pick-item${currentId === null ? ' selected' : ''}`;
  noneDiv.innerHTML = `<span class="pick-icon">❌</span><div class="pick-info"><div class="pick-name">Sin equipar</div></div>`;
  noneDiv.addEventListener('click', () => {
    if (!player.equip[equipKnightId]) player.equip[equipKnightId] = {};
    player.equip[equipKnightId][currentEquipTab] = null;
    saveGame();
    renderEquipTab();
  });
  container.appendChild(noneDiv);

  db.forEach(item => {
    const avail = countAvailable(currentEquipTab, item.id);
    const isCurrent = currentId === item.id;
    const canEquip = isCurrent || avail > 0;

    const div = document.createElement('div');
    div.className = `pick-item${isCurrent ? ' selected' : ''}`;
    div.style.opacity = canEquip ? '1' : '0.35';

    let statsHtml = '';
    if (item.defB !== undefined) statsHtml += `<span class="stat-badge def">DEF +${item.defB}</span>`;
    if (item.spdB !== undefined && item.spdB !== 0) statsHtml += `<span class="stat-badge spd">VEL ${item.spdB > 0 ? '+' : ''}${item.spdB}</span>`;
    if (item.sta  !== undefined) statsHtml += `<span class="stat-badge hor">STA ${item.sta}</span>`;
    if (item.eff  !== undefined) statsHtml += `<span class="stat-badge spd">EFI ${item.eff}</span>`;

    div.innerHTML = `
      <div class="pick-info">
        <div class="pick-name">${item.name} ${isCurrent ? '✓' : ''}</div>
        <div class="card-stats">${statsHtml}</div>
        <div class="pick-desc">${item.desc || ''} ${!isCurrent && avail > 0 ? `(${avail} disp.)` : ''}</div>
      </div>`;

    if (canEquip) {
      div.addEventListener('click', () => {
        if (!player.equip[equipKnightId]) player.equip[equipKnightId] = {};
        player.equip[equipKnightId][currentEquipTab] = item.id;
        saveGame();
        renderEquipTab();
      });
    }
    container.appendChild(div);
  });
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
