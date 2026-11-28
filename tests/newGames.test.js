import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/sound.js", () => ({
  sound: {
    isMuted: false,
    playTone: vi.fn(),
    playWin: vi.fn(),
    playLoss: vi.fn(),
    playExplosion: vi.fn(),
    playDiamond: vi.fn(),
  },
}));

import { recordStreak, getStreak } from "../src/streak.js";
import { applyTheme, cycleTheme, initTheme, THEMES } from "../src/theme.js";
import { CoinFlipGame, COINFLIP_MULTIPLIER } from "../src/games/coinflip.js";
import { TowerGame } from "../src/games/tower.js";
import { KenoGame } from "../src/games/keno.js";
import { PlinkoGame, PLINKO_MULTIPLIERS } from "../src/games/plinko.js";

describe("Hot Streak system", () => {
  it("tracks consecutive wins and resets on loss", () => {
    expect(recordStreak("alice", true)).toEqual({ count: 1, isHot: false, bonusXp: 0 });
    expect(recordStreak("alice", true)).toEqual({ count: 2, isHot: false, bonusXp: 0 });
    expect(recordStreak("alice", true)).toEqual({ count: 3, isHot: true, bonusXp: 15 });
    expect(getStreak("alice")).toBe(3);
    expect(recordStreak("alice", false)).toEqual({ count: 0, isHot: false, bonusXp: 0 });
    expect(getStreak("alice")).toBe(0);
  });
});

describe("Theme Switcher", () => {
  beforeEach(() => {
    const store = {};
    globalThis.localStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => {
        store[k] = v;
      },
    };
  });

  it("applies and cycles themes", () => {
    expect(initTheme()).toBe("cyan");
    expect(applyTheme("gold")).toBe("gold");
    expect(cycleTheme()).toBe("matrix");
    expect(THEMES.synthwave).toBeDefined();
  });
});

describe("CoinFlipGame", () => {
  it("pays 1.92x on win and 0 on loss", () => {
    const game = new CoinFlipGame();
    const win = game.flip("heads", 100, 0.1);
    expect(win.isWin).toBe(true);
    expect(win.winAmount).toBe(Math.round(100 * COINFLIP_MULTIPLIER));

    const loss = game.flip("heads", 100, 0.9);
    expect(loss.isWin).toBe(false);
    expect(loss.winAmount).toBe(0);
  });
});

describe("TowerGame", () => {
  it("climbs floors, cashes out, and explodes on trap", () => {
    const game = new TowerGame();
    game.start(100, [0, 0, 0, 0, 0, 0, 0, 0]);
    const step1 = game.pickDoor(1);
    expect(step1.safe).toBe(true);
    expect(step1.floor).toBe(1);

    const cash = game.cashOut();
    expect(cash.isWin).toBe(true);
    expect(cash.winAmount).toBeGreaterThan(100);

    game.start(100, [2, 2, 2, 2, 2, 2, 2, 2]);
    const boom = game.pickDoor(2);
    expect(boom.safe).toBe(false);
    expect(boom.finished).toBe(true);
  });
});

describe("KenoGame", () => {
  it("selects numbers up to 10 and evaluates hits", () => {
    const game = new KenoGame();
    expect(game.toggleNumber(1)).toBe(true);
    expect(game.toggleNumber(2)).toBe(true);
    expect(game.toggleNumber(3)).toBe(true);

    const res = game.play(100, [1, 2, 3, 10, 11, 12, 13, 14, 15, 16]);
    expect(res.hits).toEqual([1, 2, 3]);
    expect(res.isWin).toBe(true);
    expect(res.winAmount).toBeGreaterThan(0);
  });
});

describe("PlinkoGame", () => {
  it("drops ball and resolves bucket multiplier", () => {
    const game = new PlinkoGame();
    game.setRisk("high");
    const res = game.drop(100, [1, 1, 1, 1, 1, 1, 1, 1]);
    expect(res.bucketIndex).toBe(8);
    expect(res.multiplier).toBe(PLINKO_MULTIPLIERS.high[8]);
    expect(res.winAmount).toBe(2900);
    expect(res.isWin).toBe(true);
  });
});
