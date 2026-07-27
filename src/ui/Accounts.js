import { formatLargeNumber, COIN_SVG, escapeHtml, wrapEmoji } from "../utils.js";

export class AccountsManager {
  constructor(ui) {
    this.ui = ui;
  }

  render(onSelect, onDelete) {
    const list = document.getElementById("users-list");
    if (!list) return;

    list.innerHTML = "";
    const players = this.ui.db.getPlayers();
    const usernames = Object.keys(players);

    if (usernames.length === 0) {
      list.innerHTML = `<div class="text-center text-text-muted p-5">Žádní vytvoření hráči.</div>`;
      return;
    }

    usernames.forEach((username) => {
      const balance = players[username];
      const row = document.createElement("div");
      row.className = "flex items-center justify-between w-full gap-3";
      row.setAttribute("role", "listitem");

      const selectBtn = document.createElement("button");
      selectBtn.className =
        "btn flex-1 min-w-0 text-left text-sm py-1.5 px-3 flex flex-row items-center gap-1";
      selectBtn.innerHTML = `<span class="truncate flex-1 min-w-0 text-[clamp(0.7rem,1.8vw,0.95rem)]">${wrapEmoji(escapeHtml(username))}</span><span class="shrink-0 whitespace-nowrap text-[var(--neon-green)] text-glow-green text-[clamp(0.55rem,1.2vw,0.7rem)]"><span class="score-display">${formatLargeNumber(balance)}${COIN_SVG}</span></span>`;
      selectBtn.onclick = () => onSelect(username);

      const deleteBtn = document.createElement("button");
      deleteBtn.className =
        "delete-account-btn w-10 h-10 flex items-center justify-center shrink-0";
      deleteBtn.setAttribute("aria-label", `Smazat účet ${username}`);
      deleteBtn.innerHTML = '<span aria-hidden="true">🗑️</span>';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        onDelete(username);
      };

      row.appendChild(selectBtn);
      row.appendChild(deleteBtn);
      list.appendChild(row);
    });
  }
}
