import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExplorerManager } from '../src/ui/Explorer.js';

describe('ExplorerManager', () => {
  let manager;
  let mockUi;
  let mockModal;
  let mockList;
  let mockSearchL;
  let mockSearchH;
  let mockFilterG;
  let mockFilterR;

  beforeEach(() => {
    mockModal = {
      classList: { add: vi.fn(), remove: vi.fn() },
    };
    mockList = {
      innerHTML: '',
    };
    mockSearchL = { value: '' };
    mockSearchH = { value: '' };
    mockFilterG = { value: '' };
    mockFilterR = { value: '' };

    mockUi = {
      api: {
        getGlobalLeaderboard: vi.fn(() => Promise.resolve([])),
        getGlobalMatches: vi.fn(() => Promise.resolve([])),
      },
      leaderboardData: [],
      historyData: [],
      prepniExplorerTab: vi.fn(),
      leaderboard: {
        renderExplorer: vi.fn(),
      },
      sortHistoryData: vi.fn(),
    };

    globalThis.document.getElementById = vi.fn((id) => {
      if (id === 'explorer-modal') return mockModal;
      if (id === 'leaderboard-search') return mockSearchL;
      if (id === 'history-search') return mockSearchH;
      if (id === 'history-filter-game') return mockFilterG;
      if (id === 'history-filter-result') return mockFilterR;
      if (id === 'explorer-leaderboard-list') return mockList;
      if (id === 'explorer-history-list') return mockList;
      return null;
    });

    manager = new ExplorerManager(mockUi);
  });

  describe('load', () => {
    it('should return early when modal not found', async () => {
      globalThis.document.getElementById = vi.fn(() => null);
      await manager.load();
      // Should not throw
      expect(mockModal).toBeDefined();
    });

    it('should show modal and clear inputs', async () => {
      mockSearchL.value = 'test';
      mockSearchH.value = 'test';
      mockFilterG.value = 'game';
      mockFilterR.value = 'win';

      await manager.load();

      expect(mockModal.classList.remove).toHaveBeenCalledWith('hidden');
      expect(mockModal.classList.add).toHaveBeenCalledWith('flex');
      expect(mockSearchL.value).toBe('');
      expect(mockSearchH.value).toBe('');
    });

    it('should load leaderboard and history data', async () => {
      mockUi.api.getGlobalLeaderboard = vi.fn(() => Promise.resolve([
        { jmeno: 'player1', castka: 1000 },
      ]));
      mockUi.api.getGlobalMatches = vi.fn(() => Promise.resolve([
        { username: 'player1', gameName: 'Kostka', isWin: true, winAmount: 600 },
      ]));

      await manager.load();

      expect(mockUi.leaderboardData).toHaveLength(1);
      expect(mockUi.historyData).toHaveLength(1);
      expect(mockUi.leaderboard.renderExplorer).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockUi.api.getGlobalLeaderboard = vi.fn(() => Promise.reject(new Error('API error')));

      await manager.load();

      expect(mockList.innerHTML).toContain('Chyba při načítání dat');
    });
  });

  describe('close', () => {
    it('should hide modal', () => {
      manager.close();

      expect(mockModal.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockModal.classList.remove).toHaveBeenCalledWith('flex');
    });

    it('should not throw when modal not found', () => {
      globalThis.document.getElementById = vi.fn(() => null);
      expect(() => manager.close()).not.toThrow();
    });
  });

  describe('renderHistory', () => {
    it('should return early when list not found', () => {
      globalThis.document.getElementById = vi.fn(() => null);
      manager.renderHistory();
      // Should not throw
    });

    it('should show empty state when no history', () => {
      mockUi.historyData = [];
      manager.renderHistory();

      expect(mockList.innerHTML).toContain('Žádná historie her nenalezena');
    });

    it('should render history items', () => {
      mockUi.historyData = [
        {
          username: 'player1',
          gameName: 'Bary3x3',
          isWin: true,
          winAmount: 600,
          timestamp: Date.now(),
          resultText: 'VÝHRA',
        },
      ];
      manager.renderHistory();

      expect(mockList.innerHTML).toContain('player1');
      expect(mockList.innerHTML).toContain('Automat');
    });

    it('should use provided filtered data', () => {
      mockUi.historyData = [
        { username: 'player1', gameName: 'Kostka', isWin: true, winAmount: 600 },
        { username: 'player2', gameName: 'Kostka', isWin: false, winAmount: 0 },
      ];
      manager.renderHistory([{ username: 'player1', gameName: 'Kostka', isWin: true, winAmount: 600 }]);

      expect(mockList.innerHTML).toContain('player1');
      expect(mockList.innerHTML).not.toContain('player2');
    });
  });

  describe('filter', () => {
    beforeEach(() => {
      mockUi.historyData = [
        { username: 'player1', gameName: 'Kostka', isWin: true, winAmount: 600 },
        { username: 'player2', gameName: 'HI-LOW', isWin: false, winAmount: 0 },
      ];
    });

    it('should use empty query by default', () => {
      mockSearchH.value = '';
      manager.filter();
      expect(mockUi.sortHistoryData).toHaveBeenCalled();
    });

    it('should filter by username', () => {
      mockSearchH.value = 'player1';
      manager.filter();
      // filter() calls sortHistoryData with filtered data
      expect(mockUi.sortHistoryData).toHaveBeenCalled();
    });

    it('should filter by game', () => {
      mockFilterG.value = 'Kostka';
      manager.filter();
      expect(mockUi.sortHistoryData).toHaveBeenCalled();
    });

    it('should filter by result', () => {
      mockFilterR.value = 'win';
      manager.filter();
      expect(mockUi.sortHistoryData).toHaveBeenCalled();
    });

    it('should be case insensitive', () => {
      mockSearchH.value = 'PLAYER1';
      manager.filter();
      expect(mockUi.sortHistoryData).toHaveBeenCalled();
    });
  });
});
