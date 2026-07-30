import { formatLargeNumber, COIN_SVG, escapeHtml, wrapEmoji } from "../utils.js";

export class LeaderboardManager {
  constructor(ui) {
    this.ui = ui;
  }

  async render() {
    const container = document.getElementById("leaderboard-content");
    if (!container) return;
    if (import.meta.env.DEV) console.debug('[Leaderboard] render() called, isOnline=', this.ui.api.isOnline);
    container.innerHTML = `<span class="text-neon-gold text-lg italic" aria-hidden="true">🔄 Načítám žebříček...</span>`;

    try {
      const scores = await this.ui.api.getGlobalLeaderboard();
      if (import.meta.env.DEV) console.debug('[Leaderboard] scores length=', scores.length);
      const isOnline = this.ui.api.isOnline;

      if (scores.length === 0) {
        container.innerHTML = `<span class="text-neon-gold text-[13px] text-glow-gold">Zatím žádné rekordy...</span>`;
        return;
      }

      const badge = isOnline
        ? `<span class="text-[10px] text-[#00ff99] bg-[#00ff99]/10 px-1.5 py-0.5 rounded-full ml-2" aria-hidden="true">🌐 Online</span>`
        : `<span class="text-[10px] text-neon-gold bg-neon-gold/5 border border-neon-gold/10 px-1.5 py-0.5 rounded-full ml-2" aria-hidden="true">💾 Lokální</span>`;

      const titleEl = document.querySelector("#screen-login .leaderboard-badge");
      if (titleEl) titleEl.innerHTML = badge;

      let html = "";
      const medals = ["🥇", "🥈", "🥉"];
      scores.slice(0, 5).forEach((record, idx) => {
        const medal = medals[idx] || `#${idx + 1}`;
        html += `
            <div class="py-1 my-0 flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="font-bold text-neon-gold text-[clamp(11px,3.8vw,18px)] w-[clamp(18px,5vw,25px)] shrink-0 text-glow-gold text-center">${medal}</span>
                <span class="scoreboard-name text-neon-gold font-semibold !text-[clamp(11px,3.8vw,18px)] flex-1 min-w-0 truncate">${wrapEmoji(escapeHtml(record.jmeno))}</span>
              </div>
              <span class="score-display inline-flex items-center gap-1 font-bold text-neon-green text-[clamp(11px,3.8vw,18px)] text-glow-green shrink-0">${formatLargeNumber(record.castka)}${COIN_SVG}</span>
            </div>
          `;
      });
      container.innerHTML = html;
    } catch {
      container.innerHTML = `<span class="text-neon-pink text-[13px] text-glow-pink">Nepodařilo se načíst žebříček.</span>`;
    }
  }

  renderExplorer(filteredData = null) {
    const list = document.getElementById("explorer-leaderboard-list");
    if (!list) return;
    const data = filteredData || this.ui.leaderboardData;
    if (data.length === 0) {
      list.innerHTML = `<span class="text-neon-pink text-xs italic p-4 text-center block text-glow-pink">Žádní hráči nenalezeni</span>`;
      return;
    }

    let html = "";
    const medals = ["🥇", "🥈", "🥉"];
    data.forEach((record, _idx) => {
      const originalIdx = this.ui.leaderboardData.findIndex((r) => r.jmeno === record.jmeno);
      const medal = medals[originalIdx] || `#${originalIdx + 1}`;

      html += `
        <div role="listitem" class="py-1 my-0 flex justify-between items-center gap-2 border-b border-[rgba(255,255,255,0.03)] last:border-b-0">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="font-bold text-neon-gold text-[clamp(11px,3.8vw,16px)] w-[clamp(18px,5vw,25px)] shrink-0 text-glow-gold text-center">${medal}</span>
             <span class="scoreboard-name text-neon-gold font-semibold !text-[clamp(11px,3.8vw,16px)] flex-1 min-w-0 truncate">${wrapEmoji(escapeHtml(record.jmeno))}</span>
          </div>
          <span class="score-display inline-flex items-center gap-1 font-bold text-neon-green text-[clamp(11px,3.8vw,16px)] text-glow-green shrink-0">${formatLargeNumber(record.castka)}${COIN_SVG}</span>
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
    const filtered = this.ui.leaderboardData.filter((r) => r.jmeno.toLowerCase().includes(query));
    this.renderExplorer(filtered);
  }
}
