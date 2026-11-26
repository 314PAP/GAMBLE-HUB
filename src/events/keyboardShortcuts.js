import { sound } from '../sound.js';

/**
 * Register global keyboard shortcuts for active gameplay.
 * @param {import('../games.js').GameManager} gm
 */
export function initKeyboardShortcuts(gm) {
  document.addEventListener('keydown', (e) => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const gameScreen = document.getElementById('screen-game');
    if (!gameScreen || !gameScreen.classList.contains('active')) return;

    if (e.code === 'Space') {
      if (gm.activeGameId === 5) {
        e.preventDefault();
        gm.playSlots();
      } else if (gm.activeGameId === 7 && !gm.mines?.isActive) {
        e.preventDefault();
        gm.startMines();
      }
    } else if (e.key === 'h' || e.key === 'H') {
      if (gm.activeGameId === 6) gm.playHilo('H');
    } else if (e.key === 'l' || e.key === 'L') {
      if (gm.activeGameId === 6) gm.playHilo('L');
    } else if (e.key === 'm' || e.key === 'M') {
      sound.toggleMute();
    } else if (e.code === 'ArrowLeft') {
      gm.setBet(Math.max(10, gm.activeBet - 10));
    } else if (e.code === 'ArrowRight') {
      gm.setBet(gm.activeBet + 10);
    }
  });
}
