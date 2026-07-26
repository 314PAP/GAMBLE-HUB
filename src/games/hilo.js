import gsap from 'gsap';
import { sound } from '../sound';

/**
 * HiloGame — Hi-Lo card game with dynamic multipliers
 *
 * Rules:
 * - Cards 1–10, player guesses Higher or Lower
 * - Next card is always different from current
 * - Multiplier scales with risk: fewer winning cards = higher payout
 *   Formula: (9 / winningCards) * 0.95  (5% house edge)
 */
export class HiloGame {
  constructor() {
    this.currentNumber = 5;
    this.isAnimating = false;
  }

  init() {
    this.currentNumber = Math.floor(Math.random() * 8) + 2;
    this.updateCardDisplay(this.currentNumber);
  }

  updateCardDisplay(num) {
    const card = document.getElementById('hilo-current-card');
    if (card) {
      card.innerText = num;
    }
  }

  /**
   * Calculate how many cards would win for a given tip (excluding current)
   * @param {'H'|'L'} tip
   * @returns {number} count of winning cards (0–9)
   */
  getWinningCount(tip) {
    if (tip === 'H') return 10 - this.currentNumber;
    if (tip === 'L') return this.currentNumber - 1;
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

  play(tip, betAmount, onComplete) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    sound.playFlip();

    // Next card: 1–10, always different from current
    let nextNumber;
    do {
      nextNumber = Math.floor(Math.random() * 10) + 1;
    } while (nextNumber === this.currentNumber);

    let isWin = false;
    if (tip === 'H' && nextNumber > this.currentNumber) isWin = true;
    if (tip === 'L' && nextNumber < this.currentNumber) isWin = true;

    const multiplier = this.getMultiplier(tip);
    const winAmount = isWin ? Math.round(betAmount * multiplier) : 0;

    const originalNumber = this.currentNumber;
    const card = document.getElementById('hilo-current-card');

    if (card) {
      gsap.set(card, { transformPerspective: 1000 });
      gsap.to(card, {
        rotationY: 90,
        duration: 0.3,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
        onRepeat: () => {
          this.updateCardDisplay(nextNumber);
          this.currentNumber = nextNumber;
        },
        onComplete: () => {
          this.isAnimating = false;
          card.classList.remove('hilo-card-pop');
          void card.offsetWidth;
          card.classList.add('hilo-card-pop');
          onComplete({
            isWin,
            winAmount,
            resultText: `${originalNumber} → ${nextNumber} | ×${multiplier.toFixed(2)}`
          });
        }
      });
    } else {
      this.currentNumber = nextNumber;
      this.isAnimating = false;
      onComplete({
        isWin,
        winAmount,
        resultText: `${originalNumber} → ${nextNumber} | ×${multiplier.toFixed(2)}`
      });
    }
  }
}
