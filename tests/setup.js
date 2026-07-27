import { vi } from 'vitest';

// tests/setup.js - Global test setup

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock sound.js before any test imports it
vi.mock('../src/sound.js', () => ({
  sound: {
    playFlip: vi.fn(),
    playDiceRoll: vi.fn(),
    playClick: vi.fn(),
    playBroke: vi.fn(),
    playWin: vi.fn(),
    toggleMute: vi.fn(() => false),
    isMuted: vi.fn(() => false),
  },
}));
