// Web Audio API based retro sound generator
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
    this.muted = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Generate a simple oscillator-based sound
  playTone(frequency, duration, type = 'square', volume = 0.3, slide = 0) {
    if (!this.initialized || this.muted) return;
    this.resume();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    if (slide !== 0) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(frequency + slide, 20),
        this.audioContext.currentTime + duration
      );
    }

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Player shoot - high pitched laser
  playerShoot() {
    this.playTone(880, 0.1, 'square', 0.2, -400);
  }

  // Enemy shoot - lower pitched
  enemyShoot() {
    this.playTone(220, 0.15, 'sawtooth', 0.15, -100);
  }

  // Enemy explosion
  enemyExplosion() {
    if (!this.initialized || this.muted) return;
    this.resume();

    // Create noise for explosion
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const noise = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    noise.start();
  }

  // Player hit/death
  playerHit() {
    this.playTone(200, 0.3, 'sawtooth', 0.4, -150);
    setTimeout(() => this.playTone(150, 0.3, 'square', 0.3, -100), 100);
  }

  // Game over
  gameOver() {
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'square', 0.3), i * 200);
    });
  }

  // Victory
  victory() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'square', 0.25), i * 150);
    });
  }

  // Level start
  levelStart() {
    const notes = [262, 330, 392, 523];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'square', 0.2), i * 100);
    });
  }

  // Enemy march sound
  enemyMarch(pitch = 0) {
    const baseFreq = 80 + pitch * 10;
    this.playTone(baseFreq, 0.1, 'square', 0.15);
  }
}

export const soundManager = new SoundManager();
