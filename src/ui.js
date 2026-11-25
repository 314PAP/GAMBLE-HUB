import Swal from "sweetalert2";
import confetti from "canvas-confetti";
import gsap from "gsap";
import DOMPurify from "dompurify";

import { animateScreenIn } from "./animations/ui.js";
import { initInfoToggleAnimations, epilepticFlash, stopEpilepticFlash, animatePanelOpen, stopPanelAnimation } from "./animations/infoToggle.js";
import { GAME_INFOS } from "./ui/gameInfo.js";
import { LeaderboardManager } from "./ui/Leaderboard.js";
import { ExplorerManager } from "./ui/Explorer.js";
import { StatsManager } from "./ui/Stats.js";
import { AccountsManager } from "./ui/Accounts.js";
import { DeleteConfirmDialog } from "./ui/DeleteConfirm.js";
import { sound } from "./sound";
import { formatLargeNumber } from "./utils.js";

import {
  triggerWinConfetti as runTriggerWinConfetti,
  cancelWinConfetti as runCancelWinConfetti,
  animateWinResult as runAnimateWinResult,
  animateLossBalance as runAnimateLossBalance,
} from "./ui/resultAnimations.js";

export class GameUI {
  constructor(db, api) {
    this.db = db;
    this.api = api;
    this.activeScreen = "screen-login";
    this.leaderboardData = [];
    this.historyData = [];
    this.activeExplorerTab = "leaderboard";
    this.historySortField = "timestamp";
    this.historySortAsc = false;
    this._confettiInterval = null;

    this.leaderboard = new LeaderboardManager(this);
    this.explorer = new ExplorerManager(this);
    this.stats = new StatsManager(this);
    this.accounts = new AccountsManager(this);
    this.deleteConfirm = new DeleteConfirmDialog(this);

    // Initialize GSAP info toggle animations
    initInfoToggleAnimations();
  }

