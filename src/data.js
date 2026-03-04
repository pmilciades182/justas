// ══════════════════════════════════════
// BASE DE DATOS DE ITEMS Y CONFIGURACIÓN
// ══════════════════════════════════════

// COLORES DE HABILIDAD / TIPO
export const TYPE_COLORS = {
  lance:  '#e74c3c', // Rojo (Ataque)
  shield: '#3498db', // Azul (Defensa)
  horse:  '#f1c40f', // Amarillo (Espolear)
  armor:  '#9b59b6'  // Violeta (Especial)
};

// 1. LANZAS (Ataque - Red)
export const DB_LANCES = [
  { id: 'l1', name: 'Lanza de Práctica', tier: 1, cost: 0,   str: 1,  cd: 2600, dur: 1000, desc: 'Punta roma, recarga rápida.' },
  { id: 'l2', name: 'Lanza de Torneo',   tier: 2, cost: 150, str: 2,  cd: 2300, dur: 1200, desc: 'Equilibrada y fiable.' },
  { id: 'l3', name: 'Lanza de Guerra',   tier: 3, cost: 350, str: 4,  cd: 2000, dur: 1500, desc: 'Punta de acero reforzado.' },
  { id: 'l4', name: 'Lanza Real',        tier: 4, cost: 600, str: 6,  cd: 1600, dur: 1800, desc: 'Ligera como pluma, dura como diamante.' },
  { id: 'l5', name: 'Perforadora',       tier: 5, cost: 1000, str: 9, cd: 1300, dur: 2500, desc: 'Rompe cualquier defensa.' },
];

// 2. ESCUDOS (Defensa - Blue)
export const DB_SHIELDS = [
  { id: 's1', name: 'Escudo de Madera',  tier: 1, cost: 0,   def: 1,  cd: 3300, dur: 1500, desc: 'Protección básica.' },
  { id: 's2', name: 'Escudo Reforzado',  tier: 2, cost: 150, def: 2,  cd: 3000, dur: 2000, desc: 'Bordes de hierro.' },
  { id: 's3', name: 'Escudo de Acero',   tier: 3, cost: 350, def: 4,  cd: 2600, dur: 2500, desc: 'Sólido y pesado.' },
  { id: 's4', name: 'Pavés Real',        tier: 4, cost: 600, def: 6,  cd: 2300, dur: 3000, desc: 'Cobertura total.' },
  { id: 's5', name: 'Égida Divina',      tier: 5, cost: 1000, def: 9, cd: 2000, dur: 4000, desc: 'Forjado por los dioses.' },
];

// 3. CABALLOS (Espolear/Velocidad - Yellow)
export const DB_HORSES = [
  { id: 'h1', name: 'Rocín Viejo',       tier: 1, cost: 0,   spd: 0,  cd: 4000, dur: 1000, desc: 'Lento pero noble.' },
  { id: 'h2', name: 'Corcel de Caza',    tier: 2, cost: 200, spd: 1,  cd: 3300, dur: 1500, desc: 'Ágil en distancias cortas.' },
  { id: 'h3', name: 'Destrero de Guerra',tier: 3, cost: 450, spd: 3,  cd: 2600, dur: 2000, desc: 'Entrenado para el choque.' },
  { id: 'h4', name: 'Purasangre Real',   tier: 4, cost: 800, spd: 5,  cd: 2000, dur: 2500, desc: 'Velocidad inigualable.' },
  { id: 'h5', name: 'Sombra Veloz',      tier: 5, cost: 1500, spd: 8, cd: 1600, dur: 3000, desc: 'Ni se le ve pasar.' },
];

// 4. ARMADURAS (Especial/Resistencia - Purple)
export const DB_ARMORS = [
  { id: 'a1', name: 'Cota de Malla',     tier: 1, cost: 0,   hp: 0,   cd: 5000, dur: 100,  special: 'heal',   desc: 'Restauración básica (30% HP).' },
  { id: 'a2', name: 'Placas Parciales',  tier: 2, cost: 250, hp: 10,  cd: 4300, dur: 100,  special: 'heal',   desc: 'Zonas reforzadas (30% HP).' },
  { id: 'a3', name: 'Armadura Glacial',  tier: 3, cost: 500, hp: 20,  cd: 6000, dur: 3000, special: 'freeze', desc: 'Aura invernal (Congela 3s).' },
  { id: 'a4', name: 'Armadura de Justa', tier: 4, cost: 900, hp: 40,  cd: 3000, dur: 100,  special: 'heal',   desc: 'Óptima para impactos (30% HP).' },
  { id: 'a5', name: 'Baluarte Ártico',   tier: 5, cost: 1600, hp: 60, cd: 4000, dur: 3000, special: 'freeze', desc: 'Cero absoluto (Congela 3s).' },
];

