export class StatsManager {
  constructor(ui) {
    this.ui = ui;
    this.chartInstance = null;
  }

  open(username) {
    const stats = this.ui.db.getStats(username);
    const totalMatches = stats.vyhry + stats.prohry;
    const winRate = totalMatches > 0 ? ((stats.vyhry / totalMatches) * 100).toFixed(1) : 0;

    const statsModal = document.getElementById('stats-modal');
    if (!statsModal) return;

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

    const historyContainer = document.getElementById('modal-history-data');
    if (historyContainer) {
      historyContainer.innerHTML = '';
      if (stats.historie.length === 0) {
        historyContainer.innerHTML = `<div class="text-center text-muted" style="padding:10px;">Žádná odehraná kola.</div>`;
      } else {
        stats.historie.forEach(item => {
          const isWin = item.includes('VÝHRA');
          const sep = item.includes(' – ') ? ' – ' : '-';
          const parts = item.split(sep);
          let gamePart = (parts[0] || '').trim();
          const statusPart = (parts[1] || '').trim();
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

    statsModal.style.display = 'flex';
    setTimeout(() => this.renderChart(stats.vyhry, stats.prohry), 100);
  }

  close() {
    const statsModal = document.getElementById('stats-modal');
    if (statsModal) statsModal.style.display = 'none';
  }

  renderChart(wins, losses) {
    const canvas = document.getElementById('stats-chart');
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const hasData = (wins + losses) > 0;
    const chartData = hasData ? [wins, losses] : [1, 1];
    const chartColors = hasData
      ? ['#2ec4b6', '#ff0055']
      : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)'];

    this.chartInstance = new Chart(canvas, {
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
              font: { family: 'Outfit', size: 11 }
            }
          },
          tooltip: { enabled: hasData }
        },
        cutout: '70%'
      }
    });
  }
}
