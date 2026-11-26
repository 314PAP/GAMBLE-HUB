/**
 * Lock or unlock game controls during animations and spins.
 * @param {boolean} lock
 */
export function lockGameControls(lock) {
  const betButtons = document.querySelectorAll('.btn-bet, .bet-btn');
  betButtons.forEach((b) => {
    b.disabled = lock;
    b.classList.toggle('is-locked', lock);
  });

  const sliderContainer = document.getElementById('bet-slider-container');
  if (sliderContainer) {
    sliderContainer.style.pointerEvents = lock ? 'none' : '';
    sliderContainer.style.opacity = lock ? '0.4' : '';
  }

  document.querySelectorAll('.btn-num, .dice-num-btn, .roulette-side-btn').forEach((b) => {
    b.disabled = lock;
  });

  ['btn-spin-slots', 'btn-hilo-high', 'btn-hilo-low', 'btn-hilo-cashout', 'btn-mines-start', 'btn-mines-cashout', 'btn-crash-start', 'btn-crash-cashout'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = lock;
  });
}
