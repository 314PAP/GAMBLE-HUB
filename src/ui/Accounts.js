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
      selectBtn.innerHTML = `<span class="truncate">${username}</span><span class="ml-auto truncate" style="color: var(--neon-green); text-shadow: 0 0 5px var(--neon-green-glow);">${balance}&nbsp;<svg class="coin-icon-svg" viewBox="0 0 24 24" style="width:16px;height:16px;vertical-align:middle;"><path fill="#d4af37" d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 20 10 10 10 0 0 0 10-10-10-10-10-10zm0 2a8 8 0 0 1 8 8 8 8 0 0 1-8 8v-16zm0 2v2h4v2h-4v2h3l-2 3 2 3h-3v2h4v-2h-3l2-3-2-3h3V8h-4V6h4z"/></svg></span>`;
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