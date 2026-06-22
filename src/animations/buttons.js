import { gsap } from 'gsap';

/**
 * Initialize button entrance animations without overriding CSS button design.
 */
export function initButtonAnimations() {
  const buttons = document.querySelectorAll(
    '.btn, .btn-num, .btn-bet, .btn-auto, .btn-icon-only, .sound-toggle-btn'
  );

  buttons.forEach((btn) => {
    gsap.from(btn, { opacity: 0, y: 10, duration: 0.8, ease: 'power2.out' });
  });
}
