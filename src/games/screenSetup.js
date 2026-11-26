import { DISPLAY_STATES, GAME_CONFIG } from "./config.js";
import { clearAllResultBoxes } from "./resultBoxes.js";

const GAME_AREA_IDS = ["slots-area", "hilo-area", "mines-area", "crash-area", "classic-inputs", "dice-area"];

/**
 * Configure DOM visibility and game-specific controls when switching to a game.
 * @param {import('../games.js').GameManager} gm
 * @param {number} gameId
 */
export function setupGameScreen(gm, gameId) {
  clearAllResultBoxes();

  GAME_AREA_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  const betArea = document.getElementById("bet-area");
  if (betArea) betArea.classList.add("grid");

  document.querySelectorAll(".slot-cell").forEach((c) => c.classList.remove("win-active"));

  const titleEl = document.getElementById("game-title");
  const cfg = GAME_CONFIG[gameId];
  const state = DISPLAY_STATES[gameId] || DISPLAY_STATES[1];

  if (state.classic) {
    document.getElementById("classic-inputs")?.classList.remove("hidden");
    gm.guessing.generateGrid(cfg.minVal, cfg.maxVal, (num) =>
      gm.playGuessingGame(num, cfg.minVal, cfg.maxVal, cfg.multVal, cfg.label)
    );
  }

  if (state.dice) {
    document.getElementById("dice-area")?.classList.remove("hidden");
    gm.dice.init();
    document.querySelectorAll(".dice-num-btn").forEach((btn) => {
      btn.onclick = () => {
        if (gm.dice.isPlaying) return;
        gm.dice.selectNumber(parseInt(btn.dataset.num));
        gm.playDiceGame();
      };
    });
  }

  if (state.slots) {
    document.getElementById("slots-area")?.classList.remove("hidden");
  }

  if (state.hilo) {
    const hiloEl = document.getElementById("hilo-area");
    if (hiloEl) {
      hiloEl.classList.remove("hidden");
      hiloEl.classList.add("flex");
    }
    gm.hilo.init();
  }

  if (state.mines) {
    const minesEl = document.getElementById("mines-area");
    if (minesEl) {
      minesEl.classList.remove("hidden");
      minesEl.classList.add("flex");
    }
    gm.mines.init();
  }

  if (state.crash) {
    const crashEl = document.getElementById("crash-area");
    if (crashEl) {
      crashEl.classList.remove("hidden");
      crashEl.classList.add("flex");
    }
    gm.crash.init();
  }

  if (titleEl) {
    titleEl.innerText = state.title;
  }
}
