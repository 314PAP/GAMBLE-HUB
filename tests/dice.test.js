import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('gsap', () => ({
  default: {
    set: vi.fn(),
    timeline: vi.fn((opts = {}) => {
      if (opts.onComplete) {
        Promise.resolve().then(() => opts.onComplete());
      }
      return {
        call: vi.fn(),
      };
    }),
  },
}));

vi.mock('../src/sound.js', () => ({
  sound: {
    playDiceRoll: vi.fn(),
    playClick: vi.fn(),
  },
}));

const mockGetElementById = vi.fn((id) => {
  if (id === 'dice-display') {
    return { textContent: '' };
  }
  if (id === 'dice-frame') {
    return {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };
  }
  return null;
});

globalThis.document = {
  getElementById: mockGetElementById,
  querySelectorAll: vi.fn(() => []),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

import { DiceGame } from '../src/games/dice.js';

describe('DiceGame', () => {
  let game;

  beforeEach(() => {
    game = new DiceGame();
  });

  it('should initialize with default values', () => {
    game.init();
    expect(game.isPlaying).toBe(false);
    expect(game.selectedNumber).toBe(null);
  });

  it('should not roll without selection', () => {
    game.selectedNumber = null;
    const result = game.roll(() => {});
    expect(result).toBeUndefined();
  });

  it('should not roll while playing', () => {
    game.isPlaying = true;
    game.selectedNumber = 5;
    const result = game.roll(() => {});
    expect(result).toBeUndefined();
  });

  describe('rollAsync', () => {
    it('should return a Promise', () => {
      game.selectedNumber = 5;
      const result = game.rollAsync();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve with result object', async () => {
      game.selectedNumber = 5;
      const mockResult = { isWin: true, winAmount: 6, resultText: 'test', selectedNum: 5, diceValue: 3 };
      const originalRoll = game.roll.bind(game);
      game.roll = vi.fn((cb) => cb(mockResult));

      const result = await game.rollAsync();
      expect(result).toEqual(mockResult);
      game.roll = originalRoll;
    });
  });

  describe('selectNumber', () => {
    it('should set selectedNumber', () => {
      game.selectNumber(3);
      expect(game.selectedNumber).toBe(3);
    });

    it('should not change selection while playing', () => {
      game.isPlaying = true;
      game.selectNumber(3);
      expect(game.selectedNumber).toBe(null);
    });
  });
});
