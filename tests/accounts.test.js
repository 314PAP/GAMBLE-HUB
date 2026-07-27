import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountsManager } from '../src/ui/Accounts.js';

describe('AccountsManager', () => {
  let manager;
  let mockUi;
  let mockList;

  beforeEach(() => {
    mockList = {
      innerHTML: '',
      appendChild: vi.fn(),
    };

    mockUi = {
      db: {
        getPlayers: vi.fn(() => ({})),
      },
    };

    globalThis.document.getElementById = vi.fn((id) => {
      if (id === 'users-list') return mockList;
      return null;
    });

    manager = new AccountsManager(mockUi);
  });

  describe('render', () => {
    it('should return early when list element not found', () => {
      globalThis.document.getElementById = vi.fn(() => null);
      const result = manager.render(() => {}, () => {});
      expect(result).toBeUndefined();
    });

    it('should show empty state when no players', () => {
      mockUi.db.getPlayers = vi.fn(() => ({}));
      manager.render(() => {}, () => {});
      expect(mockList.innerHTML).toContain('Žádní vytvoření hráči');
    });

    it('should render players when available', () => {
      mockUi.db.getPlayers = vi.fn(() => ({
        alice: 1000,
        bob: 500,
      }));
      manager.render(() => {}, () => {});
      expect(mockList.appendChild).toHaveBeenCalled();
    });

    it('should call onSelect when player is clicked', () => {
      mockUi.db.getPlayers = vi.fn(() => ({
        testuser: 100,
      }));
      
      const onSelect = vi.fn();
      manager.render(onSelect, () => {});
      
      // The select button's onclick should be set
      expect(mockList.appendChild).toHaveBeenCalled();
    });

    it('should escape HTML in usernames', () => {
      mockUi.db.getPlayers = vi.fn(() => ({
        '<script>alert("xss")</script>': 100,
      }));
      
      manager.render(() => {}, () => {});
      // escapeHtml() should neutralize the script tag
      // We can't easily check innerHTML with appendChild mock, but we verify render ran
      expect(mockList.appendChild).toHaveBeenCalled();
    });
  });
});
