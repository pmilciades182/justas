// ══════════════════════════════════════
// SISTEMA DE DIÁLOGOS DE CABALLEROS
// ══════════════════════════════════════

import { WAR_CRIES } from '../data.js';

const PHRASES = {
  // Cuando están esperando lanza
  waiting: [
    "¡Date prisa con esa lanza, inútil!",
    "¿Es que tengo que forjarla yo mismo?",
    "¡Squire! ¡Trae madera de calidad esta vez!",
    "Mi abuela es más rápida que tú...",
    "¡Vamos! ¡Que el rival se está impacientando!",
    "¿A qué esperas? ¡Dámela ya!",
  ],
  // Cuando tienen poca vida
  low_hp: [
    "Veo... borroso...",
    "Un rasguño... solo un rasguño...",
    "Por mis ancestros... no caeré.",
    "Necesito... aire...",
    "Mi sangre riega la arena.",
    "¡Aún puedo sostener la lanza!",
  ],
  // Cuando ganan muchos puntos o desmontan
  dominant: [
    "¡Tiembla ante mi estirpe!",
    "¡Hincad la rodilla!",
    "¿Eso es todo lo que tienes?",
    "¡A la tierra, gusano!",
    "¡Esta arena es mía!",
    "¡Limpiad el suelo con él!",
  ],
  // Cuando están aturdidos
  stunned: [
    "¿Cuántos caballos hay...?",
    "Pajaritos... veo pajaritos...",
    "¿Quién ha apagado la luz?",
    "¿Dónde... dónde estoy?",
    "¡Eh! ¡Dejad de dar vueltas!",
  ],
  // Insultos al rival
  taunt: [
    "¡Tu armadura brilla más que tu valor!",
    "¡Montas como un saco de patatas!",
    "¡Vuelve a tu pocilga!",
    "¡Hoy cenarás tierra!",
    "¡Cobarde! ¡Enfréntame!",
  ],
  // Reacción genérica tras un choque
  reaction: [
    "¡Buen golpe! ¡Pero el mío será mejor!",
    "¡Por todos los santos!",
    "¡Maldición!",
    "¡Eso ha dolido!",
    "¡Ja! ¿Eso es todo?",
  ]
};

export function knightSay(k, category, type = 'normal') {
  if (k.speechTimer > 0 && type === 'normal') return; // Don't interrupt if normal
  
  let list;
  if (category === 'war_cry') {
    list = WAR_CRIES;
    k.speechType = 'prominent';
  } else {
    list = PHRASES[category] || PHRASES.reaction;
    k.speechType = 'normal';
  }

  k.speechText = list[Math.floor(Math.random() * list.length)];
  k.speechTimer = k.speechType === 'prominent' ? 120 : 90; // Half duration: 2s/1.5s approx
}

export function updateKnightSpeech(k) {
  if (k.speechTimer > 0) {
    k.speechTimer--;
    if (k.speechTimer <= 0) {
      k.speechText = '';
      k.speechType = 'normal';
    }
  }
}
