// Guessing games module (Guess 1-10, Guess 1-5, Dice, Roulette) with grid roll animations

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

    for (let i = min; i <= max; i++) {
      const btn = document.createElement('button');
      btn.className = 'btn-num';
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

    // Start rolling animation
    let currentIdx = 0;
    let speed = 40; // Initial speed in ms
    let elapsed = 0;
    const duration = 1000; // total animation time in ms
    
    const roll = () => {
      // Clear previous winning highlight
      buttons.forEach(b => b.classList.remove('winning'));
      
      // Pick a random button to light up (excluding the selected one to keep it distinct)
      let randomBtn;
      do {
        randomBtn = buttons[Math.floor(Math.random() * buttons.length)];
      } while (buttons.length > 1 && parseInt(randomBtn.dataset.num) === selectedNum);
      
      randomBtn.classList.add('winning');
      
      elapsed += speed;
      if (elapsed < duration - 200) {
        // Fast rolling phase
        setTimeout(roll, speed);
      } else if (elapsed < duration) {
        // Slowing down phase
        speed += 60;
        setTimeout(roll, speed);
      } else {
        // Final landing
        buttons.forEach(b => b.classList.remove('winning'));
        
        // Find winning button
        const winBtn = buttons.find(b => parseInt(b.dataset.num) === winningNum);
        if (winBtn) {
          winBtn.classList.add('winning');
        }

        // Keep selected button highlighted as red if it was a loss, or green if win
        const selBtn = buttons.find(b => parseInt(b.dataset.num) === selectedNum);
        if (selBtn) {
          if (isWin) {
            selBtn.classList.remove('selected');
            selBtn.classList.add('winning');
          } else {
            selBtn.style.background = 'var(--neon-pink)';
            selBtn.style.color = '#fff';
            selBtn.style.borderColor = 'var(--neon-pink)';
            selBtn.style.boxShadow = '0 0 12px var(--neon-pink-glow)';
          }
        }

        this.isPlaying = false;
        onComplete({
          isWin,
          winAmount,
          resultText: `Tvá volba: ${selectedNum} | Padlo: ${winningNum}`
        });
      }
    };

    setTimeout(roll, speed);
  }
}
