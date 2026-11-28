import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  spawnFloatingText,
  triggerScreenFlash,
  triggerCameraShake,
  spawnCoinShower,
  animateBetChip,
} from "../src/arcadeEffects.js";
import {
  playCoinDrop,
  playWheelTick,
  playAchievementUnlock,
  playLevelUp,
  playCashOut,
  playNearMiss,
} from "../src/soundEffects.js";
import { sound } from "../src/sound.js";

describe("arcadeEffects", () => {
  beforeEach(() => {
    const mockEl = () => ({
      style: {},
      setAttribute: vi.fn(),
      remove: vi.fn(),
      textContent: "",
    });
    globalThis.document = {
      body: {
        appendChild: vi.fn(),
      },
      createElement: vi.fn(() => mockEl()),
      getElementById: vi.fn(() => mockEl()),
    };
  });

  it("spawnFloatingText appends and animates a floating element", () => {
    spawnFloatingText("+500 🪙");
    expect(document.createElement).toHaveBeenCalledWith("div");
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  it("triggerScreenFlash appends a flash overlay", () => {
    triggerScreenFlash("rgba(255, 215, 0, 0.35)", 0.3);
    expect(document.createElement).toHaveBeenCalledWith("div");
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  it("triggerCameraShake runs without throwing", () => {
    expect(() => triggerCameraShake(8, 0.2)).not.toThrow();
  });

  it("spawnCoinShower spawns requested number of particles", () => {
    spawnCoinShower(5);
    expect(document.body.appendChild).toHaveBeenCalledTimes(5);
  });

  it("animateBetChip handles null and valid elements", () => {
    expect(() => animateBetChip(null)).not.toThrow();
    expect(() => animateBetChip({ style: {} })).not.toThrow();
  });
});

describe("soundEffects", () => {
  beforeEach(() => {
    sound.isMuted = false;
    sound.playTone = vi.fn();
  });

  it("plays coin drop, wheel tick, achievement, level up, cash out, and near miss when unmuted", () => {
    playCoinDrop();
    playWheelTick();
    playAchievementUnlock();
    playLevelUp();
    playCashOut();
    playNearMiss();
    expect(sound.playTone).toHaveBeenCalled();
  });

  it("does not play tones when muted", () => {
    sound.isMuted = true;
    playCoinDrop();
    playWheelTick();
    playAchievementUnlock();
    playLevelUp();
    playCashOut();
    playNearMiss();
    expect(sound.playTone).not.toHaveBeenCalled();
  });
});
