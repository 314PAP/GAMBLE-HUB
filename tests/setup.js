import { vi } from 'vitest';

// LocalStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

globalThis.localStorage = localStorageMock;

globalThis.document = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  getElementById: vi.fn(() => null),
  querySelectorAll: vi.fn(() => []),
  createElement: vi.fn(() => ({
    className: '',
    classList: { add: vi.fn(), remove: vi.fn() },
    dataset: {},
    onclick: null,
    innerHTML: '',
    appendChild: vi.fn(),
    setAttribute: vi.fn(),
  })),
  dispatchEvent: vi.fn(),
};

globalThis.window = {};

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
