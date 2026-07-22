import gsap from 'gsap';
import { sound } from '../sound';

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
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
        onRepeat: () => {
          this.updateCardDisplay(nextNumber);
          this.currentNumber = nextNumber;
        },
        onComplete: () => {
          this.isAnimating = false;
          onComplete({
            isWin,
            winAmount: isWin ? betAmount * 2 : 0,
            resultText: `Původní: ${originalNumber} | Nové: ${nextNumber}`
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
