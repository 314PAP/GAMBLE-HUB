import gsap from 'gsap';
import { sound } from '../sound';

/**
 * HiloGame — Hi-Lo card game with dynamic multipliers
 *
 * Rules:
 * - Cards 1–10, player guesses Higher or Lower
 * - If next card equals current → automatic loss
 * - Multiplier scales with risk: fewer winning cards = higher payout
 *   Formula: 10 / winningCards  (with 5% house edge)
 *   Example: card 1 + Higher → 9 winning cards → ×1.05
 *            card 5 + Higher → 5 winning cards → ×1.90
 *            card 9 + Higher → 1 winning card  → ×9.50
 */
export class HiloGame {
  constructor() {
    this.currentNumber = 5;
    this.isAnimating = false;
  }

  init() {
    this.currentNumber = Math.floor(Math.random() * 8) + 2;
    this.updateCardDisplay(this.currentNumber);
    this.updateMultiplierDisplay();
  }

  updateCardDisplay(num) {
    const card = document.getElementById('hilo-current-card');
    if (card) {
      card.innerText = num;
    }
  }

  /**
   * Calculate how many cards would win for a given tip
   * @param {'H'|'L'} tip
   * @returns {number} count of winning cards (0–9)
   */
  getWinningCount(tip) {
    if (tip === 'H') return 10 - this.currentNumber; // cards above current
    if (tip === 'L') return this.currentNumber - 1; // cards below current
    return 0;
  }

  /**
   * Calculate the payout multiplier for a given tip
   * Uses formula: (10 / winningCards) * 0.95  (5% house edge)
   * @param {'H'|'L'} tip
   * @returns {number} multiplier (0 if impossible bet)
   */
  getMultiplier(tip) {
    const winCount = this.getWinningCount(tip);
    if (winCount <= 0) return 0;
    return Math.round((10 / winCount) * 0.95 * 100) / 100;
  }

  /**
   * Update the multiplier badges on the Higher/Lower buttons
   */
  updateMultiplierDisplay() {
    const btnHigh = document.getElementById('btn-hilo-high');
    const btnLow = document.getElementById('btn-hilo-low');

    const multH = this.getMultiplier('H');
    const multL = this.getMultiplier('L');

    if (btnHigh) {
      const badge = btnHigh.querySelector('.hilo-mult');
      if (badge) badge.textContent = multH > 0 ? `×${multH.toFixed(2)}` : '—';
      btnHigh.disabled = multH <= 0;
    }
    if (btnLow) {
      const badge = btnLow.querySelector('.hilo-mult');
      if (badge) badge.textContent = multL > 0 ? `×${multL.toFixed(2)}` : '—';
      btnLow.disabled = multL <= 0;
    }
  }

  play(tip, betAmount, onComplete) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    sound.playFlip();

    // Next card: 1–10 (can be same as current — that means loss)
    const nextNumber = Math.floor(Math.random() * 10) + 1;

    let isWin = false;
    if (tip === 'H' && nextNumber > this.currentNumber) isWin = true;
    if (tip === 'L' && nextNumber < this.currentNumber) isWin = true;
    // nextNumber === currentNumber → isWin stays false (loss)

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
          this.updateMultiplierDisplay();

          const sameCard = nextNumber === originalNumber;
          let resultText = `${originalNumber} → ${nextNumber}`;
          if (sameCard) resultText += ' (stejná!)';
          resultText += ` | ×${multiplier.toFixed(2)}`;

          onComplete({
            isWin,
            winAmount,
            resultText
          });
        }
      });
    } else {
      this.currentNumber = nextNumber;
      this.isAnimating = false;
      this.updateMultiplierDisplay();
      onComplete({
        isWin,
        winAmount,
        resultText: `${originalNumber} → ${nextNumber} | ×${multiplier.toFixed(2)}`
      });
    }
  }
}
