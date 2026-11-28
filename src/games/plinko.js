import { sound } from "../sound.js";
import { playWheelTick } from "../soundEffects.js";

export const PLINKO_MULTIPLIERS = {
  low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
  medium: [13, 3.0, 1.3, 0.7, 0.4, 0.7, 1.3, 3.0, 13],
  high: [29, 4.0, 1.5, 0.3, 0.2, 0.3, 1.5, 4.0, 29],
};

/**
 * PlinkoGame — 8-row Plinko board with Low / Medium / High risk profiles.
 */
export class PlinkoGame {
  constructor() {
    this.risk = "medium";
    this.rows = 8;
  }

  /**
   * Set risk level ("low" | "medium" | "high").
   * @param {"low"|"medium"|"high"} risk
   */
  setRisk(risk) {
    if (PLINKO_MULTIPLIERS[risk]) {
      this.risk = risk;
    }
  }

  /**
   * Drop a ball through `rows` pegs and land in a multiplier bucket.
   * @param {number} betAmount
   * @param {number[]} [pathOverride] array of 0 (left) or 1 (right)
   * @returns {{ path: number[], bucketIndex: number, multiplier: number, winAmount: number, isWin: boolean }}
   */
  drop(betAmount, pathOverride = null) {
    const path =
      pathOverride ||
      Array.from({ length: this.rows }, () => (Math.random() < 0.5 ? 0 : 1));
    const bucketIndex = path.reduce((sum, step) => sum + step, 0);
    const table = PLINKO_MULTIPLIERS[this.risk] || PLINKO_MULTIPLIERS.medium;
    const multiplier = table[bucketIndex] ?? 0.5;
    const winAmount = Math.round(betAmount * multiplier);
    const isWin = multiplier >= 1.0;

    playWheelTick();
    if (multiplier >= 3.0) {
      sound.playWin();
    } else if (!isWin) {
      sound.playLoss();
    }

    return { path, bucketIndex, multiplier, winAmount, isWin };
  }
}
