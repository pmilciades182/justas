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

export const DB_SHIELDS = [
  { id: 'madera',  name: 'Escudo de Madera', defB: 1, duration: 1500, cost: 0,   desc: 'Protección mínima' },
  { id: 'reforz',  name: 'Escudo Reforzado', defB: 2, duration: 2000, cost: 100, desc: 'Bordes de metal' },
  { id: 'acero',   name: 'Escudo de Acero',  defB: 3, duration: 2500, cost: 200, desc: 'Sólido y pesado' },
  { id: 'pavon',   name: 'Pavés Real',       defB: 4, duration: 3000, cost: 350, desc: 'Cobertura total' },
  { id: 'leyenda', name: 'Escudo de Leyenda', defB: 6, duration: 4000, cost: 600, desc: 'Forjado por dioses' },
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
  // Enemy Dark Themes
  { armor: '#1a1a1a', plume: '#333333', shield: '#000000', horse: '#2b1a0a' }, // Black
  { armor: '#1b3022', plume: '#2e7d32', shield: '#0a2b10', horse: '#3b1f0a' }, // Dark Green
  { armor: '#1a237e', plume: '#3949ab', shield: '#0d1440', horse: '#2b1a0a' }, // Dark Blue
  { armor: '#4a0a0b', plume: '#8e1616', shield: '#260505', horse: '#3b1f0a' }, // Dark Red
];

export function getKnightData(id) { return DB_KNIGHTS.find(k => k.id === id); }
export function getArmorData(id)  { return DB_ARMORS.find(a => a.id === id); }
export function getHorseData(id)  { return DB_HORSES.find(h => h.id === id); }
export function getSquireData(id) { return DB_SQUIRES.find(s => s.id === id); }
export function getShieldData(id) { return DB_SHIELDS.find(sh => sh.id === id); }

export const WAR_CRIES = [
  "¡POR EL HONOR Y LA GLORIA!", "¡DEUS VULT!", "¡POR MI ESTIRPE!", "¡SENTID EL ACERO!",
  "¡A LA CARGA!", "¡PARA MÍ LA VICTORIA!", "¡MORID CON HONOR!", "¡POR EL REY!",
  "¡SANGRE Y HIERRO!", "¡TIEMBLA ANTE MÍ!", "¡POR LA CORONA!", "¡NO HABRÁ PIEDAD!",
  "¡MI LANZA OS ENCONTRARÁ!", "¡VALHALLA ME ESPERA!", "¡POR LA PATRIA!", "¡FUERZA Y HONOR!",
  "¡QUE DIOS JUZGUE!", "¡AL SUELO, GUSANO!", "¡POR MI CASA!", "¡SOY LA TORMENTA!",
  "¡MI NOMBRE SERÁ LEYENDA!", "¡MUERTE O VICTORIA!", "¡POR EL SOL PONIENTE!", "¡SENTID MI FURIA!",
  "¡EL TRONO ES MÍO!", "¡POR LOS ANCESTROS!", "¡NI UN PASO ATRÁS!", "¡POR LA JUSTICIA!",
  "¡MI VALOR ES ETERNO!", "¡QUE COMIENCE LA LIZA!"
];

