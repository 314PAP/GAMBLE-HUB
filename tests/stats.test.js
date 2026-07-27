import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatsManager } from '../src/ui/Stats.js';

describe('StatsManager', () => {
  let manager;
  let mockUi;
  let mockStatsModal;
  let mockStatsContainer;
  let mockHistoryContainer;

  beforeEach(() => {
    mockStatsModal = {
      classList: { add: vi.fn(), remove: vi.fn() },
    };
    mockStatsContainer = {
      innerHTML: '',
    };
    mockHistoryContainer = {
      innerHTML: '',
      appendChild: vi.fn(),
    };

    mockUi = {
      db: {
        getStats: vi.fn(() => ({
          vyhry: 0,
          prohry: 0,
          historie: [],
        })),
      },
    };

    globalThis.document.getElementById = vi.fn((id) => {
      if (id === 'stats-modal') return mockStatsModal;
      if (id === 'modal-stats-data') return mockStatsContainer;
      if (id === 'modal-history-data') return mockHistoryContainer;
      return null;
    });

    manager = new StatsManager(mockUi);
  });

  describe('open', () => {
    it('should return early when stats-modal not found', () => {
      globalThis.document.getElementById = vi.fn(() => null);
      manager.open('test');
      // Should not throw
      expect(mockStatsModal).toBeDefined();
    });

    it('should render empty stats when no matches played', () => {
      mockUi.db.getStats = vi.fn(() => ({
        vyhry: 0,
        prohry: 0,
        historie: [],
      }));
      
      manager.open('player1');
      
      expect(mockStatsContainer.innerHTML).toContain('player1');
      expect(mockStatsContainer.innerHTML).toContain('Odehraných her:');
      expect(mockStatsContainer.innerHTML).toContain('Úspěšnost:');
    });

    it('should render stats with win/loss counts', () => {
      mockUi.db.getStats = vi.fn(() => ({
        vyhry: 5,
        prohry: 3,
        historie: [],
      }));
      
      manager.open('player1');
      
      expect(mockStatsContainer.innerHTML).toContain('5 výher');
      expect(mockStatsContainer.innerHTML).toContain('3 proher');
      expect(mockStatsContainer.innerHTML).toContain('62.5%');
    });

    it('should render empty history message', () => {
      mockUi.db.getStats = vi.fn(() => ({
        vyhry: 0,
        prohry: 0,
        historie: [],
      }));
      
      manager.open('player1');
      
      expect(mockHistoryContainer.innerHTML).toContain('Žádná odehraná kola');
    });

    it('should render history items', () => {
      mockUi.db.getStats = vi.fn(() => ({
        vyhry: 1,
        prohry: 0,
        historie: ['Kostka (S: 100 kč) - VÝHRA – 600 kč'],
      }));
      
      manager.open('player1');
      
      expect(mockHistoryContainer.appendChild).toHaveBeenCalled();
    });

    it('should show stats modal when closed', () => {
      manager.open('player1');
      
      expect(mockStatsModal.classList.remove).toHaveBeenCalledWith('hidden');
      expect(mockStatsModal.classList.add).toHaveBeenCalledWith('flex');
    });
  });

  describe('close', () => {
    it('should hide stats modal', () => {
      manager.close();
      
      expect(mockStatsModal.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockStatsModal.classList.remove).toHaveBeenCalledWith('flex');
    });

    it('should not throw when stats-modal not found', () => {
      globalThis.document.getElementById = vi.fn(() => null);
      expect(() => manager.close()).not.toThrow();
    });
  });
});
