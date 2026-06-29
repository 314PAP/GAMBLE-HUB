export class LeaderboardManager {
  constructor(ui) {
    this.ui = ui;
  }

  formatLargeNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(3).replace(/\.?0+$/, '') + ' M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(3).replace(/\.?0+$/, '') + ' K';
    }
    return num.toString();
  }

  wrapEmoji(text) {
    return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u2600-\u26FF]|\u203C|\u2049|[\u2000-\u206F]/gu, '<span class="emoji-icon">$&\u200d</span>');
  }

  async render() {
    const container = document.getElementById("leaderboard-content");
    if (!container) return;
    container.innerHTML = `<span class="text-[#ffd700] text-lg italic" aria-hidden="true">🔄 Načítám žebříček...</span>`;

    try {
      const scores = await this.ui.api.getGlobalLeaderboard();
      const isOnline = this.ui.api.isOnline;

      if (scores.length === 0) {
        container.innerHTML = `<span class="text-[#ffd700] text-[13px]">Zatím žádné rekordy...</span>`;
        return;
      }

      const badge = isOnline
        ? `<span class="text-[10px] text-[#00ff99] bg-[#00ff99]/10 px-1.5 py-0.5 rounded-full ml-2" aria-hidden="true">🌐 Online</span>`
        : `<span class="text-[10px] text-[#ffd700] bg-[#ffd700]/5 border border-[#ffd700]/10 px-1.5 py-0.5 rounded-full ml-2" aria-hidden="true">💾 Lokální</span>`;

      const titleEl = document.querySelector(
        "#screen-login .leaderboard-badge",
      );
      if (titleEl) titleEl.innerHTML = badge;

      let html = "";
      const medals = ["🥇", "🥈", "🥉"];
      scores.slice(0, 5).forEach((record, idx) => {
        const medal = medals[idx] || `#${idx + 1}`;
        html += `
            <div class="px-3 py-2 my-0.5 flex justify-between items-center">
              <div class="flex items-center gap-2">
                <span class="font-bold text-[var(--neon-gold)] text-lg w-6" style="text-shadow: 0 0 5px var(--neon-gold-glow);">${medal}</span>
                <span class="scoreboard-name text-[var(--neon-gold)] font-semibold text-lg" style="flex: 1;">${this.wrapEmoji(record.jmeno)}</span>
              </div>
              <span class="font-bold text-[var(--neon-green)] text-lg" style="text-shadow: 0 0 5px var(--neon-green-glow);"><span class="score-display">${this.formatLargeNumber(record.castka)}<svg class="coin-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="url(#goldGradient)"/><text x="12" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#1a1a2e">$</text></svg></span></span>
            </div>
          `;
      });
      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = `<span class="text-[var(--neon-pink)] text-[13px]" style="text-shadow: 0 0 5px var(--neon-pink-glow);">Nepodařilo se načíst žebříček.</span>`;
    }
  }

  renderExplorer(filteredData = null) {
    const list = document.getElementById("explorer-leaderboard-list");
    if (!list) return;
    const data = filteredData || this.ui.leaderboardData;
    if (data.length === 0) {
      list.innerHTML = `<span class="text-[var(--neon-pink)] text-xs italic p-4 text-center block" style="text-shadow: 0 0 5px var(--neon-pink-glow);">Žádní hráči nenalezeni</span>`;
      return;
    }

    let html = "";
    const medals = ["🥇", "🥈", "🥉"];
    data.forEach((record, idx) => {
      const originalIdx = this.ui.leaderboardData.findIndex(
        (r) => r.jmeno === record.jmeno,
      );
      const medal = medals[originalIdx] || `#${originalIdx + 1}`;

      html += `
        <div role="listitem" style="padding: 8px 18px; margin: 4px 0; display: flex; justify-content: space-between; align-items: center;">
          <div class="flex items-center gap-2">
            <span class="font-bold text-[var(--neon-gold)] w-6" style="text-shadow: 0 0 5px var(--neon-gold-glow);">${medal}</span>
            <span class="scoreboard-name text-[var(--neon-gold)] font-semibold" style="flex: 1;">${this.wrapEmoji(record.jmeno)}</span>
          </div>
          <span class="font-bold text-[var(--neon-green)]" style="text-shadow: 0 0 5px var(--neon-green-glow);"><span class="score-display">${record.castka}<svg class="coin-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="url(#goldGradient)"/><text x="12" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#1a1a2e">$</text></svg></span></span>
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
    const filtered = this.ui.leaderboardData.filter((r) =>
      r.jmeno.toLowerCase().includes(query),
    );
    this.renderExplorer(filtered);
  }
}