import { sound } from "../sound.js";
import { evaluateAchievements } from "../achievements.js";

import { GAME_CONFIG } from "./config.js";

const RESULT_BOX_MAP = {
  resBoxClassic: "game-result-classic",
  resBoxDice: "game-result-dice",
  resBoxSlots: "game-result-slots",
  resBoxHilo: "game-result-hilo",
  resBoxMines: "game-result-mines",
};

/**
 * Process a completed round: update balance, DB stats, achievements, Firebase, UI, and broke state.
 * @param {import('../games.js').GameManager} gm
 * @param {boolean} isWin
 * @param {number} winAmount
 * @param {string} gameName
 * @param {string} resultText
 * @param {boolean} isJackpot
 * @param {number|null} betOverride
 */
export function processGameResult(
  gm,
  isWin,
  winAmount,
  gameName,
  resultText,
  isJackpot = false,
  betOverride = null
) {
  const betAmount = betOverride !== null ? betOverride : gm.activeBet;
  const oldBalance = gm.db.getPlayerBalance(gm.currentPlayer);

  let newBalance = oldBalance;
  if (isWin) {
    newBalance = oldBalance + winAmount;
    gm.db.updatePlayerBalance(gm.currentPlayer, newBalance);
    gm.ui.triggerWinConfetti(isJackpot);
  }

  gm.db.recordMatch(
    gm.currentPlayer,
    gameName,
    betAmount,
    resultText,
    isWin,
    isWin ? winAmount : 0,
    newBalance
  );
  gm.db.checkMilestones(gm.currentPlayer, oldBalance - betAmount, newBalance);

  const unlocked = evaluateAchievements(gm.currentPlayer, {
    gameName,
    betAmount,
    isWin,
    isJackpot,
    newBalance,
  });
  unlocked.forEach((ach) => {
    gm.ui.showAlert("success", `${ach.icon} Úspěch: ${ach.title}`, ach.desc);
  });

  if (gm.api) {
    gm.api.submitScore(gm.currentPlayer, newBalance);
    gm.api.submitMatch(
      gm.currentPlayer,
      gameName,
      betAmount,
      resultText,
      isWin,
      isWin ? winAmount : -betAmount
    );
  }

  gm.ui.updateMiniProfile(gm.currentPlayer, newBalance);
  document.dispatchEvent(new CustomEvent("balanceChanged", { detail: { balance: newBalance } }));

  const gameConfig = GAME_CONFIG[gm.activeGameId] || GAME_CONFIG[1];
  const targetId = RESULT_BOX_MAP[gameConfig.resultBox] || "game-result-classic";
  const targetResBox = document.getElementById(targetId) || document.getElementById("game-result-classic");

  if (isWin) {
    const hiloColor = gameConfig.hiloColor ? "#ff4060" : "var(--neon-orange)";
    gm.ui.animateWinResult(targetResBox, winAmount, resultText, isJackpot, "game-result", hiloColor);
  } else {
    gm.ui.animateLossBalance(newBalance);
  }

  if (newBalance <= 0) {
    gm.stopAutoPlay();
    setTimeout(() => {
      triggerBrokeScreen(gm);
    }, 600);
  }
}

/**
 * Trigger the bankruptcy screen when a player hits 0 balance.
 * @param {import('../games.js').GameManager} gm
 */
export function triggerBrokeScreen(gm) {
  gm.db.updatePlayerBalance(gm.currentPlayer, 0);
  sound.playBroke();
  const sockaText = document.getElementById("socka-text");
  if (sockaText) {
    sockaText.innerText = `Hráč ${gm.currentPlayer} prohrál úplně všechno. Ochranka tě vyvedla z casina!`;
  }
  gm.ui.updateBailoutButton?.(gm.currentPlayer);
  gm.ui.showScreen("screen-socka");
}
