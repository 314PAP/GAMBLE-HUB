import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HiloGame } from '../src/games/hilo.js';

describe('HiloGame', () => {
  it('should initialize with default currentNumber 5', () => {
    const game = new HiloGame();
    expect(game.currentNumber).toBe(5);
    expect(game.isAnimating).toBe(false);
  });

  describe('getWinningCount', () => {
    it('should return 10 - currentNumber for H tip', () => {
      const game = new HiloGame();
      game.currentNumber = 5;
      expect(game.getWinningCount('H')).toBe(5);
    });

    it('should return currentNumber - 1 for L tip', () => {
      const game = new HiloGame();
      game.currentNumber = 5;
      expect(game.getWinningCount('L')).toBe(4);
    });

    it('should return 9 for currentNumber 1 with H tip', () => {
      const game = new HiloGame();
      game.currentNumber = 1;
      expect(game.getWinningCount('H')).toBe(9);
    });

    it('should return 9 for currentNumber 10 with L tip', () => {
      const game = new HiloGame();
      game.currentNumber = 10;
      expect(game.getWinningCount('L')).toBe(9);
    });
  });

  describe('getMultiplier', () => {
    it('should return 0 when winCount is 0 (currentNumber 10, H tip)', () => {
      const game = new HiloGame();
      game.currentNumber = 10;
      expect(game.getMultiplier('H')).toBe(0);
    });

    it('should return 0 when winCount is 0 (currentNumber 1, L tip)', () => {
      const game = new HiloGame();
      game.currentNumber = 1;
      expect(game.getMultiplier('L')).toBe(0);
    });

    it('should return correct multiplier for H tip', () => {
      const game = new HiloGame();
      game.currentNumber = 5;
      const mult = game.getMultiplier('H');
      expect(mult).toBeCloseTo((9 / 5) * 0.95, 1);
    });

    it('should return correct multiplier for L tip', () => {
      const game = new HiloGame();
      game.currentNumber = 5;
      const mult = game.getMultiplier('L');
      expect(mult).toBeCloseTo((9 / 4) * 0.95, 1);
    });

    it('should return high multiplier for risky bet (currentNumber 9, H tip)', () => {
      const game = new HiloGame();
      game.currentNumber = 9;
      const mult = game.getMultiplier('H');
      expect(mult).toBeCloseTo((9 / 1) * 0.95, 1);
    });
  });

  describe('streaks and cashOut', () => {
    it('should accumulate streak and multiplier on consecutive wins and allow cashOut', () => {
      const game = new HiloGame();
      game.currentNumber = 5;

      // Force deterministic wins via _finalizePlay
      let result1;
      game._finalizePlay(true, 1.71, 100, 5, 8, (res) => {
        result1 = res;
      });
      expect(result1.isWin).toBe(true);
      expect(result1.isStreakContinue).toBe(true);
      expect(result1.streak).toBe(1);
      expect(result1.multiplier).toBe(1.71);
      expect(result1.potentialWin).toBe(171);

      let result2;
      game._finalizePlay(true, 2.0, 100, 8, 3, (res) => {
        result2 = res;
      });
      expect(result2.streak).toBe(2);
      expect(result2.multiplier).toBe(3.42);
      expect(result2.potentialWin).toBe(342);

      const cashout = game.cashOut();
      expect(cashout).not.toBeNull();
      expect(cashout.isWin).toBe(true);
      expect(cashout.winAmount).toBe(342);
      expect(cashout.streak).toBe(2);
      expect(game.isStreakActive).toBe(false);
      expect(game.streak).toBe(0);
    });

    it('should reset streak on loss', () => {
      const game = new HiloGame();
      game._finalizePlay(true, 1.71, 100, 5, 8, () => {});
      expect(game.isStreakActive).toBe(true);

      let lossRes;
      game._finalizePlay(false, 1.5, 100, 8, 9, (res) => {
        lossRes = res;
      });
      expect(lossRes.isWin).toBe(false);
      expect(lossRes.lostStreak).toBe(1);
      expect(lossRes.bet).toBe(100);
      expect(game.isStreakActive).toBe(false);
      expect(game.streak).toBe(0);
      expect(game.cashOut()).toBeNull();
    });

    it('should return null on cashOut when no streak is active', () => {
      const game = new HiloGame();
      expect(game.cashOut()).toBeNull();
    });
  });
});
