import { COIN_SVG, escapeHtml, formatLargeNumber, wrapEmoji } from "../utils.js";
import { getPlayerAchievements } from "../achievements.js";

let chartRegistered = false;
async function loadChart() {
  const {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Filler,
  } = await import("chart.js");
  if (!chartRegistered) {
    Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);
    chartRegistered = true;
  }
  return Chart;
}

export class StatsManager {
  constructor(ui) {
    this.ui = ui;
    this.balanceChart = null;
    this._chartRenderId = 0;
  }

  open(username) {
    const stats = this.ui.db.getStats(username);
    const totalMatches = stats.vyhry + stats.prohry;
    const winRate = totalMatches > 0 ? ((stats.vyhry / totalMatches) * 100).toFixed(1) : 0;
    const lossRate = totalMatches > 0 ? (100 - winRate).toFixed(1) : 0;
    const winPct = totalMatches > 0 ? (stats.vyhry / totalMatches) * 100 : 0;

    const statsModal = document.getElementById("stats-modal");
    if (!statsModal) return;

    const statsContainer = document.getElementById("modal-stats-data");
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="flex items-center mb-1.5">
          <span aria-hidden="true">👤</span> <span>Hráč:</span> <strong>${escapeHtml(username)}</strong>
        </div>
        <div class="flex items-center mb-1.5">
          <span aria-hidden="true">🔄</span> <span>Odehraných her:</span> <strong>${totalMatches}</strong>
        </div>
        <div class="flex items-center mb-2">
          <span aria-hidden="true">📈</span> <span>Úspěšnost:</span> <strong class="text-neon-orange">${winRate}%</strong>
        </div>
        ${
          totalMatches > 0
            ? `
        <div class="mb-2">
          <div class="stats-progress">
            ${winPct > 0 ? `<div class="stats-progress-win" style="width:${winPct}%">${winPct >= 15 ? `✓ ${winRate}%` : ""}</div>` : ""}
            ${winPct < 100 ? `<div class="stats-progress-loss" style="width:${100 - winPct}%">${100 - winPct >= 15 ? `✗ ${lossRate}%` : ""}</div>` : ""}
          </div>
          <div class="stats-footer">
            <span style="color:#39ff14">✓ ${stats.vyhry} výher</span>
            <span style="color:#ff0055">✗ ${stats.prohry} proher</span>
          </div>
        </div>`
            : ""
        }
      `;
    }

    const historyContainer = document.getElementById("modal-history-data");
    if (historyContainer) {
      historyContainer.innerHTML = "";
      if (stats.historie.length === 0) {
        historyContainer.innerHTML = `<div class="text-center text-text-muted p-2.5">Žádná odehraná kola.</div>`;
      } else {
        stats.historie.forEach((item) => {
          const isWin = item.includes("VÝHRA");
          const sep = item.includes(" – ") ? " – " : "-";
          const parts = item.split(sep);
          let gamePart = escapeHtml(parts[0] || "").trim();
          const statusPart = escapeHtml(parts[1] || "").trim();
          const coinSvg = COIN_SVG;
          gamePart = gamePart
            .replace(/\(S:\s*(\d+)\s*(kč|Kč)?\)/gi, `($1 ${coinSvg})`)
            .replace(/\((\d+)\s*kč\)/gi, `($1 ${coinSvg})`)
            .replace(/Kč/g, coinSvg);

          const div = document.createElement("div");
          div.className = `history-item p-2 rounded-xl flex justify-between items-center ${isWin ? "win border-l-4 border-l-[#39ff14]" : "loss border-l-4 border-l-[#ff007f]"}`;
          div.setAttribute("role", "listitem");
          div.innerHTML = `
            <span class="text-neon-gold flex items-center gap-1">🎮 ${wrapEmoji(gamePart)}</span>
            <strong class="${isWin ? "text-neon-green text-glow-green" : "text-neon-pink text-glow-pink"}">${statusPart}</strong>
          `;
          historyContainer.appendChild(div);
        });
      }
    }

    const achievementsContainer = document.getElementById("modal-achievements-data");
    if (achievementsContainer) {
      const list = getPlayerAchievements(username);
      achievementsContainer.innerHTML = list
        .map(
          (a) => `
          <div class="flex items-center gap-2 p-2 rounded-lg border text-xs ${
            a.unlocked
              ? "border-neon-gold/60 bg-neon-gold/10 text-text-primary"
              : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-text-muted opacity-55"
          }" title="${escapeHtml(a.desc)}">
            <span class="text-base" aria-hidden="true">${a.icon}</span>
            <div class="min-w-0">
              <div class="font-bold truncate">${escapeHtml(a.title)}</div>
              <div class="text-[11px] truncate opacity-80">${escapeHtml(a.desc)}</div>
            </div>
          </div>`
        )
        .join("");
    }

    this._renderBalanceChart(stats.balanceHistory || []);
    this._renderPerGameStats(stats.perGame || {});

    statsModal.classList.remove("hidden");
    statsModal.classList.add("flex");
  }

  _renderBalanceChart(history) {
    const wrap = document.getElementById("stats-chart-wrap");
    const canvas = document.getElementById("stats-balance-chart");
    if (!wrap || !canvas) return;

    if (this.balanceChart) {
      this.balanceChart.destroy();
      this.balanceChart = null;
    }

    if (!Array.isArray(history) || history.length < 2) {
      wrap.classList.add("hidden");
      return;
    }

    const ctx = typeof canvas.getContext === "function" ? canvas.getContext("2d") : null;
    if (!ctx) {
      wrap.classList.add("hidden");
      return;
    }

    wrap.classList.remove("hidden");
    const renderId = ++this._chartRenderId;
    loadChart()
      .then((Chart) => {
        if (renderId !== this._chartRenderId) return;
        this.balanceChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: history.map((_, idx) => `#${idx + 1}`),
            datasets: [
              {
                label: "Zůstatek",
                data: history,
                borderColor: "#00f0ff",
                backgroundColor: "rgba(0, 240, 255, 0.14)",
                borderWidth: 2,
                pointRadius: 2.5,
                pointBackgroundColor: "#ffd700",
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: {
                ticks: { color: "#94a3b8", font: { size: 10 } },
                grid: { color: "rgba(255,255,255,0.05)" },
              },
              y: {
                ticks: { color: "#94a3b8", font: { size: 10 } },
                grid: { color: "rgba(255,255,255,0.06)" },
              },
            },
          },
        });
      })
      .catch((err) => {
        console.warn("Failed to load chart.js:", err);
      });
  }

  _renderPerGameStats(perGame) {
    const container = document.getElementById("modal-pergame-stats");
    if (!container) return;

    const entries = Object.entries(perGame);
    if (entries.length === 0) {
      container.innerHTML = `<div class="text-center text-text-muted text-xs py-1">Zatím žádná data podle her.</div>`;
      return;
    }

    container.innerHTML = entries
      .map(([name, g]) => {
        const roi = g.totalBet > 0 ? (((g.totalWon - g.totalBet) / g.totalBet) * 100).toFixed(0) : "0";
        const roiNum = Number(roi);
        const roiCls = roiNum >= 0 ? "text-neon-green" : "text-neon-pink";
        return `
          <div class="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <div class="min-w-0">
              <div class="font-bold text-text-primary truncate">${escapeHtml(name)}</div>
              <div class="text-[11px] text-text-secondary">✓ ${g.wins} / ✗ ${g.losses} • Vsazeno: ${formatLargeNumber(g.totalBet)}</div>
            </div>
            <div class="text-right shrink-0 ml-2">
              <div class="font-bold text-neon-gold">Max: ${formatLargeNumber(g.highestWin)}</div>
              <div class="text-[11px] font-semibold ${roiCls}">ROI: ${roiNum >= 0 ? `+${roi}%` : `${roi}%`}</div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  close() {
    const statsModal = document.getElementById("stats-modal");
    if (statsModal) {
      statsModal.classList.add("hidden");
      statsModal.classList.remove("flex");
    }
  }
}
