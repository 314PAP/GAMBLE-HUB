import Swal from "sweetalert2";
import confetti from "canvas-confetti";
import gsap from "gsap";
import DOMPurify from "dompurify";

import { animateScreenIn } from "./animations/ui.js";
import { GAME_INFOS } from "./ui/gameInfo.js";
import { LeaderboardManager } from "./ui/Leaderboard.js";
import { ExplorerManager } from "./ui/Explorer.js";
import { StatsManager } from "./ui/Stats.js";
import { AccountsManager } from "./ui/Accounts.js";
import { DeleteConfirmDialog } from "./ui/DeleteConfirm.js";
import { sound } from "./sound";
import { formatLargeNumber } from "./utils.js";

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
  }

  // Transitions between screens with a fade effect
  showScreen(screenId) {
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
    this.cancelWinConfetti();

    if (isJackpot) {
      // Massive explosion
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      this._confettiInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          this.cancelWinConfetti();
          return;
        }

        const particleCount = Math.max(1, Math.floor(50 * (timeLeft / duration)));
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random() * 0.3, y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 },
        });
      }, 250);
    } else {
      // Normal win burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
    }
  }

  cancelWinConfetti() {
    if (this._confettiInterval) {
      clearInterval(this._confettiInterval);
      this._confettiInterval = null;
    }
  }

  animateWinResult(
    resBox,
    winAmount,
    resultText,
    isJackpot,
    resultContainerClass = "game-result",
    resultColor = "var(--neon-orange)",
  ) {
    if (resBox) {
      gsap.killTweensOf(resBox);
      resBox.classList.remove("hidden");
      resBox.classList.add("block");
      resBox.classList.remove("visibility-hidden");
      resBox.innerHTML = `
        <span class="text-[var(--neon-gold)] text-lg font-bold text-glow-gold flex items-center justify-center gap-1.5">
          <span>🎉 +${formatLargeNumber(winAmount)}</span>
          <svg class="coin-icon-svg w-[1.1em] h-[1.1em]" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="url(#goldGradient)"/><text x="12" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#1a1a2e">$</text></svg>
          ${isJackpot ? "🔥" : ""}
        </span>
        <small class="font-['Press_Start_2P',monospace] block mt-1.5 text-[10px] tracking-wider text-glow-orange" style="color:${resultColor}">${DOMPurify.sanitize(resultText)}</small>
      `;

      gsap.set(resBox, {
        borderColor: "var(--neon-gold)",
        boxShadow:
          "0 10px 25px rgba(0,0,0,0.5), 0 0 20px var(--neon-gold-glow), 0 0 40px var(--neon-gold-glow)",
      });
      gsap.set(resBox, { opacity: 0, scale: 0.8, y: 20 });
      const multiplierEl = resBox.querySelector(".hilo-result-multiplier");
      const tl = gsap.timeline();
      tl.to(resBox, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.7)",
      }).to(resBox, {
        opacity: 0,
        scale: 0.9,
        y: -10,
        duration: 0.5,
        ease: "power2.in",
        delay: 2.5,
        onComplete: () => {
          resBox.classList.add("hidden");
        },
      });

      if (multiplierEl) {
        tl.to(
          multiplierEl,
          {
            scale: 1.4,
            duration: 0.35,
            ease: "power2.out",
            delay: 2.2,
          },
          0,
        ).to(
          multiplierEl,
          {
            opacity: 0,
            scale: 1.1,
            duration: 0.4,
            ease: "power2.in",
            delay: 2.55,
          },
          0,
        );
      }

      if (isJackpot) {
        tl.to(
          resBox,
          {
            scale: 1.08,
            duration: 0.35,
            ease: "power2.out",
            delay: 1.8,
          },
          0,
        )
          .to(
            resBox,
            {
              x: 3,
              duration: 0.06,
              repeat: 6,
              yoyo: true,
              ease: "none",
              delay: 2.15,
            },
            0,
          )
          .to(
            resBox,
            {
              scale: 1.03,
              duration: 0.25,
              ease: "power1.inOut",
              delay: 2.5,
            },
            0,
          );
      }
    }
  }

  animateLossBalance(newBalance) {
    const hubMoney = document.getElementById("hub-player-money");
    const gameMoney = document.getElementById("game-player-money");

    const elements = [hubMoney, gameMoney].filter((el) => el);

    if (elements.length > 0) {
      gsap.killTweensOf(elements);

      gsap.fromTo(
        elements,
        {
          scale: 1,
          color: "var(--neon-green)",
          textShadow: "0 0 5px var(--neon-green-glow)",
        },
        {
          scale: 1.15,
          color: "var(--neon-pink)",
          textShadow: "0 0 15px var(--neon-pink-glow), 0 0 30px var(--neon-pink-glow)",
          duration: 0.15,
          ease: "power2.out",
          yoyo: true,
          repeat: 3,
          repeatDelay: 0.1,
        },
      );

      gsap.to(elements, {
        color: "var(--neon-green)",
        textShadow: "0 0 5px var(--neon-green-glow)",
        duration: 0.6,
        delay: 0.6,
      });
    }
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
}
