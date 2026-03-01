// ══════════════════════════════════════
// GESTIÓN DE PARTIDAS (intro, resultado, torneo)
// ══════════════════════════════════════

import { player, saveGame } from '../state.js';
import { getKnightData, KNIGHT_COLORS } from '../data.js';
import { resizeCanvas } from './constants.js';
import { joust, setSubPhase } from './state.js';
import { makeJoustKnight, generateEnemy, makeSquire } from './knights.js';
import { switchScreen } from '../ui/nav.js';

export function initJoustScreen() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

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

export function showMatchIntro() {
  const overlay = document.getElementById('joust-overlay');
  const pkData = joust.playerTeam[joust.matchIdx];
  const ekData = joust.enemyTeam[joust.matchIdx];
  const pkd = getKnightData(pkData.knightId);
  const ekd = getKnightData(ekData.knightId);
  const pc = KNIGHT_COLORS[pkd.colorIdx];
  const ec = KNIGHT_COLORS[ekd.colorIdx];

  overlay.style.pointerEvents = 'auto';
  overlay.innerHTML = `
    <div class="card text-center" style="padding:30px 20px; border: 4px double var(--gold); background-color: var(--card); max-width: 360px; box-shadow: 0 0 30px rgba(0,0,0,0.8);">
      <div style="font-family:MedievalSharp; font-size:14px; color:var(--text-dim); margin-bottom:15px; letter-spacing: 1px;">
        ORDEN DE COMBATE: DUELO ${joust.matchIdx + 1} / ${joust.playerTeam.length}
      </div>

      <div style="display:flex; align-items:flex-start; justify-content:center; gap:15px; margin:20px 0">
        <div style="flex: 1;">
          <div style="font-size:55px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.2))">${pkd.icon}</div>
          <div style="font-family:MedievalSharp; font-size:16px; color:${pc.plume}; margin-top:8px; font-weight:bold">${pkd.name}</div>
          <div style="font-family:Almendra; font-size:11px; color:#5d4037; margin-top:4px">
            FUE ${pkd.str} · DEF ${pkd.def} · MON ${pkd.hor}
          </div>
        </div>

        <div style="align-self: center; font-family:MedievalSharp; font-size:28px; color:var(--red); font-style: italic; text-shadow: 1px 1px 0 #fff">VS</div>

        <div style="flex: 1;">
          <div style="font-size:55px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.2))">${ekd.icon}</div>
          <div style="font-family:MedievalSharp; font-size:16px; color:${ec.plume}; margin-top:8px; font-weight:bold">${ekd.name}</div>
          <div style="font-family:Almendra; font-size:11px; color:#5d4037; margin-top:4px">
            FUE ${ekd.str} · DEF ${ekd.def} · MON ${ekd.hor}
          </div>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px; margin-bottom: 20px; font-family: Almendra; font-size: 13px; color: #2c1e16;">
        ${joust.playerMatchWins} victorias para tu casa — ${joust.enemyMatchWins} para el rival
      </div>

      <button class="btn btn-gold btn-lg" id="btn-start-match" style="width: 100%; box-shadow: 0 4px 0 #8b6b10;">
        ⚔ ¡A LA LIZA!
      </button>
    </div>`;

  document.getElementById('btn-start-match').addEventListener('click', () => {
    overlay.innerHTML = '';
    overlay.style.pointerEvents = 'none';
    startMatch();
  });
}

export function startMatch() {
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

export function showMatchResult() {
  joust.active = false;
  const k1 = joust.k1, k2 = joust.k2;

  const k1Unhorsed = joust.history.some(h => h.k2Hit.type === 'unhorse');
  const k2Unhorsed = joust.history.some(h => h.k1Hit.type === 'unhorse');

  let winnerName, winnerColor, statusText;
  let playerWon = false;

  if (k2Unhorsed && !k1Unhorsed) {
    winnerName = k1.name; winnerColor = '#2d4a22'; statusText = '¡ADVERSARIO DESMONTADO!';
    playerWon = true;
  } else if (k1Unhorsed && !k2Unhorsed) {
    winnerName = k2.name; winnerColor = 'var(--red)'; statusText = '¡HAS SIDO DESMONTADO!';
  } else if (k1Unhorsed && k2Unhorsed) {
    winnerName = 'EMPATE'; winnerColor = '#666'; statusText = '¡AMBOS CAÍDOS!';
  } else if (joust.k1Points > joust.k2Points) {
    winnerName = k1.name; winnerColor = '#2d4a22'; statusText = 'VICTORIA POR PUNTOS';
    playerWon = true;
  } else if (joust.k2Points > joust.k1Points) {
    winnerName = k2.name; winnerColor = 'var(--red)'; statusText = 'DERROTA POR PUNTOS';
  } else {
    winnerName = 'EMPATE'; winnerColor = '#666'; statusText = 'PUNTUACIÓN IGUALADA';
  }

  if (playerWon) joust.playerMatchWins++;
  else if (winnerName !== 'EMPATE') joust.enemyMatchWins++;

  const isLast = joust.matchIdx >= joust.playerTeam.length - 1;
  const btnText = isLast ? '🏆 VER VERDICTO FINAL' : '➡ SIGUIENTE DUELO';

  const overlay = document.getElementById('joust-overlay');
  overlay.style.pointerEvents = 'auto';
  overlay.innerHTML = `
    <div class="card text-center" style="padding:25px; border: 4px double var(--gold); background-color: var(--card); max-width: 340px;">
      <div style="font-family:MedievalSharp; font-size:14px; color:var(--text-dim); margin-bottom:10px">${statusText}</div>
      <div style="font-family:MedievalSharp; font-size:36px; color:${winnerColor}; margin-bottom:5px">
        ${winnerName === 'EMPATE' ? '¡EMPATE!' : '¡VICTORIA!'}
      </div>
      <div style="font-family:MedievalSharp; font-size:18px; color:#2c1e16; margin-bottom:15px">${winnerName === 'EMPATE' ? '' : winnerName}</div>

      <div style="display:flex; justify-content:center; align-items:center; gap:20px; margin:15px 0; background:rgba(0,0,0,0.05); padding:15px; border-radius:4px;">
        <div style="text-align:center">
          <div style="font-family:Almendra; font-size:12px; color:var(--text-dim)">TU PUNTUACIÓN</div>
          <div style="font-family:MedievalSharp; font-size:32px; color:#2c1e16">${joust.k1Points}</div>
        </div>
        <div style="font-size:24px; color:var(--gold)">—</div>
        <div style="text-align:center">
          <div style="font-family:Almendra; font-size:12px; color:var(--text-dim)">RIVAL</div>
          <div style="font-family:MedievalSharp; font-size:32px; color:#2c1e16">${joust.k2Points}</div>
        </div>
      </div>

      <button class="btn btn-gold btn-lg" id="btn-next-match" style="width: 100%">
        ${btnText}
      </button>
    </div>`;

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

export function showTourneyResult() {
  const pWins = joust.playerMatchWins;
  const eWins = joust.enemyMatchWins;
  const won = pWins > eWins;
  const draw = pWins === eWins;

  if (won) player.wins++;
  else if (!draw) player.losses++;

  const goldReward = won ? 150 + pWins * 50 : 30 + pWins * 20;
  player.gold += goldReward;
  saveGame();

  const overlay = document.getElementById('joust-overlay');
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
