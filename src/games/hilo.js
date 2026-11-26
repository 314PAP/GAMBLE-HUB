import gsap from "gsap";

import { sound } from "../sound";
import { formatLargeNumber } from "../utils";

/**
 * HiloGame — Hi-Lo card game with dynamic multipliers, streaks, and Cash Out
 *
 * Rules:
 * - Cards 1–10, player guesses Higher or Lower
 * - Next card is always different from current
 * - Multiplier scales with risk: fewer winning cards = higher payout
 *   Formula: (9 / winningCards) * 0.95  (5% house edge)
 * - Correct guesses chain into a streak with compounding multiplier;
 *   player can Cash Out at any time or risk another card.
 */
export class HiloGame {
  constructor() {
    this.currentNumber = 5;
    this.isAnimating = false;
    this.streak = 0;
    this.currentMultiplier = 1;
    this.streakBet = 0;
    this.isStreakActive = false;
  }

  init() {
    this.currentNumber = Math.floor(Math.random() * 8) + 2;
    this.resetStreak();
    this.updateCardDisplay(this.currentNumber);
    this._initIdleCardPulse();
  }

  resetStreak() {
    this.streak = 0;
    this.currentMultiplier = 1;
    this.streakBet = 0;
    this.isStreakActive = false;
    this.updateStreakUI();
  }

  _initIdleCardPulse() {
    const card = document.getElementById("hilo-current-card");
    if (!card) return;
    gsap.killTweensOf(card);
    gsap.to(card, {
      scale: 1.04,
      duration: 1.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  updateCardDisplay(num) {
    const card = document.getElementById("hilo-current-card");
    if (card) {
      card.innerText = num;
    }
    this.updateStreakUI();
  }

  updateStreakUI() {
    const infoEl = document.getElementById("hilo-streak-info");
    const cashoutBtn = document.getElementById("btn-hilo-cashout");
    const highBtn = document.getElementById("btn-hilo-high");
    const lowBtn = document.getElementById("btn-hilo-low");

    const highMult = this.getMultiplier("H");
    const lowMult = this.getMultiplier("L");

    if (highBtn) {
      highBtn.disabled = highMult <= 0;
    }
    if (lowBtn) {
      lowBtn.disabled = lowMult <= 0;
    }

    if (infoEl) {
      if (this.isStreakActive && this.streak > 0) {
        const potentialWin = Math.round(this.streakBet * this.currentMultiplier);
        infoEl.textContent = `Série: ${this.streak}× | Násobitel: ${this.currentMultiplier}× | Výhra: ${formatLargeNumber(potentialWin)}`;
        infoEl.classList.add("text-neon-gold");
        infoEl.classList.remove("text-text-secondary");
      } else {
        infoEl.textContent = `Vyšší: ${highMult > 0 ? `${highMult}×` : "—"} | Nižší: ${lowMult > 0 ? `${lowMult}×` : "—"}`;
        infoEl.classList.remove("text-neon-gold");
        infoEl.classList.add("text-text-secondary");
      }
    }

    if (cashoutBtn) {
      if (this.isStreakActive && this.streak > 0) {
        const potentialWin = Math.round(this.streakBet * this.currentMultiplier);
        cashoutBtn.classList.remove("hidden");
        cashoutBtn.disabled = false;
        cashoutBtn.textContent = `💰 VYBRAT (${formatLargeNumber(potentialWin)})`;
      } else {
        cashoutBtn.classList.add("hidden");
        cashoutBtn.disabled = true;
      }
    }
  }

  /**
   * Calculate how many cards would win for a given tip (excluding current)
   * @param {'H'|'L'} tip
   * @returns {number} count of winning cards (0–9)
   */
  getWinningCount(tip) {
    if (tip === "H") return 10 - this.currentNumber;
    if (tip === "L") return this.currentNumber - 1;
    return 0;
  }

  /**
   * Calculate the payout multiplier for a given tip
   * 9 possible outcomes (same card excluded), winCount winners
   * Formula: (9 / winCount) * 0.95
   */
  getMultiplier(tip) {
    const winCount = this.getWinningCount(tip);
    if (winCount <= 0) return 0;
    return Math.round((9 / winCount) * 0.95 * 100) / 100;
  }

  _finalizePlay(isWin, stepMultiplier, betAmount, originalNumber, nextNumber, onComplete) {
    this.isAnimating = false;
    if (!this.isStreakActive) {
      this.streakBet = betAmount;
    }

    if (isWin) {
      sound.playWinBonus();
      this.streak += 1;
      this.currentMultiplier = Math.round(this.currentMultiplier * stepMultiplier * 100) / 100;
      this.isStreakActive = true;
      const potentialWin = Math.round(this.streakBet * this.currentMultiplier);
      this.updateStreakUI();
      onComplete({
        isWin: true,
        isStreakContinue: true,
        streak: this.streak,
        multiplier: this.currentMultiplier,
        potentialWin,
        winAmount: 0,
        bet: this.streakBet,
        resultText: `${originalNumber}→${nextNumber}`,
      });
    } else {
      sound.playLoss();
      const bet = this.streakBet || betAmount;
      const lostStreak = this.streak;
      this.resetStreak();
      onComplete({
        isWin: false,
        isStreakContinue: false,
        lostStreak,
        winAmount: 0,
        bet,
        resultText: `${originalNumber}→${nextNumber}`,
      });
    }
  }

  cashOut() {
    if (!this.isStreakActive || this.streak <= 0 || this.isAnimating) return null;
    const winAmount = Math.round(this.streakBet * this.currentMultiplier);
    const streak = this.streak;
    const multiplier = this.currentMultiplier;
    const bet = this.streakBet;
    this.resetStreak();
    sound.playWinBonus();
    return {
      isWin: true,
      winAmount,
      bet,
      streak,
      multiplier,
      resultText: `Série ${streak}× (${multiplier}×)`,
    };
  }

  play(tip, betAmount, onComplete) {
    if (this.isAnimating) return;
    const stepMultiplier = this.getMultiplier(tip);
    if (stepMultiplier <= 0) return;

    this.isAnimating = true;
    sound.playCardFlip();

    // Next card: 1–10, always different from current
    let nextNumber;
    do {
      nextNumber = Math.floor(Math.random() * 10) + 1;
    } while (nextNumber === this.currentNumber);

    let isWin = false;
    if (tip === "H" && nextNumber > this.currentNumber) isWin = true;
    if (tip === "L" && nextNumber < this.currentNumber) isWin = true;

    const originalNumber = this.currentNumber;
    const card = document.getElementById("hilo-current-card");

    if (card) {
      gsap.set(card, { transformPerspective: 1000 });
      gsap.to(card, {
        rotationY: 90,
        duration: 0.3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1,
        onRepeat: () => {
          this.currentNumber = nextNumber;
          this.updateCardDisplay(nextNumber);
        },
        onComplete: () => {
          card.classList.remove("hilo-card-pop");
          void card.offsetWidth;
          card.classList.add("hilo-card-pop");
          this._finalizePlay(isWin, stepMultiplier, betAmount, originalNumber, nextNumber, onComplete);
        },
      });
    } else {
      this.currentNumber = nextNumber;
      this._finalizePlay(isWin, stepMultiplier, betAmount, originalNumber, nextNumber, onComplete);
    }
  }

  async playAsync(tip, betAmount) {
    return new Promise((resolve) => {
      this.play(tip, betAmount, resolve);
    });
  }
}
