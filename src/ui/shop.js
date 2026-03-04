// ══════════════════════════════════════
// TIENDA (SHOP)
// ══════════════════════════════════════

import { player, saveGame } from '../state.js';
import { DB_KNIGHTS, DB_ARMORS, DB_HORSES, DB_SQUIRES, DB_SHIELDS, DB_LANCES, KNIGHT_COLORS, TYPE_COLORS } from '../data.js';
import { $, $$, refreshGold } from './nav.js';

let currentShopTab = 'knights';

export function renderShop() {
  refreshGold();
  const container = $('#shop-list');
  container.innerHTML = '';

  let items;
  if (currentShopTab === 'knights') items = DB_KNIGHTS;
  else if (currentShopTab === 'lances') items = DB_LANCES;
  else if (currentShopTab === 'armors') items = DB_ARMORS;
  else if (currentShopTab === 'horses') items = DB_HORSES;
  else if (currentShopTab === 'shields') items = DB_SHIELDS;
  else items = DB_SQUIRES;

  items.forEach(item => {
    // Hide free tier 1 items if we already have them
    if (item.cost <= 0 && currentShopTab !== 'knights') return;
    if (item.cost <= 0 && currentShopTab === 'knights' && player.knights.includes(item.id)) return;

    const owned = currentShopTab === 'knights'
      ? player.knights.includes(item.id)
      : player[currentShopTab].filter(id => id === item.id).length;

    const alreadyOwned = currentShopTab === 'knights' && player.knights.includes(item.id);

    const div = document.createElement('div');
    div.className = 'card';

    let statsHtml = '';
    if (item.str) statsHtml += `<span class="stat-badge" style="border-color:${TYPE_COLORS.lance}">⚔️ FUE ${item.str}</span>`;
    if (item.def) statsHtml += `<span class="stat-badge" style="border-color:${TYPE_COLORS.shield}">🛡️ DEF ${item.def}</span>`;
    if (item.spd) statsHtml += `<span class="stat-badge" style="border-color:${TYPE_COLORS.horse}">🏇 VEL ${item.spd}</span>`;
    if (item.hp)  statsHtml += `<span class="stat-badge" style="border-color:${TYPE_COLORS.armor}">❤️ HP +${item.hp}</span>`;
    if (item.hor) statsHtml += `<span class="stat-badge" style="border-color:${TYPE_COLORS.horse}">⭐ MON ${item.hor}</span>`;
    
    if (item.cd)  statsHtml += `<span class="stat-badge" style="opacity:0.7">⏳ CD ${(item.cd/1000).toFixed(0)}s</span>`;
    if (item.dur) statsHtml += `<span class="stat-badge" style="opacity:0.7">⏱️ DUR ${(item.dur/1000).toFixed(1)}s</span>`;

    const iconBg = item.colorIdx !== undefined ? KNIGHT_COLORS[item.colorIdx].shield : '#000';
    let icon = item.icon || '📦';
    if (currentShopTab === 'armors') icon = '🛡';
    if (currentShopTab === 'horses') icon = '🐴';
    if (currentShopTab === 'shields') icon = '🛡️';
    if (currentShopTab === 'lances') icon = '⚔️';
    if (currentShopTab === 'squires') icon = '🧑';

    div.innerHTML = `
      <div class="card-content">
        <div class="card-header">
          <div class="card-icon" style="background:${iconBg}; color:#fff">${icon}</div>
          <div class="card-title-group">
            <div class="card-name">${item.name} ${typeof owned === 'number' && owned > 1 ? `(x${owned})` : ''}</div>
            <div class="card-tier">${item.tier ? `Tier ${item.tier}` : (currentShopTab === 'knights' ? 'Caballero' : 'Personal')}</div>
          </div>
        </div>
        
        <div class="card-desc">${item.desc || 'Sin descripción disponible.'}</div>
        
        <div class="card-stats-row">${statsHtml}</div>
      </div>

      <div class="card-footer">
        <div class="price-tag">
          ${alreadyOwned ? '<span style="font-size:12px; color:var(--text-dim)">RECLUTADO</span>' : `🪙 ${item.cost}`}
        </div>
        ${!alreadyOwned ? `
          <button class="btn btn-gold btn-sm btn-buy" data-id="${item.id}" ${player.gold < item.cost ? 'disabled' : ''}>
            COMPRAR
          </button>
        ` : ''}
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
    player.equip[itemId] = { armor: 'a1', horse: 'h1', squire: null, shield: 's1', lance: 'l1' };
    saveGame(); renderShop(); return;
  }

  item = DB_LANCES.find(i => i.id === itemId); 
  if (item) { invKey = 'lances'; }
  else if ((item = DB_ARMORS.find(i => i.id === itemId))) { invKey = 'armors'; }
  else if ((item = DB_HORSES.find(i => i.id === itemId))) { invKey = 'horses'; }
  else if ((item = DB_SHIELDS.find(i => i.id === itemId))) { invKey = 'shields'; }
  else if ((item = DB_SQUIRES.find(i => i.id === itemId))) { invKey = 'squires'; }

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
