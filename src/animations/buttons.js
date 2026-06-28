import { gsap } from 'gsap';

/**
 * Initialize button entrance animations without overriding CSS button design.
 * Only applies to static buttons present at DOM ready.
 */
export function initButtonAnimations() {
  const buttons = document.querySelectorAll(
    '#btn-enter, #btn-create-player, #btn-spin-slots, #btn-auto-slots, .btn-info-toggle, .sound-toggle-btn, #btn-game-info'
  );

  buttons.forEach((btn) => {
    gsap.from(btn, { opacity: 0, y: 10, duration: 0.8, ease: 'power2.out' });
  });
}