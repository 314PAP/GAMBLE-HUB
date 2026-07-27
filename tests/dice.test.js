import { describe, it, expect } from 'vitest';
import { DiceGame } from '../src/games/dice.js';

describe('DiceGame', () => {
  it('should initialize with default values', () => {
    const game = new DiceGame();
    expect(game.isPlaying).toBe(false);
    expect(game.selectedNumber).toBe(null);
    expect(game.currentValue).toBe(1);
  });

  describe('selectNumber', () => {
    it('should set selectedNumber', () => {
      const game = new DiceGame();
      game.selectNumber(3);
      expect(game.selectedNumber).toBe(3);
    });

    it('should not change selection while playing', () => {
      const game = new DiceGame();
      game.isPlaying = true;
      game.selectNumber(3);
      expect(game.selectedNumber).toBe(null);
    });
  });
});
