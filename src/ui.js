import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { animateScreenIn } from './animations/ui.js';
import { GAME_INFOS } from './ui/gameInfo.js';
import { LeaderboardManager } from './ui/Leaderboard.js';
import { ExplorerManager } from './ui/Explorer.js';
import { StatsManager } from './ui/Stats.js';
import { AccountsManager } from './ui/Accounts.js';

export class GameUI {
  constructor(db, api) {
    this.db = db;
    this.api = api;
    this.activeScreen = 'screen-login';
    this.leaderboardData = [];
    this.historyData = [];
    this.activeExplorerTab = 'leaderboard';
    this.historySortField = 'timestamp';
    this.historySortAsc = false;

    this.leaderboard = new LeaderboardManager(this);
    this.explorer = new ExplorerManager(this);
    this.stats = new StatsManager(this);
    this.accounts = new AccountsManager(this);
  }

  // Transitions between screens with a fade effect
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.activeScreen = screenId;
      animateScreenIn(target);
    }
  }

  // Resets number buttons grid state
  resetNumberButtons() {
    const btns = document.querySelectorAll('.btn-num');
    btns.forEach(btn => {
      btn.classList.remove('selected', 'winning', 'losing');
      btn.disabled = false;
      // Clear any inline losing styles
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.style.boxShadow = '';
    });
  }

  // Displays SweetAlert toast/alert
  showAlert(type, title, text) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: title,
      text: text,
      background: '#12121c',
      color: '#f8fafc',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      customClass: {
        popup: 'swal-custom-popup'
      }
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
    const hubName = document.getElementById('hub-player-name');
    const hubMoney = document.getElementById('hub-player-money');
    const gameMoney = document.getElementById('game-player-money');

    if (hubName) hubName.innerText = username;
    if (hubMoney) hubMoney.innerText = balance;
    if (gameMoney) gameMoney.innerText = balance;
  }

  // Confetti effects when winning money
  triggerWinConfetti(isJackpot) {
    if (isJackpot) {
      // Massive explosion
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() * 0.3, y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 } }));
      }, 250);
    } else {
      // Normal win burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  }

  openStatsModal(username) {
    return this.stats.open(username);
  }

  closeStatsModal() {
    this.stats.close();
  }

  // Highlights selected bet button and manages custom bets layout
  updateBetButtonsSelection(activeBet, presetBets = [10, 20, 50, 100]) {
    presetBets.forEach(val => {
      const btn = document.getElementById(`bet-${val}`);
      if (btn) {
        if (activeBet === val) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      }
    });

    const custBtn = document.getElementById('bet-cust');
    const customArea = document.getElementById('custom-sazka-area');
    
    if (!presetBets.includes(activeBet)) {
      if (custBtn) custBtn.classList.add('selected');
      if (customArea) customArea.style.display = 'block';
      const input = document.getElementById('game-sazka');
      if (input) input.value = activeBet;
    } else {
      if (custBtn) custBtn.classList.remove('selected');
      if (customArea) customArea.style.display = 'none';
    }
  }

  toggleInfoPanel(gameId) {
    const panel = document.getElementById('info-panel');
    if (!panel) return;
    
    if (panel.style.display === 'flex') {
      this.zavriInfoPanel();
      return;
    }
    
    const info = GAME_INFOS[gameId];
    if (!info) return;
    
    const titleEl = document.getElementById('info-panel-title');
    const bodyEl = document.getElementById('info-panel-body');
    
    if (titleEl) titleEl.innerText = info.title;
    if (bodyEl) bodyEl.innerHTML = info.html;
    
    panel.style.display = 'flex';
  }

  zavriInfoPanel() {
    const panel = document.getElementById('info-panel');
    if (panel) {
      panel.style.display = 'none';
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
    const tabLeaderboard = document.getElementById('explorer-tab-leaderboard');
    const tabHistory = document.getElementById('explorer-tab-history');
    const secLeaderboard = document.getElementById('explorer-sec-leaderboard');
    const secHistory = document.getElementById('explorer-sec-history');

    if (tabName === 'leaderboard') {
      if (tabLeaderboard) {
        tabLeaderboard.classList.add('border-[#ff9f1c]', 'text-[#ff9f1c]');
        tabLeaderboard.classList.remove('border-transparent', 'text-[#ffd700]');
      }
      if (tabHistory) {
        tabHistory.classList.remove('border-[#ff9f1c]', 'text-[#ff9f1c]');
        tabHistory.classList.add('border-transparent', 'text-[#ffd700]');
      }
      if (secLeaderboard) secLeaderboard.style.display = 'block';
      if (secHistory) secHistory.style.display = 'none';
    } else {
      if (tabHistory) {
        tabHistory.classList.add('border-[#ff9f1c]', 'text-[#ff9f1c]');
        tabHistory.classList.remove('border-transparent', 'text-[#ffd700]');
      }
      if (tabLeaderboard) {
        tabLeaderboard.classList.remove('border-[#ff9f1c]', 'text-[#ff9f1c]');
        tabLeaderboard.classList.add('border-transparent', 'text-[#ffd700]');
      }
      if (secLeaderboard) secLeaderboard.style.display = 'none';
      if (secHistory) secHistory.style.display = 'block';
    }
  }

  renderExplorerLeaderboard(filteredData = null) {
    this.leaderboard.renderExplorer(filteredData);
  }

  renderExplorerHistory(filteredData = null) {
    this.explorer.renderHistory(filteredData);
  }

  filtrujLeaderboard() {
    const searchVal = (document.getElementById('leaderboard-search')?.value || '').trim().toLowerCase();
    this.leaderboard.filter(searchVal);
  }

  filtrujHistorii() {
    this.explorer.filter();
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

      if (field === 'timestamp') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (field === 'winAmount') {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    });
  }
}
