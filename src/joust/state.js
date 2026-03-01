// ══════════════════════════════════════
// ESTADO DE LA JUSTA (objeto compartido)
// ══════════════════════════════════════

export const joust = {
  active: false,
  matchIdx: 0,
  venida: 1,
  subPhase: 'idle',   // idle|charge|clash|pass|squire|turn|pause|result
  phaseT: 0,
  t: 0,
  k1: null, k2: null,
  squire1: null, squire2: null,
  k1Hit: null, k2Hit: null,
  k1Points: 0, k2Points: 0,
  history: [],
  sparks: [], dust: [], splinters: [], blood: [],
  stunEvent: null,
  shakeAmt: 0, flashAlpha: 0,
  resultText: '',
  resultColor: '#fff',
  playerTeam: [],
  enemyTeam: [],
  playerMatchWins: 0,
  enemyMatchWins: 0,
};

export function setSubPhase(p) {
  joust.subPhase = p;
  joust.phaseT = 0;
}
