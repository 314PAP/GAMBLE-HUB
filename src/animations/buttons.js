import { gsap } from 'gsap';

/**
 * Initialize glassy button animations across the UI.
 * Applies to all button variants used in the game (regular, numeric,
 * bet, auto, and icon‑only). The animations mimic arcade‑machine
 * lighting: a subtle neon pulse, a soft fade‑in on page load, and a
 * hover scale with a quick flash.
 */
export function initButtonAnimations() {
  const buttons = document.querySelectorAll(
    '.btn, .btn-num, .btn-bet, .btn-auto, .btn-icon-only'
  );

  buttons.forEach((btn) => {
    // Fade‑in from below with a slight delay for a smooth entrance
    gsap.from(btn, { opacity: 0, y: 10, duration: 0.8, ease: 'power2.out' });

    // Neon pulse – continuously vary the glow to emulate a blinking sign
    gsap.to(btn, {
      boxShadow: `0 0 20px var(--neon-pink-glow)`,
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: 'sine.inOut',
    });

    // Hover interaction – a quick scale‑up and subtle brighten
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { scale: 1.05, duration: 0.2, ease: 'power1.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power1.in' });
    });
  });
}
