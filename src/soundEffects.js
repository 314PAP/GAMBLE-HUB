import { sound } from "./sound.js";

function safeTone(freq, type, duration, volume) {
  if (sound.isMuted || typeof sound.playTone !== "function") return;
  sound.playTone(freq, type, duration, volume);
}

/**
 * Play a crisp metallic coin-drop sound when placing or changing a bet.
 */
export function playCoinDrop() {
  if (sound.isMuted || typeof sound.playTone !== "function") return;
  safeTone(1318.5, "sine", 0.06, 0.09); // E6
  setTimeout(() => safeTone(1760, "sine", 0.09, 0.08), 45); // A6
}

/**
 * Play a short mechanical tick for the Wheel of Fortune.
 */
export function playWheelTick() {
  safeTone(620, "triangle", 0.025, 0.06);
}

/**
 * Play a celebratory arcade chord when unlocking an achievement or daily mission.
 */
export function playAchievementUnlock() {
  if (sound.isMuted || typeof sound.playTone !== "function") return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => safeTone(freq, "triangle", 0.14, 0.11), i * 65);
  });
}

/**
 * Play an ascending fanfare when leveling up VIP rank.
 */
export function playLevelUp() {
  if (sound.isMuted || typeof sound.playTone !== "function") return;
  const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4 -> C#6
  notes.forEach((freq, i) => {
    setTimeout(() => safeTone(freq, "sine", 0.16, 0.12), i * 75);
  });
}

/**
 * Play a cash-register style chime when cashing out in Crash, Mines, or Hi-Lo.
 */
export function playCashOut() {
  if (sound.isMuted || typeof sound.playTone !== "function") return;
  safeTone(987.77, "sine", 0.07, 0.11); // B5
  setTimeout(() => safeTone(1318.51, "sine", 0.15, 0.12), 60); // E6
  setTimeout(() => safeTone(1567.98, "triangle", 0.18, 0.1), 130); // G6
}

/**
 * Play a subtle descending tone on a near-miss or minor loss.
 */
export function playNearMiss() {
  if (sound.isMuted || typeof sound.playTone !== "function") return;
  safeTone(392, "sawtooth", 0.1, 0.06); // G4
  setTimeout(() => safeTone(311.13, "sawtooth", 0.14, 0.06), 80); // D#4
}

/**
 * Soft wooden rattle for Dice roll.
 */
export function playDiceSoft() {
  if (sound.isMuted || typeof sound.playTone !== "function") return;
  safeTone(280, "triangle", 0.035, 0.05);
  setTimeout(() => safeTone(360, "triangle", 0.035, 0.045), 55);
}

/**
 * Crisp paper-slide tone for Blackjack card deal.
 */
export function playBlackjackCard() {
  safeTone(460, "sine", 0.04, 0.05);
}

/**
 * Light chime for Guessing / Roulette number selection.
 */
export function playGuessSelect() {
  safeTone(740, "sine", 0.045, 0.05);
}

/**
 * Gentle rising blip for Crash multiplier ticks.
 */
export function playCrashRise(multiplier = 1) {
  const freq = Math.min(1200, 380 + multiplier * 45);
  safeTone(freq, "sine", 0.03, 0.035);
}
