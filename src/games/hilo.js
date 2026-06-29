import gsap from 'gsap';
import { sound } from '../sound';

export class HiloGame {
  constructor() {
    this.currentNumber = 5;
    this.isAnimating = false;
  }

  init() {
    this.currentNumber = Math.floor(Math.random() * 8) + 2; // Start with card between 2 and 9
    this.updateCardDisplay(this.currentNumber);
  }

  updateCardDisplay(num) {
    const card = document.getElementById('hilo-current-card');
    if (card) {
      card.innerText = num;
    }
  }

  play(tip, betAmount, onComplete) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    sound.playFlip();

    let nextNumber;
    do {
      nextNumber = Math.floor(Math.random() * 10) + 1;
    } while (nextNumber === this.currentNumber);
    let isWin = false;
    if (tip === 'H' && nextNumber > this.currentNumber) isWin = true;
    if (tip === 'L' && nextNumber < this.currentNumber) isWin = true;

    const originalNumber = this.currentNumber;
    const card = document.getElementById('hilo-current-card');

    if (card) {
      gsap.set(card, { transformPerspective: 1000 });
      gsap.to(card, {
        rotationY: 90,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          this.updateCardDisplay(nextNumber);
          this.currentNumber = nextNumber;
          gsap.to(card, {
            rotationY: 0,
            duration: 0.3,
            ease: 'back.out(1.7)',
            onComplete: () => {
              this.isAnimating = false;
              onComplete({
                isWin,
                winAmount: isWin ? betAmount * 2 : 0,
                resultText: `Původní: ${originalNumber} | Nové: ${nextNumber}`
              });
            }
          });
        }
      });
    } else {
      this.currentNumber = nextNumber;
      this.isAnimating = false;
      onComplete({
        isWin,
        winAmount: isWin ? betAmount * 2 : 0,
        resultText: `Původní: ${originalNumber} | Nové: ${nextNumber}`
      });
    }
  }
}
