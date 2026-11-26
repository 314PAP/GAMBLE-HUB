import { describe, it, expect, vi } from "vitest";
import { isValidScoreSubmission } from "../src/api.js";
import { handleIncomingFeedMessage } from "../src/liveFeed.js";

describe("API score validation", () => {
  it("should accept valid increasing scores within jump limit", () => {
    expect(isValidScoreSubmission(1000, 500)).toBe(true);
    expect(isValidScoreSubmission(60000, 1000)).toBe(true);
  });

  it("should reject non-increasing, negative, NaN, or excessive jump scores", () => {
    expect(isValidScoreSubmission(500, 0)).toBe(false);
    expect(isValidScoreSubmission(1000, 1000)).toBe(false);
    expect(isValidScoreSubmission(-100, 0)).toBe(false);
    expect(isValidScoreSubmission(Number.NaN, 0)).toBe(false);
    expect(isValidScoreSubmission(1_500_000_000, 0)).toBe(false);
    expect(isValidScoreSubmission(1_000_000, 600)).toBe(false);
  });
});

describe("LiveFeed", () => {
  it("should show alert on valid big_win message and ignore malformed payloads", () => {
    const ui = { showAlert: vi.fn() };
    handleIncomingFeedMessage(
      JSON.stringify({
        type: "big_win",
        username: "Pepa",
        gameName: "Automat",
        winAmount: 1500,
        isJackpot: true,
      }),
      ui
    );
    expect(ui.showAlert).toHaveBeenCalledTimes(1);
    expect(ui.showAlert.mock.calls[0][1]).toContain("JACKPOT");

    handleIncomingFeedMessage("not-json", ui);
    handleIncomingFeedMessage(JSON.stringify({ type: "other" }), ui);
    expect(ui.showAlert).toHaveBeenCalledTimes(1);
  });
});
