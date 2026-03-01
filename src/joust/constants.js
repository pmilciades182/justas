// ══════════════════════════════════════
// CONSTANTES DEL MOTOR DE JUSTA
// ══════════════════════════════════════

export const canvas = document.querySelector('#canvas');
export const ctx = canvas.getContext('2d');

// Internal resolution (logical) — actualizados por resizeCanvas()
export let W = 390;
export let H = 844;
export let LANE_X   = W / 2;
export let TRACK_X  = LANE_X - 50; 
export let TRACK_TOP = H * 0.05; // 5% margin top
export let TRACK_BOT = H * 0.95; // 5% margin bottom (90% total)

export const TRACK_W    = 100;
export const DELIVERY_ZONE_PCT = 0.20; 
export const LANCE_LEN  = 80;
export const KNIGHT_BW  = 26;
export const KNIGHT_BH  = 42;
export const HORSE_W    = 22;
export const HORSE_H    = 60;
export const MAX_VENIDAS = 4;

export const COL = {
  grass: '#3a7a35', dirt: '#c8a87a', rail: '#8b6914', railLine: '#6b4f10',
  lance: '#c9a96e', lanceSheen: '#f0d090', horseDark: '#3b1f0a',
};

export const HIT_TABLE = [
  { type: 'miss',     prob: 0.10, pts: 0,  brk: false, label: 'Fallo' },
  { type: 'attaint',  prob: 0.13, pts: 0,  brk: false, label: 'Toque sin romper' },
  { type: 'arm',      prob: 0.12, pts: 1,  brk: false, label: 'Golpe en brazo' },
  { type: 'shield',   prob: 0.30, pts: 2,  brk: false, label: 'Choque en escudo' },
  { type: 'helmet',   prob: 0.18, pts: 3,  brk: false, label: 'Golpe en yelmo' },
  { type: 'lanceTip', prob: 0.00, pts: 5,  brk: false, label: 'Punta contra punta' },
  { type: 'unhorse',  prob: 0.12, pts: 10, brk: false, label: '¡Desmontado!' },
];

export const HP_DAMAGE = {
  miss: 0, attaint: 0,
  arm: 8, shield: 14, helmet: 22, lanceTip: 30, unhorse: 0,
};

export function resizeCanvas() {
  const arena = document.getElementById('joust-arena');
  const sw = arena ? arena.clientWidth : window.innerWidth;
  const sh = arena ? arena.clientHeight : window.innerHeight;

  canvas.width = sw;
  canvas.height = sh;

  W = sw;
  H = sh;
  LANE_X = W / 2;
  TRACK_X = LANE_X - TRACK_W / 2;
  TRACK_TOP = H * 0.05;
  TRACK_BOT = H * 0.95;
}
