import { describe, it, expect, beforeEach, vi } from 'vitest';

const createElementMock = vi.fn(() => ({
  className: '',
  classList: { remove: vi.fn(), add: vi.fn() },
  dataset: {},
  onclick: null,
  innerHTML: '',
}));

const mockContainer = {
  innerHTML: '',
  classList: {
    remove: vi.fn(),
    add: vi.fn(),
  },
  appendChild: vi.fn(),
};

vi.mock('gsap', () => {
  const mockTimeline = vi.fn((opts = {}) => {
    if (opts.onComplete) {
      Promise.resolve().then(() => opts.onComplete());
    }
    return {
      to: vi.fn(),
      call: vi.fn(),
    };
  });

  return {
    default: {
      set: vi.fn(),
      timeline: mockTimeline,
      delayedCall: vi.fn(),
    },
  };
});

vi.mock('../src/sound.js', () => ({
  sound: {
    playClick: vi.fn(),
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
  createElement: createElementMock,
};

import { GuessingGame } from '../src/games/guessing.js';

describe('GuessingGame', () => {
  let game;

  beforeEach(() => {
    game = new GuessingGame();
    mockContainer.innerHTML = '';
    mockContainer.classList.remove.mockClear();
    mockContainer.classList.add.mockClear();
    mockContainer.appendChild.mockClear();
    createElementMock.mockClear();
  });

  it('should initialize with isPlaying false', () => {
    expect(game.isPlaying).toBe(false);
  });

  describe('generateGrid', () => {
    it('should create buttons for range', () => {
      game.generateGrid(1, 5, () => {});
      expect(createElementMock).toHaveBeenCalled();
    });

    it('should use grid-cols-6 for large ranges', () => {
      game.generateGrid(0, 35, () => {});
      expect(mockContainer.classList.remove).toHaveBeenCalledWith('grid-cols-5');
      expect(mockContainer.classList.add).toHaveBeenCalledWith('grid-cols-6');
    });
  });

  describe('playAsync', () => {
    it('should return a Promise', () => {
      const result = game.playAsync(5, 1, 10, 10, 5);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
