import { sound } from "../sound.js";
import { playCoinDrop } from "../soundEffects.js";

export const COINFLIP_MULTIPLIER = 1.92;

/**
 * CoinFlipGame — Heads or Tails (Panna / Orel) with 1.92x payout.
 */
export class CoinFlipGame {
  constructor() {
    this.isFlipping = false;
    this.lastResult = null;
  }

  /**
   * Flip the coin and evaluate the player's choice ("heads" | "tails").
   * @param {"heads"|"tails"} choice
   * @param {number} betAmount
   * @param {number} [rand]
   * @returns {{ isWin: boolean, outcome: "heads"|"tails", winAmount: number, multiplier: number, resultText: string }}
   */
  flip(choice, betAmount, rand = Math.random()) {
    const outcome = rand < 0.5 ? "heads" : "tails";
    const isWin = outcome === choice;
    const winAmount = isWin ? Math.round(betAmount * COINFLIP_MULTIPLIER) : 0;
    this.lastResult = outcome;

    playCoinDrop();
    if (isWin) {
      sound.playWin();
    } else {
      sound.playLoss();
    }

    const label = outcome === "heads" ? "Panna 👑" : "Orel 🦅";
    return {
      isWin,
      outcome,
      winAmount,
      multiplier: isWin ? COINFLIP_MULTIPLIER : 0,
      resultText: isWin ? `Padla ${label}!` : `Padla ${label} — smůla`,
    };
  }
}
