import gsap from 'gsap';

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
    const cardFront = document.getElementById('hilo-current-card');
    if (cardFront) {
      cardFront.innerText = num;
    }
  }

  play(tip, betAmount, onComplete) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const card = document.querySelector('.hilo-card');
    if (!card) {
      this.isAnimating = false;
      return;
    }

    const nextNumber = Math.floor(Math.random() * 10) + 1; // Card value between 1 and 10
    let isWin = false;

    // Game logic
    if (tip === 'H' && nextNumber > this.currentNumber) isWin = true;
    if (tip === 'L' && nextNumber < this.currentNumber) isWin = true;
    if (nextNumber === this.currentNumber) isWin = Math.random() > 0.5; // Random 50% chance on tie

    const originalNumber = this.currentNumber;
    
    // GSAP 3D Flipping Animation
    // 1. Flip card to its back (180deg)
    gsap.to(card, {
      rotateY: 180,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        // 2. Set the new card number while it is hidden
        this.updateCardDisplay(nextNumber);
        this.currentNumber = nextNumber;
        
        // 3. Flip back to front (0deg) with a springy back bounce
        gsap.to(card, {
          rotateY: 0,
          duration: 0.45,
          ease: 'back.out(1.4)',
          delay: 0.1,
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
  }
}
