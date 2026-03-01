// ══════════════════════════════════════
// BASE DE DATOS DE ITEMS + helpers de búsqueda
// ══════════════════════════════════════

export const DB_KNIGHTS = [
  { id: 'roland',   name: 'Sir Roland',   str: 6, def: 6, hor: 6, cost: 0,   icon: '🔴', colorIdx: 0 },
  { id: 'dorian',   name: 'Sir Dorian',   str: 5, def: 8, hor: 5, cost: 0,   icon: '🔵', colorIdx: 1 },
  { id: 'pelayo',   name: 'Don Pelayo',   str: 8, def: 4, hor: 6, cost: 200, icon: '🟤', colorIdx: 2 },
  { id: 'gawain',   name: 'Sir Gawain',   str: 5, def: 5, hor: 9, cost: 250, icon: '🟢', colorIdx: 3 },
  { id: 'cid',      name: 'El Cid',       str: 8, def: 7, hor: 8, cost: 400, icon: '🟡', colorIdx: 4 },
  { id: 'lancelot', name: 'Sir Lancelot', str: 9, def: 6, hor: 9, cost: 500, icon: '🟣', colorIdx: 5 },
  { id: 'baron',    name: 'Barón Rojo',   str: 9, def: 3, hor: 7, cost: 300, icon: '🔶', colorIdx: 6 },
  { id: 'percival', name: 'Sir Percival', str: 7, def: 7, hor: 7, cost: 350, icon: '⚪', colorIdx: 7 },
];

export const DB_ARMORS = [
  { id: 'malla',    name: 'Cota de Malla',     defB: 1, spdB: 0,  cost: 0,   desc: 'Protección básica' },
  { id: 'cuero',    name: 'Armadura de Cuero',  defB: 2, spdB: 0,  cost: 80,  desc: 'Ligera y resistente' },
  { id: 'placas',   name: 'Placas de Acero',    defB: 3, spdB: -1, cost: 150, desc: 'Protección sólida' },
  { id: 'milanes',  name: 'Arnés Milanés',      defB: 4, spdB: -1, cost: 250, desc: 'Artesanía italiana' },
  { id: 'justa',    name: 'Arnés de Justa',     defB: 5, spdB: -2, cost: 400, desc: 'La mejor protección' },
];

export const DB_HORSES = [
  { id: 'rocin',    name: 'Rocín',       spdB: 0, sta: 3, cost: 0,   desc: 'Caballo humilde' },
  { id: 'corcel',   name: 'Corcel',      spdB: 1, sta: 4, cost: 120, desc: 'Rápido y ágil' },
  { id: 'destrero', name: 'Destrero',    spdB: 2, sta: 5, cost: 250, desc: 'Caballo de guerra' },
  { id: 'andaluz',  name: 'Andaluz',     spdB: 3, sta: 6, cost: 400, desc: 'Nobleza española' },
];

export const DB_SQUIRES = [
  { id: 'novato',  name: 'Novato',        eff: 1, cost: 0,   desc: 'Lento pero cumple' },
  { id: 'aprend',  name: 'Aprendiz',      eff: 2, cost: 100, desc: 'Va aprendiendo' },
  { id: 'experto', name: 'Experimentado', eff: 3, cost: 200, desc: 'Rápido y fiable' },
  { id: 'vetera',  name: 'Veterano',      eff: 4, cost: 350, desc: 'El mejor del reino' },
];

export const KNIGHT_COLORS = [
  { armor: '#b0bec5', plume: '#e74c3c', shield: '#c0392b', horse: '#5c3317' },
  { armor: '#546e7a', plume: '#3498db', shield: '#2471a3', horse: '#4a2810' },
  { armor: '#8d6e63', plume: '#ff9800', shield: '#e65100', horse: '#3b1f0a' },
  { armor: '#66bb6a', plume: '#2e7d32', shield: '#1b5e20', horse: '#5c3317' },
  { armor: '#fdd835', plume: '#f9a825', shield: '#f57f17', horse: '#3e2723' },
  { armor: '#ab47bc', plume: '#7b1fa2', shield: '#4a148c', horse: '#4a2810' },
  { armor: '#ef5350', plume: '#b71c1c', shield: '#d32f2f', horse: '#5c3317' },
  { armor: '#e0e0e0', plume: '#bdbdbd', shield: '#757575', horse: '#3b1f0a' },
];

export function getKnightData(id) { return DB_KNIGHTS.find(k => k.id === id); }
export function getArmorData(id)  { return DB_ARMORS.find(a => a.id === id); }
export function getHorseData(id)  { return DB_HORSES.find(h => h.id === id); }
export function getSquireData(id) { return DB_SQUIRES.find(s => s.id === id); }
