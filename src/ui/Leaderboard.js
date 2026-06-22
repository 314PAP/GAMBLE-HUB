export class LeaderboardManager {
  constructor(ui) {
    this.ui = ui;
  }

  async render() {
    const container = document.getElementById('leaderboard-content');
    if (!container) return;
    container.innerHTML = `<span class="text-[#ffd700] text-xs italic">🔄 Načítám žebříček...</span>`;

    try {
      const scores = await this.ui.api.getGlobalLeaderboard();
      const isOnline = this.ui.api.isOnline;

      if (scores.length === 0) {
        container.innerHTML = `<span class="text-[#ffd700] text-[13px]">Zatím žádné rekordy...</span>`;
        return;
      }

      const badge = isOnline
          ? `<span class="text-[10px] text-[#00ff99] bg-[#00ff99]/10 border border-[#00ff99]/30 px-1.5 py-0.5 rounded-full ml-2">🌐 Online</span>`
          : `<span class="text-[10px] text-[#ffd700] bg-[#ffd700]/5 border border-[#ffd700]/10 px-1.5 py-0.5 rounded-full ml-2">💾 Lokální</span>`;

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

  renderExplorer(filteredData = null) {
    const list = document.getElementById('explorer-leaderboard-list');
    if (!list) return;
    const data = filteredData || this.ui.leaderboardData;
    if (data.length === 0) {
      list.innerHTML = `<span class="text-[var(--neon-pink)] text-xs italic p-4 text-center block" style="text-shadow: 0 0 5px var(--neon-pink-glow);">Žádní hráči nenalezeni</span>`;
      return;
    }

    let html = '';
    const medals = ['🥇', '🥈', '🥉'];
    data.forEach((record, idx) => {
      const originalIdx = this.ui.leaderboardData.findIndex(r => r.jmeno === record.jmeno);
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

  filter(query) {
    if (!query) {
      this.renderExplorer();
      return;
    }
    const filtered = this.ui.leaderboardData.filter(r => r.jmeno.toLowerCase().includes(query));
    this.renderExplorer(filtered);
  }
}
