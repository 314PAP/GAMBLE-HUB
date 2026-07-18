import { formatLargeNumber } from '../utils.js';

export class LeaderboardManager {
  constructor(ui) {
    this.ui = ui;
  }

  formatLargeNumber(num) {
    return formatLargeNumber(num);
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
        container.innerHTML = `<span class="text-[var(--neon-gold)] text-[13px] text-glow-gold">Zatím žádné rekordy...</span>`;
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
            <div class="py-1 my-0 flex justify-between items-center gap-2">
              <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <span class="font-bold text-[var(--neon-gold)] text-[clamp(11px,3.8vw,18px)] w-[clamp(14px,4.5vw,22px)] shrink-0 text-glow-gold text-center">${medal}</span>
                <span class="scoreboard-name text-[var(--neon-gold)] font-semibold !text-[clamp(11px,3.8vw,18px)] flex-1 min-w-0 truncate">${this.wrapEmoji(record.jmeno)}</span>
              </div>
              <span class="score-display inline-flex items-center gap-1 font-bold text-[var(--neon-green)] text-[clamp(11px,3.8vw,18px)] text-glow-green shrink-0">${this.formatLargeNumber(record.castka)}<svg class="coin-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="url(#goldGradient)"/><text x="12" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#1a1a2e">$</text></svg></span>
            </div>
          `;
      });
      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = `<span class="text-[var(--neon-pink)] text-[13px] text-glow-pink">Nepodařilo se načíst žebříček.</span>`;
    }
  }

  renderExplorer(filteredData = null) {
    const list = document.getElementById("explorer-leaderboard-list");
    if (!list) return;
    const data = filteredData || this.ui.leaderboardData;
    if (data.length === 0) {
      list.innerHTML = `<span class="text-[var(--neon-pink)] text-xs italic p-4 text-center block text-glow-pink">Žádní hráči nenalezeni</span>`;
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
        <div role="listitem" class="py-1 my-0 flex justify-between items-center gap-2 border-b border-[rgba(255,255,255,0.03)] last:border-b-0">
          <div class="flex items-center gap-1.5 min-w-0 flex-1">
            <span class="font-bold text-[var(--neon-gold)] text-[clamp(11px,3.8vw,16px)] w-[clamp(14px,4.5vw,22px)] shrink-0 text-glow-gold text-center">${medal}</span>
            <span class="scoreboard-name text-[var(--neon-gold)] font-semibold !text-[clamp(11px,3.8vw,16px)] flex-1 min-w-0 truncate">${this.wrapEmoji(record.jmeno)}</span>
          </div>
          <span class="score-display inline-flex items-center gap-1 font-bold text-[var(--neon-green)] text-[clamp(11px,3.8vw,16px)] text-glow-green shrink-0">${this.formatLargeNumber(record.castka)}<svg class="coin-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="url(#goldGradient)"/><text x="12" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#1a1a2e">$</text></svg></span>
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