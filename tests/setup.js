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

globalThis.window = {
  __GAMBLE_HUB__: {
    otevriPrihlaseni: vi.fn(),
    otevriRegistraci: vi.fn(),
    zpetDoMenu: vi.fn(),
    navratDoHubu: vi.fn(),
    prihlasitHrace: vi.fn(),
    smazatUcet: vi.fn(),
    zavriDeleteConfirm: vi.fn(),
    potvrditRegistraci: vi.fn(),
    odhlasitSe: vi.fn(),
    otevriDisclaimer: vi.fn(),
    zavriDisclaimer: vi.fn(),
    otevriInstalaciInfo: vi.fn(),
    zavriInstalaciInfo: vi.fn(),
    spustitHru: vi.fn(),
    nastavSazku: vi.fn(),
    vsaditVse: vi.fn(),
    kliknutoCislo: vi.fn(),
    toggleAutoPlay: vi.fn(),
    hrajHiLo: vi.fn(),
    otevriStatsModal: vi.fn(),
    zavriStatsModal: vi.fn(),
    otevriExplorer: vi.fn(),
    zavriExplorer: vi.fn(),
    prepniExplorerTab: vi.fn(),
    filtrujLeaderboard: vi.fn(),
    filtrujHistorii: vi.fn(),
    seradHistorii: vi.fn(),
    toggleInfoPanel: vi.fn(),
    zavriInfoPanel: vi.fn(),
    exportovatData: vi.fn(),
    importovatData: vi.fn(),
    checkEnter: vi.fn(),
    toggleMuteState: vi.fn(),
  },
};

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
