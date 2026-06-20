// Robust Web Audio API sound synthesizer with safe resource management.
// Key design decisions:
// - All OscillatorNodes are tracked in a Set so they can be force-stopped at any time.
// - playSpin() has a re-entrancy guard: if a spin sound is already playing it is
//   cancelled first so oscillators never pile up (the original bug).
// - On page hide / tab close the AudioContext is suspended immediately and all
//   scheduled oscillators are force-stopped, preventing the "stuck sound" issue
//   observed on macOS.

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('c_mute') === 'true';

    // Set of every OscillatorNode currently alive so we can kill them all at once.
    this._activeOscs = new Set();

    // Re-entrancy guard for playSpin to prevent oscillator pile-up.
    this._spinPlaying = false;

    // Kill everything when the tab is hidden or the window is being closed.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._emergencyStop();
      }
    });

    window.addEventListener('pagehide', () => {
      this._emergencyStop();
    });

    window.addEventListener('beforeunload', () => {
      this._emergencyStop();
    });
  }

  // ─── Internal helpers ──────────────────────────────────────────────────────

  initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Create a tracked oscillator.
   * When the oscillator naturally stops it removes itself from the Set.
   */
  _createOsc() {
    const osc = this.ctx.createOscillator();
    this._activeOscs.add(osc);
    osc.onended = () => {
      this._activeOscs.delete(osc);
      try { osc.disconnect(); } catch (_) {}
    };
    return osc;
  }

  /**
   * Force-stop every tracked oscillator and suspend the AudioContext.
   * Safe to call multiple times.
   */
  _emergencyStop() {
    this._spinPlaying = false;
    for (const osc of this._activeOscs) {
      try { osc.stop(0); } catch (_) {}
      try { osc.disconnect(); } catch (_) {}
    }
    this._activeOscs.clear();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.suspend();
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('c_mute', this.muted);
    if (this.muted) {
      // Immediately kill any running sounds when muting.
      this._emergencyStop();
    }
    return this.muted;
  }

  isMuted() { return this.muted; }

  // ─── Sound effects ────────────────────────────────────────────────────────

  // Short click for button presses.
  playClick() {
    if (this.muted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc  = this._createOsc();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Card flip sweep.
  playFlip() {
    if (this.muted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc  = this._createOsc();
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

  /**
   * Slot reel spinning click-track.
   *
   * THE BUG FIX: previously this created 10 future-scheduled oscillators on
   * every call with no guard, so if autoplay or the animation system called it
   * again before the previous batch finished, oscillators stacked endlessly.
   *
   * Now:
   *  - If a spin sound is already running we do nothing (guard).
   *  - Every oscillator is registered in _activeOscs.
   *  - After the last oscillator finishes the guard is cleared.
   */
  playSpin() {
    if (this.muted) return;
    if (this._spinPlaying) return;  // ← guard: never stack spin sounds

    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    this._spinPlaying = true;

    const CLICKS      = 12;
    const STEP        = 0.09;    // seconds between each click
    const CLICK_DUR   = 0.05;    // duration of each click burst
    const totalDur    = CLICKS * STEP + CLICK_DUR;

    for (let i = 0; i < CLICKS; i++) {
      const t    = now + i * STEP;
      const freq = 120 + i * 20;

      const osc  = this._createOsc();
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

    // Release the guard after the last click has finished.
    setTimeout(() => {
      this._spinPlaying = false;
    }, totalDur * 1000 + 50);
  }

  // Upward winning arpeggio.
  playWin() {
    if (this.muted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [293.66, 329.63, 392.00, 523.25];

    notes.forEach((freq, i) => {
      const t    = now + i * 0.06;
      const dur  = 0.25;
      const osc  = this._createOsc();
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

  // Jackpot fanfare.
  playJackpot() {
    if (this.muted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51, 1567.98];

    notes.forEach((freq, i) => {
      const t    = now + i * 0.06;
      const dur  = 0.2;
      const osc  = this._createOsc();
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

  // Descending loss buzzer.
  playLoss() {
    if (this.muted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dur = 0.3;

    const osc  = this._createOsc();
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

  // Sad bankrupt jingle.
  playBroke() {
    if (this.muted) return;
    this.initContext();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [311.13, 293.66, 261.63, 196.00];

    notes.forEach((freq, i) => {
      const t    = now + i * 0.18;
      const dur  = 0.4;
      const osc  = this._createOsc();
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
}

export const sound = new SoundManager();
