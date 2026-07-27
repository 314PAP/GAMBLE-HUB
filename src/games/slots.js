import gsap from "gsap";

import { sound } from "../sound";
import { formatLargeNumber } from "../utils.js";

const symbolClasses = {
  "🍒": "sym-cherry",
  "🔔": "sym-bell",
  "🍋": "sym-lemon",
  "⭐": "sym-star",
  "💎": "sym-diamond",
  "7️⃣": "sym-seven",
};

export class SlotMachineGame {
  constructor(symbols, winningLines) {
    this.symbols = symbols;
    this.winningLines = winningLines;
    this.isSpinning = false;
    this.currentMatrix = ["🍒", "🍋", "🔔", "⭐", "💎", "7️⃣", "🔔", "🍒", "🍋"];
  }

  initReels() {
    this.renderReels();
  }

  renderReels() {
    document.querySelectorAll(".slot-reel-container").forEach((container) => {
      container.style.height = "100%";
      container.style.transform = "translateY(0)";
    });
    for (let r = 0; r < 3; r++) {
      const container = document.getElementById(`reel-container-${r}`);
      if (!container) continue;

      container.style.height = "100%";
      container.innerHTML = "";
      const items = [this.currentMatrix[r], this.currentMatrix[r + 3], this.currentMatrix[r + 6]];

      items.forEach((sym) => {
        const cell = document.createElement("div");
        cell.className = `slot-cell ${symbolClasses[sym] || "sym-default"}`;
        cell.innerText = sym;
        container.appendChild(cell);
      });
    }
  }

  spin(betAmount, userBalance, onComplete) {
    if (this.isSpinning) return;
    this.isSpinning = true;
    sound.playSpin();

    const finalMatrix = [];
    for (let i = 0; i < 9; i++) {
      finalMatrix.push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
    }

    let completedReels = 0;

    document.querySelectorAll(".slot-cell").forEach((cell) => {
      cell.classList.remove("win-active");
    });

    for (let r = 0; r < 3; r++) {
      const container = document.getElementById(`reel-container-${r}`);
      if (!container) continue;

      const reelParent = container.parentElement;
      const singleCellHeight = reelParent.clientHeight / 3;

      const currentReelSymbols = [
        this.currentMatrix[r],
        this.currentMatrix[r + 3],
        this.currentMatrix[r + 6],
      ];
      const finalReelSymbols = [finalMatrix[r], finalMatrix[r + 3], finalMatrix[r + 6]];

      const numIntermediates = 15 + r * 5;
      const spinSymbols = [...currentReelSymbols];

      for (let i = 0; i < numIntermediates; i++) {
        spinSymbols.push(this.symbols[Math.floor(Math.random() * this.symbols.length)]);
      }
      spinSymbols.push(...finalReelSymbols);

      container.style.height = "auto";
      container.innerHTML = "";
      spinSymbols.forEach((sym) => {
        const cell = document.createElement("div");
        cell.className = `slot-cell ${symbolClasses[sym] || "sym-default"}`;
        cell.style.height = `${singleCellHeight}px`;
        cell.innerText = sym;
        container.appendChild(cell);
      });

      const targetY = -((spinSymbols.length - 3) * singleCellHeight);

      gsap.set(container, { y: 0 });
      gsap.set(reelParent, { filter: "blur(3px)" });

      gsap.to(container, {
        y: targetY,
        duration: 1.5 + r * 0.4,
        ease: "power2.inOut",
        onUpdate: function () {
          const progress = this.progress();
          if (progress > 0.7) {
            const currentBlur = (1 - progress) * 10;
            gsap.set(reelParent, { filter: `blur(${Math.max(0, currentBlur)}px)` });
          }
        },
        onComplete: () => {
          gsap.set(reelParent, { filter: "blur(0px)" });

          completedReels++;
          if (completedReels === 3) {
            this.currentMatrix = finalMatrix;
            this.renderReels();
            this.isSpinning = false;
            this.checkWinnings(betAmount, onComplete);
          }
        },
      });
    }
  }

  spinAsync(betAmount, userBalance) {
    return new Promise((resolve) => {
      this.spin(betAmount, userBalance, resolve);
    });
  }

  checkWinnings(betAmount, onComplete) {
    let winAmount = 0;
    const winningCells = new Set();
    let isJackpot = false;
    const lineDetails = [];

    this.winningLines.forEach((line) => {
      const idx0 = line[0];
      const idx1 = line[1];
      const idx2 = line[2];

      if (
        this.currentMatrix[idx0] === this.currentMatrix[idx1] &&
        this.currentMatrix[idx1] === this.currentMatrix[idx2]
      ) {
        const multipliers = {
          "🍒": 2,
          "🔔": 5,
          "🍋": 8,
          "⭐": 15,
          "💎": 30,
          "7️⃣": 100,
        };
        const symbol = this.currentMatrix[idx0];
        const multiplier = multipliers[symbol] || 5;

        if (symbol === "7️⃣") isJackpot = true;

        const lineWin = betAmount * multiplier;
        winAmount += lineWin;

        lineDetails.push({
          line,
          symbol,
          multiplier,
          lineWin,
          betAmount,
        });

        line.forEach((cellIdx) => winningCells.add(cellIdx));
      }
    });

    const isWin = winAmount > 0;

    const winningLineCount = lineDetails.length;
    const symbolMap = {
      "🍒": "Třešně",
      "🔔": "Zvonky",
      "🍋": "Citrony",
      "⭐": "Hvězdy",
      "💎": "Diamanty",
      "7️⃣": "777",
    };

    let resultText;
    if (isJackpot) {
      resultText = "🔥 JACKPOT 777! 🔥";
    } else {
      const symbols = [...new Set(lineDetails.map((d) => d.symbol))];
      const symbolNames = symbols.join(", ");
      const multiplierText = winningLineCount > 1 ? `×${winningLineCount}` : "";
      resultText = `${winningLineCount}× ${symbolNames}${multiplierText}: +${formatLargeNumber(winAmount)} $`;
    }

    if (isWin) {
      winningCells.forEach((cellIdx) => {
        const reel = cellIdx % 3;
        const row = Math.floor(cellIdx / 3);
        const container = document.getElementById(`reel-container-${reel}`);
        if (container) {
          const cells = container.getElementsByClassName("slot-cell");
          if (cells && cells[row]) {
            cells[row].classList.add("win-active");
          }
        }
      });
    }

    onComplete({
      isWin,
      winAmount,
      isJackpot,
      betAmount,
      resultText: resultText,
    });
  }
}
