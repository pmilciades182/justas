// ══════════════════════════════════════
// GESTOR DE AUDIO (ROBUSTO Y DINÁMICO)
// ══════════════════════════════════════

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterVolume = 0.8;
    this._nextGallop = 0;
    this.lastSpeed = 0;
  }

  async init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      console.log("Audio Engine Created");
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
      console.log("Audio Engine Resumed");
    }
  }

  // Asegura que el contexto esté activo antes de sonar
  async _checkContext() {
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    return true;
  }

  playClick() {
    if (!this.ctx) return;
    this._checkContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
    gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.05);
  }

  playMetalHit(intensity = 1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const carrierGain = this.ctx.createGain();
    const modGain = this.ctx.createGain();

    carrier.type = 'triangle';
    carrier.frequency.setValueAtTime(2000 * intensity, now);
    modulator.type = 'square';
    modulator.frequency.setValueAtTime(800, now);
    modGain.gain.setValueAtTime(1200 * intensity, now);

    carrierGain.gain.setValueAtTime(0.25 * intensity * this.masterVolume, now);
    carrierGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(carrierGain);
    carrierGain.connect(this.ctx.destination);

    carrier.start(); modulator.start();
    carrier.stop(now + 0.2); modulator.stop(now + 0.2);
  }

  playClash(intensity = 1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 0.5 * intensity;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 4));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5 * intensity * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  updateGallop(speed) {
    if (!this.ctx || speed < 0.3) return;
    this._checkContext();
    
    const now = this.ctx.currentTime;
    // Cadencia de galope: más rápido cuanto más velocidad
    const interval = 0.35 / (0.4 + speed * 0.3);
    
    if (now > this._nextGallop) {
      this.playGallopStep(speed);
      this._nextGallop = now + interval;
    }
  }

  playGallopStep(speed) {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // El "thump" del casco
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.12);
    
    // Volumen basado en velocidad (más fuerte al correr más)
    const vol = Math.min(0.4, (speed / 6) * 0.3) * this.masterVolume;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.12);
  }

  playFanfareUnhorse() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this._note(392.00, now, 0.1, 'sawtooth', 0.2); 
    this._note(523.25, now + 0.1, 0.4, 'sawtooth', 0.2);
  }

  playFanfareMatch() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      this._note(f, now + i * 0.1, 0.3, 'square', 0.15);
    });
  }

  playFanfareTourney() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const mel = [{f: 523.25, t: 0}, {f: 523.25, t: 0.15}, {f: 523.25, t: 0.3}, {f: 698.46, t: 0.45}, {f: 783.99, t: 0.75}, {f: 1046.50, t: 1.0}];
    mel.forEach(n => this._note(n.f, now + n.t, 0.5, 'sawtooth', 0.15));
  }

  _note(freq, start, duration, type = 'sine', vol = 0.1) {
    if (!this.ctx) return;
    const st = Math.max(this.ctx.currentTime, start);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, st);
    gain.gain.setValueAtTime(0, st);
    gain.gain.linearRampToValueAtTime(vol * this.masterVolume, st + 0.02);
    gain.gain.linearRampToValueAtTime(0, st + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(st);
    osc.stop(st + duration + 0.1);
  }
}

export const audio = new AudioManager();
