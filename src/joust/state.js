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
  groundBlood: [], groundSplinters: [], hoofPrints: [],
  stunEvent: null,
  shakeAmt: 0, flashAlpha: 0,
  resultText: '',
  resultColor: '#fff',
  
  // Team Match State
  playerTeam: [], // { knightId, equip, hp }
  enemyTeam: [],  // { knightId, equip, hp }
  playerMatchWins: 0,
  enemyMatchWins: 0,
  totalMatches: 4, // Standard 4 knights per squad
  
  // Current Match Selection
  selectedPlayerKnightIdx: -1,
  selectedEnemyKnightIdx: -1,
};

export function setSubPhase(p) {
  joust.subPhase = p;
  joust.phaseT = 0;
}
