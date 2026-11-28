/**
 * Screen Wake Lock helper — keeps mobile display awake during AutoPlay.
 */
let wakeLockSentinel = null;

/**
 * Request a screen wake lock if supported by the browser.
 */
export async function requestWakeLock() {
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return false;
  try {
    if (!wakeLockSentinel) {
      wakeLockSentinel = await navigator.wakeLock.request("screen");
      wakeLockSentinel.addEventListener?.("release", () => {
        wakeLockSentinel = null;
      });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Release the active screen wake lock.
 */
export async function releaseWakeLock() {
  if (!wakeLockSentinel) return;
  try {
    await wakeLockSentinel.release();
  } catch {
    // Ignore release errors
  } finally {
    wakeLockSentinel = null;
  }
}
