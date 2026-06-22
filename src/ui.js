import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import Chart from 'chart.js/auto';
import { animateScreenIn } from './animations/ui.js';

export class GameUI {
  constructor(db, api) {
    this.db = db;
    this.api = api;
    this.activeScreen = 'screen-login';
    this.statsChartInstance = null;
    this.leaderboardData = [];
    this.historyData = [];
    this.activeExplorerTab = 'leaderboard';
    this.historySortField = 'timestamp';
    this.historySortAsc = false;
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

  // Renders the leaderboard (Top 5 players) – async, fetches from Firebase if available
  async renderLeaderboard() {
    const container = document.getElementById('leaderboard-content');
    if (!container) return;

    // Loading stav
    container.innerHTML = `<span class="text-[#ffd700] text-xs italic">🔄 Načítám žebříček...</span>`;

    try {
      const scores = await this.api.getGlobalLeaderboard();
      const isOnline = this.api.isOnline;

      if (scores.length === 0) {
        container.innerHTML = `<span class="text-[#ffd700] text-[13px]">Zatím žádné rekordy...</span>`;
        return;
      }

      const badge = isOnline
          ? `<span class="text-[10px] text-[#00ff99] bg-[#00ff99]/10 border border-[#00ff99]/30 px-1.5 py-0.5 rounded-full ml-2">🌐 Online</span>`
          : `<span class="text-[10px] text-[#ffd700] bg-[#ffd700]/5 border border-[#ffd700]/10 px-1.5 py-0.5 rounded-full ml-2">💾 Lokální</span>`;

      // Update leaderboard title to show online/offline status
      const titleEl = document.querySelector('#screen-login .leaderboard-badge');
      if (titleEl) titleEl.innerHTML = badge;

      let html = '';
      const medals = ['🥇', '🥈', '🥉'];
      scores.slice(0, 5).forEach((record, idx) => {
        const medal = medals[idx] || `#${idx + 1}`;
        html += `
          <div class="leaderboard-item flex justify-between items-center py-2 px-1 text-sm">
            <span class="font-bold text-[var(--neon-gold)] w-6 text-center" style="text-shadow: 0 0 5px var(--neon-gold-glow);">${medal}</span>
            <span class="flex-grow pl-3 font-semibold" style="color: var(--neon-gold); text-shadow: 0 0 5px var(--neon-gold-glow);">${record.jmeno}</span>
            <span class="font-bold text-[var(--neon-green)]" style="text-shadow: 0 0 5px var(--neon-green-glow);">${record.castka} Kč</span>
          </div>
        `;
      });
      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = `<span class="text-[var(--neon-pink)] text-[13px]" style="text-shadow: 0 0 5px var(--neon-pink-glow);">Nepodařilo se načíst žebříček.</span>`;
    }
  }

  // Renders the list of accounts with custom selection and delete handlers
  renderAccounts(onSelect, onDelete) {
    const list = document.getElementById('users-list');
    if (!list) return;
    
    list.innerHTML = '';
    const players = this.db.getPlayers();
    const usernames = Object.keys(players);

    if (usernames.length === 0) {
      list.innerHTML = `<div class="text-center text-muted" style="padding:20px;">Žádní vytvoření hráči.</div>`;
      return;
    }

    usernames.forEach(username => {
      const balance = players[username];
      const row = document.createElement('div');
      row.className = 'flex items-center gap-2 animate-[slideIn_0.2s_ease-out]';
      row.style.background = 'rgba(0,0,0,0.5)';
      row.style.border = '2px solid var(--neon-purple)';
      row.style.borderRadius = '12px';
      row.style.padding = '4px';
      row.style.marginBottom = '4px';

      const selectBtn = document.createElement('button');
      selectBtn.className = 'btn account-btn';
      selectBtn.innerHTML = `<span class="account-name font-semibold" style="color: var(--neon-gold); text-shadow: 0 0 5px var(--neon-gold-glow);">${username}</span> <span class="ml-auto" style="color: var(--neon-green); text-shadow: 0 0 5px var(--neon-green-glow);">${balance} Kč</span>`;
      selectBtn.onclick = () => onSelect(username);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'w-[50px] min-w-[50px] h-[50px] bg-[#ff0055]/15 border border-[#ff0055]/30 text-[#ff0055] p-0 rounded-xl flex items-center justify-center transition-colors hover:bg-[#ff0055] hover:text-white hover:border-[#ff0055]';
      deleteBtn.innerHTML = '<span class="text-[20px]">🗑️</span>';      
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        
        Swal.fire({
          title: 'Smazat účet?',
          text: `Opravdu chcete permanentně smazat hráče ${username}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ff0055',
          cancelButtonColor: '#ffd700',
          confirmButtonText: 'Ano, smazat',
          cancelButtonText: 'Zrušit',
          background: '#12121c',
          color: '#f8fafc'
        }).then((result) => {
          if (result.isConfirmed) {
            onDelete(username);
          }
        });
      };

      row.appendChild(selectBtn);
      row.appendChild(deleteBtn);
      list.appendChild(row);
    });
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

  // Opens player statistics modal, renders the win/loss chart and recent history
  openStatsModal(username) {
    const stats = this.db.getStats(username);
    const totalMatches = stats.vyhry + stats.prohry;
    const winRate = totalMatches > 0 ? ((stats.vyhry / totalMatches) * 100).toFixed(1) : 0;

    const statsModal = document.getElementById('stats-modal');
    if (!statsModal) return;

    // Render Stats Text
    const statsContainer = document.getElementById('modal-stats-data');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="flex-row-center" style="margin-bottom: 6px;">
          <span>👤 Hráč:</span> <strong>${username}</strong>
        </div>
        <div class="flex-row-center" style="margin-bottom: 6px;">
          <span>🔄 Odehraných her:</span> <strong>${totalMatches}</strong>
        </div>
        <div class="flex-row-center" style="margin-bottom: 6px;">
          <span>📈 Úspěšnost:</span> <strong style="color:var(--neon-orange)">${winRate}%</strong>
        </div>
      `;
    }

    // Render History
    const historyContainer = document.getElementById('modal-history-data');
    if (historyContainer) {
      historyContainer.innerHTML = '';
      if (stats.historie.length === 0) {
        historyContainer.innerHTML = `<div class="text-center text-muted" style="padding:10px;">Žádná odehraná kola.</div>`;
      } else {
        stats.historie.forEach(item => {
          const isWin = item.includes('VÝHRA');
          // Support new " – " format and old "-" format for backwards compat
          const sep = item.includes(' – ') ? ' – ' : '-';
          const parts = item.split(sep);
          let gamePart   = (parts[0] || '').trim();
          const statusPart = (parts[1] || '').trim();

          // Clean up old "S:" prefix and format in history
          gamePart = gamePart
            .replace(/\(S:\s*(\d+)\s*(kč|Kč)?\)/gi, '($1 Kč)')
            .replace(/\((\d+)\s*kč\)/gi, '($1 Kč)');

          const div = document.createElement('div');
          div.className = `history-item ${isWin ? 'win' : 'loss'}`;
          div.innerHTML = `
            <span>🎮 ${gamePart}</span>
            <strong>${statusPart}</strong>
          `;
          historyContainer.appendChild(div);
        });
      }
    }

    // Show modal
    statsModal.style.display = 'flex';

    // Render Chart using Chart.js
    setTimeout(() => {
      this.renderStatsChart(stats.vyhry, stats.prohry);
    }, 100);
  }

  closeStatsModal() {
    const statsModal = document.getElementById('stats-modal');
    if (statsModal) {
      statsModal.style.display = 'none';
    }
  }

  // Renders the doughnut chart showing wins vs losses
  renderStatsChart(wins, losses) {
    const canvas = document.getElementById('stats-chart');
    if (!canvas) return;

    // Destroy existing chart to prevent garbage canvas overlay
    if (this.statsChartInstance) {
      this.statsChartInstance.destroy();
    }

    // If zero games played, show placeholder data so chart doesn't look empty
    const hasData = (wins + losses) > 0;
    const chartData = hasData ? [wins, losses] : [1, 1];
    const chartColors = hasData 
      ? ['#2ec4b6', '#ff0055'] // Green (wins), Pink (losses)
      : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)'];

    this.statsChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: hasData ? ['Výhry', 'Prohry'] : ['Žádná data', ''],
        datasets: [{
          data: chartData,
          backgroundColor: chartColors,
          borderColor: '#12121c',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: hasData,
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: {
                family: 'Outfit',
                size: 11
              }
            }
          },
          tooltip: {
            enabled: hasData
          }
        },
        cutout: '70%'
      }
    });
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
    
