import { COIN_SVG, wrapEmoji } from '../utils.js';

export class StatsManager {
  constructor(ui) {
    this.ui = ui;
  }

  open(username) {
    const stats = this.ui.db.getStats(username);
    const totalMatches = stats.vyhry + stats.prohry;
    const winRate = totalMatches > 0 ? ((stats.vyhry / totalMatches) * 100).toFixed(1) : 0;
    const lossRate = totalMatches > 0 ? (100 - winRate).toFixed(1) : 0;
    const winPct = totalMatches > 0 ? (stats.vyhry / totalMatches) * 100 : 0;

    const statsModal = document.getElementById('stats-modal');
    if (!statsModal) return;

    const statsContainer = document.getElementById('modal-stats-data');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="flex-row-center mb-1.5">
          <span aria-hidden="true">👤</span> <span>Hráč:</span> <strong>${escapeHtml(username)}</strong>
        </div>
        <div class="flex-row-center mb-1.5">
          <span aria-hidden="true">🔄</span> <span>Odehraných her:</span> <strong>${totalMatches}</strong>
        </div>
        <div class="flex-row-center mb-2">
          <span aria-hidden="true">📈</span> <span>Úspěšnost:</span> <strong class="text-[var(--neon-orange)]">${winRate}%</strong>
        </div>
        ${totalMatches > 0 ? `
        <div class="mb-2">
          <div style="display:flex;height:20px;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)">
            ${winPct > 0 ? `<div style="width:${winPct}%;background:linear-gradient(90deg,#1db96a,#39ff14);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:#000">${winPct >= 15 ? `✓ ${winRate}%` : ''}</div>` : ''}
            ${winPct < 100 ? `<div style="width:${100 - winPct}%;background:linear-gradient(90deg,#ff0055,#c0004a);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:#fff">${(100 - winPct) >= 15 ? `✗ ${lossRate}%` : ''}</div>` : ''}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;margin-top:4px">
            <span style="color:#39ff14">✓ ${stats.vyhry} výher</span>
            <span style="color:#ff0055">✗ ${stats.prohry} proher</span>
          </div>
        </div>` : ''}
      `;
    }

    const historyContainer = document.getElementById('modal-history-data');
    if (historyContainer) {
      historyContainer.innerHTML = '';
      if (stats.historie.length === 0) {
        historyContainer.innerHTML = `<div class="text-center text-muted p-2.5">Žádná odehraná kola.</div>`;
      } else {
        stats.historie.forEach(item => {
          const isWin = item.includes('VÝHRA');
          const sep = item.includes(' – ') ? ' – ' : '-';
          const parts = item.split(sep);
          let gamePart = (parts[0] || '').trim();
          const statusPart = (parts[1] || '').trim();
          const coinSvg = COIN_SVG;
          gamePart = gamePart
            .replace(/\(S:\s*(\d+)\s*(kč|Kč)?\)/gi, `($1 ${coinSvg})`)
            .replace(/\((\d+)\s*kč\)/gi, `($1 ${coinSvg})`)
            .replace(/Kč/g, coinSvg);

          const div = document.createElement('div');
          div.className = `history-item p-2 rounded-xl flex justify-between items-center ${isWin ? 'win border-l-4 border-l-[#39ff14]' : 'loss border-l-4 border-l-[#ff007f]'}`;
          div.setAttribute('role', 'listitem');
          div.innerHTML = `
            <span class="text-[var(--neon-gold)] flex items-center gap-1">🎮 ${wrapEmoji(gamePart)}</span>
            <strong class="${isWin ? 'text-[var(--neon-green)] text-glow-green' : 'text-[var(--neon-pink)] text-glow-pink'}">${statusPart}</strong>
          `;
          historyContainer.appendChild(div);
        });
      }
    }

    statsModal.classList.remove('hidden');
    statsModal.classList.add('flex');
  }

  close() {
    const statsModal = document.getElementById('stats-modal');
    if (statsModal) {
      statsModal.classList.add('hidden');
      statsModal.classList.remove('flex');
    }
  }
}
