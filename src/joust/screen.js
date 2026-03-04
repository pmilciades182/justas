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
import { audio } from '../audio.js';
import { initAbilities } from './abilities.js';

export function initJoustScreen() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  joust.playerTeam = player.team.map(kid => ({
    knightId: kid,
    equip: player.equip[kid] || { armor: 'a1', horse: 'h1', squire: 'sq1', shield: 's1', lance: 'l1' },
    hp: 100,
    maxHp: 100,
    fatigue: 0,
    abilityShieldT: 0
  }));
  
  const enemyResult = generateEnemy(4);
  joust.enemyTeam = enemyResult.knights.map(k => ({ ...k, hp: 100, maxHp: 100, fatigue: 0, abilityShieldT: 0 }));
  joust.enemySquadData = enemyResult.squadData;

  joust.matchIdx = 0;
  joust.playerMatchWins = 0;
  joust.enemyMatchWins = 0;
  joust.totalMatches = 4;

  // Reset ground marks
  joust.groundBlood = [];
  joust.groundSplinters = [];
  joust.hoofPrints = [];
  joust.roses = [];
  joust.trash = [];
  joust.confetti = [];
  joust.groundBrokenLances = [];

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

  const playerHasHp = joust.playerTeam.some(k => k.hp > 0);
  const enemyHasHp = joust.enemyTeam.some(k => k.hp > 0);

  if (!playerHasHp) { handleWalkover('player'); return; }
  if (!enemyHasHp) { handleWalkover('enemy'); return; }

  let html = `
    <div class="card text-center" style="padding:20px; border: 4px double var(--gold); background:#1a110a; color:#e8d5b5; max-width: 440px; width: 95%; box-shadow: 0 0 50px rgba(0,0,0,0.9);">
      <div style="font-family:MedievalSharp; font-size:14px; color:var(--gold-dim); margin-bottom:15px; letter-spacing:2px">
        COMBATE ${joust.matchIdx + 1} / ${joust.totalMatches}
      </div>
      
      <div style="font-family:MedievalSharp; font-size:22px; color:#fff; margin-bottom:20px; text-transform:uppercase">
        Selecciona un caballero
      </div>

      <!-- PLAYER GRID (Top 2x2) -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px">`;

  joust.playerTeam.forEach((k, idx) => {
    const kd = getKnightData(k.knightId);
    const disabled = k.hp <= 0;
    html += `
      <div class="selection-item ${disabled ? 'disabled' : ''}" data-idx="${idx}" 
           style="background:#000; border:1px solid ${disabled ? '#333' : 'var(--gold-dim)'}; padding:8px; display:flex; align-items:center; gap:10px; cursor:${disabled ? 'default' : 'pointer'}; opacity:${disabled ? 0.4 : 1}; transition:all 0.2s">
        <span style="font-size:24px">${kd.icon}</span>
        <div style="text-align:left; flex:1; overflow:hidden">
          <div style="font-size:11px; font-weight:bold; color:var(--gold-bright); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${kd.name}</div>
          <div style="font-size:9px; color:#aaa">HP: ${k.hp}%</div>
        </div>
      </div>`;
  });

  html += `
      </div>

      <div style="font-family:MedievalSharp; font-size:24px; color:var(--red); font-style:italic; margin:10px 0; text-shadow:0 0 10px rgba(142,22,22,0.5)">VS</div>

      <!-- ENEMY GRID (Bottom 2x2 - Informational only) -->
      <div style="font-size:10px; color:#888; margin-bottom:8px; letter-spacing:1px; text-align:left">RIVALES:</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:20px">`;

  joust.enemyTeam.forEach((k, idx) => {
    const kd = k.customData;
    const disabled = k.hp <= 0;
    html += `
      <div style="display:flex; align-items:center; gap:10px; padding:4px; opacity:${disabled ? 0.2 : 0.6}; border-bottom: 1px solid rgba(255,255,255,0.05)">
        <span style="font-size:20px; filter: grayscale(0.5)">${kd.icon}</span>
        <div style="text-align:left; flex:1; overflow:hidden">
          <div style="font-size:10px; font-weight:bold; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${kd.name}</div>
          <div style="font-size:8px; color:#666">HP: ${k.hp}%</div>
        </div>
      </div>`;
  });

  html += `
      </div>

      <button class="btn btn-gold btn-lg" id="btn-confirm-selection" disabled style="width:100%">¡A LA LIZA!</button>
    </div>`;

  overlay.innerHTML = html;

  let selectedIdx = -1;
  const items = overlay.querySelectorAll('.selection-item');
  items.forEach(item => {
    if (item.classList.contains('disabled')) return;
    item.addEventListener('click', () => {
      items.forEach(i => {
          i.style.borderColor = 'var(--gold-dim)';
          i.style.background = '#000';
          i.style.boxShadow = 'none';
      });
      item.style.borderColor = '#fff';
      item.style.background = 'rgba(212,160,23,0.15)';
      item.style.boxShadow = '0 0 15px rgba(255,255,255,0.2)';
      selectedIdx = parseInt(item.dataset.idx);
      document.getElementById('btn-confirm-selection').disabled = false;
    });
  });

  document.getElementById('btn-confirm-selection').addEventListener('click', () => {
    joust.selectedPlayerKnightIdx = selectedIdx;
    
    // Enemy selection logic
    const validEnemies = joust.enemyTeam.map((k, i) => k.hp > 0 ? i : -1).filter(i => i !== -1);
    if (validEnemies.length === 0) { handleWalkover('enemy'); return; }
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
    winnerColor = '#27ae60';
  } else {
    joust.enemyMatchWins++;
    winnerText = '¡DERROTA POR WALKOVER!';
    winnerColor = 'var(--red)';
  }
  updateGlobalHUD();

  const isLast = joust.matchIdx >= joust.totalMatches - 1;
  const btnText = isLast ? '🏆 VER VERDICTO FINAL' : '➡ SIGUIENTE DUELO';

  overlay.innerHTML = `
    <div class="card text-center" style="padding:25px; border: 4px double var(--gold); background:#1a110a; color:#e8d5b5">
      <div style="font-family:MedievalSharp; font-size:24px; color:${winnerColor}; margin-bottom:15px">${winnerText}</div>
      <p style="font-family:Almendra; margin-bottom:20px">El oponente no tiene caballeros aptos para luchar.</p>
      <button class="btn btn-gold btn-lg" id="btn-next-walkover">${btnText}</button>
    </div>`;
  
  document.getElementById('btn-next-walkover').addEventListener('click', () => {
    if (isLast) { showTourneyResult(); } 
    else { joust.matchIdx++; showKnightSelection(); }
  });
}

