// ==========================================================================
// Web Audio API Synthesizer & Speech Synthesis Utility
// ==========================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  toggleSound(enableState) {
    this.enabled = enableState;
  }

  playBeep(freq = 600, duration = 0.08, type = 'sine') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    this.playBeep(523.25, 0.08); // C5
    setTimeout(() => this.playBeep(659.25, 0.12), 70); // E5
  }

  playDelete() {
    if (!this.enabled) return;
    this.playBeep(300, 0.1, 'sawtooth');
  }

  speakText(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text || text.trim().length === 0) return;

    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

export const soundFx = new SoundEngine();
