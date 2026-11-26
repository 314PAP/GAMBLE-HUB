import { sound } from "../sound.js";
import { formatLargeNumber } from "../utils.js";

/**
 * Generate a crash point with a 4% house edge, capped at 100.00x.
 * @param {number} [rand]
 * @returns {number}
 */
export function generateCrashPoint(rand = Math.random()) {
  if (rand < 0.04) return 1.0;
  const raw = 0.96 / (1 - rand);
  return Math.min(100, Math.max(1.01, Math.floor(raw * 100) / 100));
}

/**
 * Compute multiplier for elapsed milliseconds along an exponential climb curve.
 * @param {number} elapsedMs
 * @returns {number}
 */
export function multiplierAtElapsed(elapsedMs) {
  return Math.max(1.0, Math.floor(Math.exp(0.00012 * elapsedMs) * 100) / 100);
}

export class CrashGame {
  constructor() {
    this.isActive = false;
    this.currentBet = 0;
    this.currentMultiplier = 1.0;
    this.crashPoint = 1.0;
    this._timerId = null;
    this._startTime = 0;
    this._onCrash = null;
  }

  init() {
    this.cleanup();
    this.isActive = false;
    this.currentBet = 0;
    this.currentMultiplier = 1.0;
    this.crashPoint = 1.0;
    this._updateDisplay("1.00×", "idle", 0);
    this._updateStatus("Vsaď si a klikni na START — vyber výhru dřív, než raketa spadne!");
    this._syncButtons();
  }

  /**
   * Start a new Crash round.
   * @param {number} bet
   * @param {Function} onCrash
   */
  start(bet, onCrash) {
    if (this.isActive) return;
    this.cleanup();
    this.isActive = true;
    this.currentBet = bet;
    this.currentMultiplier = 1.0;
    this.crashPoint = generateCrashPoint();
    this._onCrash = onCrash;
    this._startTime = Date.now();

    sound.playClick();
    this._updateDisplay("1.00×", "climbing", 0);
    this._updateStatus("🚀 Letíme! Klikni na VYBRAT před pádem!");
    this._syncButtons();

    this._timerId = setInterval(() => this._tick(), 50);
  }

  _tick() {
    if (!this.isActive) return;
    const elapsed = Date.now() - this._startTime;
    const nextMult = multiplierAtElapsed(elapsed);

    if (nextMult >= this.crashPoint) {
      this._triggerCrash();
      return;
    }

    this.currentMultiplier = nextMult;
    const pct = Math.min(100, (Math.log(nextMult) / Math.log(10)) * 100);
    this._updateDisplay(`${nextMult.toFixed(2)}×`, "climbing", pct);
    this._syncButtons();
  }

  _triggerCrash() {
    this.cleanup();
    this.isActive = false;
    this.currentMultiplier = this.crashPoint;
    sound.playLoss();
    this._updateDisplay(`💥 ${this.crashPoint.toFixed(2)}×`, "crashed", 100);
    this._updateStatus(`💥 CRASH na ${this.crashPoint.toFixed(2)}×!`);
    this._syncButtons();

    if (typeof this._onCrash === "function") {
      const cb = this._onCrash;
      this._onCrash = null;
      cb({
        bet: this.currentBet,
        crashPoint: this.crashPoint,
        resultText: `Crash na ${this.crashPoint.toFixed(2)}×!`,
      });
    }
  }

  /**
   * Cash out at the current multiplier before the crash.
   */
  cashOut() {
    if (!this.isActive) return null;
    this.cleanup();
    this.isActive = false;
    this._onCrash = null;

    const mult = this.currentMultiplier;
    const winAmount = Math.floor(this.currentBet * mult);
    sound.playWin();
    this._updateDisplay(`✅ ${mult.toFixed(2)}×`, "cashed-out", 100);
    this._updateStatus(`✅ Vybráno na ${mult.toFixed(2)}× — Výhra ${formatLargeNumber(winAmount)}!`);
    this._syncButtons();

    return {
      bet: this.currentBet,
      multiplier: mult,
      winAmount,
      resultText: `Crash Cash Out (${mult.toFixed(2)}×)!`,
    };
  }

  cleanup() {
    if (this._timerId !== null) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  _updateDisplay(text, state, barPct) {
    const multEl = document.getElementById("crash-multiplier");
    if (multEl) {
      multEl.textContent = text;
      multEl.classList.remove("climbing", "crashed", "cashed-out");
      if (state !== "idle") multEl.classList.add(state);
    }

    const barEl = document.getElementById("crash-bar-fill");
    if (barEl) {
      barEl.style.width = `${Math.max(0, Math.min(100, barPct))}%`;
      barEl.classList.toggle("crashed", state === "crashed");
    }
  }

  _updateStatus(text) {
    const el = document.getElementById("crash-status-info");
    if (el) el.textContent = text;
  }

  _syncButtons() {
    const startBtn = document.getElementById("btn-crash-start");
    const cashoutBtn = document.getElementById("btn-crash-cashout");
    if (startBtn) startBtn.disabled = this.isActive;
    if (cashoutBtn) {
      cashoutBtn.disabled = !this.isActive;
      if (this.isActive) {
        const pot = Math.floor(this.currentBet * this.currentMultiplier);
        cashoutBtn.textContent = `💰 VYBRAT (${formatLargeNumber(pot)})`;
      } else {
        cashoutBtn.textContent = "💰 VYBRAT";
      }
    }
  }
}
