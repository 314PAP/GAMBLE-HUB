/**
 * Hot Streak tracker — tracks consecutive wins per player.
 */
const streaks = new Map();

/**
 * Record a round outcome and return current streak info.
 * @param {string} player
 * @param {boolean} isWin
 * @returns {{ count: number, isHot: boolean, bonusXp: number }}
 */
export function recordStreak(player, isWin) {
  if (!player) return { count: 0, isHot: false, bonusXp: 0 };
  if (!isWin) {
    streaks.set(player, 0);
    return { count: 0, isHot: false, bonusXp: 0 };
  }
  const next = (streaks.get(player) || 0) + 1;
  streaks.set(player, next);
  const isHot = next >= 3;
  const bonusXp = isHot ? next * 5 : 0;
  return { count: next, isHot, bonusXp };
}

/**
 * Get current win streak for a player.
 * @param {string} player
 * @returns {number}
 */
export function getStreak(player) {
  return streaks.get(player) || 0;
}
