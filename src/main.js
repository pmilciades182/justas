// ═══════════════════════════════════════════════════════════════
// JUSTA REAL — Prototipo completo de juego medieval de justas
// ═══════════════════════════════════════════════════════════════

// ══════════════════════════════════════
// §1  BASE DE DATOS DE ITEMS
// ══════════════════════════════════════

const DB_KNIGHTS = [
  { id: 'roland',   name: 'Sir Roland',   str: 6, def: 6, hor: 6, cost: 0,   icon: '🔴', colorIdx: 0 },
  { id: 'dorian',   name: 'Sir Dorian',   str: 5, def: 8, hor: 5, cost: 0,   icon: '🔵', colorIdx: 1 },
  { id: 'pelayo',   name: 'Don Pelayo',   str: 8, def: 4, hor: 6, cost: 200, icon: '🟤', colorIdx: 2 },
  { id: 'gawain',   name: 'Sir Gawain',   str: 5, def: 5, hor: 9, cost: 250, icon: '🟢', colorIdx: 3 },
  { id: 'cid',      name: 'El Cid',       str: 8, def: 7, hor: 8, cost: 400, icon: '🟡', colorIdx: 4 },
  { id: 'lancelot', name: 'Sir Lancelot', str: 9, def: 6, hor: 9, cost: 500, icon: '🟣', colorIdx: 5 },
  { id: 'baron',    name: 'Barón Rojo',   str: 9, def: 3, hor: 7, cost: 300, icon: '🔶', colorIdx: 6 },
  { id: 'percival', name: 'Sir Percival', str: 7, def: 7, hor: 7, cost: 350, icon: '⚪', colorIdx: 7 },
];

const DB_ARMORS = [
  { id: 'malla',    name: 'Cota de Malla',     defB: 1, spdB: 0,  cost: 0,   desc: 'Protección básica' },
  { id: 'cuero',    name: 'Armadura de Cuero',  defB: 2, spdB: 0,  cost: 80,  desc: 'Ligera y resistente' },
  { id: 'placas',   name: 'Placas de Acero',    defB: 3, spdB: -1, cost: 150, desc: 'Protección sólida' },
  { id: 'milanes',  name: 'Arnés Milanés',      defB: 4, spdB: -1, cost: 250, desc: 'Artesanía italiana' },
  { id: 'justa',    name: 'Arnés de Justa',     defB: 5, spdB: -2, cost: 400, desc: 'La mejor protección' },
];

const DB_HORSES = [
  { id: 'rocin',    name: 'Rocín',       spdB: 0, sta: 3, cost: 0,   desc: 'Caballo humilde' },
  { id: 'corcel',   name: 'Corcel',      spdB: 1, sta: 4, cost: 120, desc: 'Rápido y ágil' },
  { id: 'destrero', name: 'Destrero',    spdB: 2, sta: 5, cost: 250, desc: 'Caballo de guerra' },
  { id: 'andaluz',  name: 'Andaluz',     spdB: 3, sta: 6, cost: 400, desc: 'Nobleza española' },
];

const DB_SQUIRES = [
  { id: 'novato',  name: 'Novato',        eff: 1, cost: 0,   desc: 'Lento pero cumple' },
  { id: 'aprend',  name: 'Aprendiz',      eff: 2, cost: 100, desc: 'Va aprendiendo' },
  { id: 'experto', name: 'Experimentado', eff: 3, cost: 200, desc: 'Rápido y fiable' },
  { id: 'vetera',  name: 'Veterano',      eff: 4, cost: 350, desc: 'El mejor del reino' },
];

// Paleta de colores para cada caballero
const KNIGHT_COLORS = [
  { armor: '#b0bec5', plume: '#e74c3c', shield: '#c0392b', horse: '#5c3317' },
  { armor: '#546e7a', plume: '#3498db', shield: '#2471a3', horse: '#4a2810' },
  { armor: '#8d6e63', plume: '#ff9800', shield: '#e65100', horse: '#3b1f0a' },
  { armor: '#66bb6a', plume: '#2e7d32', shield: '#1b5e20', horse: '#5c3317' },
  { armor: '#fdd835', plume: '#f9a825', shield: '#f57f17', horse: '#3e2723' },
  { armor: '#ab47bc', plume: '#7b1fa2', shield: '#4a148c', horse: '#4a2810' },
  { armor: '#ef5350', plume: '#b71c1c', shield: '#d32f2f', horse: '#5c3317' },
  { armor: '#e0e0e0', plume: '#bdbdbd', shield: '#757575', horse: '#3b1f0a' },
];

// ══════════════════════════════════════
// §2  ESTADO DEL JUGADOR (con localStorage)
// ══════════════════════════════════════

const SAVE_KEY = 'justa_real_save';

function defaultSave() {
  return {
    gold: 500,
    wins: 0,
    losses: 0,
    // Caballeros propios (por id)
    knights: ['roland', 'dorian'],
    // Inventario de items (por id, con duplicados posibles)
    armors:  ['malla', 'malla'],
    horses:  ['rocin', 'rocin'],
    squires: ['novato'],
    // Asignación de equipo: { knightId: { armor, horse, squire } }
    equip: {
      roland: { armor: 'malla', horse: 'rocin', squire: 'novato' },
      dorian: { armor: 'malla', horse: 'rocin', squire: null },
    },
    // Equipo de justa (array de knightIds, hasta 6)
    team: ['roland', 'dorian'],
  };
}

let player;
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { player = JSON.parse(raw); return; }
  } catch(e) { /* ignore */ }
  player = defaultSave();
}
function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); } catch(e) { /* ignore */ }
}
loadGame();

// helpers
function getKnightData(id) { return DB_KNIGHTS.find(k => k.id === id); }
function getArmorData(id)  { return DB_ARMORS.find(a => a.id === id); }
function getHorseData(id)  { return DB_HORSES.find(h => h.id === id); }
function getSquireData(id) { return DB_SQUIRES.find(s => s.id === id); }

// Count how many of an item are in use (assigned to knights)
function countAssigned(type, itemId) {
  let c = 0;
  for (const eq of Object.values(player.equip)) {
    if (eq[type] === itemId) c++;
  }
  return c;
}
// Count available (in inventory minus assigned)
function countAvailable(type, itemId) {
  const inInv = player[type + 's'].filter(id => id === itemId).length;
  return inInv - countAssigned(type, itemId);
}

// ══════════════════════════════════════
// §3  NAVEGACIÓN / UI
// ══════════════════════════════════════

let currentScreen = 'home';
let currentShopTab = 'knights';
let currentEquipTab = 'armor';
let equipKnightId = null;
let pickSlotIdx = -1;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function switchScreen(name) {
  currentScreen = name;
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`#screen-${name}`).classList.add('active');
  $$('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.screen === name));

  // Hide topbar & nav during joust
  const inJoust = name === 'joust';
  $('#topbar').classList.toggle('hidden', inJoust);
  $('#bottomnav').classList.toggle('hidden', inJoust);

  if (name === 'home')   renderHome();
  if (name === 'roster') renderRoster();
  if (name === 'shop')   renderShop();
  if (name === 'team')   renderTeam();
  if (name === 'joust')  initJoustScreen();
}

