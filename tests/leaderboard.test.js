import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaderboardManager } from '../src/ui/Leaderboard.js';

describe('LeaderboardManager', () => {
  let manager;
  let mockUi;
  let mockContainer;

  beforeEach(() => {
    mockContainer = {
      innerHTML: '',
    };

    mockUi = {
      api: {
        getGlobalLeaderboard: vi.fn(() => Promise.resolve([])),
        isOnline: false,
      },
      leaderboardData: [],
    };

    globalThis.document.getElementById = vi.fn((id) => {
      if (id === 'leaderboard-content') return mockContainer;
      if (id === 'explorer-leaderboard-list') return mockContainer;
      return null;
    });

    globalThis.document.querySelector = vi.fn(() => null);

    manager = new LeaderboardManager(mockUi);
  });

  describe('render', () => {
    it('should return early when container not found', async () => {
      globalThis.document.getElementById = vi.fn(() => null);
      await manager.render();
      // Should not throw
      expect(mockContainer).toBeDefined();
    });

    it('should show loading message', async () => {
      let resolveLeaderboard;
      mockUi.api.getGlobalLeaderboard = vi.fn(() => new Promise(resolve => {
        resolveLeaderboard = resolve;
      }));
      
      const renderPromise = manager.render();
      expect(mockContainer.innerHTML).toContain('Načítám žebříček');
      
      resolveLeaderboard([]);
      await renderPromise;
    }, 10000);

    it('should show empty state when no scores', async () => {
      mockUi.api.getGlobalLeaderboard = vi.fn(() => Promise.resolve([]));
      
      await manager.render();
      
      expect(mockContainer.innerHTML).toContain('Zatím žádné rekordy');
    });

    it('should render scores when available', async () => {
      mockUi.api.getGlobalLeaderboard = vi.fn(() => Promise.resolve([
        { jmeno: 'player1', castka: 1000 },
        { jmeno: 'player2', castka: 500 },
      ]));
      
      await manager.render();
      
      expect(mockContainer.innerHTML).toContain('player1');
      expect(mockContainer.innerHTML).toContain('player2');
    });

    it('should show online badge when online', async () => {
      mockUi.api.isOnline = true;
      mockUi.api.getGlobalLeaderboard = vi.fn(() => Promise.resolve([
        { jmeno: 'player1', castka: 1000 },
      ]));
      
      await manager.render();
      
      expect(mockContainer.innerHTML).toContain('player1');
    });

    it('should show local badge when offline', async () => {
      mockUi.api.isOnline = false;
      mockUi.api.getGlobalLeaderboard = vi.fn(() => Promise.resolve([
        { jmeno: 'player1', castka: 1000 },
      ]));
      
      await manager.render();
      
      expect(mockContainer.innerHTML).toContain('player1');
    });

    it('should handle API errors gracefully', async () => {
      mockUi.api.getGlobalLeaderboard = vi.fn(() => Promise.reject(new Error('API error')));
      
      await manager.render();
      
      expect(mockContainer.innerHTML).toContain('Nepodařilo se načíst žebříček');
    });
  });

  describe('renderExplorer', () => {
    it('should return early when list not found', () => {
      globalThis.document.getElementById = vi.fn(() => null);
      manager.renderExplorer();
      // Should not throw
    });

    it('should show empty state when no data', () => {
      mockUi.leaderboardData = [];
      manager.renderExplorer();
      
      expect(mockContainer.innerHTML).toContain('Žádní hráči nenalezeni');
    });

    it('should render data when available', () => {
      mockUi.leaderboardData = [
        { jmeno: 'player1', castka: 1000 },
      ];
      manager.renderExplorer();
      
      expect(mockContainer.innerHTML).toContain('player1');
    });

    it('should use provided filtered data', () => {
      mockUi.leaderboardData = [
        { jmeno: 'player1', castka: 1000 },
        { jmeno: 'player2', castka: 500 },
      ];
      manager.renderExplorer([{ jmeno: 'player1', castka: 1000 }]);
      
      expect(mockContainer.innerHTML).toContain('player1');
      expect(mockContainer.innerHTML).not.toContain('player2');
    });
  });

  describe('filter', () => {
    it('should render all data when query is empty', () => {
      mockUi.leaderboardData = [
        { jmeno: 'player1', castka: 1000 },
      ];
      manager.filter('');
      
      expect(mockContainer.innerHTML).toContain('player1');
    });

    it('should filter data by query', () => {
      mockUi.leaderboardData = [
        { jmeno: 'player1', castka: 1000 },
        { jmeno: 'player2', castka: 500 },
      ];
      manager.filter('player1');
      
      expect(mockContainer.innerHTML).toContain('player1');
      expect(mockContainer.innerHTML).not.toContain('player2');
    });

    it('should be case insensitive', () => {
      mockUi.leaderboardData = [
        { jmeno: 'Player1', castka: 1000 },
      ];
      manager.filter('player');
      
      expect(mockContainer.innerHTML).toContain('Player1');
    });
  });
});
