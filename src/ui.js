import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import Chart from 'chart.js/auto';

export class GameUI {
  constructor(db) {
    this.db = db;
    this.activeScreen = 'screen-login';
    this.statsChartInstance = null;
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
    }
  }

  // Resets number buttons grid state
  resetNumberButtons() {
    const btns = document.querySelectorAll('.btn-num');
    btns.forEach(btn => {
      btn.classList.remove('selected', 'winning');
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
      icon: type, // 'success', 'error', 'warning', 'info'
      title: title,
      text: text,
      background: '#12121c',
      color: '#f8fafc',
      confirmButtonColor: '#ff9f1c',
      customClass: {
        popup: 'swal-custom-popup'
      }
    });
  }

  // Renders the leaderboard (Top 5 players) on login screen
  renderLeaderboard() {
    const container = document.getElementById('leaderboard-content');
    if (!container) return;

    const scores = this.db.getLeaderboard();
    if (scores.length === 0) {
      container.innerHTML = `<span style="color:#64748b; font-size:13px;">Zatím žádné rekordy...</span>`;
      return;
    }

    let html = '';
    scores.slice(0, 5).forEach((record, idx) => {
      html += `
        <div class="flex justify-between items-center py-2 px-1 border-b border-white/5 text-sm last:border-b-0">
          <span class="font-bold text-[#94a3b8]">#${idx + 1}</span>
          <span class="flex-grow pl-3 text-white">${record.jmeno}</span>
          <span class="font-bold text-[#00ff99]">${record.castka} Kč</span>
        </div>
      `;
    });
    container.innerHTML = html;
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

      const selectBtn = document.createElement('button');
      selectBtn.className = 'btn flex-1 text-left justify-start pl-4';
      selectBtn.innerHTML = `<span style="color:var(--text-secondary)">👤</span> <span style="font-weight:600">${username}</span> <span style="margin-left:auto; color:var(--neon-green)">${balance} Kč</span>`;
      selectBtn.onclick = () => onSelect(username);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'w-[50px] min-w-[50px] h-[50px] bg-[#ff0055]/15 border border-[#ff0055]/30 text-[#ff0055] p-0 rounded-xl flex items-center justify-center transition-colors hover:bg-[#ff0055] hover:text-white hover:border-[#ff0055]';
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        
        Swal.fire({
          title: 'Smazat účet?',
          text: `Opravdu chcete permanentně smazat hráče ${username}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ff0055',
          cancelButtonColor: '#475569',
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
  border: 1px solid rgba(255, 255, 255, 0.03);
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
