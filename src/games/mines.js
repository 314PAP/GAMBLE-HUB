import gsap from "gsap";

import { sound } from "../sound";
import { formatLargeNumber } from "../utils";

export const MINES_GRID_SIZE = 25;
export const ALLOWED_MINE_COUNTS = [1, 3, 5, 10];

/**
 * MinesGame — 5x5 grid Mines game with progressive multipliers and Cash Out.
 *
 * Fair multiplier formula (5% house edge):
 *   M(k) = round(0.95 * prod_{i=0..k-1} ((25 - i) / (25 - mines - i)) * 100) / 100
 */
export class MinesGame {
  constructor() {
    this.gridSize = MINES_GRID_SIZE;
    this.minesCount = 3;
    this.minePositions = new Set();
    this.revealedIndices = new Set();
    this.isActive = false;
    this.betAmount = 0;
    this.currentMultiplier = 1;
  }

  init() {
    this.isActive = false;
    this.minePositions.clear();
    this.revealedIndices.clear();
    this.betAmount = 0;
    this.currentMultiplier = 1;
    this.renderBoard();
    this.updateStatusUI();
  }

  setMinesCount(count) {
    if (this.isActive) return false;
    if (!ALLOWED_MINE_COUNTS.includes(count)) return false;
    this.minesCount = count;
    this.updateStatusUI();
    return true;
  }

  /**
   * Calculate cumulative multiplier after `safeRevealed` safe tiles.
   * @param {number} safeRevealed
   * @param {number} minesCount
   * @returns {number}
   */
  calculateMultiplier(safeRevealed, minesCount = this.minesCount) {
    if (safeRevealed <= 0) return 1;
    const maxSafe = this.gridSize - minesCount;
    if (safeRevealed > maxSafe) return 0;

    let probInverse = 1;
    for (let i = 0; i < safeRevealed; i++) {
      probInverse *= (this.gridSize - i) / (this.gridSize - minesCount - i);
    }
    return Math.round(0.95 * probInverse * 100) / 100;
  }

  /**
   * Start a new Mines round with the given bet amount.
   * @param {number} betAmount
   * @param {number[]|null} fixedMines - Optional deterministic mine indices for testing
   */
  start(betAmount, fixedMines = null) {
    this.betAmount = betAmount;
    this.revealedIndices.clear();
    this.minePositions.clear();
    this.currentMultiplier = 1;
    this.isActive = true;

    if (Array.isArray(fixedMines)) {
      fixedMines.forEach((idx) => this.minePositions.add(idx));
    } else {
      while (this.minePositions.size < this.minesCount) {
        const idx = Math.floor(Math.random() * this.gridSize);
        this.minePositions.add(idx);
      }
    }

    this.renderBoard();
    this.updateStatusUI();
  }

  /**
   * Reveal a tile on the 5x5 board.
   * @param {number} index
   * @returns {object|null}
   */
  revealTile(index) {
    if (!this.isActive) return null;
    if (index < 0 || index >= this.gridSize) return null;
    if (this.revealedIndices.has(index)) return null;

    if (this.minePositions.has(index)) {
      // Hit a mine -> loss
      sound.playLoss();
      this.isActive = false;
      const bet = this.betAmount;
      const revealedCount = this.revealedIndices.size;
      this.renderBoard(true, index);
      this.updateStatusUI();
      return {
        status: "mine",
        isWin: false,
        winAmount: 0,
        bet,
        resultText: `💣 Mina (${revealedCount} odkryto)`,
      };
    }

    // Safe tile
    sound.playWinBonus();
    this.revealedIndices.add(index);
    const safeCount = this.revealedIndices.size;
    this.currentMultiplier = this.calculateMultiplier(safeCount, this.minesCount);
    const maxSafe = this.gridSize - this.minesCount;

    this._animateTileReveal(index);

    if (safeCount >= maxSafe) {
      // All safe tiles cleared -> auto cashOut
      const winAmount = Math.round(this.betAmount * this.currentMultiplier);
      const bet = this.betAmount;
      const mult = this.currentMultiplier;
      this.isActive = false;
      this.renderBoard(true);
      this.updateStatusUI();
      return {
        status: "cleared",
        isWin: true,
        winAmount,
        bet,
        multiplier: mult,
        resultText: `💎 Vše čisté (${mult}×)`,
      };
    }

    this.renderBoard();
    this.updateStatusUI();
    return {
      status: "safe",
      safeCount,
      multiplier: this.currentMultiplier,
      potentialWin: Math.round(this.betAmount * this.currentMultiplier),
    };
  }

