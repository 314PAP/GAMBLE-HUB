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
      row.className = 'account-row flex items-center gap-2';

      const selectBtn = document.createElement('button');
      selectBtn.className = 'btn account-btn';
      selectBtn.innerHTML = `<span class="account-name font-semibold">${username}</span> <span class="ml-auto account-balance">${balance} Kč</span>`;
      selectBtn.onclick = () => onSelect(username);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'account-delete-btn';
      deleteBtn.innerHTML = '<span class="text-[20px]">🗑️</span>';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        Swal.fire({
          title: 'Smazat účet?',
          text: `Opravdu chcete permanentně smazat hráče ${username}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ff0055',
          cancelButtonColor: '#ffd700',
          confirmButtonText: 'Ano, smazat',
          cancelButtonText: 'Zrušit',
          background: '#12121c',
          color: '#f8fafc'
        }).then((result) => {
          if (result.isConfirmed) {
            onDelete(username);
          }
        });
      };

      row.appendChild(selectBtn);
      row.appendChild(deleteBtn);
      list.appendChild(row);
    });
  }
}
