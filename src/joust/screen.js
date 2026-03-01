// ══════════════════════════════════════
// GESTIÓN DE PARTIDAS (intro, resultado, torneo)
// ══════════════════════════════════════

import { player, saveGame } from '../state.js';
import { getKnightData, KNIGHT_COLORS } from '../data.js';
import { resizeCanvas } from './constants.js';
import { joust, setSubPhase } from './state.js';
import { makeJoustKnight, generateEnemy, makeSquire } from './knights.js';
import { switchScreen } from '../ui/nav.js';
import { spawnConfetti, spawnRoses, spawnTrash } from './particles.js';
import { knightSay } from './dialogue.js';

export function initJoustScreen() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  joust.playerTeam = player.team.map(kid => ({
    knightId: kid,
    equip: player.equip[kid] || { armor: null, horse: null, squire: null },
    hp: 100,
    maxHp: 100,
    fatigue: 0
  }));
  
  const enemyResult = generateEnemy(4);
  joust.enemyTeam = enemyResult.knights.map(k => ({ ...k, hp: 100, maxHp: 100, fatigue: 0 }));
  joust.enemySquadData = enemyResult.squadData;

  joust.matchIdx = 0;
  joust.playerMatchWins = 0;
  joust.enemyMatchWins = 0;
  joust.totalMatches = 4;

  // Reset ground marks ONLY at the start of the tournament
  joust.groundBlood = [];
  joust.groundSplinters = [];
  joust.hoofPrints = [];
  joust.roses = [];
  joust.trash = [];
  joust.confetti = [];

  updateGlobalHUD();
  showKnightSelection();
}

function updateGlobalHUD() {
  const p1 = document.getElementById('jhud-global-p1');
  const p2 = document.getElementById('jhud-global-p2');
  if (p1) p1.textContent = joust.playerMatchWins;
  if (p2) p2.textContent = joust.enemyMatchWins;
}

