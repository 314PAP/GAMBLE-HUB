import Swal from 'sweetalert2';

export class AccountsManager {
  constructor(ui) {
    this.ui = ui;
  }

  render(onSelect, onDelete) {
    const list = document.getElementById('users-list');
    if (!list) return;

    list.innerHTML = '';
    const players = this.ui.db.getPlayers();
    const usernames = Object.keys(players);

    if (usernames.length === 0) {
      list.innerHTML = `<div class="text-center text-muted" style="padding:20px;">Žádní vytvoření hráči.</div>`;
      return;
    }

    usernames.forEach(username => {
      const balance = players[username];
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between w-full gap-2';

      const selectBtn = document.createElement('button');
      selectBtn.className = 'btn flex-1 min-w-0 text-left text-xs sm:text-sm';
      selectBtn.innerHTML = `<span class="truncate block">${username}</span> <span class="account-balance ml-auto block truncate">${balance} Kč</span>`;
      selectBtn.onclick = () => onSelect(username);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'w-8 h-8 flex-shrink-0 flex items-center justify-center';
      deleteBtn.innerHTML = '<span class="text-base sm:text-lg">🗑️</span>';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        Swal.fire({
          title: 'Smazat účet?',
          text: `Opravdu chcete permanentně smazat hráče ${username}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ff0055',
          cancelButtonColor: '#333',
          confirmButtonText: 'Smazat',
          cancelButtonText: 'Zrušit'
        });
      };

      row.appendChild(selectBtn);
      row.appendChild(deleteBtn);
      list.appendChild(row);
    });
  }
}