export const ENEMY_SQUADS = [
  {
    name: 'La Orden de Calatrava',
    origin: 'Española',
    knights: [
      { name: 'García de Paredes', str: 9, def: 7, hor: 6, icon: '🛡️', colorIdx: 2, armor: 'milanes', horse: 'destrero', squire: 'experto' },
      { name: 'Suero de Quiñones', str: 7, def: 8, hor: 7, icon: '⚔️', colorIdx: 0, armor: 'justa', horse: 'corcel', squire: 'vetera' },
      { name: 'Diego García', str: 8, def: 6, hor: 8, icon: '🐎', colorIdx: 1, armor: 'placas', horse: 'andaluz', squire: 'novato' },
      { name: 'Pero Niño', str: 6, def: 9, hor: 5, icon: '🔥', colorIdx: 4, armor: 'milanes', horse: 'destrero', squire: 'experto' }
    ]
  },
  {
    name: 'Die Tevtonischen Ritter',
    origin: 'Alemana',
    knights: [
      { name: 'Ulrich von Jungingen', str: 8, def: 8, hor: 6, icon: '🦅', colorIdx: 7, armor: 'justa', horse: 'destrero', squire: 'vetera' },
      { name: 'Wolfram von Eschenbach', str: 6, def: 7, hor: 9, icon: '🏰', colorIdx: 6, armor: 'milanes', horse: 'corcel', squire: 'experto' },
      { name: 'Götz von Berlichingen', str: 9, def: 5, hor: 7, icon: '🦾', colorIdx: 3, armor: 'placas', horse: 'destrero', squire: 'aprend' },
      { name: 'Hermann von Salza', str: 7, def: 9, hor: 6, icon: '⚖️', colorIdx: 5, armor: 'justa', horse: 'rocin', squire: 'vetera' }
    ]
  },
  {
    name: 'Escuadrón Zarista Nevsky',
    origin: 'Rusa',
    knights: [
      { name: 'Alexander Nevsky', str: 9, def: 9, hor: 7, icon: '❄️', colorIdx: 1, armor: 'justa', horse: 'destrero', squire: 'vetera' },
      { name: 'Dmitry Donskoy', str: 8, def: 7, hor: 8, icon: '🐻', colorIdx: 7, armor: 'milanes', horse: 'corcel', squire: 'experto' },
      { name: 'Ilya Muromets', str: 10, def: 5, hor: 6, icon: '🏔️', colorIdx: 2, armor: 'placas', horse: 'destrero', squire: 'novato' },
      { name: 'Dobrynya Nikitich', str: 7, def: 8, hor: 9, icon: '🐉', colorIdx: 3, armor: 'milanes', horse: 'andaluz', squire: 'aprend' }
    ]
  },
  {
    name: 'Karantanski Vitezi',
    origin: 'Eslovena',
    knights: [
      { name: 'Erasmus Lueger', str: 7, def: 9, hor: 6, icon: '⛰️', colorIdx: 0, armor: 'justa', horse: 'destrero', squire: 'vetera' },
      { name: 'Jurij Dalmatin', str: 6, def: 6, hor: 8, icon: '📖', colorIdx: 4, armor: 'placas', horse: 'corcel', squire: 'experto' },
      { name: 'Andrej Turjaški', str: 8, def: 7, hor: 7, icon: '🏹', colorIdx: 6, armor: 'milanes', horse: 'corcel', squire: 'aprend' },
      { name: 'Nikola Jurišić', str: 9, def: 8, hor: 5, icon: '🛡️', colorIdx: 5, armor: 'justa', horse: 'destrero', squire: 'experto' }
    ]
  },
  {
    name: 'Guardia de Hierro Ming',
    origin: 'China',
    knights: [
      { name: 'General Qi Jiguang', str: 8, def: 9, hor: 7, icon: '🐉', colorIdx: 4, armor: 'justa', horse: 'destrero', squire: 'vetera' },
      { name: 'Lu Bu', str: 10, def: 4, hor: 10, icon: '👹', colorIdx: 6, armor: 'milanes', horse: 'destrero', squire: 'experto' },
      { name: 'Guan Yu', str: 9, def: 8, hor: 8, icon: '👺', colorIdx: 2, armor: 'justa', horse: 'corcel', squire: 'vetera' },
      { name: 'Yue Fei', str: 7, def: 10, hor: 6, icon: '🦅', colorIdx: 3, armor: 'milanes', horse: 'andaluz', squire: 'experto' }
    ]
  },
  {
    name: 'Orden del León Dorado',
    origin: 'Inglesa',
    knights: [
      { name: 'Sir Richard Lionheart', str: 9, def: 8, hor: 7, icon: '🦁', colorIdx: 0, armor: 'justa', horse: 'destrero', squire: 'vetera' },
      { name: 'Sir William Marshall', str: 8, def: 10, hor: 8, icon: '⚔️', colorIdx: 1, armor: 'milanes', horse: 'andaluz', squire: 'experto' },
      { name: 'Sir Edward Woodstock', str: 10, def: 6, hor: 9, icon: '🛡️', colorIdx: 2, armor: 'placas', horse: 'corcel', squire: 'aprend' },
      { name: 'Sir John Hawkwood', str: 7, def: 7, hor: 10, icon: '🏹', colorIdx: 3, armor: 'cuero', horse: 'rocin', squire: 'novato' }
    ]
  },
  {
    name: 'Shogunato Ashikaga',
    origin: 'Japonesa',
    knights: [
      { name: 'Musashi Miyamoto', str: 10, def: 5, hor: 8, icon: '🌙', colorIdx: 4, armor: 'cuero', horse: 'corcel', squire: 'experto' },
      { name: 'Tadakatsu Honda', str: 9, def: 10, hor: 6, icon: '👹', colorIdx: 5, armor: 'milanes', horse: 'destrero', squire: 'vetera' },
      { name: 'Yukimura Sanada', str: 8, def: 7, hor: 10, icon: '🔥', colorIdx: 6, armor: 'placas', horse: 'andaluz', squire: 'aprend' },
      { name: 'Masamune Date', str: 9, def: 8, hor: 7, icon: '🦅', colorIdx: 7, armor: 'justa', horse: 'corcel', squire: 'experto' }
    ]
  },
  {
    name: 'Húsares Alados de Varsovia',
    origin: 'Polaca',
    knights: [
      { name: 'Jan Sobieski III', str: 9, def: 9, hor: 10, icon: '🪶', colorIdx: 0, armor: 'justa', horse: 'andaluz', squire: 'vetera' },
      { name: 'Stanislaw Zolkiewski', str: 8, def: 8, hor: 9, icon: '🛡️', colorIdx: 1, armor: 'milanes', horse: 'destrero', squire: 'experto' },
      { name: 'Stefan Czarniecki', str: 7, def: 10, hor: 8, icon: '⚔️', colorIdx: 2, armor: 'placas', horse: 'corcel', squire: 'aprend' },
      { name: 'Jerzy Lubomirski', str: 9, def: 7, hor: 9, icon: '🦅', colorIdx: 3, armor: 'milanes', horse: 'destrero', squire: 'novato' }
    ]
  },
  {
    name: 'Clan del Lobo Gélido',
    origin: 'Nórdica',
    knights: [
      { name: 'Ragnar Lodbrok', str: 10, def: 6, hor: 7, icon: '🐺', colorIdx: 4, armor: 'cuero', horse: 'rocin', squire: 'experto' },
      { name: 'Bjorn Ironside', str: 8, def: 10, hor: 6, icon: '⚓', colorIdx: 5, armor: 'placas', horse: 'destrero', squire: 'aprend' },
      { name: 'Ivar the Boneless', str: 10, def: 4, hor: 9, icon: '🪓', colorIdx: 6, armor: 'cuero', horse: 'corcel', squire: 'novato' },
      { name: 'Harald Hardrada', str: 9, def: 8, hor: 8, icon: '🏔️', colorIdx: 7, armor: 'milanes', horse: 'andaluz', squire: 'vetera' }
    ]
  },
  {
    name: 'Guardia de los Inmortales',
    origin: 'Persa',
    knights: [
      { name: 'Ciro el Grande', str: 9, def: 9, hor: 8, icon: '☀️', colorIdx: 0, armor: 'justa', horse: 'andaluz', squire: 'vetera' },
      { name: 'Darío I el Grande', str: 8, def: 10, hor: 7, icon: '🦁', colorIdx: 1, armor: 'milanes', horse: 'destrero', squire: 'experto' },
      { name: 'Jerjes I', str: 10, def: 5, hor: 9, icon: '🏹', colorIdx: 2, armor: 'placas', horse: 'corcel', squire: 'aprend' },
      { name: 'Artajerjes', str: 7, def: 8, hor: 10, icon: '💎', colorIdx: 3, armor: 'justa', horse: 'corcel', squire: 'vetera' }
    ]
  }
];