export function showKnightSelection() {
  const overlay = document.getElementById('joust-overlay');
  overlay.style.pointerEvents = 'auto';

  // Check if any side has no HP left to continue
  const playerHasHp = joust.playerTeam.some(k => k.hp > 0);
  const enemyHasHp = joust.enemyTeam.some(k => k.hp > 0);

  if (!playerHasHp) {
    handleWalkover('player');
    return;
  }
  if (!enemyHasHp) {
    handleWalkover('enemy');
    return;
  }

  // Check for walkover: if one side doesn't have 4 knights it's handled by selection or game start.
  // Actually, the user says if they don't have enough knights "pierde por walkover ese punto".
  // This means if joust.matchIdx < 4 but we can't fulfill it.

  let html = `
    <div class="card text-center" style="padding:20px; border: 4px double var(--gold); background-color: var(--card); max-width: 420px; width: 95%;">
      <div style="font-family:MedievalSharp; font-size:18px; color:var(--red); margin-bottom:10px">
        COMBATE ${joust.matchIdx + 1} DE ${joust.totalMatches}
      </div>
      <div style="font-family:Almendra; font-size:13px; color:var(--gold-bright); margin-bottom:15px; background:rgba(0,0,0,0.4); padding:6px; border:1px solid var(--gold-dim)">
        Selecciona un caballero para este duelo. Los que no tengan HP no pueden luchar.
      </div>

      <div style="display:flex; gap:10px; margin-bottom:20px;">
        <div style="flex:1; background:rgba(0,0,0,0.05); padding:10px; border-radius:4px;">
          <div style="font-size:11px; font-weight:bold; margin-bottom:5px">TU ESCUADRÓN</div>
          <div id="selection-player-list" style="display:flex; flex-direction:column; gap:5px">`;

  joust.playerTeam.forEach((k, idx) => {
    const kd = getKnightData(k.knightId);
    const disabled = k.hp <= 0;
    html += `
      <div class="selection-item ${disabled ? 'disabled' : ''}" data-idx="${idx}" style="display:flex; align-items:center; gap:8px; padding:5px; border:1px solid ${disabled ? '#ccc' : 'var(--gold)'}; background:${disabled ? '#eee' : '#fff'}; cursor:${disabled ? 'default' : 'pointer'}; border-radius:4px; opacity:${disabled ? 0.6 : 1}">
        <span style="font-size:20px">${kd.icon}</span>
        <div style="text-align:left; flex:1">
          <div style="font-size:11px; font-weight:bold">${kd.name}</div>
          <div style="font-size:9px">HP: ${k.hp}/100</div>
        </div>
      </div>`;
  });

  html += `</div>
        </div>
        <div style="flex:1; background:rgba(0,0,0,0.05); padding:10px; border-radius:4px;">
          <div style="font-size:11px; font-weight:bold; margin-bottom:5px">RIVALES</div>
          <div style="display:flex; flex-direction:column; gap:5px">`;

  joust.enemyTeam.forEach((k, idx) => {
    const kd = k.customData; // Use predefined data for enemies
    const disabled = k.hp <= 0;
    html += `
      <div style="display:flex; align-items:center; gap:8px; padding:5px; border:1px solid #ccc; background:${disabled ? '#eee' : '#fff'}; border-radius:4px; opacity:${disabled ? 0.6 : 1}">
        <span style="font-size:20px">${kd.icon}</span>
        <div style="text-align:left; flex:1">
          <div style="font-size:11px; font-weight:bold; color:#2c1e16">${kd.name}</div>
          <div style="font-size:9px; color:#5d4037">HP: ${k.hp}/100</div>
        </div>
      </div>`;
  });

  html += `</div>
        </div>
      </div>
      <div id="selection-error" style="color:var(--red); font-size:12px; margin-bottom:10px; min-height:1.2em"></div>
      <button class="btn btn-gold btn-lg" id="btn-confirm-selection" disabled>¡A LA LIZA!</button>
    </div>`;

  overlay.innerHTML = html;

  let selectedIdx = -1;
  const items = overlay.querySelectorAll('.selection-item');
  items.forEach(item => {
    if (item.classList.contains('disabled')) return;
    item.addEventListener('click', () => {
      items.forEach(i => i.style.borderColor = 'var(--gold)');
      item.style.borderColor = 'var(--red)';
      item.style.backgroundColor = '#fff9e6';
      selectedIdx = parseInt(item.dataset.idx);
      document.getElementById('btn-confirm-selection').disabled = false;
    });
  });

  document.getElementById('btn-confirm-selection').addEventListener('click', () => {
    joust.selectedPlayerKnightIdx = selectedIdx;
    
    // Enemy AI selection: pick a random one with HP
    const validEnemies = joust.enemyTeam.map((k, i) => k.hp > 0 ? i : -1).filter(i => i !== -1);
    if (validEnemies.length === 0) {
      handleWalkover('enemy'); // Enemy has no one left
      return;
    }
    joust.selectedEnemyKnightIdx = validEnemies[Math.floor(Math.random() * validEnemies.length)];

    overlay.innerHTML = '';
    overlay.style.pointerEvents = 'none';
    showMatchIntro();
  });
}

function handleWalkover(side) {
  const overlay = document.getElementById('joust-overlay');
  let winnerText, winnerColor;
  if (side === 'enemy') {
    joust.playerMatchWins++;
    winnerText = '¡VICTORIA POR WALKOVER!';
    winnerColor = 'var(--green)';
  } else {
    joust.enemyMatchWins++;
    winnerText = '¡DERROTA POR WALKOVER!';
    winnerColor = 'var(--red)';
  }
  updateGlobalHUD();

  const isLast = joust.matchIdx >= joust.totalMatches - 1;
  const btnText = isLast ? '🏆 VER VERDICTO FINAL' : '➡ SIGUIENTE DUELO';

  overlay.innerHTML = `
    <div class="card text-center" style="padding:25px; border: 4px double var(--gold); background-color: var(--card);">
      <div style="font-family:MedievalSharp; font-size:24px; color:${winnerColor}; margin-bottom:15px">${winnerText}</div>
      <p style="font-family:Almendra; margin-bottom:20px">El oponente no tiene caballeros aptos para luchar.</p>
      <button class="btn btn-gold btn-lg" id="btn-next-walkover">${btnText}</button>
    </div>`;
  
  document.getElementById('btn-next-walkover').addEventListener('click', () => {
    if (isLast) {
      showTourneyResult();
    } else {
      joust.matchIdx++;
      showKnightSelection();
    }
  });
}

