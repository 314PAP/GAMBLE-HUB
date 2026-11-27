import { getPlayerVip } from "../vip.js";
import { getPlayerMissions } from "../missions.js";
import { escapeHtml, formatLargeNumber } from "../utils.js";

/**
 * Renderuje VIP odznak a XP progress bar v hlavičce hubu.
 * @param {string} username
 */
export function renderHubVip(username) {
  const el = document.getElementById("hub-vip-badge");
  if (!el || !username) return;
  const vip = getPlayerVip(username);
  el.innerHTML = `<span class="text-neon-gold font-bold">${vip.icon} ${escapeHtml(vip.name)}</span>
    <span class="text-[10px] text-text-muted ml-1">${vip.nextLevel ? `${vip.progress}%` : "MAX"}</span>`;
  el.title = vip.nextLevel
    ? `VIP ${vip.name} (${vip.xp} XP) — další úroveň: ${vip.nextLevel.name} (${vip.nextLevel.minXp} XP)`
    : `VIP ${vip.name} (${vip.xp} XP) — maximální úroveň`;
}

/**
 * Renderuje kompaktní widget denních misí v hubu.
 * @param {string} username
 */
export function renderHubMissions(username) {
  const el = document.getElementById("hub-missions-widget");
  if (!el || !username) return;
  const missions = getPlayerMissions(username);
  el.innerHTML = missions
    .map((m) => {
      const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
      const status = m.completed
        ? `<span class="text-[10px] text-neon-green font-bold">✓ +${formatLargeNumber(m.reward)}</span>`
        : `<span class="text-[10px] text-text-muted">${m.progress}/${m.target}</span>`;
      return `<div class="flex items-center justify-between gap-2 text-[11px] bg-black/40 border border-white/10 rounded-lg px-2 py-1">
        <div class="min-w-0 flex-1">
          <div class="truncate text-text-primary">${escapeHtml(m.title)}</div>
          <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
            <div class="h-full bg-neon-cyan transition-all" style="width:${pct}%"></div>
          </div>
        </div>
        ${status}
      </div>`;
    })
    .join("");
}

/**
 * Aktualizuje live ticker v hubu novou zprávou o velké výhře.
 * @param {string} text
 */
export function pushLiveTicker(text) {
  const el = document.getElementById("hub-live-ticker");
  if (!el || !text) return;
  el.textContent = `🔥 ${text}`;
  el.classList.remove("hidden");
}