// ESCUDEROS (Pasivos - Extra)
export const DB_SQUIRES = [
  { id: 'sq1', name: 'Novato',        eff: 1, cost: 0,   desc: 'Lento pero cumple' },
  { id: 'sq2', name: 'Aprendiz',      eff: 2, cost: 100, desc: 'Va aprendiendo' },
  { id: 'sq3', name: 'Experto',       eff: 3, cost: 200, desc: 'Rápido y fiable' },
  { id: 'sq4', name: 'Maestro',       eff: 4, cost: 350, desc: 'El mejor del reino' },
];

// CABALLEROS (Personajes base)
export const KNIGHT_COLORS = [
  { id: 0, name: 'Azul Real', plume: '#3498db', armor: '#bdc3c7', shield: '#2980b9', horse: '#ecf0f1' },
  { id: 1, name: 'Rojo Sangre', plume: '#e74c3c', armor: '#7f8c8d', shield: '#c0392b', horse: '#2c3e50' },
  { id: 2, name: 'Verde Bosque', plume: '#2ecc71', armor: '#95a5a6', shield: '#27ae60', horse: '#7f8c8d' },
  { id: 3, name: 'Oro Viejo', plume: '#f1c40f', armor: '#f39c12', shield: '#d35400', horse: '#8e44ad' },
  { id: 4, name: 'Negro Noche', plume: '#8e44ad', armor: '#2c3e50', shield: '#8e44ad', horse: '#000000' },
];

export const DB_KNIGHTS = [
  { id: 'k1', name: 'Sir Roland',   str: 5, def: 5, hor: 5, icon: '🦁', colorIdx: 0, cost: 0 },
  { id: 'k2', name: 'Sir Dorian',   str: 4, def: 6, hor: 5, icon: '🦅', colorIdx: 1, cost: 0 },
  { id: 'k3', name: 'Lady Elara',   str: 6, def: 4, hor: 6, icon: '🦄', colorIdx: 2, cost: 500 },
  { id: 'k4', name: 'Barón Valen',  str: 7, def: 3, hor: 4, icon: '🐗', colorIdx: 3, cost: 800 },
  { id: 'k5', name: 'Sir Kael',     str: 5, def: 5, hor: 5, icon: '🐺', colorIdx: 4, cost: 1200 },
];

// Helpers
export function getLanceData(id)  { return DB_LANCES.find(i => i.id === id) || DB_LANCES[0]; }
export function getShieldData(id) { return DB_SHIELDS.find(i => i.id === id) || DB_SHIELDS[0]; }
export function getHorseData(id)  { return DB_HORSES.find(i => i.id === id) || DB_HORSES[0]; }
export function getArmorData(id)  { return DB_ARMORS.find(i => i.id === id) || DB_ARMORS[0]; }
export function getSquireData(id) { return DB_SQUIRES.find(i => i.id === id) || DB_SQUIRES[0]; }
export function getKnightData(id) { return DB_KNIGHTS.find(i => i.id === id) || DB_KNIGHTS[0]; }

// Enemigos por defecto
export const ENEMY_SQUADS = [
  {
    name: 'Los Cuervos', origin: 'Norte',
    knights: [
      { name: 'Cuervo 1', str: 4, def: 4, hor: 4, icon: '🐦', colorIdx: 1, equip: { lance:'l1', shield:'s1', horse:'h1', armor:'a1', squire:'sq1' } },
      { name: 'Cuervo 2', str: 5, def: 5, hor: 5, icon: '🦅', colorIdx: 1, equip: { lance:'l1', shield:'s1', horse:'h1', armor:'a1', squire:'sq1' } },
      { name: 'Líder Cuervo', str: 6, def: 5, hor: 5, icon: '🦅', colorIdx: 4, equip: { lance:'l2', shield:'s2', horse:'h2', armor:'a2', squire:'sq2' } },
      { name: 'Veterano', str: 5, def: 6, hor: 4, icon: '🗡️', colorIdx: 1, equip: { lance:'l2', shield:'s2', horse:'h2', armor:'a2', squire:'sq2' } }
    ]
  }
];

export const WAR_CRIES = ['¡Por el honor!', '¡Gloria!', '¡A la carga!', '¡Sin piedad!'];