  // Transitions between screens with a fade effect
  showScreen(screenId) {
    const currentScreen =
      typeof document.querySelector === "function" ? document.querySelector(".screen.active") : null;
    if (currentScreen) {
      gsap.killTweensOf(currentScreen);
      const animated = currentScreen.querySelector("[data-animate]");
      if (animated) gsap.killTweensOf(animated);
    }
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add("active");
      this.activeScreen = screenId;
      animateScreenIn(target);
    }
  }

  // Resets number buttons grid state
  resetNumberButtons() {
    const btns = document.querySelectorAll(".btn-num");
    btns.forEach((btn) => {
      btn.classList.remove("selected", "winning", "losing");
      btn.disabled = false;
    });
  }

  // Displays SweetAlert toast/alert
  showAlert(type, title, text) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: type,
      title: title,
      text: text,
      background: "#12121c",
      color: "#f8fafc",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      customClass: {
        popup: "swal-custom-popup",
      },
    });
  }

  renderLeaderboard() {
    return this.leaderboard.render();
  }

  renderAccounts(onSelect, onDelete) {
    return this.accounts.render(onSelect, onDelete);
  }

  // Updates player profile info in the navigation bars
  updateMiniProfile(username, balance) {
    const hubName = document.getElementById("hub-player-name");
    const hubMoney = document.getElementById("hub-player-money");
    const gameMoney = document.getElementById("game-player-money");

    if (hubName) hubName.innerText = username;
    if (hubMoney) hubMoney.innerText = formatLargeNumber(balance);
    if (gameMoney) gameMoney.innerText = formatLargeNumber(balance);
  }

  // Confetti effects when winning money
  triggerWinConfetti(isJackpot) {
    runTriggerWinConfetti(this, isJackpot);
  }

  cancelWinConfetti() {
    runCancelWinConfetti(this);
  }

  animateWinResult(
    resBox,
    winAmount,
    resultText,
    isJackpot,
    resultContainerClass = "game-result",
    resultColor = "var(--neon-orange)",
  ) {
    runAnimateWinResult(resBox, winAmount, resultText, isJackpot, resultContainerClass, resultColor);
  }

  animateLossBalance() {
    runAnimateLossBalance();
  }

  openStatsModal(username) {
    return this.stats.open(username);
  }

  closeStatsModal() {
    this.stats.close();
  }

  // Highlights selected bet button; deselects all others
  updateBetButtonsSelection(activeBet, presetBets = [10, 20, 50, 100]) {
    presetBets.forEach((val) => {
      const btn = document.getElementById(`bet-${val}`);
      if (btn) {
        if (activeBet === val) {
          btn.classList.add("selected");
        } else {
          btn.classList.remove("selected");
        }
      }
    });

    // ALL-IN button — highlight when bet equals full balance
    const allInBtn = document.getElementById("bet-all-in");
    if (allInBtn) {
      // We don't know balance here, so just deselect unless it's one of presets
      if (!presetBets.includes(activeBet)) {
        allInBtn.classList.add("selected");
      } else {
        allInBtn.classList.remove("selected");
      }
    }
  }

  toggleInfoPanel(gameId) {
    const panel = document.getElementById("info-panel");
    const btn = document.getElementById("btn-game-info");
    if (!panel || !btn) return;

    if (panel.classList.contains("flex")) {
      this.zavriInfoPanel();
      return;
    }

    let effectiveGameId = gameId;
    if (effectiveGameId == null) {
      effectiveGameId = this._lastInfoGameId ?? 1;
    }
    this._lastInfoGameId = effectiveGameId;

    const info = GAME_INFOS[effectiveGameId];
    if (!info) return;

    const titleEl = document.getElementById("info-panel-title");
    const bodyEl = document.getElementById("info-panel-body");

    if (titleEl) titleEl.innerText = info.title;
    if (bodyEl) bodyEl.innerHTML = DOMPurify.sanitize(info.html);

    panel.classList.add("flex");
    panel.classList.remove("hidden");
    btn.classList.add("is-pressed");
    panel.classList.add("is-open");

    // Trigger GSAP animations
    epilepticFlash(btn);
    animatePanelOpen(panel);
  }

  zavriInfoPanel() {
    const panel = document.getElementById("info-panel");
    const btn = document.getElementById("btn-game-info");
    if (panel) {
      panel.classList.add("hidden");
      panel.classList.remove("flex");
      panel.classList.remove("is-open");
    }
    if (btn) {
      btn.classList.remove("is-pressed");
    }

    // Stop GSAP animations and reset
    stopEpilepticFlash(btn);
    stopPanelAnimation(panel);
  }

  openExplorer() {
    return this.explorer.load();
  }

  closeExplorer() {
    this.explorer.close();
  }

  prepniExplorerTab(tabName) {
    this.activeExplorerTab = tabName;
    const tabLeaderboard = document.getElementById("explorer-tab-leaderboard");
    const tabHistory = document.getElementById("explorer-tab-history");
    const secLeaderboard = document.getElementById("explorer-sec-leaderboard");
    const secHistory = document.getElementById("explorer-sec-history");

    if (tabName === "leaderboard") {
      if (tabLeaderboard) {
        tabLeaderboard.classList.add("border-[#ff9f1c]", "text-[#ff9f1c]");
        tabLeaderboard.classList.remove("border-transparent", "text-[#ffd700]");
      }
      if (tabHistory) {
        tabHistory.classList.remove("border-[#ff9f1c]", "text-[#ff9f1c]");
        tabHistory.classList.add("border-transparent", "text-[#ffd700]");
      }
      if (secLeaderboard) secLeaderboard.classList.remove("hidden");
      if (secHistory) secHistory.classList.add("hidden");
    } else {
      if (tabHistory) {
        tabHistory.classList.add("border-[#ff9f1c]", "text-[#ff9f1c]");
        tabHistory.classList.remove("border-transparent", "text-[#ffd700]");
      }
      if (tabLeaderboard) {
        tabLeaderboard.classList.remove("border-[#ff9f1c]", "text-[#ff9f1c]");
        tabLeaderboard.classList.add("border-transparent", "text-[#ffd700]");
      }
      if (secLeaderboard) secLeaderboard.classList.add("hidden");
      if (secHistory) secHistory.classList.remove("hidden");
    }
  }

  renderExplorerLeaderboard(filteredData = null) {
    this.leaderboard.renderExplorer(filteredData);
  }

  renderExplorerHistory(filteredData = null) {
    this.explorer.renderHistory(filteredData);
  }

  filtrujLeaderboard() {
    const searchVal = (document.getElementById("leaderboard-search")?.value || "")
      .trim()
      .toLowerCase();
    this.leaderboard.filter(searchVal);
  }

  seradHistorii(columnName) {
    this.explorer.sort(columnName);
  }

  sortHistoryData(data) {
    const field = this.historySortField;
    const asc = this.historySortAsc;

    data.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === "timestamp") {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (field === "winAmount") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else if (field === "isWin") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    });
  }

  updateDailyBonusButton(username) {
    const btn = document.getElementById("hub-daily-bonus-btn");
    if (!btn || !username || typeof this.db.getDailyBonusStatus !== "function") return;
    const status = this.db.getDailyBonusStatus(username);
    if (status.available) {
      btn.classList.remove("opacity-40");
      btn.classList.add("animate-pulse");
      btn.title = `Denní bonus (+${status.nextAmount}, den ${status.nextStreak})`;
    } else {
      btn.classList.add("opacity-40");
      btn.classList.remove("animate-pulse");
      btn.title = `Denní bonus už dnes vyzvednut (série: ${status.streak})`;
    }
  }

  updateBailoutButton(username) {
    const btn = document.getElementById("socka-bailout-btn");
    const hint = document.getElementById("socka-bailout-hint");
    if (!btn || !username || typeof this.db.getBailoutStatus !== "function") return;
    const status = this.db.getBailoutStatus(username);
    if (status.available) {
      btn.disabled = false;
      btn.classList.remove("opacity-50");
      if (hint) hint.classList.add("hidden");
    } else {
      btn.disabled = status.remainingMs > 0;
      if (status.remainingMs > 0) {
        btn.classList.add("opacity-50");
        const secs = Math.ceil(status.remainingMs / 1000);
        if (hint) {
          hint.innerText = `Další záchranný kredit za ${secs} s.`;
          hint.classList.remove("hidden");
        }
      }
    }
  }
}
