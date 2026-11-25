/**
 * Register global keyboard shortcuts for active gameplay.
 * @param {import('../games.js').GameManager} gm
 */
export function initKeyboardShortcuts(gm) {
  document.addEventListener('keydown', (e) => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen || !gameScreen.classList.contains('active')) return;

    if (e.code === 'Space' && gm.activeGameId === 5) {
      e.preventDefault();
      gm.playSlots();
    } else if (e.code === 'ArrowLeft') {
      gm.setBet(Math.max(10, gm.activeBet - 10));
    } else if (e.code === 'ArrowRight') {
      gm.setBet(gm.activeBet + 10);
    }
  });
}
