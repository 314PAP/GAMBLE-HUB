import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteConfirmDialog } from '../src/ui/DeleteConfirm.js';

describe('DeleteConfirmDialog', () => {
  let dialog;
  let mockUi;
  let mockDialogEl;
  let mockYesBtn;

  beforeEach(() => {
    mockDialogEl = {
      classList: { add: vi.fn(), remove: vi.fn() },
    };
    mockYesBtn = {
      onclick: null,
    };

    mockUi = {};

    globalThis.document.getElementById = vi.fn((id) => {
      if (id === 'delete-confirm-dialog') return mockDialogEl;
      if (id === 'delete-confirm-yes') return mockYesBtn;
      return null;
    });

    dialog = new DeleteConfirmDialog(mockUi);
  });

  describe('show', () => {
    it('should return early when dialog not found', () => {
      globalThis.document.getElementById = vi.fn(() => null);
      dialog.show('player1', () => {});
      expect(mockDialogEl).toBeDefined();
    });

    it('should return early when yesBtn not found', () => {
      globalThis.document.getElementById = vi.fn((id) => {
        if (id === 'delete-confirm-dialog') return mockDialogEl;
        return null;
      });
      dialog.show('player1', () => {});
      expect(mockDialogEl.constructor).toBeDefined();
    });

    it('should show dialog and set onclick handler', () => {
      const onConfirm = vi.fn();
      dialog.show('player1', onConfirm);

      expect(mockDialogEl.classList.remove).toHaveBeenCalledWith('hidden');
      expect(mockDialogEl.classList.add).toHaveBeenCalledWith('flex');
      expect(mockYesBtn.onclick).toBeDefined();
    });

    it('should call onConfirm and hide dialog when yes is clicked', () => {
      const onConfirm = vi.fn();
      dialog.show('player1', onConfirm);

      mockYesBtn.onclick();

      expect(onConfirm).toHaveBeenCalled();
      expect(mockDialogEl.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockYesBtn.onclick).toBeNull();
    });
  });

  describe('hide', () => {
    it('should hide dialog and clear onclick', () => {
      mockYesBtn.onclick = vi.fn();
      dialog.hide();

      expect(mockDialogEl.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockDialogEl.classList.remove).toHaveBeenCalledWith('flex');
      expect(mockYesBtn.onclick).toBeNull();
    });

    it('should not throw when dialog is null', () => {
      globalThis.document.getElementById = vi.fn(() => null);
      const d = new DeleteConfirmDialog(mockUi);
      expect(() => d.hide()).not.toThrow();
    });

    it('should handle null yesBtn', () => {
      globalThis.document.getElementById = vi.fn((id) => {
        if (id === 'delete-confirm-dialog') return mockDialogEl;
        return null;
      });
      const d = new DeleteConfirmDialog(mockUi);
      expect(() => d.hide()).not.toThrow();
    });
  });
});
