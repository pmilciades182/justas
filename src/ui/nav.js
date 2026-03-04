// ══════════════════════════════════════
// NAVEGACIÓN / UI — sin dependencias circulares
// Los handlers de pantalla se registran desde main.js
// ══════════════════════════════════════

import { player } from '../state.js';

export let currentScreen = 'home';

import { audio } from '../audio.js';

export const $ = (s) => document.querySelector(s);

export const $$ = s => document.querySelectorAll(s);

const _handlers = {};

export function registerScreenHandler(name, fn) {
  _handlers[name] = fn;
}

export async function switchScreen(name) {
  await audio.init(); // Ensure context is ready
  audio.playClick();
  currentScreen = name;
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`#screen-${name}`)?.classList.add('active');
  $$('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.screen === name));

  const immersive = (name === 'joust' || name === 'designer');
  $('#topbar')?.classList.toggle('hidden', immersive);
  $('#bottomnav')?.classList.toggle('hidden', immersive);

  // Music logic
  if (['home', 'roster', 'shop', 'team'].includes(name)) {
    audio.playMusic('menu');
  } else if (name === 'joust') {
    audio.playMusic('combat');
  } else {
    audio.stopMusic();
  }

  if (_handlers[name]) _handlers[name]();
  refreshGold();
}

export function refreshGold() {
  const el = document.getElementById('gold-display');
  if (el) el.textContent = `🪙 ${player.gold}`;
}

// Bottom nav bindings
$$('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => switchScreen(tab.dataset.screen));
});
