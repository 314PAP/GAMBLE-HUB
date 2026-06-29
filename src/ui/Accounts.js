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
      list.innerHTML = `<div class="text-center text-muted" style="padding:20px;">Žádní vytvoření hráči.</div>`;
      return;
    }

    usernames.forEach(username => {
      const balance = players[username];
      const row = document.createElement("div");
      row.className = "flex items-center justify-between w-full gap-3";
      row.setAttribute("role", "listitem");

      const selectBtn = document.createElement("button");
      selectBtn.className = "btn flex-1 min-w-0 text-left text-xs sm:text-sm py-3";
      selectBtn.style.paddingLeft = "12px";
      selectBtn.style.paddingRight = "12px";
      selectBtn.innerHTML = `<span class="truncate">${username}</span><span class="ml-auto truncate" style="color: var(--neon-green); text-shadow: 0 0 5px var(--neon-green-glow);"><span class="score-display">${balance}<svg class="coin-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="url(#goldGradient)"/><text x="12" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#1a1a2e">$</text></svg></span></span>`;
      selectBtn.onclick = () => onSelect(username);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-account-btn";
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