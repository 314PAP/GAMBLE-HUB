export class DeleteConfirmDialog {
  constructor(ui) {
    this.ui = ui;
    this.dialog = document.getElementById('delete-confirm-dialog');
    this.yesBtn = document.getElementById('delete-confirm-yes');
  }

  show(username, onConfirm) {
    if (!this.dialog || !this.yesBtn) return;
    
    const handleDelete = () => {
      this.hide();
      onConfirm();
    };
    
    this.yesBtn.onclick = handleDelete;
    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('flex');
  }

  hide() {
    if (this.dialog) {
      this.dialog.classList.add('hidden');
      this.dialog.classList.remove('flex');
    }
    if (this.yesBtn) {
      this.yesBtn.onclick = null;
    }
  }
}