// Bottom nav
$$('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => switchScreen(tab.dataset.screen));
});

// Gold display
function refreshGold() {
  $('#gold-display').textContent = `🪙 ${player.gold}`;
}

// ══════════════════════════════════════
// §4  PANTALLA CASA (HOME)
// ══════════════════════════════════════

function renderHome() {
  refreshGold();
  $('#stat-knights').textContent = player.knights.length;
  $('#stat-wins').textContent = player.wins;
  $('#stat-losses').textContent = player.losses;

  const container = $('#home-team-preview');
  container.innerHTML = '';
  if (player.team.length === 0) {
    container.innerHTML = '<p class="text-center text-dim text-sm">No hay equipo seleccionado</p>';
  } else {
    player.team.forEach(kid => {
      const kd = getKnightData(kid);
      if (!kd) return;
      const c = KNIGHT_COLORS[kd.colorIdx];
      const eq = player.equip[kid] || {};
      const arm = eq.armor ? getArmorData(eq.armor) : null;
      const hrs = eq.horse ? getHorseData(eq.horse) : null;
      container.innerHTML += `
        <div class="card" style="border-left: 3px solid ${c.plume}">
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

  // Enable/disable joust button
  $('#btn-quick-joust').disabled = player.team.length < 1;
}

$('#btn-quick-joust').addEventListener('click', () => {
  switchScreen('joust');
});

// ══════════════════════════════════════
// §5  PLANTEL (ROSTER)
// ══════════════════════════════════════

function renderRoster() {
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

  // Equip buttons
  container.querySelectorAll('.btn-equip').forEach(btn => {
    btn.addEventListener('click', () => openEquipModal(btn.dataset.kid));
  });
}

// ══════════════════════════════════════
// §6  MODAL DE EQUIPAMIENTO
// ══════════════════════════════════════

function openEquipModal(knightId) {
  equipKnightId = knightId;
  const kd = getKnightData(knightId);
  $('#modal-equip-title').textContent = `Equipar: ${kd.name}`;
  currentEquipTab = 'armor';
  renderEquipTab();
  $('#modal-equip').classList.add('open');
}

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

function renderEquipTab() {
  const container = $('#equip-list');
  container.innerHTML = '';
  const eq = player.equip[equipKnightId] || {};
  const currentId = eq[currentEquipTab] || null;

  let db, invKey;
  if (currentEquipTab === 'armor')  { db = DB_ARMORS;  invKey = 'armors'; }
  if (currentEquipTab === 'horse')  { db = DB_HORSES;  invKey = 'horses'; }
  if (currentEquipTab === 'squire') { db = DB_SQUIRES;  invKey = 'squires'; }

  // "None" option
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

// ══════════════════════════════════════
// §7  TIENDA (SHOP)
// ══════════════════════════════════════

$$('#shop-tabs .shop-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentShopTab = tab.dataset.tab;
    $$('#shop-tabs .shop-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === currentShopTab));
    renderShop();
  });
});

function renderShop() {
  refreshGold();
  const container = $('#shop-list');
  container.innerHTML = '';

  let items;
  if (currentShopTab === 'knights') items = DB_KNIGHTS;
  else if (currentShopTab === 'armors') items = DB_ARMORS;
  else if (currentShopTab === 'horses') items = DB_HORSES;
  else items = DB_SQUIRES;

  items.forEach(item => {
    if (item.cost <= 0 && currentShopTab === 'knights' && player.knights.includes(item.id)) return;
    if (item.cost <= 0 && currentShopTab !== 'knights') return; // Starting items can't be rebought

    const owned = currentShopTab === 'knights'
      ? player.knights.includes(item.id)
      : player[currentShopTab].filter(id => id === item.id).length;

    const canBuy = !owned && player.gold >= item.cost || (currentShopTab !== 'knights' && player.gold >= item.cost);
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

    const iconBg = item.colorIdx !== undefined ? KNIGHT_COLORS[item.colorIdx].shield : 'var(--card-hover)';
    const icon = item.icon || (currentShopTab === 'armors' ? '🛡' : currentShopTab === 'horses' ? '🐴' : '🧑');

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

function buyItem(itemId) {
  // Find which DB and which inventory
  let item, invKey;
  item = DB_KNIGHTS.find(k => k.id === itemId);
  if (item) {
    if (player.knights.includes(itemId)) return;
    if (player.gold < item.cost) return;
    player.gold -= item.cost;
    player.knights.push(itemId);
    player.equip[itemId] = { armor: null, horse: null, squire: null };
    saveGame(); renderShop(); return;
  }
  item = DB_ARMORS.find(a => a.id === itemId);
  if (item) { invKey = 'armors'; }
  else { item = DB_HORSES.find(h => h.id === itemId); if (item) invKey = 'horses'; }
  if (!item) { item = DB_SQUIRES.find(s => s.id === itemId); if (item) invKey = 'squires'; }
  if (!item) return;
  if (player.gold < item.cost) return;
  player.gold -= item.cost;
  player[invKey].push(itemId);
  saveGame();
  renderShop();
}

// ══════════════════════════════════════
// §8  SELECCIÓN DE EQUIPO
// ══════════════════════════════════════

function renderTeam() {
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

  // Click to add
  container.querySelectorAll('.team-slot').forEach(slot => {
    slot.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove-slot')) return;
      const idx = parseInt(slot.dataset.slot);
      if (player.team[idx]) return; // already filled, use remove button
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

$('#btn-start-joust').addEventListener('click', () => switchScreen('joust'));

function openPickKnightModal() {
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
      // Clean nulls from the end
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

$('#modal-pick-close').addEventListener('click', () => {
  $('#modal-pick-knight').classList.remove('open');
});

// ══════════════════════════════════════
// §9  MOTOR DE JUSTA (Canvas)
// ══════════════════════════════════════

const canvas = $('#canvas');
const ctx = canvas.getContext('2d');
const W = 390, H = 844;
canvas.width = W; canvas.height = H;

function resizeCanvas() {
  const screen = $('#screen-joust');
  const sw = screen.clientWidth || window.innerWidth;
  const sh = screen.clientHeight || window.innerHeight;
  const scale = Math.min(sw / W, sh / H);
  canvas.style.width = `${W * scale}px`;
  canvas.style.height = `${H * scale}px`;
}

// Track constants
const LANE_X   = W / 2;
const TRACK_W  = 100;
const TRACK_X  = LANE_X - TRACK_W / 2;
const LANCE_LEN    = 80;
const KNIGHT_BW    = 26;
const KNIGHT_BH    = 42;
const HORSE_W      = 22;
const HORSE_H      = 60;
const MAX_VENIDAS  = 4;
const TRACK_TOP    = 60;
const TRACK_BOT    = H - 60;

// Hit types (same system as before)
const HIT_TABLE = [
  { type: 'miss',     prob: 0.10, pts: 0,  brk: false, label: 'Fallo' },
  { type: 'attaint',  prob: 0.13, pts: 0,  brk: false, label: 'Toque sin romper' },
  { type: 'arm',      prob: 0.12, pts: 1,  brk: true,  label: 'Golpe en brazo' },
  { type: 'shield',   prob: 0.30, pts: 2,  brk: true,  label: 'Lanza rota en escudo' },
  { type: 'helmet',   prob: 0.18, pts: 3,  brk: true,  label: 'Golpe en yelmo' },
  { type: 'lanceTip', prob: 0.05, pts: 5,  brk: true,  label: 'Punta contra punta' },
  { type: 'unhorse',  prob: 0.12, pts: 10, brk: true,  label: '¡Desmontado!' },
];

function rollHit(strBonus, defBonus) {
  let r = Math.random();
  // Adjust probabilities based on stats
  const strFactor = 1 + (strBonus - 5) * 0.04;
  const defFactor = 1 + (defBonus - 5) * 0.04;

  // Higher str = less miss, more damage; higher def = more miss for opponent
  const adjusted = HIT_TABLE.map(h => {
    let p = h.prob;
    if (h.type === 'miss') p *= defFactor / strFactor;
    else if (h.pts >= 3) p *= strFactor / defFactor;
    return { ...h, adjProb: Math.max(0.01, p) };
  });
  const total = adjusted.reduce((s, h) => s + h.adjProb, 0);

  for (const h of adjusted) {
    r -= h.adjProb / total;
    if (r <= 0) return h;
  }
  return adjusted[0];
}

// ── Joust state ──
const COL = {
  grass: '#3a7a35', dirt: '#c8a87a', rail: '#8b6914', railLine: '#6b4f10',
  lance: '#c9a96e', lanceSheen: '#f0d090', horseDark: '#3b1f0a',
};

const joust = {
  active: false,
  matchIdx: 0,          // which match (0-based) in the tournament
  venida: 1,
  subPhase: 'idle',     // idle|charge|clash|pass|squire|turn|pause|result|tourneyEnd
  phaseT: 0,
  t: 0,
  k1: null, k2: null,   // runtime knight objects
  squire1: null, squire2: null,
  k1Hit: null, k2Hit: null,
  k1Points: 0, k2Points: 0,
  history: [],
  sparks: [], dust: [], splinters: [],
  shakeAmt: 0, flashAlpha: 0,
  resultText: '',
  resultColor: '#fff',
  playerTeam: [],
  enemyTeam: [],
  playerMatchWins: 0,
  enemyMatchWins: 0,
};

function setSubPhase(p) { joust.subPhase = p; joust.phaseT = 0; }

// Create a runtime knight for the joust
function makeJoustKnight(knightId, side, equipData) {
  const kd = getKnightData(knightId);
  const c = KNIGHT_COLORS[kd.colorIdx];
  const arm = equipData.armor ? getArmorData(equipData.armor) : null;
  const hrs = equipData.horse ? getHorseData(equipData.horse) : null;
  const sqr = equipData.squire ? getSquireData(equipData.squire) : null;

  const totalDef = kd.def + (arm ? arm.defB : 0);
  const spdMod = (hrs ? hrs.spdB : 0) + (arm ? arm.spdB : 0);
  const baseSpeed = 2.2 + spdMod * 0.2;

  return {
    id: knightId,
    name: kd.name,
    str: kd.str,
    def: totalDef,
    hor: kd.hor,
    squireEff: sqr ? sqr.eff : 0,
    colors: c,
    icon: kd.icon,
    // Position & movement
    x: side === 'left' ? LANE_X - 16 : LANE_X + 16,
    y: side === 'left' ? TRACK_TOP + 20 : TRACK_BOT - 20,
    baseDir: side === 'left' ? 1 : -1,  // 1 = going down, -1 = going up
    speed: 0,
    maxSpeed: baseSpeed,
    // Visual state
    rotation: side === 'left' ? 0 : Math.PI, // 0=facing down, PI=facing up
    targetRotation: side === 'left' ? 0 : Math.PI,
    lanceIntact: true,
    lanceStub: false,
    fallen: false,
    tilt: 0,
    wobble: 0,
    wobbleDecay: 0,
    side: side,
  };
}

// Generate enemy team
function generateEnemy(count) {
  const pool = [...DB_KNIGHTS];
  const team = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const kd = pool[idx];
    team.push({
      knightId: kd.id,
      equip: {
        armor: DB_ARMORS[Math.min(Math.floor(Math.random() * 3), DB_ARMORS.length - 1)].id,
        horse: DB_HORSES[Math.min(Math.floor(Math.random() * 3), DB_HORSES.length - 1)].id,
        squire: DB_SQUIRES[Math.min(Math.floor(Math.random() * 2), DB_SQUIRES.length - 1)].id,
      },
    });
  }
  return team;
}

// Squire runtime — always visible on the field
function makeSquire(side, efficiency) {
  const homeX = side === 'left' ? TRACK_X - 24 : TRACK_X + TRACK_W + 24;
  const startY = side === 'left' ? TRACK_TOP + 40 : TRACK_BOT - 40;
  return {
    homeX,
    x: homeX,
    y: startY,
    targetX: side === 'left' ? LANE_X - 16 : LANE_X + 16,
    phase: 'watching', // watching | running_in | handoff | running_out
    timer: 0,
    speed: 1.5 + efficiency * 0.8,
    side,
    eff: efficiency,
    facingTrack: true, // looks toward the track
  };
}

// ── Particles ──
function spawnSparks(x, y, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 2 + Math.random() * 7;
    joust.sparks.push({
      x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
      life: 1, decay: 0.028 + Math.random()*0.018,
      size: 1.5 + Math.random()*4,
      color: Math.random() < 0.55 ? '#f39c12' : (Math.random() < 0.5 ? '#fff' : '#e74c3c'),
    });
  }
}
function spawnDust(x, y) {
  joust.dust.push({
    x: x+(Math.random()-0.5)*12, y: y+(Math.random()-0.5)*6,
    vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.4,
    size: 4+Math.random()*5, life: 0.7+Math.random()*0.3, decay: 0.035+Math.random()*0.015,
  });
}
function spawnSplinters(x, y, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random()*Math.PI*2;
    const sp = 2.5 + Math.random()*5;
    joust.splinters.push({
      x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
      angle: Math.random()*Math.PI, spin: (Math.random()-0.5)*0.18,
      len: 7+Math.random()*18, life: 1, decay: 0.014+Math.random()*0.014,
    });
  }
}
function updateParticles() {
  for (const p of joust.sparks) { p.x+=p.vx; p.y+=p.vy; p.vy+=0.09; p.vx*=0.97; p.life-=p.decay; }
  joust.sparks = joust.sparks.filter(p => p.life > 0);
  for (const d of joust.dust) { d.x+=d.vx; d.y+=d.vy; d.size*=1.02; d.life-=d.decay; }
  joust.dust = joust.dust.filter(d => d.life > 0);
  for (const s of joust.splinters) { s.x+=s.vx; s.y+=s.vy; s.vy+=0.12; s.angle+=s.spin; s.life-=s.decay; }
  joust.splinters = joust.splinters.filter(s => s.life > 0);
}

// ── Clash resolution ──
function resolveClash() {
  const k1 = joust.k1, k2 = joust.k2;
  let h1 = rollHit(k1.str, k2.def); // k1 attacks k2
  let h2 = rollHit(k2.str, k1.def); // k2 attacks k1

  if (h1.type === 'lanceTip' || h2.type === 'lanceTip') {
    const lt = HIT_TABLE.find(h => h.type === 'lanceTip');
    h1 = lt; h2 = lt;
  }

  joust.k1Hit = h1;
  joust.k2Hit = h2;
  joust.k1Points += h1.pts;
  joust.k2Points += h2.pts;
  joust.history.push({ venida: joust.venida, k1Hit: h1, k2Hit: h2 });

  const impactX = LANE_X;
  const impactY = (k1.y + k2.y) / 2;
  const maxPts = Math.max(h1.pts, h2.pts);

  // Effects by severity
  if (maxPts === 0 && h1.type === 'miss' && h2.type === 'miss') {
    joust.shakeAmt = 0; joust.flashAlpha = 0;
  } else if (maxPts === 0) {
    spawnSparks(impactX, impactY, 8); joust.shakeAmt = 3;
  } else if (maxPts <= 2) {
    spawnSparks(impactX, impactY, 18); spawnSplinters(impactX, impactY, 14);
    joust.shakeAmt = 8; joust.flashAlpha = 0.3;
  } else if (maxPts <= 5) {
    spawnSparks(impactX, impactY, 35); spawnSplinters(impactX, impactY, 28);
    joust.shakeAmt = 14; joust.flashAlpha = 0.6;
  } else {
    spawnSparks(impactX, impactY, 50); spawnSplinters(impactX, impactY, 35);
    joust.shakeAmt = 20; joust.flashAlpha = 0.9;
  }

  // Lance breakage
  if (h1.brk) { k1.lanceIntact = false; k1.lanceStub = true; }
  if (h2.brk) { k2.lanceIntact = false; k2.lanceStub = true; }

  // Wobble/fall
  applyHitEffect(h1, k2);
  applyHitEffect(h2, k1);
}

function applyHitEffect(hit, defender) {
  const s = defender.side === 'left' ? -1 : 1;
  switch (hit.type) {
    case 'arm':      defender.wobble = 0.08 * s; defender.wobbleDecay = 0.015; break;
    case 'shield':   defender.wobble = 0.12 * s; defender.wobbleDecay = 0.012; break;
    case 'helmet':   defender.wobble = 0.22 * s; defender.wobbleDecay = 0.010; break;
    case 'lanceTip': defender.wobble = 0.15 * s; defender.wobbleDecay = 0.012; break;
    case 'unhorse':  defender.fallen = true; break;
  }
}

// ── Squire logic — always updating, always on screen ──
function updateSquireTracking(sq, knight) {
  if (!sq || !knight) return;

  // In 'watching' mode: squire follows knight's Y with lag, stays at home X
  if (sq.phase === 'watching') {
    const targetY = Math.max(TRACK_TOP + 20, Math.min(TRACK_BOT - 20, knight.y));
    sq.y += (targetY - sq.y) * 0.04; // smooth follow
    sq.x += (sq.homeX - sq.x) * 0.1; // drift back to home X
  }
}

function updateSquireDelivery(sq, knight) {
  if (!sq || sq.phase === 'watching') return;

  if (sq.phase === 'running_in') {
    const dx = knight.x - sq.x;
    const dy = knight.y - sq.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) {
      sq.phase = 'handoff';
      sq.timer = 0;
    } else {
      const spd = sq.speed * 2.2;
      sq.x += (dx / dist) * spd;
      sq.y += (dy / dist) * spd;
    }
  } else if (sq.phase === 'handoff') {
    // Stay next to knight
    sq.x += (knight.x - sq.x) * 0.3;
    sq.y += (knight.y - sq.y) * 0.3;
    sq.timer++;
    if (sq.timer > 25) {
      knight.lanceIntact = true;
      knight.lanceStub = false;
      sq.phase = 'running_out';
    }
  } else if (sq.phase === 'running_out') {
    const dx = sq.homeX - sq.x;
    if (Math.abs(dx) < 4) {
      sq.phase = 'watching';
    } else {
      sq.x += (dx > 0 ? 1 : -1) * sq.speed * 2.5;
    }
  }
}

function activateSquire(sq, knight) {
  sq.phase = 'running_in';
  sq.targetX = knight.x;
  // Squire is already near the knight thanks to Y tracking — just runs in from sideline
}

// ── Main joust update ──
function updateJoust() {
  if (!joust.active) return;
  joust.t++;
  joust.phaseT++;

  const k1 = joust.k1, k2 = joust.k2;

  // Decay shake & flash
  if (joust.shakeAmt > 0.3) joust.shakeAmt *= 0.85; else joust.shakeAmt = 0;
  if (joust.flashAlpha > 0) joust.flashAlpha -= 0.045;

  // Decay wobble
  for (const k of [k1, k2]) {
    if (k && !k.fallen && Math.abs(k.wobble) > 0.001) {
      k.wobble *= (1 - k.wobbleDecay);
      if (Math.abs(k.wobble) < 0.002) k.wobble = 0;
    }
  }

  // Smooth rotation
  for (const k of [k1, k2]) {
    if (!k) continue;
    const diff = k.targetRotation - k.rotation;
    if (Math.abs(diff) > 0.01) {
      k.rotation += diff * 0.06;
    } else {
      k.rotation = k.targetRotation;
    }
  }

  // Squires: always track their knight's Y (watching mode)
  updateSquireTracking(joust.squire1, k1);
  updateSquireTracking(joust.squire2, k2);

  // ── CHARGE ──
  if (joust.subPhase === 'charge') {
    // Accelerate to max speed
    k1.speed = Math.min(k1.speed + 0.08, k1.maxSpeed);
    k2.speed = Math.min(k2.speed + 0.08, k2.maxSpeed);

    k1.y += k1.speed * k1.baseDir;
    k2.y += k2.speed * k2.baseDir;

    // Dust
    if (joust.t % 3 === 0) {
      spawnDust(k1.x, k1.y - k1.baseDir * (HORSE_H/2 + 4));
      spawnDust(k2.x, k2.y - k2.baseDir * (HORSE_H/2 + 4));
    }

    // Check crossing
    if (k1.baseDir === 1 && k1.y >= k2.y - 20) {
      resolveClash();
      setSubPhase('clash');
    } else if (k1.baseDir === -1 && k1.y <= k2.y + 20) {
      resolveClash();
      setSubPhase('clash');
    }
  }

  // ── CLASH ──
  if (joust.subPhase === 'clash') {
    // Keep moving briefly
    k1.y += k1.speed * k1.baseDir * 0.5;
    k2.y += k2.speed * k2.baseDir * 0.5;

    // Unhorse fall
    if (k1.fallen && joust.phaseT > 3) {
      k1.tilt += 0.05 * (k1.side === 'left' ? -1 : 1);
      k1.x += (k1.side === 'left' ? -1.5 : 1.5);
    }
    if (k2.fallen && joust.phaseT > 3) {
      k2.tilt += 0.05 * (k2.side === 'left' ? -1 : 1);
      k2.x += (k2.side === 'left' ? -1.5 : 1.5);
    }

    if (joust.phaseT > 20) {
      setSubPhase('pass');
    }
  }

  // ── PASS (ride all the way to opposite end) ──
  if (joust.subPhase === 'pass') {
    for (const k of [k1, k2]) {
      if (k.fallen) {
        // Continue fall animation
        if (joust.phaseT < 50) {
          k.tilt += 0.02 * (k.side === 'left' ? -1 : 1);
          k.x += (k.side === 'left' ? -0.5 : 0.5);
        }
        continue;
      }
      // Target: the far end the knight is riding toward
      const endY = k.baseDir === 1 ? TRACK_BOT - 25 : TRACK_TOP + 25;
      const distToEnd = Math.abs(endY - k.y);

      if (distToEnd > 80) {
        // Maintain good speed most of the way
        k.speed = Math.max(k.maxSpeed * 0.6, k.speed - 0.008);
      } else {
        // Brake near the end
        k.speed = Math.max(0, k.speed - 0.07);
      }
      k.y += k.speed * k.baseDir;
      k.y = Math.max(TRACK_TOP + 10, Math.min(TRACK_BOT - 10, k.y));

      // Dust while still moving
      if (k.speed > 0.5 && joust.t % 4 === 0) {
        spawnDust(k.x, k.y - k.baseDir * (HORSE_H / 2 + 4));
      }
    }

    // Check if both knights have reached their ends (or fallen)
    const k1Done = k1.fallen || k1.speed < 0.08;
    const k2Done = k2.fallen || k2.speed < 0.08;

    if (k1Done && k2Done && joust.phaseT > 20) {
      if (k1.fallen || k2.fallen) {
        setSubPhase('result');
      } else if (joust.venida >= MAX_VENIDAS) {
        setSubPhase('result');
      } else if (!k1.lanceIntact || !k2.lanceIntact) {
        setSubPhase('squire');
        if (!k1.lanceIntact && k1.squireEff > 0) activateSquire(joust.squire1, k1);
        if (!k2.lanceIntact && k2.squireEff > 0) activateSquire(joust.squire2, k2);
      } else {
        setSubPhase('turn');
      }
    }
  }

  // ── SQUIRE ──
  if (joust.subPhase === 'squire') {
    updateSquireDelivery(joust.squire1, k1);
    updateSquireDelivery(joust.squire2, k2);

    // Auto-restore lance for knights without squire after delay
    if (joust.phaseT > 60) {
      if (!k1.lanceIntact && joust.squire1.phase === 'watching') {
        k1.lanceIntact = true; k1.lanceStub = false;
      }
      if (!k2.lanceIntact && joust.squire2.phase === 'watching') {
        k2.lanceIntact = true; k2.lanceStub = false;
      }
    }

    // Wait for all squires to finish, or timeout
    const sq1Done = joust.squire1.phase === 'watching';
    const sq2Done = joust.squire2.phase === 'watching';
    if ((sq1Done && sq2Done && k1.lanceIntact && k2.lanceIntact) || joust.phaseT > 160) {
      // Ensure lances restored
      k1.lanceIntact = true; k1.lanceStub = false;
      k2.lanceIntact = true; k2.lanceStub = false;
      joust.squire1.phase = 'watching';
      joust.squire2.phase = 'watching';
      setSubPhase('turn');
    }
  }

  // ── TURN ──
  if (joust.subPhase === 'turn') {
    // Set target rotations for 180° turn
    if (joust.phaseT === 1) {
      k1.targetRotation = k1.rotation + Math.PI;
      k2.targetRotation = k2.rotation + Math.PI;
    }

    if (joust.phaseT > 70) {
      // Flip directions
      k1.baseDir *= -1;
      k2.baseDir *= -1;
      // Snap rotation
      k1.rotation = k1.targetRotation;
      k2.rotation = k2.targetRotation;
      setSubPhase('pause');
    }
  }

  // ── PAUSE ──
  if (joust.subPhase === 'pause') {
    if (joust.phaseT > 30) {
      if (joust.venida >= MAX_VENIDAS) {
        setSubPhase('result');
      } else {
        joust.venida++;
        joust.k1Hit = null;
        joust.k2Hit = null;
        k1.speed = 0;
        k2.speed = 0;
        setSubPhase('charge');
      }
    }
  }

  // ── RESULT ──
  if (joust.subPhase === 'result') {
    // Show result for this match; wait for tap to continue
    // (handled by overlay button)
  }

  updateParticles();
}

// ══════════════════════════════════════
// §10  JOUST RENDERING
// ══════════════════════════════════════

function drawTrack() {
  // Background - simple field
  ctx.fillStyle = '#2d5a27';
  ctx.fillRect(0, 0, W, H);

  // Dirt track
  ctx.fillStyle = COL.dirt;
  ctx.fillRect(TRACK_X, 0, TRACK_W, H);

  // Track texture
  ctx.strokeStyle = 'rgba(150,110,55,0.2)';
  ctx.lineWidth = 1;
  for (let ry = 8; ry < H; ry += 14) {
    ctx.beginPath();
    ctx.moveTo(TRACK_X + 5, ry);
    ctx.lineTo(TRACK_X + TRACK_W - 5, ry);
    ctx.stroke();
  }

  // Tilt barrier (center)
  ctx.strokeStyle = COL.railLine;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(LANE_X, 0); ctx.lineTo(LANE_X, H);
  ctx.stroke();

  // Tilt posts
  ctx.fillStyle = COL.rail;
  for (let py = 24; py < H; py += 50) {
    ctx.fillRect(LANE_X - 6, py - 4, 12, 8);
  }

  // Track borders
  ctx.strokeStyle = COL.rail;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(TRACK_X, 0); ctx.lineTo(TRACK_X, H); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(TRACK_X + TRACK_W, 0); ctx.lineTo(TRACK_X + TRACK_W, H); ctx.stroke();
}

function drawJoustKnight(k) {
  if (!k) return;
  ctx.save();
  ctx.translate(k.x, k.y);
  ctx.rotate(k.rotation + k.tilt + k.wobble);

  const bob = k.fallen ? 0 : Math.sin(joust.t * 0.28) * 2;

  // ── Horse ──
  ctx.save();
  ctx.translate(bob, 0);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(3, 5, HORSE_W/2+3, HORSE_H/2+5, 0, 0, Math.PI*2);
  ctx.fill();
  // Legs
  if (!k.fallen) {
    const legs = [{lx:-9,ly:0.3,ph:0},{lx:9,ly:0.3,ph:Math.PI},{lx:-9,ly:-0.3,ph:Math.PI},{lx:9,ly:-0.3,ph:0}];
    for (const l of legs) {
      const kick = Math.sin(joust.t * 0.35 + l.ph) * 6;
      ctx.fillStyle = COL.horseDark;
      ctx.beginPath();
      ctx.ellipse(l.lx + kick*0.4, l.ly*HORSE_H, 4, 5, 0, 0, Math.PI*2);
      ctx.fill();
    }
  }
  // Body
  ctx.fillStyle = k.colors.horse;
  ctx.beginPath();
  ctx.ellipse(0, 0, HORSE_W/2, HORSE_H/2, 0, 0, Math.PI*2);
  ctx.fill();
  // Head (always at local "front" = positive Y)
  ctx.fillStyle = COL.horseDark;
  ctx.beginPath();
  ctx.ellipse(0, HORSE_H/2 - 2, 8, 12, 0, 0, Math.PI*2);
  ctx.fill();
  // Nose
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, HORSE_H/2 + 7, 5, 4, 0, 0, Math.PI*2);
  ctx.fill();
  // Tail
  ctx.fillStyle = COL.horseDark;
  ctx.beginPath();
  ctx.ellipse(0, -(HORSE_H/2 + 4), 5, 8, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // ── Knight body ──
  ctx.save();
  ctx.translate(bob, 5);
  // Armor
  ctx.fillStyle = k.colors.armor;
  ctx.beginPath();
  ctx.roundRect(-KNIGHT_BW/2, -KNIGHT_BH/2, KNIGHT_BW, KNIGHT_BH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-KNIGHT_BW/2, -KNIGHT_BH/2, KNIGHT_BW, KNIGHT_BH);
  // Shine
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-KNIGHT_BW/2 + 4, -KNIGHT_BH/2 + 5);
  ctx.lineTo(-KNIGHT_BW/2 + 4,  KNIGHT_BH/2 - 6);
  ctx.stroke();

  // Pauldrons
  for (const sx of [-1, 1]) {
    ctx.fillStyle = k.colors.armor;
    ctx.beginPath();
    ctx.ellipse(sx*(KNIGHT_BW/2+3), -KNIGHT_BH/2+8, 7, 5, 0, 0, Math.PI*2);
    ctx.fill();
  }

  // Shield & lance direction — ALWAYS toward the barrier/opponent
  // In screen space: barrier is at LANE_X. If knight is left of it, point right (+1), else left (-1).
  // But we're in LOCAL space (rotated), so convert screen→local by checking cos(rotation):
  //   rotation ≈ 0 or 2PI  → local X = screen X  (cosR > 0)
  //   rotation ≈ PI or 3PI → local X = -screen X (cosR < 0)
  const barrierScreenDir = k.x < LANE_X ? 1 : -1;
  const cosR = Math.cos(k.rotation + k.tilt + k.wobble);
  const shieldSide = barrierScreenDir * (cosR >= 0 ? 1 : -1);

  // Shield
  ctx.fillStyle = k.colors.shield;
  ctx.beginPath();
  ctx.ellipse(shieldSide*(KNIGHT_BW/2+9), 2, 9, 14, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(shieldSide*(KNIGHT_BW/2+9), -10); ctx.lineTo(shieldSide*(KNIGHT_BW/2+9), 14);
  ctx.moveTo(shieldSide*(KNIGHT_BW/2+2), 2); ctx.lineTo(shieldSide*(KNIGHT_BW/2+16), 2);
  ctx.stroke();

  // Helmet (at front = local +Y)
  ctx.fillStyle = k.colors.armor;
  ctx.beginPath();
  ctx.arc(0, KNIGHT_BH/2 - 5, 10, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-6, KNIGHT_BH/2 - 5); ctx.lineTo(6, KNIGHT_BH/2 - 5);
  ctx.stroke();
  // Plume
  ctx.fillStyle = k.colors.plume;
  ctx.beginPath();
  ctx.ellipse(0, KNIGHT_BH/2 + 4, 5, 9, 0, 0, Math.PI*2);
  ctx.fill();

  // Lance — same side as shield, crosses the barrier diagonally toward opponent
  const lanceSide = shieldSide;
  if (k.lanceIntact) {
    const handY = KNIGHT_BH/2 - 14;
    const endY = handY + LANCE_LEN;
    const endX = lanceSide * 32;
    ctx.strokeStyle = COL.lance;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, handY); ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.strokeStyle = COL.lanceSheen;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(1, handY); ctx.lineTo(endX+1, endY);
    ctx.stroke();
    // Tip
    const dx = endX, dy = endY - handY;
    const len = Math.sqrt(dx*dx+dy*dy);
    const nx = dx/len, ny = dy/len;
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX+nx*12-ny*4, endY+ny*12+nx*4);
    ctx.lineTo(endX+nx*12+ny*4, endY+ny*12-nx*4);
    ctx.closePath();
    ctx.fill();
  } else if (k.lanceStub) {
    const handY = KNIGHT_BH/2 - 14;
    ctx.strokeStyle = COL.lance;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, handY); ctx.lineTo(lanceSide * 8, handY + 20);
    ctx.stroke();
  }

  // Hand
  ctx.fillStyle = '#4a4a4a';
  ctx.beginPath();
  ctx.arc(0, KNIGHT_BH/2 - 16, 4, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

function drawSquire(sq) {
  if (!sq) return;
  ctx.save();
  ctx.translate(sq.x, sq.y);

  const isMoving = sq.phase === 'running_in' || sq.phase === 'running_out';
  const isHandoff = sq.phase === 'handoff';
  const isWatching = sq.phase === 'watching';

  // Subtle idle bob when watching, running bob when moving
  const bob = isMoving ? Math.sin(joust.t * 0.5) * 3 : Math.sin(joust.t * 0.06) * 1;

  // Face toward the track
  const faceDir = sq.side === 'left' ? 1 : -1;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(1, 10, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (small figure in brown tunic)
  ctx.fillStyle = isHandoff ? '#6d8040' : '#8b6040';
  ctx.beginPath();
  ctx.ellipse(bob * 0.3, 0, 7, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belt
  ctx.strokeStyle = '#5a3a20';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-6, 2); ctx.lineTo(6, 2);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#e0b890';
  ctx.beginPath();
  ctx.arc(0, -11, 5.5, 0, Math.PI * 2);
  ctx.fill();
  // Hair
  ctx.fillStyle = '#5a3a20';
  ctx.beginPath();
  ctx.arc(0, -13, 4, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes (dots looking toward track)
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(faceDir * 2, -11, 1, 0, Math.PI * 2);
  ctx.fill();

  // Arms — watching: hands at sides, running: carrying lance
  if (isWatching) {
    // Arms at sides, slightly animated
    ctx.strokeStyle = '#e0b890';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, -4); ctx.lineTo(-7, 4);
    ctx.moveTo(5, -4); ctx.lineTo(7, 4);
    ctx.stroke();
    // Spare lance held vertically at side
    ctx.strokeStyle = COL.lance;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(faceDir * 8, -18); ctx.lineTo(faceDir * 8, 14);
    ctx.stroke();
    // Lance tip
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.moveTo(faceDir * 8, -18);
    ctx.lineTo(faceDir * 8 - 2, -22);
    ctx.lineTo(faceDir * 8 + 2, -22);
    ctx.closePath();
    ctx.fill();
  } else if (sq.phase === 'running_in' || isHandoff) {
    // Carrying lance horizontally
    ctx.strokeStyle = COL.lance;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, -4); ctx.lineTo(22, -4);
    ctx.stroke();
    // Lance tip
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.moveTo(faceDir * 22, -4);
    ctx.lineTo(faceDir * 26, -6);
    ctx.lineTo(faceDir * 26, -2);
    ctx.closePath();
    ctx.fill();
  }
  // running_out: empty hands, just running back

  ctx.restore();
}

function drawParticles() {
  for (const p of joust.sparks) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2);
    ctx.fill();
  }
  for (const d of joust.dust) {
    ctx.globalAlpha = d.life * 0.38;
    ctx.fillStyle = '#c8a87a';
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI*2);
    ctx.fill();
  }
  for (const s of joust.splinters) {
    ctx.save();
    ctx.globalAlpha = s.life;
    ctx.strokeStyle = '#c9a96e';
    ctx.lineWidth = 2.5;
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.beginPath();
    ctx.moveTo(-s.len/2, 0); ctx.lineTo(s.len/2, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawSpeedLines() {
  if (joust.subPhase !== 'charge') return;
  const k1 = joust.k1, k2 = joust.k2;
  if (!k1 || !k2) return;
  const dist = Math.abs(k2.y - k1.y);
  if (dist > 300) return;
  const alpha = (1 - dist/300) * 0.25;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const lx = TRACK_X + 10 + Math.random()*(TRACK_W-20);
    const mid = (k1.y + k2.y)/2;
    const y = mid + (Math.random()-0.5)*100;
    ctx.beginPath();
    ctx.moveTo(lx, y); ctx.lineTo(lx+(Math.random()-0.5)*8, y+(Math.random()-0.5)*12);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function sText(text, x, y, fill, stroke = 'rgba(0,0,0,0.85)', lw = 4) {
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeText(text, x, y);
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
}

function drawJoustUI() {
  // Top HUD
  const k1 = joust.k1, k2 = joust.k2;
  if (!k1 || !k2) return;

  // Panel bg
  ctx.fillStyle = 'rgba(44, 30, 22, 0.8)';
  ctx.beginPath();
  ctx.roundRect(10, 6, W - 20, 50, 4);
  ctx.fill();
  ctx.strokeStyle = '#d4a017';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 6, W - 20, 50);

  // Names
  ctx.font = 'bold 14px Almendra';
  ctx.textAlign = 'left';
  ctx.fillStyle = k1.colors.plume;
  ctx.fillText(k1.name, 18, 24);
  ctx.textAlign = 'right';
  ctx.fillStyle = k2.colors.plume;
  ctx.fillText(k2.name, W - 18, 24);

  // Score
  ctx.font = '22px MedievalSharp';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd54f';
  ctx.fillText(`${joust.k1Points} : ${joust.k2Points}`, W/2, 28);

  // Venida
  ctx.font = '12px Almendra';
  ctx.fillStyle = 'rgba(224, 208, 176, 0.7)';
  ctx.fillText(`VENIDA ${joust.venida}/${MAX_VENIDAS}  ·  COMBATE ${joust.matchIdx + 1}`, W/2, 46);

  // History at bottom
  const hY = H - 14;
  ctx.font = '11px Almendra';
  ctx.textAlign = 'center';
  for (let i = 0; i < joust.history.length; i++) {
    const h = joust.history[i];
    const x = W/2 + (i - (joust.history.length-1)/2) * 60;
    ctx.fillStyle = 'rgba(224, 208, 176, 0.5)';
    ctx.fillText(`V${h.venida}: +${h.k1Hit.pts} / +${h.k2Hit.pts}`, x, hY);
  }

  // Phase-specific text
  if (joust.subPhase === 'clash') {
    const a = Math.max(0, 1 - joust.phaseT/20);
    if (a > 0) {
      ctx.globalAlpha = a;
      ctx.font = '44px MedievalSharp';
      ctx.textAlign = 'center';
      const maxPts = Math.max(joust.k1Hit?.pts || 0, joust.k2Hit?.pts || 0);
      let txt = '¡IMPACTO!', col = '#d4a017';
      if (maxPts >= 10) { txt = '¡¡DESMONTADO!!'; col = '#7b1113'; }
      else if (maxPts >= 3) { txt = '¡GRAN GOLPE!'; col = '#e67e22'; }
      else if (maxPts === 0) { txt = joust.k1Hit?.type === 'miss' ? '¡FALLO!' : '¡TOQUE!'; col = '#a09080'; }
      sText(txt, W/2, H/2 - 20, col, 'rgba(0,0,0,0.8)', 6);
      ctx.globalAlpha = 1;
    }
  }

  // Hit details after clash
  if ((joust.subPhase === 'pass' || joust.subPhase === 'squire') && joust.k1Hit) {
    const fadeIn = Math.min(1, joust.phaseT / 25);
    const fadeOut = joust.subPhase === 'pass' && joust.phaseT > 100 ? Math.max(0, 1 - (joust.phaseT - 100) / 40) : 1;
    const alpha = fadeIn * fadeOut;
    if (alpha > 0.01) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#f4e4bc';
      ctx.beginPath();
      ctx.roundRect(20, H/2 - 30, W - 40, 60, 4);
      ctx.fill();
      ctx.strokeStyle = '#d4a017';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, H/2 - 30, W - 40, 60);
      
      ctx.font = 'bold 14px Almendra';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#2c1e16';
      ctx.fillText(`${k1.name}: ${joust.k1Hit.label} (+${joust.k1Hit.pts})`, 30, H/2 + 5);
      ctx.textAlign = 'right';
      ctx.fillText(`${k2.name}: ${joust.k2Hit.label} (+${joust.k2Hit.pts})`, W - 30, H/2 + 5);
      ctx.globalAlpha = 1;
    }
  }

  // Turn phase
  if (joust.subPhase === 'turn') {
    ctx.globalAlpha = 0.8;
    ctx.font = '18px MedievalSharp';
    ctx.textAlign = 'center';
    sText(joust.venida < MAX_VENIDAS ? `Preparando venida ${joust.venida + 1}...` : 'Torneo Finalizado', W/2, H/2, '#ffd54f');
    ctx.globalAlpha = 1;
  }
}

function drawJoust() {
  ctx.save();
  if (joust.shakeAmt > 0) {
    ctx.translate((Math.random()-0.5)*joust.shakeAmt, (Math.random()-0.5)*joust.shakeAmt);
  }
  ctx.clearRect(-20, -20, W+40, H+40);

  drawTrack();
  drawSpeedLines();

  // Draw dust under knights
  drawParticles();

  drawSquire(joust.squire1);
  drawSquire(joust.squire2);
  drawJoustKnight(joust.k1);
  drawJoustKnight(joust.k2);

  // Flash
  if (joust.flashAlpha > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, joust.flashAlpha)})`;
    ctx.fillRect(-20, -20, W+40, H+40);
  }

  drawJoustUI();
  ctx.restore();
}

// ══════════════════════════════════════
// §11  JOUST SCREEN MANAGEMENT
// ══════════════════════════════════════

function initJoustScreen() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Build teams
  joust.playerTeam = player.team.map(kid => ({
    knightId: kid,
    equip: player.equip[kid] || { armor: null, horse: null, squire: null },
  }));
  joust.enemyTeam = generateEnemy(joust.playerTeam.length);

  joust.matchIdx = 0;
  joust.playerMatchWins = 0;
  joust.enemyMatchWins = 0;

  showMatchIntro();
}

function showMatchIntro() {
  const overlay = $('#joust-overlay');
  const pk = joust.playerTeam[joust.matchIdx];
  const ek = joust.enemyTeam[joust.matchIdx];
  const pkd = getKnightData(pk.knightId);
  const ekd = getKnightData(ek.knightId);
  const pc = KNIGHT_COLORS[pkd.colorIdx];
  const ec = KNIGHT_COLORS[ekd.colorIdx];

  overlay.innerHTML = `
    <div class="card text-center" style="padding:30px 20px; border: 4px double var(--gold); background-color: var(--card);">
      <div style="font-family:MedievalSharp; font-size:16px; color:var(--text-dim); margin-bottom:12px; text-transform:uppercase">COMBATE ${joust.matchIdx + 1} DE ${joust.playerTeam.length}</div>
      <div style="display:flex; align-items:center; justify-content:center; gap:20px; margin:16px 0">
        <div>
          <div style="font-size:50px">${pkd.icon}</div>
          <div style="font-family:MedievalSharp; font-size:16px; color:${pc.plume}; margin-top:4px">${pkd.name}</div>
        </div>
        <div style="font-family:MedievalSharp; font-size:32px; color:var(--red)">VS</div>
        <div>
          <div style="font-size:50px">${ekd.icon}</div>
          <div style="font-family:MedievalSharp; font-size:16px; color:${ec.plume}; margin-top:4px">${ekd.name}</div>
        </div>
      </div>
      <button class="btn btn-gold btn-lg" id="btn-start-match">⚔ ¡A LA LIZA!</button>
    </div>`;
  overlay.style.pointerEvents = 'auto';

  document.getElementById('btn-start-match').addEventListener('click', () => {
    overlay.innerHTML = '';
    overlay.style.pointerEvents = 'none';
    startMatch();
  });
}

function startMatch() {
  const pk = joust.playerTeam[joust.matchIdx];
  const ek = joust.enemyTeam[joust.matchIdx];

  joust.k1 = makeJoustKnight(pk.knightId, 'left', pk.equip);
  joust.k2 = makeJoustKnight(ek.knightId, 'right', ek.equip);
  joust.squire1 = makeSquire('left', joust.k1.squireEff);
  joust.squire2 = makeSquire('right', joust.k2.squireEff);

  joust.venida = 1;
  joust.k1Points = 0;
  joust.k2Points = 0;
  joust.history = [];
  joust.k1Hit = null;
  joust.k2Hit = null;
  joust.sparks = [];
  joust.dust = [];
  joust.splinters = [];
  joust.shakeAmt = 0;
  joust.flashAlpha = 0;
  joust.t = 0;
  joust.active = true;

  joust.k1.speed = 0;
  joust.k2.speed = 0;
  setSubPhase('charge');
}

function showMatchResult() {
  joust.active = false;
  const k1 = joust.k1, k2 = joust.k2;

  const k1Unhorsed = joust.history.some(h => h.k2Hit.type === 'unhorse');
  const k2Unhorsed = joust.history.some(h => h.k1Hit.type === 'unhorse');

  let winnerName, winnerColor;
  let playerWon = false;

  if (k2Unhorsed && !k1Unhorsed) {
    winnerName = k1.name; winnerColor = k1.colors.plume;
    playerWon = true;
  } else if (k1Unhorsed && !k2Unhorsed) {
    winnerName = k2.name; winnerColor = k2.colors.plume;
  } else if (k1Unhorsed && k2Unhorsed) {
    winnerName = 'EMPATE'; winnerColor = '#d4a017';
  } else if (joust.k1Points > joust.k2Points) {
    winnerName = k1.name; winnerColor = k1.colors.plume;
    playerWon = true;
  } else if (joust.k2Points > joust.k1Points) {
    winnerName = k2.name; winnerColor = k2.colors.plume;
  } else {
    winnerName = 'EMPATE'; winnerColor = '#d4a017';
  }

  if (playerWon) joust.playerMatchWins++;
  else if (winnerName !== 'EMPATE') joust.enemyMatchWins++;

  const isLast = joust.matchIdx >= joust.playerTeam.length - 1;
  const btnText = isLast ? '🏆 RESULTADOS' : '➡ SIGUIENTE';

  const overlay = $('#joust-overlay');
  overlay.innerHTML = `
    <div class="card text-center" style="padding:24px 20px; border: 4px double var(--gold); background-color: var(--card);">
      <div style="font-family:MedievalSharp; font-size:32px; color:${winnerColor}">${winnerName === 'EMPATE' ? '¡EMPATE!' : '¡VICTORIA!'}</div>
      <div style="font-family:MedievalSharp; font-size:18px; color:var(--surface); margin:8px 0">${winnerName === 'EMPATE' ? '' : winnerName}</div>
      <div style="font-family:MedievalSharp; font-size:40px; color:var(--red); margin:12px 0">${joust.k1Points} — ${joust.k2Points}</div>
      <div style="font-family:Almendra; font-size:14px; color:var(--text-dim); margin:10px 0">
        Torneo: ${joust.playerMatchWins} - ${joust.enemyMatchWins}
      </div>
      <button class="btn btn-gold btn-lg" id="btn-next-match">${btnText}</button>
    </div>`;
  overlay.style.pointerEvents = 'auto';

  document.getElementById('btn-next-match').addEventListener('click', () => {
    if (isLast) {
      showTourneyResult();
    } else {
      joust.matchIdx++;
      overlay.innerHTML = '';
      overlay.style.pointerEvents = 'none';
      showMatchIntro();
    }
  });
}

function showTourneyResult() {
  const pWins = joust.playerMatchWins;
  const eWins = joust.enemyMatchWins;
  const won = pWins > eWins;
  const draw = pWins === eWins;

  if (won) player.wins++;
  else if (!draw) player.losses++;

  const goldReward = won ? 150 + pWins * 50 : 30 + pWins * 20;
  player.gold += goldReward;
  saveGame();

  const overlay = $('#joust-overlay');
  overlay.innerHTML = `
    <div class="card text-center" style="padding:30px 20px; border: 4px double var(--gold); background-color: var(--card);">
      <div style="font-size:60px; margin-bottom:10px">${won ? '🏆' : draw ? '⚖️' : '💀'}</div>
      <div style="font-family:MedievalSharp; font-size:32px; color:${won ? 'var(--gold)' : draw ? '#666' : 'var(--red)'}">
        ${won ? '¡CAMPEÓN!' : draw ? 'EMPATE' : 'DERROTA'}
      </div>
      <div style="font-family:Almendra; font-size:18px; color:var(--surface); margin:8px 0">
        ${pWins} combates ganados — ${eWins} perdidos
      </div>
      <div style="font-family:MedievalSharp; font-size:20px; color:var(--gold-dim); margin:12px 0">
        +${goldReward} 🪙
      </div>
      <button class="btn btn-red btn-lg" id="btn-back-home">🏰 VOLVER AL CASTILLO</button>
    </div>`;
  overlay.style.pointerEvents = 'auto';

  document.getElementById('btn-back-home').addEventListener('click', () => {
    overlay.innerHTML = '';
    overlay.style.pointerEvents = 'none';
    joust.active = false;
    switchScreen('home');
  });
}

// ══════════════════════════════════════
// §12  GAME LOOP
// ══════════════════════════════════════

function gameLoop() {
  if (currentScreen === 'joust') {
    updateJoust();
    drawJoust();

    // Check if result should show
    if (joust.subPhase === 'result' && joust.active) {
      showMatchResult();
    }
  }
  requestAnimationFrame(gameLoop);
}

// ══════════════════════════════════════
// §13  INIT
// ══════════════════════════════════════

renderHome();
gameLoop();