  cashOut() {
    if (!this.isActive || this.revealedIndices.size === 0) return null;
    const winAmount = Math.round(this.betAmount * this.currentMultiplier);
    const bet = this.betAmount;
    const mult = this.currentMultiplier;
    const count = this.revealedIndices.size;
    this.isActive = false;
    sound.playWinBonus();
    this.renderBoard(true);
    this.updateStatusUI();
    return {
      isWin: true,
      winAmount,
      bet,
      multiplier: mult,
      resultText: `💎 ${count} polí (${mult}×)`,
    };
  }

  _animateTileReveal(index) {
    if (typeof document?.querySelector !== "function") return;
    const tile = document.querySelector(`#mines-grid [data-mine-index="${index}"]`);
    if (tile) {
      gsap.fromTo(
        tile,
        { scale: 0.85 },
        { scale: 1, duration: 0.2, ease: "back.out(2)" }
      );
    }
  }

  renderBoard(revealAll = false, explodedIndex = -1) {
    const gridEl = document.getElementById("mines-grid");
    if (!gridEl) return;

    let html = "";
    for (let i = 0; i < this.gridSize; i++) {
      const isRevealed = this.revealedIndices.has(i);
      const isMine = this.minePositions.has(i);

      let cls = "mines-tile";
      let content = "";
      let disabled = !this.isActive || isRevealed;

      if (isRevealed) {
        cls += " mines-tile-safe";
        content = "💎";
      } else if (revealAll && isMine) {
        cls += i === explodedIndex ? " mines-tile-exploded" : " mines-tile-mine";
        content = "💣";
      } else if (revealAll) {
        cls += " mines-tile-dim";
      }

      html += `<button type="button" class="${cls}" data-mine-index="${i}" onclick="revealMineTile(${i})" ${disabled ? "disabled" : ""} aria-label="Pole ${i + 1}">${content}</button>`;
    }
    gridEl.innerHTML = html;
  }

  updateStatusUI() {
    const statusEl = document.getElementById("mines-status-info");
    const startBtn = document.getElementById("btn-mines-start");
    const cashoutBtn = document.getElementById("btn-mines-cashout");

    if (typeof document?.querySelectorAll === "function") {
      document.querySelectorAll("[data-mines-count]").forEach((btn) => {
        const count = Number(btn.getAttribute("data-mines-count"));
        btn.disabled = this.isActive;
        btn.classList.toggle("active", count === this.minesCount);
      });
    }

    const nextMult = this.calculateMultiplier(this.revealedIndices.size + 1, this.minesCount);

    if (statusEl) {
      if (this.isActive && this.revealedIndices.size > 0) {
        const potential = Math.round(this.betAmount * this.currentMultiplier);
        statusEl.textContent = `Odkryto: ${this.revealedIndices.size} | Násobitel: ${this.currentMultiplier}× | Další: ${nextMult}× | Výhra: ${formatLargeNumber(potential)}`;
        statusEl.classList.add("text-neon-gold");
        statusEl.classList.remove("text-text-secondary");
      } else if (this.isActive) {
        statusEl.textContent = `Vyber bezpečné pole! Další krok: ${nextMult}× (${this.minesCount} min)`;
        statusEl.classList.remove("text-neon-gold");
        statusEl.classList.add("text-text-secondary");
      } else {
        statusEl.textContent = `Počet min: ${this.minesCount} | První krok: ${this.calculateMultiplier(1, this.minesCount)}×`;
        statusEl.classList.remove("text-neon-gold");
        statusEl.classList.add("text-text-secondary");
      }
    }

    if (startBtn) {
      startBtn.classList.toggle("hidden", this.isActive);
      startBtn.disabled = this.isActive;
    }

    if (cashoutBtn) {
      const canCashOut = this.isActive && this.revealedIndices.size > 0;
      cashoutBtn.classList.toggle("hidden", !this.isActive);
      cashoutBtn.disabled = !canCashOut;
      if (canCashOut) {
        const potential = Math.round(this.betAmount * this.currentMultiplier);
        cashoutBtn.textContent = `💰 VYBRAT (${formatLargeNumber(potential)})`;
      } else {
        cashoutBtn.textContent = "💰 VYBRAT";
      }
    }
  }
}
