import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameUI } from '../src/ui.js';

// Mock dependencies
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

vi.mock('../src/animations/ui.js', () => ({
  animateScreenIn: vi.fn(),
}));

vi.mock('../src/ui/gameInfo.js', () => ({
  GAME_INFOS: {
    1: { title: 'Test Game', html: '<p>Test</p>' },
  },
}));

vi.mock('../src/sound.js', () => ({
  sound: {
    playClick: vi.fn(),
    playClickRetro: vi.fn(),
    playCardFlip: vi.fn(),
    playWin: vi.fn(),
    playWinBonus: vi.fn(),
    playLoss: vi.fn(),
    toggleMute: vi.fn(() => false),
    isMuted: vi.fn(() => false),
  },
}));

describe('GameUI', () => {
  let ui;
  let mockDb;
  let mockApi;

  beforeEach(() => {
    mockDb = {
      getPlayerBalance: vi.fn(() => 500),
      getPlayerStats: vi.fn(() => ({})),
      getAllPlayers: vi.fn(() => []),
      getMatchHistory: vi.fn(() => []),
      updatePlayerBalance: vi.fn(),
      recordMatch: vi.fn(),
    };

    mockApi = {
      isOnline: false,
      recordVisit: vi.fn(),
      syncLeaderboard: vi.fn(),
    };

    globalThis.document = {
      ...globalThis.document,
      querySelectorAll: vi.fn(() => []),
      getElementById: vi.fn(() => ({
        classList: { add: vi.fn(), remove: vi.fn() },
        innerHTML: '',
      })),
      body: { classList: { add: vi.fn(), remove: vi.fn() } },
    };

    ui = new GameUI(mockDb, mockApi);
    ui.leaderboard = { filter: vi.fn(), render: vi.fn(() => '') };
    ui.sortHistoryData = vi.fn();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(ui.activeScreen).toBe('screen-login');
      expect(ui.leaderboardData).toEqual([]);
      expect(ui.historyData).toEqual([]);
      expect(ui.activeExplorerTab).toBe('leaderboard');
    });
  });

  describe('showScreen', () => {
    it('should update activeScreen', () => {
      const mockTarget = {
        classList: { add: vi.fn(), remove: vi.fn() },
      };
      globalThis.document.getElementById = vi.fn((id) => {
        if (id === 'screen-new') return mockTarget;
        return null;
      });

      ui.showScreen('screen-new');
      expect(ui.activeScreen).toBe('screen-new');
    });
  });

  describe('resetNumberButtons', () => {
    it('should reset button states', () => {
      const mockBtn = {
        classList: { remove: vi.fn() },
        disabled: false,
      };
      globalThis.document.querySelectorAll = vi.fn(() => [mockBtn]);

      ui.resetNumberButtons();
      expect(mockBtn.classList.remove).toHaveBeenCalledWith('selected', 'winning', 'losing');
    });
  });

  describe('updateMiniProfile', () => {
    it('should call with player name and balance', () => {
      const mockElement = {
        querySelector: vi.fn(() => ({
          textContent: '',
        })),
      };
      globalThis.document.getElementById = vi.fn((id) => {
        if (id === 'hub-player-name') return mockElement;
        return null;
      });

      expect(() => ui.updateMiniProfile('TestPlayer', 500)).not.toThrow();
    });
  });

  describe('showAlert', () => {
    it('should call Swal.fire', async () => {
      const Swal = (await import('sweetalert2')).default;
      ui.showAlert('success', 'Test', 'Test message');
      expect(Swal.fire).toHaveBeenCalled();
    });
  });

  describe('filtrujLeaderboard', () => {
    it('should call leaderboard.filter with search value', () => {
      globalThis.document.getElementById = vi.fn((id) => {
        if (id === 'leaderboard-search') return { value: 'player1' };
        return null;
      });
      ui.filtrujLeaderboard();
      expect(ui.leaderboard.filter).toHaveBeenCalledWith('player1');
    });

    it('should handle empty search', () => {
      globalThis.document.getElementById = vi.fn((id) => {
        if (id === 'leaderboard-search') return { value: '' };
        return null;
      });
      ui.filtrujLeaderboard();
      expect(ui.leaderboard.filter).toHaveBeenCalledWith('');
    });
  });

  describe('seradHistorii', () => {
    it('should set sort field and modify sort state', () => {
      ui.historyData = [{ timestamp: 2 }, { timestamp: 1 }];
      ui.seradHistorii('timestamp');
      expect(ui.historySortField).toBe('timestamp');
    });

    it('should toggle sort order for same field', () => {
      ui.historySortField = 'timestamp';
      ui.historySortAsc = true;
      ui.seradHistorii('timestamp');
      expect(ui.historySortAsc).toBe(false);
    });

    it('should set new field with descending order', () => {
      ui.historySortField = 'timestamp';
      ui.historySortAsc = true;
      ui.historyData = [{ winAmount: 2 }, { winAmount: 1 }];
      ui.seradHistorii('winAmount');
      expect(ui.historySortField).toBe('winAmount');
      expect(ui.historySortAsc).toBe(false);
    });
  });
});
