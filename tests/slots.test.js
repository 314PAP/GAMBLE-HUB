import { describe, it, expect, vi } from 'vitest';

vi.mock('gsap', () => ({
  set: vi.fn(),
  to: vi.fn(() => ({
    onUpdate: vi.fn(),
    onComplete: vi.fn(),
  })),
}));

vi.mock('../src/sound.js', () => ({
  sound: {
    playSpin: vi.fn(),
  },
}));

const mockContainer = {
  style: {
    height: '',
    transform: '',
    filter: '',
    innerHTML: '',
  },
  parentElement: {
    clientHeight: 100,
    style: { filter: '' },
  },
  getElementsByClassName: vi.fn(() => []),
  appendChild: vi.fn(),
};

vi.mock('../src/utils.js', () => ({
  formatLargeNumber: (n) => `${n}`,
}));

import { SlotMachineGame } from '../src/games/slots.js';

describe('SlotMachineGame', () => {
  it('should initialize with default values', () => {
    const game = new SlotMachineGame(['🍒', '🔔', '🍋', '⭐', '💎', '7️⃣'], [[0,1,2]]);
    expect(game.isSpinning).toBe(false);
    expect(game.currentMatrix.length).toBe(9);
  });

  it('should not spin while already spinning', () => {
    const game = new SlotMachineGame(['🍒', '🔔', '🍋', '⭐', '💎', '7️⃣'], [[0,1,2]]);
    game.isSpinning = true;
    const result = game.spin(10, 100, () => {});
    expect(result).toBeUndefined();
  });

  describe('spinAsync', () => {
    it('should return a Promise', () => {
      const game = new SlotMachineGame(['🍒', '🔔', '🍋', '⭐', '💎', '7️⃣'], [[0,1,2]]);
      const result = game.spinAsync(10, 100);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('checkWinnings', () => {
    it('should detect winning lines', () => {
      const game = new SlotMachineGame(['🍒', '🔔', '🍋', '⭐', '💎', '7️⃣'], [[0,1,2],[3,4,5],[6,7,8]]);
      game.currentMatrix = ['🍒', '🍒', '🍒', '⭐', '⭐', '⭐', '🔔', '🔔', '🔔'];
      
      let result;
      game.checkWinnings(10, (res) => { result = res; });
      
      expect(result.isWin).toBe(true);
      expect(result.winAmount).toBe(10 * 2 + 10 * 15 + 10 * 5); // 2+15+5
    });

    it('should return 0 winAmount for no matches', () => {
      const game = new SlotMachineGame(['🍒', '🔔', '🍋', '⭐', '💎', '7️⃣'], [[0,1,2]]);
      game.currentMatrix = ['🍒', '🔔', '🍋', '⭐', '💎', '7️⃣', '🍒', '🔔', '🍋'];
      
      let result;
      game.checkWinnings(10, (res) => { result = res; });
      
      expect(result.isWin).toBe(false);
      expect(result.winAmount).toBe(0);
    });
  });
});
