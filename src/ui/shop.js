// ══════════════════════════════════════
// TIENDA (SHOP)
// ══════════════════════════════════════

import { player, saveGame } from '../state.js';
import { DB_KNIGHTS, DB_ARMORS, DB_HORSES, DB_SQUIRES, DB_SHIELDS, KNIGHT_COLORS } from '../data.js';
import { $, $$, refreshGold } from './nav.js';

let currentShopTab = 'knights';

export function renderShop() {
  refreshGold();
  const container = $('#shop-list');
  container.innerHTML = '';

  let items;
  if (currentShopTab === 'knights') items = DB_KNIGHTS;
  else if (currentShopTab === 'armors') items = DB_ARMORS;
  else if (currentShopTab === 'horses') items = DB_HORSES;
  else if (currentShopTab === 'shields') items = DB_SHIELDS;
  else items = DB_SQUIRES;

  items.forEach(item => {
    if (item.cost <= 0 && currentShopTab === 'knights' && player.knights.includes(item.id)) return;
    if (item.cost <= 0 && currentShopTab !== 'knights') return;

    const owned = currentShopTab === 'knights'
      ? player.knights.includes(item.id)
      : player[currentShopTab].filter(id => id === item.id).length;

    const alreadyOwned = currentShopTab === 'knights' && player.knights.includes(item.id);

    const div = document.createElement('div');
    div.className = 'card';

    let statsHtml = '';
    if (item.str !== undefined) statsHtml += `<span class="stat-badge str">FUE ${item.str}</span>`;
    if (item.def !== undefined) statsHtml += `<span class="stat-badge def">DEF ${item.def}</span>`;
    if (item.hor !== undefined) statsHtml += `<span class="stat-badge hor">MON ${item.hor}</span>`;
    if (item.defB !== undefined) statsHtml += `<span class="stat-badge def">DEF +${item.defB}</span>`;
    if (item.spdB !== undefined && item.spdB !== 0) statsHtml += `<span class="stat-badge spd">VEL ${item.spdB > 0 ? '+' : ''}${item.spdB}</span>`;
    if (item.sta !== undefined) statsHtml += `<span class="stat-badge hor">STA ${item.sta}</span>`;
    if (item.eff !== undefined) statsHtml += `<span class="stat-badge spd">EFI ${item.eff}</span>`;
    if (item.duration !== undefined) statsHtml += `<span class="stat-badge spd">TIEMPO ${(item.duration/1000).toFixed(1)}s</span>`;

    const iconBg = item.colorIdx !== undefined ? KNIGHT_COLORS[item.colorIdx].shield : 'var(--card-hover)';
    const icon = item.icon || (currentShopTab === 'armors' ? '🛡' : currentShopTab === 'horses' ? '🐴' : currentShopTab === 'shields' ? '🛡️' : '🧑');

    div.innerHTML = `
      <div class="card-row">
        <div class="card-icon" style="background:${iconBg}; color:#fff">${icon}</div>
        <div class="card-info">
          <div class="card-name">${item.name} ${typeof owned === 'number' && owned > 0 ? `(x${owned})` : alreadyOwned ? '✓' : ''}</div>
          <div class="card-stats">${statsHtml}</div>
          <div class="card-desc">${item.desc || ''}</div>
        </div>
        ${alreadyOwned
          ? '<span class="text-dim text-sm">Reclutado</span>'
          : item.cost > 0
            ? `<button class="btn btn-gold btn-sm btn-buy" data-id="${item.id}" ${player.gold < item.cost ? 'disabled' : ''}>🪙 ${item.cost}</button>`
            : ''}
      </div>`;
    container.appendChild(div);
  });

  container.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => buyItem(btn.dataset.id));
  });
}

export function buyItem(itemId) {
  let item, invKey;
  item = DB_KNIGHTS.find(k => k.id === itemId);
  if (item) {
    if (player.knights.includes(itemId)) return;
    if (player.gold < item.cost) return;
    player.gold -= item.cost;
    player.knights.push(itemId);
    player.equip[itemId] = { armor: null, horse: null, squire: null, shield: null };
    saveGame(); renderShop(); return;
  }
  item = DB_ARMORS.find(a => a.id === itemId);
  if (item) { invKey = 'armors'; }
  else { item = DB_HORSES.find(h => h.id === itemId); if (item) invKey = 'horses'; }
  if (!item) { item = DB_SHIELDS.find(sh => sh.id === itemId); if (item) invKey = 'shields'; }
  if (!item) { item = DB_SQUIRES.find(s => s.id === itemId); if (item) invKey = 'squires'; }
  if (!item) return;
  if (player.gold < item.cost) return;
  player.gold -= item.cost;
  player[invKey].push(itemId);
  saveGame();
  renderShop();
}

// Shop tab bindings
$$('#shop-tabs .shop-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentShopTab = tab.dataset.tab;
    $$('#shop-tabs .shop-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === currentShopTab));
    renderShop();
  });
});
