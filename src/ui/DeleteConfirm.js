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
    this.dialog.style.display = 'flex';
  }

  hide() {
    if (this.dialog) {
      this.dialog.style.display = 'none';
    }
    if (this.yesBtn) {
      this.yesBtn.onclick = null;
    }
  }
}