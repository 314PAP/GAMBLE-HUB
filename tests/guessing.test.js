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

import { GuessingGame } from '../src/games/guessing.js';

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
});
