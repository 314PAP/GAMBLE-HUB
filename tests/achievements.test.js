import { describe, it, expect, beforeEach } from "vitest";
import {
  ACHIEVEMENTS,
  evaluateAchievements,
  getPlayerAchievements,
} from "../src/achievements.js";

describe("Achievements", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return all achievements locked initially", () => {
    const list = getPlayerAchievements("Alice");
    expect(list.length).toBe(ACHIEVEMENTS.length);
    expect(list.every((a) => !a.unlocked)).toBe(true);
  });

  it("should unlock first_win and high_roller and not duplicate on repeat", () => {
    const first = evaluateAchievements("Alice", {
      gameName: "Kostka",
      betAmount: 500,
      isWin: true,
      newBalance: 1000,
    });
    expect(first.map((a) => a.id)).toContain("first_win");
    expect(first.map((a) => a.id)).toContain("high_roller");

    const second = evaluateAchievements("Alice", {
      gameName: "Kostka",
      betAmount: 500,
      isWin: true,
      newBalance: 1500,
    });
    expect(second.map((a) => a.id)).not.toContain("first_win");
    expect(second.map((a) => a.id)).not.toContain("high_roller");
  });

  it("should unlock win_streak_5 after 5 consecutive wins and reset on loss", () => {
    for (let i = 0; i < 4; i++) {
      evaluateAchievements("Bob", { gameName: "Kostka", isWin: true });
    }
    // Loss resets streak
    evaluateAchievements("Bob", { gameName: "Kostka", isWin: false });
    const afterReset = evaluateAchievements("Bob", { gameName: "Kostka", isWin: true });
    expect(afterReset.map((a) => a.id)).not.toContain("win_streak_5");

    for (let i = 0; i < 4; i++) {
      const unlocked = evaluateAchievements("Bob", { gameName: "Kostka", isWin: true });
      if (i === 3) {
        expect(unlocked.map((a) => a.id)).toContain("win_streak_5");
      }
    }
  });

  it("should unlock jackpot_slots, rich_10k, broke_survivor, and all_games", () => {
    const games = ["Hádanka 1-10", "Hádanka 1-5", "Kostka", "Ruleta", "Automat", "VíceMéně", "Miny"];
    let last;
    games.forEach((g) => {
      last = evaluateAchievements("Pro", {
        gameName: g,
        isWin: true,
        isJackpot: g === "Automat",
        newBalance: 12000,
        usedBailout: true,
      });
    });
    const all = getPlayerAchievements("Pro");
    const unlockedIds = all.filter((a) => a.unlocked).map((a) => a.id);
    expect(unlockedIds).toContain("jackpot_slots");
    expect(unlockedIds).toContain("rich_10k");
    expect(unlockedIds).toContain("broke_survivor");
    expect(unlockedIds).toContain("all_games");
    expect(last.map((a) => a.id)).toContain("all_games");
  });
});
