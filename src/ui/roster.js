// ══════════════════════════════════════
// PLANTEL (ROSTER) + MODAL DE EQUIPAMIENTO
// ══════════════════════════════════════

import { player, saveGame, countAvailable } from '../state.js';
import { getKnightData, getArmorData, getHorseData, getSquireData, getShieldData, getLanceData, KNIGHT_COLORS, DB_ARMORS, DB_HORSES, DB_SQUIRES, DB_SHIELDS, DB_LANCES, TYPE_COLORS } from '../data.js';
import { $, $$ , refreshGold } from './nav.js';

let currentEquipTab = 'lance';
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
    const arm = getArmorData(eq.armor || 'a1');
    const hrs = getHorseData(eq.horse || 'h1');
    const sqr = eq.squire ? getSquireData(eq.squire) : null;
    const shd = getShieldData(eq.shield || 's1');
    const lnc = getLanceData(eq.lance || 'l1');

    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${c.plume}`;
    
    div.innerHTML = `
      <div class="card-content">
        <div class="card-header">
          <div class="card-icon" style="background:#000; color:#fff; font-size:28px">${kd.icon}</div>
          <div class="card-title-group">
            <div class="card-name">${kd.name}</div>
            <div class="card-stats-row">
              <span class="stat-badge str">⚔️ ${kd.str}</span>
              <span class="stat-badge def">🛡️ ${kd.def}</span>
              <span class="stat-badge hor">🏇 ${kd.hor}</span>
            </div>
          </div>
        </div>
        
        <div class="roster-equip-preview">
          <div class="mini-slot">
            <div class="icon-frame" style="border-color:${TYPE_COLORS.lance}">⚔️</div>
            <div class="label">${lnc.name}</div>
          </div>
          <div class="mini-slot">
            <div class="icon-frame" style="border-color:${TYPE_COLORS.shield}">🛡️</div>
            <div class="label">${shd.name}</div>
          </div>
          <div class="mini-slot">
            <div class="icon-frame" style="border-color:${TYPE_COLORS.armor}">🛡</div>
            <div class="label">${arm.name}</div>
          </div>
          <div class="mini-slot">
            <div class="icon-frame" style="border-color:${TYPE_COLORS.horse}">🐴</div>
            <div class="label">${hrs.name}</div>
          </div>
          <div class="mini-slot">
            <div class="icon-frame" style="border-color:#555">${sqr ? '🧑' : '❌'}</div>
            <div class="label">${sqr ? sqr.name : 'Libre'}</div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <button class="btn btn-gold btn-equip" data-kid="${kid}" style="width:100%; padding:10px; font-size:12px">
          ⚙️ GESTIONAR EQUIPAMIENTO
        </button>
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
  renderEquipTab();
  $('#modal-equip').classList.add('open');
}

export function renderEquipTab() {
  const container = $('#equip-list');
  container.innerHTML = '';
  
  if (!player.equip[equipKnightId]) {
      player.equip[equipKnightId] = { lance: 'l1', armor: 'a1', horse: 'h1', shield: 's1', squire: null };
  }
  
  const eq = player.equip[equipKnightId];
  const currentId = eq[currentEquipTab] || null;

  // Sync Tabs Visuals
  $$('#equip-tabs .shop-tab').forEach(t => {
      const active = t.dataset.etab === currentEquipTab;
      t.classList.toggle('active', active);
      t.style.borderColor = active ? (TYPE_COLORS[t.dataset.etab] || 'var(--gold)') : 'var(--gold-dim)';
      t.style.color = active ? '#000' : 'var(--text-dim)';
      if (active) t.style.background = TYPE_COLORS[t.dataset.etab] || 'var(--gold)';
      else t.style.background = '#1a110a';
  });

  let db;
  if (currentEquipTab === 'armor')  { db = DB_ARMORS; }
  else if (currentEquipTab === 'horse')  { db = DB_HORSES; }
  else if (currentEquipTab === 'shield') { db = DB_SHIELDS; }
  else if (currentEquipTab === 'lance')  { db = DB_LANCES; }
  else if (currentEquipTab === 'squire') { db = DB_SQUIRES; }

  const grid = document.createElement('div');
  grid.className = 'equip-grid';

  if (currentEquipTab === 'squire') {
      const noneDiv = document.createElement('div');
      noneDiv.className = `equip-item ${currentId === null ? 'selected' : ''}`;
      noneDiv.innerHTML = `
        <div class="item-header">
          <div class="item-name">Ninguno</div>
        </div>
        <div class="item-body" style="text-align:center; font-size:24px; padding:20px">❌</div>
        <div class="item-footer">VACÍO</div>
      `;
      noneDiv.onclick = () => {
        player.equip[equipKnightId][currentEquipTab] = null;
        saveGame();
        renderEquipTab();
      };
      grid.appendChild(noneDiv);
  }

  db.forEach(item => {
    const invKey = currentEquipTab + 's';
    const avail = countAvailable(invKey, item.id);
    const isCurrent = currentId === item.id;
    const canEquip = isCurrent || avail > 0;

    const div = document.createElement('div');
    div.className = `equip-item ${isCurrent ? 'selected' : ''} ${!canEquip ? 'disabled' : ''}`;
    
    if (isCurrent) {
        div.style.borderColor = TYPE_COLORS[currentEquipTab] || 'var(--gold)';
    }

    let statsHtml = '';
    if (item.str) statsHtml += `<span class="stat-badge" style="border-color:${TYPE_COLORS.lance}">⚔️ ${item.str}</span>`;
    if (item.def) statsHtml += `<span class="stat-badge" style="border-color:${TYPE_COLORS.shield}">🛡️ ${item.def}</span>`;
    if (item.spd) statsHtml += `<span class="stat-badge" style="border-color:${TYPE_COLORS.horse}">🏇 ${item.spd}</span>`;
    if (item.hp)  statsHtml += `<span class="stat-badge" style="border-color:${TYPE_COLORS.armor}">❤️ ${item.hp}</span>`;

    div.innerHTML = `
      <div class="item-header">
        <div class="item-name">${item.name}</div>
        <div class="item-tier">${item.tier ? 'TIER ' + item.tier : ''}</div>
      </div>
      <div class="item-body">
        <div class="item-stats">${statsHtml}</div>
      </div>
      <div class="item-footer">
        ${isCurrent ? 'EQUIPADO' : (canEquip ? `DISP: ${avail}` : 'NO DISPONIBLE')}
      </div>
      ${isCurrent ? `<div class="item-check" style="background:${TYPE_COLORS[currentEquipTab] || 'var(--gold)'}">✓</div>` : ''}
    `;

    if (canEquip) {
      div.onclick = () => {
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
    renderEquipTab();
  });
});