export function showMatchIntro() {
  const overlay = document.getElementById('joust-overlay');
  const pkData = joust.playerTeam[joust.selectedPlayerKnightIdx];
  const ekData = joust.enemyTeam[joust.selectedEnemyKnightIdx];
  const pkd = getKnightData(pkData.knightId);
  const ekd = ekData.customData;
  const pc = KNIGHT_COLORS[pkd.colorIdx];
  const ec = KNIGHT_COLORS[ekd.colorIdx];

  overlay.style.pointerEvents = 'auto';
  overlay.innerHTML = `
    <div class="card text-center" style="padding:30px 20px; border: 4px double var(--gold); background:#1a110a; color:#e8d5b5; max-width: 360px; box-shadow: 0 0 50px rgba(0,0,0,0.9);">
      <div style="font-family:MedievalSharp; font-size:12px; color:var(--gold-dim); margin-bottom:5px; text-transform:uppercase; letter-spacing:1px">
        Enfrentando a:
      </div>
      <div style="font-family:MedievalSharp; font-size:22px; color:#fff; margin-bottom:2px">
        ${joust.enemySquadData.name}
      </div>
      <div style="font-family:Almendra; font-size:14px; color:var(--gold-dim); margin-bottom:15px; font-style:italic">
        — Casa Real ${joust.enemySquadData.origin} —
      </div>

      <div style="font-family:MedievalSharp; font-size:11px; color:#aaa; margin-bottom:15px; letter-spacing: 1px; border-top: 1px solid rgba(255,255,255,0.1); padding-top:10px">
        DUELO ${joust.matchIdx + 1} / ${joust.totalMatches}
      </div>

      <div style="display:flex; align-items:flex-start; justify-content:center; gap:15px; margin:20px 0">
        <div style="flex: 1;">
          <div style="font-size:55px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5))">${pkd.icon}</div>
          <div style="font-family:MedievalSharp; font-size:16px; color:${pc.plume}; margin-top:8px; font-weight:bold">${pkd.name}</div>
          <div style="font-family:Almendra; font-size:11px; color:#aaa; margin-top:4px">
            HP: ${pkData.hp}% | Fatiga: ${pkData.fatigue || 0}%<br>
            FUE ${pkd.str} · DEF ${pkd.def}
          </div>
        </div>

        <div style="align-self: center; font-family:MedievalSharp; font-size:28px; color:var(--red); font-style: italic; text-shadow: 0 0 10px rgba(142,22,22,0.5)">VS</div>

        <div style="flex: 1;">
          <div style="font-size:55px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5))">${ekd.icon}</div>
          <div style="font-family:MedievalSharp; font-size:16px; color:${ec.plume}; margin-top:8px; font-weight:bold">${ekd.name}</div>
          <div style="font-family:Almendra; font-size:11px; color:#aaa; margin-top:4px">
            HP: ${ekData.hp}% | Fatiga: ${ekData.fatigue || 0}%<br>
            FUE ${ekd.str} · DEF ${ekd.def}
          </div>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.3); padding: 10px; border:1px solid rgba(212,160,23,0.2); border-radius: 2px; margin-bottom: 20px; font-family: Almendra; font-size: 13px; color: #fff;">
        ${joust.playerMatchWins} victorias para tu casa — ${joust.enemyMatchWins} para el rival
      </div>

      <button class="btn btn-gold btn-lg" id="btn-start-match" style="width: 100%;">
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
  joust.k1.lanceIntact = true; 
  joust.k1.lanceLoading = 0;
  
  joust.k2 = makeJoustKnight(ek.knightId, 'right', ek.equip, ek.customData);
  joust.k2.hp = ek.hp;
  joust.k2.fatigue = ek.fatigue || 0;
  joust.k2.lanceIntact = true; 
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
  joust.shakeAmt = 0;
  joust.flashAlpha = 0;
  joust.t = 0;
  joust.active = true;

  joust.k1.speed = 0;
  joust.k2.speed = 0;
  
  knightSay(joust.k1, 'war_cry');
  knightSay(joust.k2, 'war_cry');

  initAbilities();
  resetAbilityCooldowns(); 
  setSubPhase('charge');
}

function resetAbilityCooldowns() {
  const k1 = joust.k1;
  const k2 = joust.k2;
  
  [k1, k2].forEach(k => {
    if (!k) return;
    if (k.equipStats.shield) k.cdShield = k.equipStats.shield.cd;
    if (k.equipStats.lance)  k.cdAttack = k.equipStats.lance.cd;
    if (k.equipStats.horse)  k.cdHorse  = k.equipStats.horse.cd;
    if (k.equipStats.armor)  k.cdSpecial = k.equipStats.armor.cd;
    
    k.abilityShieldT = 0;
    k.abilityAttackT = 0;
    k.abilityHorseT = 0;
    k.abilitySpecialT = 0;
    k.abilityActive = false;
  });
}

export function showMatchResult() {
  joust.active = false;
  const k1 = joust.k1, k2 = joust.k2;

  const pkData = joust.playerTeam[joust.selectedPlayerKnightIdx];
  const ekData = joust.enemyTeam[joust.selectedEnemyKnightIdx];
  
  pkData.hp = k1.hp;
  ekData.hp = k2.hp;
  
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

  if (playerWon) {
    spawnConfetti(56);
    spawnRoses('left', 17);
    spawnTrash('right', 14);
    audio.playFanfareMatch();
  } else if (!isDraw) {
    spawnRoses('right', 17);
    spawnTrash('left', 14);
    audio.playFanfareDefeat();
  } else {
    spawnTrash('left', 7);
    spawnTrash('right', 7);
    audio.playFanfareDraw();
  }

  const isLast = joust.matchIdx >= joust.totalMatches - 1;
  const btnText = isLast ? '🏆 VER VERDICTO FINAL' : '➡ SIGUIENTE SELECCIÓN';

  const overlay = document.getElementById('joust-overlay');
  overlay.style.pointerEvents = 'auto';
  
  let mainTitle = '¡EMPATE!';
  let titleColor = '#666';
  if (playerWon) {
    mainTitle = '¡VICTORIA!';
    titleColor = '#27ae60';
  } else if (!isDraw) {
    mainTitle = '¡DERROTA!';
    titleColor = 'var(--red)';
  }

  overlay.innerHTML = `
    <div class="card text-center" style="padding:25px; border: 4px double var(--gold); background:#1a110a; color:#e8d5b5; max-width: 340px;">
      <div style="font-family:MedievalSharp; font-size:14px; color:#aaa; margin-bottom:10px">${statusText}</div>
      <div style="font-family:MedievalSharp; font-size:36px; color:${titleColor}; margin-bottom:15px">
        ${mainTitle}
      </div>

      <div style="display:flex; justify-content:center; align-items:center; gap:20px; margin:15px 0; background:rgba(0,0,0,0.3); padding:15px; border:1px solid rgba(255,255,255,0.1);">
        <div style="text-align:center">
          <div style="font-family:Almendra; font-size:12px; color:#aaa">TUS PUNTOS</div>
          <div style="font-family:MedievalSharp; font-size:32px; color:#fff">${joust.k1Points}</div>
        </div>
        <div style="font-size:24px; color:var(--gold)">—</div>
        <div style="text-align:center">
          <div style="font-family:Almendra; font-size:12px; color:#aaa">RIVAL</div>
          <div style="font-family:MedievalSharp; font-size:32px; color:#fff">${joust.k2Points}</div>
        </div>
      </div>

      <button class="btn btn-gold btn-lg" id="btn-next-match" style="width: 100%">
        ${btnText}
      </button>
    </div>`;

  document.getElementById('btn-next-match').addEventListener('click', () => {
    if (isLast) { showTourneyResult(); } 
    else {
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
    audio.playFanfareTourney();
  }
  else if (!draw) {
    player.losses++;
    audio.playFanfareDefeat();
  }

  const goldReward = won ? 150 + pWins * 50 : 30 + pWins * 20;
  player.gold += goldReward;
  saveGame();

  const overlay = document.getElementById('joust-overlay');
  overlay.innerHTML = `
    <div class="card text-center" style="padding:30px 20px; border: 4px double var(--gold); background:#1a110a; color:#e8d5b5; max-width:360px">
      <div style="font-size:60px; margin-bottom:10px">${won ? '🏆' : draw ? '⚖️' : '💀'}</div>
      <div style="font-family:MedievalSharp; font-size:32px; color:${won ? 'var(--gold)' : draw ? '#666' : 'var(--red)'}">
        ${won ? '¡CAMPEÓN!' : draw ? 'EMPATE' : 'DERROTA'}
      </div>
      <div style="font-family:Almendra; font-size:18px; color:#aaa; margin:8px 0">
        ${pWins} combates ganados — ${eWins} perdidos
      </div>
      <div style="font-family:MedievalSharp; font-size:20px; color:var(--gold-bright); margin:12px 0">
        +${goldReward} 🪙
      </div>
      <button class="btn btn-gold btn-lg" id="btn-back-home">🏰 VOLVER AL CASTILLO</button>
    </div>`;
  overlay.style.pointerEvents = 'auto';

  document.getElementById('btn-back-home').addEventListener('click', () => {
    overlay.innerHTML = '';
    overlay.style.pointerEvents = 'none';
    joust.active = false;
    switchScreen('home');
  });
}
