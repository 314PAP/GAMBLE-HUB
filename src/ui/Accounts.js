import { formatLargeNumber } from '../utils.js';

export class AccountsManager {
  constructor(ui) {
    this.ui = ui;
  }

  formatLargeNumber(num) {
    return formatLargeNumber(num);
  }

  wrapEmoji(text) {
    return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u2600-\u26FF]|\u203C|\u2049|[\u2000-\u206F]/gu, '<span class="emoji-icon">$&\u200d</span>');
  }

  render(onSelect, onDelete) {
    const list = document.getElementById("users-list");
    if (!list) return;

    list.innerHTML = "";
    const players = this.ui.db.getPlayers();
    const usernames = Object.keys(players);

    if (usernames.length === 0) {
      list.innerHTML = `<div class="text-center text-muted p-5">Žádní vytvoření hráči.</div>`;
      return;
    }

    usernames.forEach(username => {
      const balance = players[username];
      const row = document.createElement("div");
      row.className = "flex items-center justify-between w-full gap-3";
      row.setAttribute("role", "listitem");

      const selectBtn = document.createElement("button");
      selectBtn.className = "btn flex-1 min-w-0 text-left text-xs sm:text-sm py-3 pl-3 pr-3";
      selectBtn.innerHTML = `<span class="truncate scoreboard-name">${this.wrapEmoji(username)}</span><span class="ml-auto truncate text-[var(--neon-green)] text-glow-green"><span class="score-display">${this.formatLargeNumber(balance)}<svg class="coin-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="url(#goldGradient)"/><text x="12" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#1a1a2e">$</text></svg></span></span>`;
      selectBtn.onclick = () => onSelect(username);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-account-btn w-14 h-14 flex items-center justify-center shrink-0";
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