/**
 * Haptic feedback helper using navigator.vibrate when supported.
 */

export function vibrate(pattern) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export const vibrateTap = () => vibrate(15);
export const vibrateWin = () => vibrate([25, 40, 45]);
export const vibrateLoss = () => vibrate([60, 30, 60]);
