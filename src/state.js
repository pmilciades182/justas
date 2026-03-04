// ══════════════════════════════════════
// ESTADO DEL JUGADOR (con localStorage)
// ══════════════════════════════════════

export const SAVE_KEY = 'justa_real_save';

export function defaultSave() {
  return {
    gold: 500,
    wins: 0,
    losses: 0,
    // Inventory (IDs)
    knights: ['k1', 'k2'],
    lances:  ['l1', 'l1'],
    armors:  ['a1', 'a1'],
    horses:  ['h1', 'h1'],
    shields: ['s1', 's1'],
    squires: ['sq1', 'sq1'], // Two starting squires
    // Assigned Equipment
    equip: {
      k1: { lance: 'l1', armor: 'a1', horse: 'h1', shield: 's1', squire: 'sq1' },
      k2: { lance: 'l1', armor: 'a1', horse: 'h1', shield: 's1', squire: 'sq1' },
    },
    // Active Squad
    team: ['k1', 'k2'],
  };
}

// ── SAVE / LOAD SYSTEM ──
export let player = defaultSave();

export function loadGame() {
  const json = localStorage.getItem(SAVE_KEY);
  if (json) {
    try {
      const data = JSON.parse(json);
      // Merge with default to ensure new fields exist
      player = { ...defaultSave(), ...data };
      
      // Migration: Ensure equip objects have all fields mandatory
      for (const kid in player.equip) {
        if (!player.equip[kid].lance)  player.equip[kid].lance  = 'l1';
        if (!player.equip[kid].shield) player.equip[kid].shield = 's1';
        if (!player.equip[kid].horse)  player.equip[kid].horse  = 'h1';
        if (!player.equip[kid].armor)  player.equip[kid].armor  = 'a1';
        if (!player.equip[kid].squire) player.equip[kid].squire = 'sq1';
      }
    } catch (e) {
      console.error('Save file corrupted, resetting.', e);
      player = defaultSave();
    }
  } else {
    player = defaultSave();
  }
}

export function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(player));
}

export function resetGame() {
  player = defaultSave();
  saveGame();
  window.location.reload();
}

// ── HELPERS ──

export function countAssigned(type, itemId) {
  let c = 0;
  const slot = type.slice(0, -1); 
  
  for (const eq of Object.values(player.equip)) {
    if (eq[slot] === itemId) c++;
  }
  return c;
}

export function countAvailable(type, itemId) {
  const inInv = (player[type] || []).filter(id => id === itemId).length;
  return inInv - countAssigned(type, itemId);
}
