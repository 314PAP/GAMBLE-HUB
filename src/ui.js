import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { animateScreenIn } from './animations/ui.js';
import { GAME_INFOS } from './ui/gameInfo.js';
import { LeaderboardManager } from './ui/Leaderboard.js';
import { ExplorerManager } from './ui/Explorer.js';
import { StatsManager } from './ui/Stats.js';
import { AccountsManager } from './ui/Accounts.js';
import { DeleteConfirmDialog } from './ui/DeleteConfirm.js';
import { sound } from './sound';
import { formatLargeNumber } from './utils.js';

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
    this.deleteConfirm = new DeleteConfirmDialog(this);
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

  formatLargeNumber(num) {
    return formatLargeNumber(num);
  }

  // Updates player profile info in the navigation bars
  updateMiniProfile(username, balance) {
    const hubName = document.getElementById('hub-player-name');
    const hubMoney = document.getElementById('hub-player-money');
    const gameMoney = document.getElementById('game-player-money');

    if (hubName) hubName.innerText = username;
    if (hubMoney) hubMoney.innerText = this.formatLargeNumber(balance);
    if (gameMoney) gameMoney.innerText = this.formatLargeNumber(balance);
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

  animateWinResult(resBox, winAmount, resultText, isJackpot, resultContainerClass = 'game-result') {
    if (resBox) {
      gsap.killTweensOf(resBox);
      resBox.style.display = 'block';
      resBox.style.visibility = 'visible';

      resBox.style.borderColor = 'var(--neon-gold)';
      resBox.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5), 0 0 20px var(--neon-gold-glow), 0 0 40px var(--neon-gold-glow)';
      resBox.innerHTML = `
        <span class="text-[var(--neon-gold)] text-lg font-bold text-glow-gold flex items-center justify-center gap-1.5">
          <span>🎉 +${this.formatLargeNumber(winAmount)}</span>
          <svg class="coin-icon-svg w-[1.1em] h-[1.1em]" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="url(#goldGradient)"/><text x="12" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#1a1a2e">$</text></svg>
          ${isJackpot ? '🔥' : ''}
        </span>
        <small class="text-[var(--neon-cyan)] block mt-1 text-xs">${resultText}</small>
      `;

      gsap.set(resBox, { opacity: 0, scale: 0.8, y: 20 });
      const tl = gsap.timeline();
      tl.to(resBox, { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.4, 
        ease: 'back.out(1.7)' 
      })
      .to(resBox, { 
        opacity: 0, 
        scale: 0.9,
        y: -10, 
        duration: 0.5, 
        ease: 'power2.in', 
        delay: 2.5,
        onComplete: () => {
          resBox.style.display = 'none';
        }
      });
    }
  }

  animateLossBalance(newBalance) {
    const hubMoney = document.getElementById('hub-player-money');
    const gameMoney = document.getElementById('game-player-money');

    const elements = [hubMoney, gameMoney].filter(el => el);

    if (elements.length > 0) {
      gsap.killTweensOf(elements);

      gsap.fromTo(elements, {
        scale: 1,
        color: 'var(--neon-green)',
        textShadow: '0 0 5px var(--neon-green-glow)'
      }, {
        scale: 1.15,
        color: 'var(--neon-pink)',
        textShadow: '0 0 15px var(--neon-pink-glow), 0 0 30px var(--neon-pink-glow)',
        duration: 0.15,
        ease: 'power2.out',
        yoyo: true,
        repeat: 3,
        repeatDelay: 0.1
      });

      gsap.to(elements, {
        color: 'var(--neon-green)',
        textShadow: '0 0 5px var(--neon-green-glow)',
        duration: 0.6,
        delay: 0.6
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
  updateBetButtonsSelection(activeBet, presetBets = [10, 20, 50, 100, 1000, 10000, 100000, 1000000, 10000000]) {
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
      if (secLeaderboard) secLeaderboard.style.display = 'flex';
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
      if (secHistory) secHistory.style.display = 'flex';
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
