import { stopBetButtonsGlow } from '../animations/ui.js';

/**
 * Toggle slot machine autoplay on or off.
 * @param {import('../games.js').GameManager} gm
 * @param {number} intervalMs
 */
export async function toggleAutoPlay(gm, intervalMs) {
  const autoBtn = document.getElementById('btn-auto-slots');
  if (gm.autoPlayInterval) {
    stopAutoPlay(gm);
    return;
  }

  const modulesLoaded = await gm._ensureGameModules();
  if (!modulesLoaded) return;

  if (!gm.preGameChecks()) return;

  autoBtn.classList.add('active');
  autoBtn.innerHTML = '<span class="icon-node"></span> STOP';

  gm.playSlots();

  gm.autoPlayInterval = setInterval(() => {
    const balance = gm.db.getPlayerBalance(gm.currentPlayer);
    if (balance >= gm.activeBet && !gm.slots.isSpinning) {
      gm.playSlots();
    } else if (balance < gm.activeBet) {
      stopAutoPlay(gm);
    }
  }, intervalMs);
}

/**
 * Stop slot machine autoplay and restore UI controls.
 * @param {import('../games.js').GameManager} gm
 */
export function stopAutoPlay(gm) {
  if (gm.autoPlayInterval) {
    clearInterval(gm.autoPlayInterval);
    gm.autoPlayInterval = null;
  }
  const autoBtn = document.getElementById('btn-auto-slots');
  if (autoBtn) {
    autoBtn.classList.remove('active');
    autoBtn.innerHTML = '<span class="icon-node"></span> AUTO';
  }
  stopBetButtonsGlow();
  gm.lockGameControls(false);
}
