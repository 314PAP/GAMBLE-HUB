import { describe, it, expect, vi } from "vitest";
import { MinesGame, MINES_GRID_SIZE } from "../src/games/mines.js";

vi.mock("../src/sound", () => ({
  sound: {
    playWinBonus: vi.fn(),
    playLoss: vi.fn(),
  },
}));

describe("MinesGame", () => {
  it("should initialize with 25-tile grid and default 3 mines", () => {
    const game = new MinesGame();
    expect(game.gridSize).toBe(MINES_GRID_SIZE);
    expect(game.minesCount).toBe(3);
    expect(game.isActive).toBe(false);
  });

  it("should allow changing mine count only when inactive", () => {
    const game = new MinesGame();
    expect(game.setMinesCount(5)).toBe(true);
    expect(game.minesCount).toBe(5);
    expect(game.setMinesCount(99)).toBe(false);

    game.start(100, [0, 1, 2, 3, 4]);
    expect(game.setMinesCount(1)).toBe(false);
  });

  it("should calculate progressive multipliers accurately", () => {
    const game = new MinesGame();
    expect(game.calculateMultiplier(0, 3)).toBe(1);
    // Step 1 with 3 mines: 0.95 * (25/22) = 1.0795 -> 1.08
    expect(game.calculateMultiplier(1, 3)).toBeCloseTo(1.08, 2);
    // Step 1 with 10 mines: 0.95 * (25/15) = 1.5833 -> 1.58
    expect(game.calculateMultiplier(1, 10)).toBeCloseTo(1.58, 2);
  });

  it("should handle safe tile reveals and cashOut", () => {
    const game = new MinesGame();
    game.setMinesCount(3);
    game.start(100, [0, 1, 2]);

    const r1 = game.revealTile(5);
    expect(r1.status).toBe("safe");
    expect(r1.safeCount).toBe(1);
    expect(r1.multiplier).toBeCloseTo(1.08, 2);

    const r2 = game.revealTile(6);
    expect(r2.status).toBe("safe");
    expect(r2.safeCount).toBe(2);

    const cash = game.cashOut();
    expect(cash).not.toBeNull();
    expect(cash.isWin).toBe(true);
    expect(cash.winAmount).toBe(Math.round(100 * r2.multiplier));
    expect(game.isActive).toBe(false);
  });

  it("should end round as loss when hitting a mine", () => {
    const game = new MinesGame();
    game.start(100, [4, 8, 12]);
    const res = game.revealTile(4);
    expect(res.status).toBe("mine");
    expect(res.isWin).toBe(false);
    expect(res.winAmount).toBe(0);
    expect(game.isActive).toBe(false);
  });

  it("should auto-win when all safe tiles are cleared", () => {
    const game = new MinesGame();
    game.setMinesCount(1);
    const mines = [24];
    game.start(100, mines);

    let lastRes;
    for (let i = 0; i < 24; i++) {
      lastRes = game.revealTile(i);
    }
    expect(lastRes.status).toBe("cleared");
    expect(lastRes.isWin).toBe(true);
    expect(lastRes.winAmount).toBeGreaterThan(100);
    expect(game.isActive).toBe(false);
  });
});
