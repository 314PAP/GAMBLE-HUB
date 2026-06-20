import gsap from 'gsap';

export class SlotMachineGame {
  constructor(symbols, winningLines) {
    this.symbols = symbols;
    this.winningLines = winningLines;
    this.isSpinning = false;
    this.currentMatrix = [
      '🍒', '🍋', '🛎',
      '⭐', '💎', '7️⃣',
      '🛎', '🍒', '🍋'
    ];
  }

  initReels() {
    this.renderReels();
  }

  // Renders the reels in the DOM based on current matrix
  renderReels() {
    for (let r = 0; r < 3; r++) {
      const container = document.getElementById(`reel-container-${r}`);
      if (!container) continue;
      
      container.innerHTML = '';
      // Reel r has items: row0 = matrix[r], row1 = matrix[r+3], row2 = matrix[r+6]
      const items = [this.currentMatrix[r], this.currentMatrix[r + 3], this.currentMatrix[r + 6]];
      
      items.forEach(sym => {
        const cell = document.createElement('div');
        cell.className = 'slot-cell';
        cell.innerText = sym;
        container.appendChild(cell);
      });
      
      // Reset position
      gsap.set(container, { y: 0 });
    }
  }

  // Spins the reels using GSAP animations
  spin(betAmount, userBalance, onComplete) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Determine final symbols for this spin
    const finalMatrix = [];
    for (let i = 0; i < 9; i++) {
      finalMatrix.push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
    }

    // Set up animations for each of the 3 reels
    let completedReels = 0;
    
    // Clear previous winning cells highlights
    document.querySelectorAll('.slot-cell').forEach(cell => {
      cell.classList.remove('win-active');
    });

    for (let r = 0; r < 3; r++) {
      const container = document.getElementById(`reel-container-${r}`);
      const reelElement = document.getElementById(`reel-${r}`);
      if (!container || !reelElement) continue;

      // Extract current symbols for this reel
      const currentReelSymbols = [this.currentMatrix[r], this.currentMatrix[r + 3], this.currentMatrix[r + 6]];
      // Extract final symbols for this reel
      const finalReelSymbols = [finalMatrix[r], finalMatrix[r + 3], finalMatrix[r + 6]];

      // Generate a sequence of intermediate spinning symbols (e.g. 15 symbols total)
      const numIntermediates = 15 + r * 5; // Staggered length for each reel
      const spinSymbols = [...currentReelSymbols];
      
      for (let i = 0; i < numIntermediates; i++) {
        spinSymbols.push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
      }
      spinSymbols.push(...finalReelSymbols);

      // Re-populate the container with the full sequence of symbols
      container.innerHTML = '';
      spinSymbols.forEach(sym => {
        const cell = document.createElement('div');
        cell.className = 'slot-cell';
        cell.innerText = sym;
        container.appendChild(cell);
      });

      // The distance we need to scroll.
      // Every symbol is 60px high. Since we start at the first 3 (index 0,1,2 at y=0),
      // we need to animate y so that the last 3 (the end of the array) are in the viewport.
      // Total symbols = spinSymbols.length.
      // Target position: we want the index (spinSymbols.length - 3) to be at the top of viewport.
      // That means y = - (spinSymbols.length - 3) * 60.
      const targetY = - (spinSymbols.length - 3) * 60;

      // Apply initial styling: container at y = 0
      gsap.set(container, { y: 0 });
      // Apply blur to reel container to simulate movement speed
      gsap.set(reelElement, { filter: 'blur(3px)' });

      // Run GSAP spin animation
      gsap.to(container, {
        y: targetY,
        duration: 1.5 + r * 0.4, // Staggered durations
        ease: 'power2.inOut',
        onUpdate: function() {
          // Reduce blur filter as animation decelerates
          const progress = this.progress();
          if (progress > 0.7) {
            const currentBlur = (1 - progress) * 10;
            gsap.set(reelElement, { filter: `blur(${Math.max(0, currentBlur)}px)` });
          }
        },
        onComplete: () => {
          gsap.set(reelElement, { filter: 'blur(0px)' });
          
          completedReels++;
          if (completedReels === 3) {
            // All reels stopped spinning
            this.currentMatrix = finalMatrix;
            this.renderReels(); // Clean up DOM and reset containers
            this.isSpinning = false;
            
            // Check winnings
            this.checkWinnings(betAmount, onComplete);
          }
        }
      });
    }
  }

  checkWinnings(betAmount, onComplete) {
    let winAmount = 0;
    const winningCells = new Set();
    let isJackpot = false;

    this.winningLines.forEach(line => {
      const idx0 = line[0];
      const idx1 = line[1];
      const idx2 = line[2];

      if (
        this.currentMatrix[idx0] === this.currentMatrix[idx1] &&
        this.currentMatrix[idx1] === this.currentMatrix[idx2]
      ) {
        // Multiply bet based on symbol
        const multiplier = (this.currentMatrix[idx0] === '7️⃣') ? 50 : 5;
        if (multiplier === 50) isJackpot = true;
        
        winAmount += betAmount * multiplier;
        
        // Add indices of winning cells
        line.forEach(cellIdx => winningCells.add(cellIdx));
      }
    });

    const isWin = winAmount > 0;
    
    // Highlight winning cells
    if (isWin) {
      winningCells.forEach(cellIdx => {
        // Find which reel and row this cellIdx is
        const reel = cellIdx % 3;
        const row = Math.floor(cellIdx / 3);
        const container = document.getElementById(`reel-container-${reel}`);
        if (container) {
          const cells = container.getElementsByClassName('slot-cell');
          if (cells && cells[row]) {
            cells[row].classList.add('win-active');
          }
        }
      });
    }

    // Call callback with results
    onComplete({
      isWin,
      winAmount,
      isJackpot,
      resultText: isJackpot ? '🔥 JACKPOT 777! 🔥' : `VÝHRA: ${winAmount} Kč`
    });
  }
}
