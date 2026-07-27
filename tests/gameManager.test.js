import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameManager, GAME_CONFIG, DISPLAY_STATES } from '../src/games.js';

describe('GameManager', () => {
  let gm;
  let mockDb;
  let mockUi;

  beforeEach(() => {
    mockDb = {
      getPlayerBalance: vi.fn(() => 500),
      updatePlayerBalance: vi.fn(),
      recordMatch: vi.fn(),
      checkMilestones: vi.fn(),
    };
    
    mockUi = {
      showScreen: vi.fn(),
      updateMiniProfile: vi.fn(),
      updateBetButtonsSelection: vi.fn(),
      showAlert: vi.fn(),
    };
    
    gm = new GameManager(mockDb, mockUi, {});
  });

  describe('setBet', () => {
    it('should update activeBet and call UI', () => {
      gm.setBet(50);
      expect(gm.activeBet).toBe(50);
      expect(mockUi.updateBetButtonsSelection).toHaveBeenCalledWith(50);
    });
  });

  describe('setCurrentPlayer', () => {
    it('should update currentPlayer', () => {
      gm.setCurrentPlayer('test');
      expect(gm.currentPlayer).toBe('test');
    });
  });

  describe('_ensureGameModules', () => {
    it('should return true after loading modules', async () => {
      const result = await gm._ensureGameModules();
      expect(result).toBe(true);
      expect(gm._gameModulesLoaded).toBe(true);
    });
  });

  describe('GAME_CONFIG', () => {
    it('should have 6 games', () => {
      expect(Object.keys(GAME_CONFIG).length).toBe(6);
    });

    it('should have required fields', () => {
      Object.values(GAME_CONFIG).forEach((cfg) => {
        expect(cfg).toHaveProperty('resultBox');
        expect(cfg).toHaveProperty('hiloColor');
        expect(cfg).toHaveProperty('label');
        expect(cfg).toHaveProperty('minVal');
        expect(cfg).toHaveProperty('maxVal');
        expect(cfg).toHaveProperty('multVal');
      });
    });
  });

  describe('DISPLAY_STATES', () => {
    it('should have 6 games', () => {
      expect(Object.keys(DISPLAY_STATES).length).toBe(6);
    });

    it('should have exactly one true display flag per game', () => {
      Object.values(DISPLAY_STATES).forEach((state) => {
        const flags = [state.classic, state.dice, state.slots, state.hilo];
        expect(flags.filter(Boolean).length).toBe(1);
      });
    });
  });
});
