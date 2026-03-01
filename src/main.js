// ══════════════════════════════════════
// JUSTA REAL — Entry point
// ══════════════════════════════════════

import { loadGame } from './state.js';
import { currentScreen, registerScreenHandler } from './ui/nav.js';
import { renderHome } from './ui/home.js';
import { renderRoster } from './ui/roster.js';
import { renderShop } from './ui/shop.js';
import { renderTeam } from './ui/team.js';
import { initJoustScreen, showMatchResult } from './joust/screen.js';
import { updateJoust } from './joust/update.js';
import { drawJoust } from './joust/render.js';
import { joust } from './joust/state.js';

// Cargar partida guardada
loadGame();

// Registrar handlers de pantalla (evita dependencias circulares en nav.js)
registerScreenHandler('home',   renderHome);
registerScreenHandler('roster', renderRoster);
registerScreenHandler('shop',   renderShop);
registerScreenHandler('team',   renderTeam);
registerScreenHandler('joust',  initJoustScreen);

// Bucle de juego
function gameLoop() {
  if (currentScreen === 'joust') {
    updateJoust();
    drawJoust();

    if (joust.subPhase === 'result' && joust.active) {
      showMatchResult();
    }
  }
  requestAnimationFrame(gameLoop);
}

// Init
renderHome();
gameLoop();
