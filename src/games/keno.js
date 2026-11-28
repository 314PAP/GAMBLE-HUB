import { sound } from "../sound.js";
import { playWheelTick } from "../soundEffects.js";

export const KENO_POOL_SIZE = 40;
export const KENO_DRAW_COUNT = 10;
export const KENO_MAX_PICKS = 10;

/**
 * KenoGame — Pick 1–10 numbers from 1..40, 10 numbers are drawn.
 */
export class KenoGame {
  constructor() {
    this.selected = new Set();
  }

  /**
   * Toggle a number selection (1..40).
   * @param {number} num
   * @returns {boolean} whether the number is now selected
   */
  toggleNumber(num) {
    if (num < 1 || num > KENO_POOL_SIZE) return false;
    if (this.selected.has(num)) {
      this.selected.delete(num);
      return false;
    }
    if (this.selected.size >= KENO_MAX_PICKS) return false;
    this.selected.add(num);
    playWheelTick();
    return true;
  }

  /**
   * Calculate payout multiplier based on picks count and hits count.
   * @param {number} picksCount
   * @param {number} hitsCount
   * @returns {number}
   */
  static getMultiplier(picksCount, hitsCount) {
    if (picksCount <= 0 || hitsCount <= 0) return 0;
    const ratio = hitsCount / picksCount;
    if (ratio < 0.3) return 0;
    const base = Math.pow(hitsCount, 1.75) * (10 / Math.max(1, picksCount)) * 0.45;
    return Math.round(base * 100) / 100;
  }

  /**
   * Draw 10 unique numbers and evaluate the round.
   * @param {number} betAmount
   * @param {number[]} [drawnOverride]
   * @returns {{ drawn: number[], hits: number[], multiplier: number, winAmount: number, isWin: boolean }}
   */
  play(betAmount, drawnOverride = null) {
    const picks = Array.from(this.selected);
    if (picks.length === 0) return null;

    let drawn;
    if (drawnOverride) {
      drawn = drawnOverride.slice(0, KENO_DRAW_COUNT);
    } else {
      const pool = Array.from({ length: KENO_POOL_SIZE }, (_, i) => i + 1);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      drawn = pool.slice(0, KENO_DRAW_COUNT);
    }

    const drawnSet = new Set(drawn);
    const hits = picks.filter((n) => drawnSet.has(n));
    const multiplier = KenoGame.getMultiplier(picks.length, hits.length);
    const winAmount = Math.round(betAmount * multiplier);
    const isWin = winAmount > 0;

    if (isWin) {
      sound.playWin();
    } else {
      sound.playLoss();
    }

    return { drawn, hits, multiplier, winAmount, isWin };
  }
}
