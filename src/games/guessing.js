// Guessing games module (Guess 1-10, Guess 1-5, Dice, Roulette) with grid roll animations
import gsap from 'gsap';
import { sound } from '../sound';

export class GuessingGame {
  constructor() {
    this.isPlaying = false;
  }

  // Generates number buttons in the grid
  generateGrid(min, max, onNumberClick) {
    const gridContainer = document.getElementById('game-number-buttons');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    // For Roulette (0-36), adjust columns if needed
    if (max - min > 10) {
      gridContainer.style.gridTemplateColumns = 'repeat(6, 1fr)';
    } else {
      gridContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    }

    // Classic roulette number colors
    const redNums = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    const blackNums = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];

    for (let i = min; i <= max; i++) {
      const btn = document.createElement('button');
      btn.className = 'btn-num';
      
      // === RULE 2: Retro Digital Contrast – casino colors for roulette ===
      if (min === 0 && max === 35) {
        if (i === 0) {
          btn.classList.add('green-num');
        } else if (redNums.includes(i)) {
          btn.classList.add('red-num');
        } else {
          btn.classList.add('black-num');
        }
      }
      
      btn.innerText = i;
      btn.dataset.num = i;
      btn.onclick = () => {
        if (this.isPlaying) return;
        onNumberClick(i);
      };
      gridContainer.appendChild(btn);
    }
  }

  // Animates the selection process on the grid, landing on the winning number
  play(selectedNum, min, max, betAmount, multiplier, onComplete) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const winningNum = Math.floor(Math.random() * (max - min + 1)) + min;
    const isWin = (selectedNum === winningNum);
    const winAmount = isWin ? betAmount * multiplier : 0;

    const buttons = Array.from(document.querySelectorAll('.btn-num'));
    
    // Disable all buttons and highlight selected
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.classList.remove('selected', 'winning');
      if (parseInt(btn.dataset.num) === selectedNum) {
        btn.classList.add('selected');
      }
    });

    // Start rolling animation using GSAP for rich, smooth visuals
    let currentIdx = 0;
    const totalSteps = 16;
    const tl = gsap.timeline({
      onComplete: () => {
        // Final landing
        buttons.forEach(b => b.classList.remove('winning'));
        
        // Find winning button
        const winBtn = buttons.find(b => parseInt(b.dataset.num) === winningNum);
        if (winBtn) {
          winBtn.classList.add('winning');
          gsap.fromTo(winBtn, { scale: 0.8 }, { scale: 1.1, duration: 0.4, yoyo: true, repeat: 1, ease: 'back.out(2)' });
        }

        // Keep selected button highlighted
        const selBtn = buttons.find(b => parseInt(b.dataset.num) === selectedNum);
        if (selBtn) {
          if (isWin) {
            selBtn.classList.remove('selected');
            selBtn.classList.add('winning');
          } else {
            selBtn.classList.add('losing');
            gsap.fromTo(selBtn, { scale: 0.8 }, { scale: 1.0, duration: 0.3, ease: 'power2.out' });
          }
        }

        this.isPlaying = false;
        onComplete({
          isWin,
          winAmount,
          resultText: `Tvá volba: ${selectedNum} | Padlo: ${winningNum}`
        });
      }
    });

    // Create a sequential glowing wave across the buttons
    for (let step = 0; step < totalSteps; step++) {
      const targetBtn = buttons[Math.floor(Math.random() * buttons.length)];
      const stepDuration = 0.05 + (step / totalSteps) * 0.15; // Slow down effect

      tl.to(targetBtn, {
        duration: stepDuration,
        onStart: () => {
          buttons.forEach(b => b.classList.remove('winning'));
          if (parseInt(targetBtn.dataset.num) !== selectedNum) {
            targetBtn.classList.add('winning');
          }
          sound.playClick();
        }
      });
    }
  }
}
