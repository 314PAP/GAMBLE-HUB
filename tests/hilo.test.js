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
});
