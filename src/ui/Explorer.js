export class ExplorerManager {
  constructor(ui) {
    this.ui = ui;
  }

  async load() {
    const modal = document.getElementById('explorer-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    const searchL = document.getElementById('leaderboard-search');
    if (searchL) searchL.value = '';
    const searchH = document.getElementById('history-search');
    if (searchH) searchH.value = '';
    const filterG = document.getElementById('history-filter-game');
    if (filterG) filterG.value = '';
    const filterR = document.getElementById('history-filter-result');
    if (filterR) filterR.value = '';

    this.ui.prepniExplorerTab('leaderboard');

    const listL = document.getElementById('explorer-leaderboard-list');
    if (listL) listL.innerHTML = `<span class="text-[#ffd700] text-xs italic p-4 text-center block">🔄 Načítám žebříček...</span>`;
    const listH = document.getElementById('explorer-history-list');
    if (listH) listH.innerHTML = `<span class="text-[#ffd700] text-xs italic p-4 text-center block">🔄 Načítám historii...</span>`;

    try {
      const [leaderboard, history] = await Promise.all([
        this.ui.api.getGlobalLeaderboard(),
        this.ui.api.getGlobalMatches()
      ]);

      this.ui.leaderboardData = leaderboard;
      this.ui.historyData = history;
      this.ui.leaderboard.renderExplorer();
      this.renderHistory();
    } catch (e) {
      console.error("Failed to load explorer data", e);
      if (listL) listL.innerHTML = `<span class="text-[#ff0055] text-xs p-4 text-center block">Chyba při načítání dat</span>`;
      if (listH) listH.innerHTML = `<span class="text-[#ff0055] text-xs p-4 text-center block">Chyba při načítání dat</span>`;
    }
  }

  close() {
    const modal = document.getElementById('explorer-modal');
    if (modal) modal.style.display = 'none';
  }

  renderHistory(filteredData = null) {
    const list = document.getElementById('explorer-history-list');
    if (!list) return;
    const data = filteredData || this.ui.historyData;
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

  filter() {
    const searchVal = (document.getElementById('history-search')?.value || '').trim().toLowerCase();
    const gameVal = document.getElementById('history-filter-game')?.value || '';
    const resultVal = document.getElementById('history-filter-result')?.value || '';

    let filtered = [...this.ui.historyData];

    if (searchVal) {
      filtered = filtered.filter(item => item.username.toLowerCase().includes(searchVal));
    }
    if (gameVal) {
      filtered = filtered.filter(item => item.gameName === gameVal);
    }
    if (resultVal) {
      filtered = filtered.filter(item => resultVal === 'win' ? item.isWin : !item.isWin);
    }

    this.ui.sortHistoryData(filtered);
    this.renderHistory(filtered);
  }

  sort(columnName) {
    if (this.ui.historySortField === columnName) {
      this.ui.historySortAsc = !this.ui.historySortAsc;
    } else {
      this.ui.historySortField = columnName;
      this.ui.historySortAsc = false;
    }
    this.filter();
  }
}
