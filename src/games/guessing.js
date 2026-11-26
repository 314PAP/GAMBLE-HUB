// Guessing games module (Guess 1-10, Guess 1-5, Dice, Roulette) with grid roll animations
import gsap from "gsap";

import { sound } from "../sound";

export const ROULETTE_RED_NUMS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const ROULETTE_SIDE_BETS = {
  red: { label: "Červená", multiplier: 2, match: (n) => n > 0 && ROULETTE_RED_NUMS.includes(n) },
  black: { label: "Černá", multiplier: 2, match: (n) => n > 0 && !ROULETTE_RED_NUMS.includes(n) },
  even: { label: "Sudá", multiplier: 2, match: (n) => n > 0 && n % 2 === 0 },
  odd: { label: "Lichá", multiplier: 2, match: (n) => n > 0 && n % 2 === 1 },
  low: { label: "1–18", multiplier: 2, match: (n) => n >= 1 && n <= 18 },
  high: { label: "19–35", multiplier: 2, match: (n) => n >= 19 && n <= 35 },
  dozen1: { label: "1–12", multiplier: 3, match: (n) => n >= 1 && n <= 12 },
  dozen2: { label: "13–24", multiplier: 3, match: (n) => n >= 13 && n <= 24 },
  dozen3: { label: "25–35", multiplier: 3, match: (n) => n >= 25 && n <= 35 },
};

export function evaluateRouletteBet(selection, winningNum, numberMultiplier = 35) {
  if (typeof selection === "string" && ROULETTE_SIDE_BETS[selection]) {
    const betDef = ROULETTE_SIDE_BETS[selection];
    return {
      isWin: betDef.match(winningNum),
      multiplier: betDef.multiplier,
      label: betDef.label,
    };
  }
  return {
    isWin: selection === winningNum,
    multiplier: numberMultiplier,
    label: String(selection),
  };
}

export class GuessingGame {
  constructor() {
    this.isPlaying = false;
  }

  // Generates number buttons in the grid
  generateGrid(min, max, onNumberClick) {
    const gridContainer = document.getElementById("game-number-buttons");
    if (!gridContainer) return;

    gridContainer.innerHTML = "";

    // For Roulette (0-36), adjust columns if needed
    if (max - min > 10) {
      gridContainer.classList.remove("grid-cols-5");
      gridContainer.classList.add("grid-cols-6");
    } else {
      gridContainer.classList.remove("grid-cols-6");
      gridContainer.classList.add("grid-cols-5");
    }

    for (let i = min; i <= max; i++) {
      const btn = document.createElement("button");
      btn.className = "btn-num";

      // === RULE 2: Retro Digital Contrast – casino colors for roulette ===
      if (min === 0 && max === 35) {
        if (i === 0) {
          btn.classList.add("green-num");
        } else if (ROULETTE_RED_NUMS.includes(i)) {
          btn.classList.add("red-num");
        } else {
          btn.classList.add("black-num");
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
    const evaluation = evaluateRouletteBet(selectedNum, winningNum, multiplier);
    const isWin = evaluation.isWin;
    const winAmount = isWin ? betAmount * evaluation.multiplier : 0;
    const isSideBet = typeof selectedNum === "string" && Boolean(ROULETTE_SIDE_BETS[selectedNum]);

    const buttons = Array.from(document.querySelectorAll(".btn-num"));

    // Disable all buttons and highlight selected
    buttons.forEach((btn) => {
      btn.disabled = true;
      btn.classList.remove("selected", "winning");
      const btnNum = parseInt(btn.dataset.num);
      if (isSideBet ? ROULETTE_SIDE_BETS[selectedNum].match(btnNum) : btnNum === selectedNum) {
        btn.classList.add("selected");
      }
    });

    // Start rolling animation using GSAP for rich, smooth visuals
    const totalSteps = 22;
    const tl = gsap.timeline({
      onComplete: () => {
        // Final landing
        buttons.forEach((b) => b.classList.remove("winning"));

        // Find winning button
        const winBtn = buttons.find((b) => parseInt(b.dataset.num) === winningNum);
        if (winBtn) {
          winBtn.classList.add("winning");
        }

        // Keep selected button highlighted
        const selBtn = !isSideBet ? buttons.find((b) => parseInt(b.dataset.num) === selectedNum) : null;
        if (selBtn) {
          if (isWin) {
            selBtn.classList.remove("selected");
            selBtn.classList.add("winning");
          } else {
            selBtn.classList.add("losing");
          }
        }

        // Pause for 1.5 seconds so player can clearly see the outcome
        gsap.delayedCall(1.5, () => {
          this.isPlaying = false;
          if (isWin) {
            sound.playWinBonus();
          } else {
            sound.playLoss();
          }
          onComplete({
            isWin,
            winAmount,
            resultText: `${winningNum}`,
          });
        });
      },
    });

    // Create a sequential glowing wave across the buttons that progressively slows down
    for (let step = 0; step < totalSteps; step++) {
      const targetBtn =
        step === totalSteps - 1
          ? buttons.find((b) => parseInt(b.dataset.num) === winningNum)
          : buttons[Math.floor(Math.random() * buttons.length)];

      const stepDuration = 0.06 + Math.pow(step / totalSteps, 2) * 0.35; // Dramatic slow down at the end

      tl.to(targetBtn, {
        duration: stepDuration,
        onStart: () => {
          buttons.forEach((b) => b.classList.remove("winning"));
          if (parseInt(targetBtn.dataset.num) !== selectedNum) {
            targetBtn.classList.add("winning");
          }
          if (step === totalSteps - 1) {
            sound.play8BitSelect();
          } else {
            sound.playClick();
          }
        },
      });
    }
  }

  playAsync(selectedNum, min, max, betAmount, multiplier) {
    return new Promise((resolve) => {
      this.play(selectedNum, min, max, betAmount, multiplier, resolve);
    });
  }
}
