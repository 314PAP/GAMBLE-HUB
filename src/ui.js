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
        <div class="leaderboard-row">
          <span class="leaderboard-rank">#${idx + 1}</span>
          <span class="leaderboard-name">${record.jmeno}</span>
          <span class="leaderboard-val">${record.castka} Kč</span>
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
      row.className = 'user-row';

      const selectBtn = document.createElement('button');
      selectBtn.className = 'btn btn-user-select';
      selectBtn.innerHTML = `<span style="color:var(--text-secondary)">👤</span> <span style="font-weight:600">${username}</span> <span style="margin-left:auto; color:var(--neon-green)">${balance} Kč</span>`;
      selectBtn.onclick = () => onSelect(username);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete';
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
          const gamePart   = (parts[0] || '').trim();
          const statusPart = (parts[1] || '').trim();

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
}
