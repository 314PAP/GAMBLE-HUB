import { sound } from "../sound.js";
import { playAchievementUnlock, playLevelUp } from "../soundEffects.js";
import {
  spawnCoinShower,
  spawnFloatingText,
  triggerCameraShake,
  triggerScreenFlash,
} from "../arcadeEffects.js";
import { formatLargeNumber } from "../utils.js";
import { evaluateAchievements } from "../achievements.js";
import { updateMissionsProgress } from "../missions.js";
import { addPlayerXp } from "../vip.js";
import { recordStreak } from "../streak.js";
import { vibrateWin, vibrateLoss } from "../haptics.js";
import { broadcastBigWin } from "../liveFeed.js";

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
    playAchievementUnlock();
    gm.ui.showAlert("success", `${ach.icon} Úspěch: ${ach.title}`, ach.desc);
  });

  const multiplier = betAmount > 0 ? winAmount / betAmount : 1;
  const completedMissions = updateMissionsProgress(gm.currentPlayer, {
    gameName,
    isWin,
    multiplier,
  });
  completedMissions.forEach((m) => {
    playAchievementUnlock();
    const curBal = gm.db.getPlayerBalance(gm.currentPlayer);
    gm.db.updateBalance(gm.currentPlayer, curBal + m.reward);
    gm.ui.updateBalanceDisplay(gm.currentPlayer);
    gm.ui.showAlert("success", `🎯 Denní mise splněna!`, `${m.title} (+${m.reward} mincí)`);
  });

  if (isWin) vibrateWin();
  else vibrateLoss();

  const streakInfo = recordStreak(gm.currentPlayer, isWin);
  const vipRes = addPlayerXp(gm.currentPlayer, betAmount + streakInfo.bonusXp);
  if (streakInfo.isHot) {
    spawnFloatingText(`🔥 HOT STREAK ×${streakInfo.count}!`, {
      color: "var(--neon-orange)",
      yOffset: -140,
      fontSize: "1.15rem",
    });
  }
  if (vipRes.leveledUp) {
    playLevelUp();
    spawnFloatingText(`⭐ VIP LEVEL ${vipRes.info.level}!`, {
      color: "var(--neon-cyan)",
      yOffset: -120,
    });
    gm.ui.showAlert("success", `⭐ VIP Level ${vipRes.info.level}!`, `Nová hodnost: ${vipRes.info.name}`);
  }

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
    broadcastBigWin(gm.currentPlayer, gameName, winAmount, isJackpot);

    if (isJackpot) {
      triggerScreenFlash("rgba(255, 215, 0, 0.45)", 0.55);
      triggerCameraShake(10, 0.45);
      spawnCoinShower(26);
      spawnFloatingText(`🔥 JACKPOT +${formatLargeNumber(winAmount)} 🪙`, {
        color: "var(--neon-gold)",
        fontSize: "1.5rem",
      });
    } else {
      triggerScreenFlash("rgba(0, 255, 136, 0.22)", 0.35);
      spawnFloatingText(`+${formatLargeNumber(winAmount)} 🪙`, {
        color: "var(--neon-green)",
      });
    }
  } else {
    gm.ui.animateLossBalance(newBalance);
    triggerScreenFlash("rgba(255, 42, 133, 0.22)", 0.35);
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