    // If it's already open, close it
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

  // Open the Global History & Leaderboard Explorer modal
  async openExplorer() {
    const modal = document.getElementById('explorer-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    // Reset search inputs and filters
    const searchL = document.getElementById('leaderboard-search');
    if (searchL) searchL.value = '';
    const searchH = document.getElementById('history-search');
    if (searchH) searchH.value = '';
    const filterG = document.getElementById('history-filter-game');
    if (filterG) filterG.value = '';
    const filterR = document.getElementById('history-filter-result');
    if (filterR) filterR.value = '';

    // Set default tab
    this.prepniExplorerTab('leaderboard');

    // Show loading
    const listL = document.getElementById('explorer-leaderboard-list');
    if (listL) listL.innerHTML = `<span class="text-[#ffd700] text-xs italic p-4 text-center block">🔄 Načítám žebříček...</span>`;
    const listH = document.getElementById('explorer-history-list');
    if (listH) listH.innerHTML = `<span class="text-[#ffd700] text-xs italic p-4 text-center block">🔄 Načítám historii...</span>`;

    try {
      // Fetch both datasets concurrently
      const [leaderboard, history] = await Promise.all([
        this.api.getGlobalLeaderboard(),
        this.api.getGlobalMatches()
      ]);

      this.leaderboardData = leaderboard;
      this.historyData = history;

      this.renderExplorerLeaderboard();
      this.renderExplorerHistory();
    } catch (e) {
      console.error("Failed to load explorer data", e);
      if (listL) listL.innerHTML = `<span class="text-[#ff0055] text-xs p-4 text-center block">Chyba při načítání dat</span>`;
      if (listH) listH.innerHTML = `<span class="text-[#ff0055] text-xs p-4 text-center block">Chyba při načítání dat</span>`;
    }
  }

  closeExplorer() {
    const modal = document.getElementById('explorer-modal');
    if (modal) modal.style.display = 'none';
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
    const list = document.getElementById('explorer-leaderboard-list');
    if (!list) return;

    const data = filteredData || this.leaderboardData;
    if (data.length === 0) {
      list.innerHTML = `<span class="text-[var(--neon-pink)] text-xs italic p-4 text-center block" style="text-shadow: 0 0 5px var(--neon-pink-glow);">Žádní hráči nenalezeni</span>`;
      return;
    }

    let html = '';
    const medals = ['🥇', '🥈', '🥉'];
    data.forEach((record, idx) => {
      // Find overall index from original data for correct medal/ranking
      const originalIdx = this.leaderboardData.findIndex(r => r.jmeno === record.jmeno);
      const medal = medals[originalIdx] || `#${originalIdx + 1}`;

      html += `
        <div class="flex justify-between items-center py-2.5 px-3 bg-[rgba(13,0,26,0.7)] border border-[rgba(189,0,255,0.25)] rounded-xl text-sm transition-all hover:bg-[rgba(189,0,255,0.15)]">
          <span class="font-bold text-[var(--neon-gold)] w-6 text-center" style="text-shadow: 0 0 5px var(--neon-gold-glow);">${medal}</span>
          <span class="flex-grow pl-3 text-[var(--neon-gold)] font-semibold" style="text-shadow: 0 0 5px var(--neon-gold-glow);">${record.jmeno}</span>
          <span class="font-bold text-[var(--neon-green)]" style="text-shadow: 0 0 5px var(--neon-green-glow);">${record.castka} Kč</span>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  renderExplorerHistory(filteredData = null) {
    const list = document.getElementById('explorer-history-list');
    if (!list) return;

    const data = filteredData || this.historyData;
    if (data.length === 0) {
      list.innerHTML = `<span class="text-[var(--neon-gold)] text-xs italic p-4 text-center block" style="text-shadow: 0 0 5px var(--neon-gold-glow);">Žádná historie her nenalezena</span>`;
      return;
    }

    let html = '';
    data.forEach(item => {
      const isWin = item.isWin;
      const winVal = item.winAmount;
      const formattedWin = winVal > 0 ? `+${winVal} Kč` : `${winVal} Kč`;
      const timeString = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : '';

      // Map internal game code to user-friendly label
      let gameLabel = item.gameName;
      if (item.gameName === 'Bary3x3') gameLabel = 'Automat';
      else if (item.gameName === 'VíceMéně') gameLabel = 'Hi-Lo';

      html += `
        <div class="flex justify-between items-center py-2 px-3 bg-[rgba(13,0,26,0.7)] border-l-4 ${isWin ? 'border-l-[var(--neon-green)]' : 'border-l-[var(--neon-pink)]'} border border-[rgba(189,0,255,0.25)] rounded-r-xl text-xs">
          <div class="flex flex-col gap-0.5">
            <span class="font-semibold text-[var(--neon-gold)]" style="text-shadow: 0 0 5px var(--neon-gold-glow);">${item.username}</span>
            <span class="text-[10px] text-[var(--text-secondary)]">${gameLabel} – ${timeString}</span>
          </div>
          <div class="flex flex-col items-end gap-0.5">
            <span class="font-bold ${isWin ? 'text-[var(--neon-green)]' : 'text-[var(--neon-pink)]'}" style="text-shadow: 0 0 5px ${isWin ? 'var(--neon-green-glow)' : 'var(--neon-pink-glow)'};">${formattedWin}</span>
            <span class="text-[10px] text-[var(--neon-gold)] opacity-75">${item.resultText || ''}</span>
          </div>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  filtrujLeaderboard() {
    const searchVal = (document.getElementById('leaderboard-search')?.value || '').trim().toLowerCase();
    if (!searchVal) {
      this.renderExplorerLeaderboard();
      return;
    }

    const filtered = this.leaderboardData.filter(r => r.jmeno.toLowerCase().includes(searchVal));
    this.renderExplorerLeaderboard(filtered);
  }

  filtrujHistorii() {
    const searchVal = (document.getElementById('history-search')?.value || '').trim().toLowerCase();
    const gameVal = document.getElementById('history-filter-game')?.value || '';
    const resultVal = document.getElementById('history-filter-result')?.value || '';

    let filtered = [...this.historyData];

    // Filter by name
    if (searchVal) {
      filtered = filtered.filter(item => item.username.toLowerCase().includes(searchVal));
    }

    // Filter by game
    if (gameVal) {
      filtered = filtered.filter(item => item.gameName === gameVal);
    }

    // Filter by result
    if (resultVal) {
      if (resultVal === 'win') {
        filtered = filtered.filter(item => item.isWin);
      } else {
        filtered = filtered.filter(item => !item.isWin);
      }
    }

    // Sort the filtered results based on current sorting selection
    this.sortHistoryData(filtered);
    this.renderExplorerHistory(filtered);
  }

  seradHistorii(columnName) {
    if (this.historySortField === columnName) {
      this.historySortAsc = !this.historySortAsc;
    } else {
      this.historySortField = columnName;
      this.historySortAsc = false;
    }
    this.filtrujHistorii();
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

const GAME_INFOS = {
  1: {
    title: "Hádanka 1-10",
    html: `
      <p>Vyberte si libovolné číslo v rozmezí <strong>1 až 10</strong> a vsaďte si.</p>
      <ul>
        <li><strong>Cíl hry:</strong> Uhodnout náhodně vylosované číslo.</li>
        <li><strong>Výhra:</strong> <strong>10násobek (10x)</strong> vsazené částky.</li>
      </ul>
    `
  },
  2: {
    title: "Hádanka 1-5",
    html: `
      <p>Vyberte si libovolné číslo v rozmezí <strong>1 až 5</strong> a vsaďte si.</p>
      <ul>
        <li><strong>Cíl hry:</strong> Uhodnout náhodně vylosované číslo.</li>
        <li><strong>Výhra:</strong> <strong>5násobek (5x)</strong> vsazené částky.</li>
      </ul>
    `
  },
  3: {
    title: "Kostka 1-6",
    html: `
      <p>Vyberte si libovolné číslo v rozmezí <strong>1 až 6</strong> a vsaďte si.</p>
      <ul>
        <li><strong>Cíl hry:</strong> Uhodnout hozené číslo na hrací kostce.</li>
        <li><strong>Výhra:</strong> <strong>6násobek (6x)</strong> vsazené částky.</li>
      </ul>
    `
  },
  4: {
    title: "Ruleta 0-36",
    html: `
      <p>Vyberte si libovolné číslo v rozmezí <strong>0 až 36</strong> na hracím poli a vsaďte si.</p>
      <ul>
        <li><strong>Cíl hry:</strong> Uhodnout vylosované číslo.</li>
        <li><strong>Výhra:</strong> <strong>36násobek (36x)</strong> vsazené částky.</li>
      </ul>
    `
  },
  5: {
    title: "Automat Bary 3x3",
    html: `
      <p>Tříválcový výherní automat s 3 viditelnými symboly na každém válci a <strong>5 výherními liniemi</strong> (3 horizontální, 2 diagonální).</p>
      <ul>
        <li><strong>Jak hrát:</strong> Nastavte sázku a stiskněte <strong>SPIN</strong>, případně zapněte režim <strong>AUTO</strong>.</li>
        <li><strong>Cíl hry:</strong> Získat 3 stejné symboly v jakékoli výherní linii.</li>
        <li><strong>Výplatní tabulka (násobiče):</strong></li>
      </ul>
      <style>
.number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
  gap: 8px;
  margin: 12px 0;
  max-height: 190px;
  overflow-y: auto;
  padding: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1.5px solid var(--neon-gold);
}

@media (max-width: 480px) {
  .number-grid {
    grid-template-columns: repeat(auto-fit, minmax(25px, 1fr));
    font-size: 12px;
  }
}
</style>
      <table style="width:100%; border-collapse: collapse; margin-top:8px; font-size:13px;">
        <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
          <th style="text-align:left; padding:4px;">Symbol</th>
          <th style="text-align:right; padding:4px;">Výhra</th>
        </tr>
        <tr><td style="padding:4px;">🍒 Třešeň</td><td style="text-align:right; padding:4px; color:var(--neon-green)">2x sázka</td></tr>
        <tr><td style="padding:4px;">🛎 Zvonek</td><td style="text-align:right; padding:4px; color:var(--neon-green)">5x sázka</td></tr>
        <tr><td style="padding:4px;">🍋 Citron</td><td style="text-align:right; padding:4px; color:var(--neon-green)">8x sázka</td></tr>
        <tr><td style="padding:4px;">⭐ Hvězda</td><td style="text-align:right; padding:4px; color:var(--neon-green)">15x sázka</td></tr>
        <tr><td style="padding:4px;">💎 Diamant</td><td style="text-align:right; padding:4px; color:var(--neon-green)">30x sázka</td></tr>
        <tr style="font-weight:bold; color:var(--neon-gold);"><td style="padding:4px;">7️⃣ Sedmička</td><td style="text-align:right; padding:4px;">100x sázka (JACKPOT)</td></tr>
      </table>
    `
  },
  6: {
    title: "Více / Méně (Hi-Lo)",
    html: `
      <p>Karetní hra, ve které odhadujete hodnotu další karty. Hraje se s kartami s hodnotami <strong>od 1 do 10</strong>.</p>
      <ul>
        <li><strong>Začátek hry:</strong> Na začátku je vygenerována počáteční karta v rozmezí 2 až 9.</li>
        <li><strong>Jak hrát:</strong> Tipněte si, zda bude další karta <strong>VYŠŠÍ ▲</strong> nebo <strong>NIŽŠÍ ▼</strong> než ta aktuální.</li>
        <li><strong>Při shodě (stejná karta):</strong> Pokud má nová karta stejnou hodnotu, máte 50% šanci na výhru.</li>
        <li><strong>Výhra:</strong> <strong>2násobek (2x)</strong> vsazené částky při správném odhadu.</li>
      </ul>
    `
  }
};
