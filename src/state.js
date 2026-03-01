// ══════════════════════════════════════
// ESTADO DEL JUGADOR (con localStorage)
// ══════════════════════════════════════

export const SAVE_KEY = 'justa_real_save';

export function defaultSave() {
  return {
    gold: 500,
    wins: 0,
    losses: 0,
    knights: ['roland', 'dorian'],
    armors:  ['malla', 'malla'],
    horses:  ['rocin', 'rocin'],
    squires: ['novato'],
    equip: {
      roland: { armor: 'malla', horse: 'rocin', squire: 'novato' },
      dorian: { armor: 'malla', horse: 'rocin', squire: null },
    },
    team: ['roland', 'dorian'],
  };
}

export let player;

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { player = JSON.parse(raw); return; }
  } catch(e) { /* ignore */ }
  player = defaultSave();
}

export function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); } catch(e) { /* ignore */ }
}

export function countAssigned(type, itemId) {
  let c = 0;
  for (const eq of Object.values(player.equip)) {
    if (eq[type] === itemId) c++;
  }
  return c;
}

export function countAvailable(type, itemId) {
  const inInv = player[type + 's'].filter(id => id === itemId).length;
  return inInv - countAssigned(type, itemId);
}
