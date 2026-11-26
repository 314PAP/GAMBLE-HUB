import { describe, it, expect, vi } from 'vitest';

const mockContainer = {
  innerHTML: '',
  classList: {
    remove: vi.fn(),
    add: vi.fn(),
  },
  appendChild: vi.fn(),
};

vi.mock('gsap', () => ({
  default: {
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn(),
      call: vi.fn(),
    })),
    delayedCall: vi.fn(),
  },
}));

vi.mock('../src/sound.js', () => ({
  sound: {
    playClick: vi.fn(),
    playClickRetro: vi.fn(),
    play8BitSelect: vi.fn(),
    play8BitPowerUp: vi.fn(),
    playWinBonus: vi.fn(),
    playLoss: vi.fn(),
    toggleMute: vi.fn(() => false),
    isMuted: vi.fn(() => false),
  },
}));

const mockGetElementById = vi.fn((id) => {
  if (id === 'game-number-buttons') {
    return mockContainer;
  }
  return null;
});

globalThis.document = {
  getElementById: mockGetElementById,
  querySelectorAll: vi.fn(() => []),
  createElement: vi.fn(() => ({
    className: '',
    classList: { remove: vi.fn(), add: vi.fn() },
    dataset: {},
    onclick: null,
    innerHTML: '',
    appendChild: vi.fn(),
    setAttribute: vi.fn(),
  })),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

import { GuessingGame, evaluateRouletteBet } from '../src/games/guessing.js';

describe('GuessingGame', () => {
  it('should initialize with isPlaying false', () => {
    const game = new GuessingGame();
    expect(game.isPlaying).toBe(false);
  });

  describe('generateGrid', () => {
    it('should use grid-cols-6 for large ranges', () => {
      const game = new GuessingGame();
      mockContainer.classList.remove.mockClear();
      mockContainer.classList.add.mockClear();

      game.generateGrid(0, 35, () => {});
      expect(mockContainer.classList.remove).toHaveBeenCalledWith('grid-cols-5');
      expect(mockContainer.classList.add).toHaveBeenCalledWith('grid-cols-6');
    });
  });

  describe('evaluateRouletteBet', () => {
    it('evaluates direct number bets', () => {
      expect(evaluateRouletteBet(17, 17, 35)).toEqual({ isWin: true, multiplier: 35, label: '17' });
      expect(evaluateRouletteBet(17, 18, 35)).toEqual({ isWin: false, multiplier: 35, label: '17' });
    });

    it('evaluates color, parity, half, and dozen side bets (and 0 loses)', () => {
      expect(evaluateRouletteBet('red', 1).isWin).toBe(true);
      expect(evaluateRouletteBet('red', 2).isWin).toBe(false);
      expect(evaluateRouletteBet('black', 2).isWin).toBe(true);
      expect(evaluateRouletteBet('even', 14).isWin).toBe(true);
      expect(evaluateRouletteBet('odd', 15).isWin).toBe(true);
      expect(evaluateRouletteBet('low', 18).isWin).toBe(true);
      expect(evaluateRouletteBet('high', 19).isWin).toBe(true);
      expect(evaluateRouletteBet('dozen1', 12)).toEqual({ isWin: true, multiplier: 3, label: '1–12' });
      expect(evaluateRouletteBet('dozen2', 24).isWin).toBe(true);
      expect(evaluateRouletteBet('dozen3', 35).isWin).toBe(true);
      // Zero loses all side bets
      expect(evaluateRouletteBet('red', 0).isWin).toBe(false);
      expect(evaluateRouletteBet('even', 0).isWin).toBe(false);
      expect(evaluateRouletteBet('low', 0).isWin).toBe(false);
    });
  });
});