export function showMatchIntro() {
  const overlay = document.getElementById('joust-overlay');
  const pkData = joust.playerTeam[joust.selectedPlayerKnightIdx];
  const ekData = joust.enemyTeam[joust.selectedEnemyKnightIdx];
  const pkd = getKnightData(pkData.knightId);
  const ekd = ekData.customData; // Using customData for enemy knights
  const pc = KNIGHT_COLORS[pkd.colorIdx];
  const ec = KNIGHT_COLORS[ekd.colorIdx];

  overlay.style.pointerEvents = 'auto';
  overlay.innerHTML = `
    <div class="card text-center" style="padding:30px 20px; border: 4px double var(--gold); background-color: var(--card); max-width: 360px; box-shadow: 0 0 30px rgba(0,0,0,0.8);">
      <div style="font-family:MedievalSharp; font-size:12px; color:var(--red); margin-bottom:5px; text-transform:uppercase; letter-spacing:1px">
        Enfrentando a:
      </div>
      <div style="font-family:MedievalSharp; font-size:22px; color:#2c1e16; margin-bottom:2px">
        ${joust.enemySquadData.name}
      </div>
      <div style="font-family:Almendra; font-size:14px; color:var(--gold-dim); margin-bottom:15px; font-style:italic">
        — Casa Real ${joust.enemySquadData.origin} —
      </div>

      <div style="font-family:MedievalSharp; font-size:11px; color:var(--text-dim); margin-bottom:15px; letter-spacing: 1px; border-top: 1px solid rgba(0,0,0,0.1); padding-top:10px">
        DUELO ${joust.matchIdx + 1} / ${joust.totalMatches}
      </div>

      <div style="display:flex; align-items:flex-start; justify-content:center; gap:15px; margin:20px 0">
        <div style="flex: 1;">
          <div style="font-size:55px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.2))">${pkd.icon}</div>
          <div style="font-family:MedievalSharp; font-size:16px; color:${pc.plume}; margin-top:8px; font-weight:bold">${pkd.name}</div>
          <div style="font-family:Almendra; font-size:11px; color:#5d4037; margin-top:4px">
            HP: ${pkData.hp}/100 | Cansancio: ${pkData.fatigue || 0}%<br>
            FUE ${pkd.str} · DEF ${pkd.def}
          </div>
        </div>

        <div style="align-self: center; font-family:MedievalSharp; font-size:28px; color:var(--red); font-style: italic; text-shadow: 1px 1px 0 #fff">VS</div>

        <div style="flex: 1;">
          <div style="font-size:55px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.2))">${ekd.icon}</div>
          <div style="font-family:MedievalSharp; font-size:16px; color:${ec.plume}; margin-top:8px; font-weight:bold">${ekd.name}</div>
          <div style="font-family:Almendra; font-size:11px; color:#5d4037; margin-top:4px">
            HP: ${ekData.hp}/100 | Cansancio: ${ekData.fatigue || 0}%<br>
            FUE ${ekd.str} · DEF ${ekd.def}
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
  const pk = joust.playerTeam[joust.selectedPlayerKnightIdx];
  const ek = joust.enemyTeam[joust.selectedEnemyKnightIdx];

  joust.k1 = makeJoustKnight(pk.knightId, 'left', pk.equip);
  joust.k1.hp = pk.hp; 
  joust.k1.fatigue = pk.fatigue || 0;
  joust.k1.lanceIntact = true; // Start with lance
  joust.k1.lanceLoading = 0;
  
  // For enemy, pass ek.customData
  joust.k2 = makeJoustKnight(ek.knightId, 'right', ek.equip, ek.customData);
  joust.k2.hp = ek.hp;
  joust.k2.fatigue = ek.fatigue || 0;
  joust.k2.lanceIntact = true; // Start with lance
  joust.k2.lanceLoading = 0;
  
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
  joust.blood = [];
  joust.confetti = [];
  // groundBlood, groundSplinters, hoofPrints, roses, and trash are NOT reset here to persist across matches
  joust.shakeAmt = 0;
  joust.flashAlpha = 0;
  joust.t = 0;
  joust.active = true;

  joust.k1.speed = 0;
  joust.k2.speed = 0;
  
  // WAR CRIES at start
  knightSay(joust.k1, 'war_cry');
  knightSay(joust.k2, 'war_cry');

  setSubPhase('charge');
}

export function showMatchResult() {
  joust.active = false;
  const k1 = joust.k1, k2 = joust.k2;

  // Persist HP and Fatigue back to the teams
  const pkData = joust.playerTeam[joust.selectedPlayerKnightIdx];
  const ekData = joust.enemyTeam[joust.selectedEnemyKnightIdx];
  
  pkData.hp = k1.hp;
  ekData.hp = k2.hp;
  
  // Increase fatigue (15% per duel)
  pkData.fatigue = Math.min(100, (pkData.fatigue || 0) + 15);
  ekData.fatigue = Math.min(100, (ekData.fatigue || 0) + 15);

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

  const isDraw = winnerName === 'EMPATE';
  if (playerWon) joust.playerMatchWins++;
  else if (!isDraw) joust.enemyMatchWins++;

  updateGlobalHUD();

  // FEEDBACK EFFECTS (Roses, Trash, Confetti) - Reduced count by 30%
  if (playerWon) {
    spawnConfetti(56); // 80 * 0.7
    spawnRoses('left', 17); // 25 * 0.7
    spawnTrash('right', 14); // 20 * 0.7
  } else if (!isDraw) {
    spawnRoses('right', 17);
    spawnTrash('left', 14);
  } else {
    spawnTrash('left', 7);
    spawnTrash('right', 7);
  }

  const isLast = joust.matchIdx >= joust.totalMatches - 1;
  const btnText = isLast ? '🏆 VER VERDICTO FINAL' : '➡ SIGUIENTE SELECCIÓN';

  const overlay = document.getElementById('joust-overlay');
  overlay.style.pointerEvents = 'auto';
  
  // Decide main title based on player outcome
  let mainTitle = '¡EMPATE!';
  let titleColor = '#666';
  if (playerWon) {
    mainTitle = '¡VICTORIA!';
    titleColor = '#2d4a22';
  } else if (!isDraw) {
    mainTitle = '¡DERROTA!';
    titleColor = 'var(--red)';
  }

  overlay.innerHTML = `
    <div class="card text-center" style="padding:25px; border: 4px double var(--gold); background-color: var(--card); max-width: 340px;">
      <div style="font-family:MedievalSharp; font-size:14px; color:var(--text-dim); margin-bottom:10px">${statusText}</div>
      <div style="font-family:MedievalSharp; font-size:36px; color:${titleColor}; margin-bottom:15px">
        ${mainTitle}
      </div>

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
      showKnightSelection();
    }
  });
}

export function showTourneyResult() {
  const pWins = joust.playerMatchWins;
  const eWins = joust.enemyMatchWins;
  const won = pWins > eWins;
  const draw = pWins === eWins;

  if (won) {
    player.wins++;
    spawnConfetti(150);
  }
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
