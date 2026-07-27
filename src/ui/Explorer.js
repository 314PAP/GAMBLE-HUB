import { formatLargeNumber, COIN_SVG, escapeHtml, wrapEmoji } from "../utils.js";

const SYMBOL_REVERSE_MAP = {
  Citrony: "🍋",
  Třešně: "🍒",
  třešně: "🍒",
  Třešní: "🍒",
  třešní: "🍒",
  Zvonky: "🔔",
  zvonky: "🔔",
  Švestky: "🍇",
  švestky: "🍇",
  Diamanty: "💎",
  diamanty: "💎",
  Hvězdy: "⭐",
  hvězdy: "⭐",
  777: "7️⃣",
};

const GAME_LABELS = {
  Bary3x3: "Automat",
  VíceMéně: "HI-LOW",
  Ruleta: "Ruleta",
  "Hádanka 1-10": "Hádanka 1-10",
  "Hádanka 1-5": "Hádanka 1-5",
  Kostka: "Kostka",
};

function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export class ExplorerManager {
  constructor(ui) {
    this.ui = ui;
  }

  async load() {
    const modal = document.getElementById("explorer-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const searchL = document.getElementById("leaderboard-search");
    if (searchL) searchL.value = "";

    this.ui.prepniExplorerTab("leaderboard");

    const listL = document.getElementById("explorer-leaderboard-list");
    if (listL)
      listL.innerHTML = `<span class="text-[#ffd700] text-xs italic p-4 text-center block" aria-hidden="true">🔄 Načítám žebříček...</span>`;
    const listH = document.getElementById("explorer-history-list");
    if (listH)
      listH.innerHTML = `<span class="text-[#ffd700] text-xs italic p-4 text-center block" aria-hidden="true">🔄 Načítám historii...</span>`;

    try {
      const [leaderboard, history] = await Promise.all([
        this.ui.api.getGlobalLeaderboard(),
        this.ui.api.getGlobalMatches(),
      ]);

      this.ui.leaderboardData = leaderboard;
      this.ui.historyData = history;
      this.ui.leaderboard.renderExplorer();
      this.renderHistory();
    } catch (e) {
      console.error("Failed to load explorer data", e);
      if (listL)
        listL.innerHTML = `<span class="text-[#ff0055] text-xs p-4 text-center block">Chyba při načítání dat</span>`;
      if (listH)
        listH.innerHTML = `<span class="text-[#ff0055] text-xs p-4 text-center block">Chyba při načítání dat</span>`;
    }
  }

  close() {
    const modal = document.getElementById("explorer-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  renderHistory(filteredData = null) {
    const list = document.getElementById("explorer-history-list");
    if (!list) return;
    const data = filteredData || this.ui.historyData;
    if (data.length === 0) {
      list.innerHTML = `<span class="text-[var(--neon-gold)] text-xs italic p-4 text-center block text-glow-gold">Žádná historie her nenalezena</span>`;
      return;
    }

    const coinSvg = COIN_SVG;

    const rows = data
      .map((item) => {
        const isWin = item.isWin;
        const winVal = item.winAmount || 0;
        const sign = winVal > 0 ? "+" : "";
        const formattedWin = `${sign}${formatLargeNumber(winVal)}`;
        const gameLabel = GAME_LABELS[item.gameName] || item.gameName;

        const winClass = isWin
          ? "text-[var(--neon-green)] text-glow-green"
          : "text-[var(--neon-pink)] text-glow-pink";
        const cleanResult = stripHtml(item.resultText || "");
        const resultTypeClass = isWin ? "text-[var(--neon-green)]" : "text-[var(--neon-pink)]";
        const resultTypeText = isWin ? "Výhra" : "Prohra";

        // Compact Detaily: show count of symbols (×3 7️⃣) not winning line count
        // Extract ×N multiplier and use as prefix, drop line-count prefix
        const compactResult = cleanResult
          ? (() => {
              const parts = cleanResult.split(":")[0].trim();

              // Jackpot: show just the 777 symbol with count
              if (parts.includes("JACKPOT")) {
                return "3× 7️⃣";
              }

              // Match "N× symbol×M" or "N× symbol" (multiplier M on symbols per line)
              const m = parts.match(/\d+×\s+(.+?)(?:×(\d+))?$/);
              if (m) {
                const count = m[2] || "3";
                const symbol = m[1].trim();
                const mapped = SYMBOL_REVERSE_MAP[symbol] || symbol;
                return `${count}× ${mapped}`;
              }
              return parts;
            })()
          : "";
        return `
        <tr class="history-row group border-b border-[rgba(255,255,255,0.06)] last:border-b-0 hover:bg-[rgba(189,0,255,0.1)] transition-colors">
          <td class="px-2 py-1.5 text-[clamp(10px,2vw,12px)] font-semibold text-[var(--neon-gold)] truncate text-center">${wrapEmoji(escapeHtml(item.username))}</td>
          <td class="px-2 py-1.5 text-[clamp(9px,1.5vw,11px)] text-[var(--text-primary)] whitespace-nowrap text-center">${escapeHtml(gameLabel)}</td>
          <td class="px-2 py-1.5 text-[clamp(10px,2vw,12px)] font-bold text-center whitespace-nowrap ${winClass}">
            <span class="inline-flex items-center gap-1.5">${formattedWin}<span class="coin-icon-table w-[1.1em] h-[1.1em] inline-flex items-center flex-shrink-0">${coinSvg}</span></span>
          </td>
          <td class="px-2 py-1.5 text-[clamp(9px,1.5vw,11px)] font-bold text-center whitespace-nowrap ${resultTypeClass}">${resultTypeText}</td>
          <td class="px-2 py-1.5 text-[clamp(10px,2vw,12px)] text-[var(--text-secondary)] font-mono whitespace-nowrap text-center">${isWin ? escapeHtml(compactResult) : "—"}</td>
        </tr>
      `;
      })
      .join("");

    list.innerHTML = `
      <table class="w-full text-[var(--text-primary)] border-collapse explorer-history-table text-[clamp(10px,2vw,12px)]" role="table" aria-label="Historie her">
        <thead>
          <tr class="text-[clamp(9px,1.5vw,11px)] text-[var(--neon-gold)] uppercase font-bold tracking-wider border-b border-[rgba(189,0,255,0.2)]">
            <th class="px-2 py-1.5 text-center w-[20%]">
              <button onclick="seradHistorii('username')" aria-sort="none" class="bg-transparent border-0 p-0 text-[clamp(9px,1.5vw,11px)] text-[var(--neon-gold)] hover:text-[var(--neon-orange)] text-glow-gold cursor-pointer whitespace-nowrap">Hráč ⇅</button>
            </th>
            <th class="px-2 py-1.5 text-center w-[20%]">
              <button onclick="seradHistorii('gameName')" aria-sort="none" class="bg-transparent border-0 p-0 text-[clamp(9px,1.5vw,11px)] text-[var(--neon-gold)] hover:text-[var(--neon-orange)] text-glow-gold cursor-pointer whitespace-nowrap">Hra ⇅</button>
            </th>
            <th class="px-2 py-1.5 text-center w-[20%]">
              <button onclick="seradHistorii('winAmount')" aria-sort="none" class="bg-transparent border-0 p-0 text-[clamp(9px,1.5vw,11px)] text-[var(--neon-gold)] hover:text-[var(--neon-orange)] text-glow-gold cursor-pointer whitespace-nowrap">Výhra ⇅</button>
            </th>
            <th class="px-2 py-1.5 text-center w-[20%]">
              <button onclick="seradHistorii('isWin')" aria-sort="none" class="bg-transparent border-0 p-0 text-[clamp(9px,1.5vw,11px)] text-[var(--neon-gold)] hover:text-[var(--neon-orange)] text-glow-gold cursor-pointer whitespace-nowrap">Typ ⇅</button>
            </th>
            <th class="px-2 py-1.5 text-center w-[20%]">
              <button onclick="seradHistorii('resultText')" aria-sort="none" class="bg-transparent border-0 p-0 text-[clamp(9px,1.5vw,11px)] text-[var(--neon-gold)] hover:text-[var(--neon-orange)] text-glow-gold cursor-pointer whitespace-nowrap">Detaily ⇅</button>
            </th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  sort(columnName) {
    if (this.ui.historySortField === columnName) {
      this.ui.historySortAsc = !this.ui.historySortAsc;
    } else {
      this.ui.historySortField = columnName;
      this.ui.historySortAsc = false;
    }
    this.ui.sortHistoryData(this.ui.historyData);
    this.renderHistory();
  }
}
