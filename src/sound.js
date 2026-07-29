// Hybrid sound engine: Web Audio API synthesized sounds + file-based audio assets + music playback
// Preserves all existing synthesized effects while adding support for 8-bit sound files and BGM.
import { SOUND_ASSETS, BGM_TRACKS } from './soundIndex.js';

class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxMuted = localStorage.getItem('c_mute') === 'true';
    this.bgmMuted = localStorage.getItem('c_music_mute') === 'true';

    this._activeOscs = new Set();
    this._activeFileAudios = new Set();
    this._spinPlaying = false;
    this._bgmAudio = null;
    this._bgmTrackIndex = 0;
    this._bgmPlaying = false;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this._emergencyStop();
    });
    window.addEventListener('pagehide', () => this._emergencyStop());
    window.addEventListener('beforeunload', () => this._emergencyStop());
  }

  // ─── Internal helpers ──────────────────────────────────────────────────────

  initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  _createOsc() {
    const osc = this.ctx.createOscillator();
    this._activeOscs.add(osc);
    osc.onended = () => {
      this._activeOscs.delete(osc);
      try { osc.disconnect(); } catch { /* ignore */ }
    };
    return osc;
  }

  _emergencyStop() {
    this._spinPlaying = false;
    for (const osc of this._activeOscs) {
      try { osc.stop(0); } catch { /* ignore */ }
      try { osc.disconnect(); } catch { /* ignore */ }
    }
    this._activeOscs.clear();
    for (const audio of this._activeFileAudios) {
      try { audio.pause(); } catch { /* ignore */ }
      try { audio.currentTime = 0; } catch { /* ignore */ }
    }
    this._activeFileAudios.clear();
    if (this.ctx && this.ctx.state !== 'closed') this.ctx.suspend();
    this._stopBGM();
  }

  // ─── File-based audio ─────────────────────────────────────────────────────

  _playFile(src, volume = 1.0, loop = false, isBGM = false) {
    const muteKey = isBGM ? this.bgmMuted : this.sfxMuted;
    if (muteKey) return;
    this.initContext();
    if (!this.ctx) return;

    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;
    audio.play().catch(() => {});
    this._activeFileAudios.add(audio);
    audio.addEventListener('ended', () => {
      this._activeFileAudios.delete(audio);
    });
    return audio;
  }

  // ─── BGM music ────────────────────────────────────────────────────────────

  playBGM(trackIndex = 2) {
    if (this._bgmPlaying) this._stopBGM();
    this._bgmTrackIndex = trackIndex;
    const track = BGM_TRACKS[trackIndex];
    if (!track) return;

    this._bgmAudio = this._playFile(track.src, 0.35, true, true);
    if (this._bgmAudio) {
      this._bgmAudio.addEventListener('ended', () => {
        // Restart the same chiptune-action track instead of cycling
        this.playBGM(this._bgmTrackIndex);
      });
      this._bgmPlaying = true;
    }
  }

  toggleBGM() {
    if (this._bgmPlaying) {
      this._stopBGM();
      this.bgmMuted = true;
      localStorage.setItem('c_music_mute', 'true');
      return false;
    } else {
      this.bgmMuted = false;
      localStorage.setItem('c_music_mute', 'false');
      this.playBGM(2); // Always start with chiptune-action
      return true;
    }
  }

  isBGMPlaying() { return this._bgmPlaying; }

  _stopBGM() {
    if (this._bgmAudio) {
      this._bgmAudio.pause();
      this._bgmAudio = null;
    }
    this._bgmPlaying = false;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  toggleMute() {
    this.sfxMuted = !this.sfxMuted;
    localStorage.setItem('c_mute', this.sfxMuted);
    if (this.sfxMuted) {
      // Stop only SFX, leave BGM untouched
      this._spinPlaying = false;
      for (const osc of this._activeOscs) {
        try { osc.stop(0); } catch { /* ignore */ }
        try { osc.disconnect(); } catch { /* ignore */ }
      }
      this._activeOscs.clear();
      for (const audio of this._activeFileAudios) {
        if (audio !== this._bgmAudio) {
          try { audio.pause(); } catch { /* ignore */ }
          try { audio.currentTime = 0; } catch { /* ignore */ }
        }
      }
      this._activeFileAudios.clear();
      if (this.ctx && this.ctx.state !== 'closed') this.ctx.suspend();
    }
    return this.sfxMuted;
  }

  isMuted() { return this.sfxMuted; }

  // ─── Sound effects (synthesized - keep existing) ──────────────────────────

  playClick() {
    if (this.sfxMuted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = this._createOsc();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.035);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playFlip() {
    if (this.sfxMuted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = this._createOsc();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playSpin() {
    if (this.sfxMuted) return;
    if (this._spinPlaying) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    this._spinPlaying = true;
    const CLICKS = 12;
    const STEP = 0.09;
    const CLICK_DUR = 0.05;
    const totalDur = CLICKS * STEP + CLICK_DUR;
    for (let i = 0; i < CLICKS; i++) {
      const t = now + i * STEP;
      const freq = 120 + i * 20;
      const osc = this._createOsc();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + CLICK_DUR);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + CLICK_DUR);
    }
    setTimeout(() => { this._spinPlaying = false; }, totalDur * 1000 + 50);
  }

  playWin() {
    if (this.sfxMuted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [293.66, 329.63, 392.00, 523.25];
    notes.forEach((freq, i) => {
      const t = now + i * 0.06;
      const dur = 0.25;
      const osc = this._createOsc();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    });
  }

  playDiceRoll() {
    if (this.sfxMuted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const CLICKS = 20;
    const STEP = 0.03;
    const CLICK_DUR = 0.04;
    for (let i = 0; i < CLICKS; i++) {
      const t = now + i * STEP;
      const freq = 200 + i * 25;
      const osc = this._createOsc();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + CLICK_DUR);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + CLICK_DUR);
    }
  }

  playJackpot() {
    if (this.sfxMuted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      const t = now + i * 0.06;
      const dur = 0.2;
      const osc = this._createOsc();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    });
  }

  playLoss() {
    if (this.sfxMuted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dur = 0.3;
    const osc = this._createOsc();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + dur);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  playBroke() {
    if (this.sfxMuted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [311.13, 293.66, 261.63, 196.00];
    notes.forEach((freq, i) => {
      const t = now + i * 0.18;
      const dur = 0.4;
      const osc = this._createOsc();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    });
  }

  // ─── File-based sound shortcuts ───────────────────────────────────────────

  playSlotSpin() { this._playFile(SOUND_ASSETS['slot-spin'], 0.7); }
  playSlotReelStop() { this._playFile(SOUND_ASSETS['slot-reel-stop'], 0.8); }
  playSlotWheel() { this._playFile(SOUND_ASSETS['slot-wheel'], 0.7); }
  playSlotCoin() { this._playFile(SOUND_ASSETS['slot-coin'], 0.8); }
  playSlotWin() { this._playFile(SOUND_ASSETS['slot-win'], 0.9); }
  playSlotJackpot() { this._playFile(SOUND_ASSETS['slot-jackpot'], 1.0); }
  playSlotBonus() { this._playFile(SOUND_ASSETS['slot-bonus'], 0.8); }
  playSlotNearMiss() { this._playFile(SOUND_ASSETS['slot-near-miss'], 0.6); }
  playSlotCancel() { this._playFile(SOUND_ASSETS['slot-cancel'], 0.5); }

  play8BitJump() { this._playFile(SOUND_ASSETS['8bit-jump'], 0.7); }
  play8BitPowerUp() { this._playFile(SOUND_ASSETS['8bit-powerup'], 0.8); }
  play8BitCoin() { this._playFile(SOUND_ASSETS['8bit-coin'], 0.7); }
  play8BitSelect() { this._playFile(SOUND_ASSETS['8bit-select'], 0.6); }

  playWinBonus() { this._playFile(SOUND_ASSETS['win-8bit'], 0.9); }
  playClickRetro() { this._playFile(SOUND_ASSETS['button-click-retro'], 0.8); }
  playCardFlip() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const src = SOUND_ASSETS['card-flip'];
    if (!src) {
      this.playFlip();
      return;
    }

    const audio = new Audio(src);
    audio.volume = 0.8;
    audio.play().catch(() => {
      this.playFlip();
    });
    this._activeFileAudios.add(audio);
    audio.addEventListener('ended', () => {
      this._activeFileAudios.delete(audio);
    });
  }
}

export const sound = new SoundManager();
