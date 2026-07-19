import { gsap } from 'gsap';

export function initTitleFlicker() {
  const title = document.querySelector('h1');
  if (!title) return;
  gsap.to(title, {
    opacity: 0.85,
    duration: 0.4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}

/* === RULE 4: Neon Flicker – simulates old neon tube instabilit === */
export function initNeonFlicker(element, colorGlow) {
  if (!element) return;
  const glow = colorGlow || 'rgba(0, 240, 255, 0.6)';
  gsap.to(element, {
    opacity: 0.82,
    duration: 0.12 + Math.random() * 0.25,
    repeat: -1,
    yoyo: true,
    ease: 'steps(1)',
    onRepeat: function() {
      // occasional longer flicker
      if (Math.random() < 0.08) {
        gsap.set(element, { opacity: 0.4, textShadow: `0 0 2px ${glow}` });
        gsap.to(element, { opacity: 0.9, textShadow: `0 0 8px ${glow}, 0 0 16px ${glow}`, duration: 0.08, delay: 0.06 });
      }
    }
  });
}

/* Idle pulse for spin button / game title */
export function initIdlePulse(element) {
  if (!element) return;
  gsap.to(element, {
    scale: 1.03,
    duration: 1.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}

export function animateScreenIn(element) {
  gsap.fromTo(element, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
}

export function initModalAnimations() {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  const content = modal.querySelector('.modal-content');

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.attributeName === 'class' && modal.classList.contains('show')) {
        gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
        gsap.fromTo(content, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
      }
    });
  });
  observer.observe(modal, { attributes: true });
}

export function initInfoPanelAnimations() {
  const panel = document.querySelector('.info-panel');
  if (!panel) return;
  const content = panel.querySelector('.info-panel-content');

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.attributeName === 'class' && panel.classList.contains('show')) {
        gsap.fromTo(content, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
      }
    });
  });
  observer.observe(panel, { attributes: true });
}

export function initStatusBoxAnimation() {
  const box = document.querySelector('.status-box');
  if (!box) return;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.attributeName === 'class' && box.classList.contains('show')) {
        gsap.fromTo(box, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' });
      }
    });
  });
  observer.observe(box, { attributes: true });
}

export function initSockaShake() {
  const icon = document.querySelector('.socka-icon');
  if (!icon) return;
  gsap.to(icon, { rotation: 5, duration: 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
}

export function initPulseSeven() {
  document.querySelectorAll('.slot-cell.sym-seven').forEach((el) => {
    gsap.to(el, { scale: 1.15, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
}

export function animateSlotWin(cell) {
  gsap.to(cell, {
    backgroundColor: 'rgba(255, 238, 0, 0.4)',
    boxShadow: 'inset 0 0 20px var(--neon-gold-glow)',
    duration: 0.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}

// Animate AUTO button during auto-spin with yellow glow
export function animateAutoSpinGlow(autoBtn) {
  if (!autoBtn) return;
  gsap.killTweensOf(autoBtn);
  gsap.to(autoBtn, {
    boxShadow: '0 0 25px rgba(255, 215, 0, 0.7), inset 0 0 15px rgba(255, 215, 0, 0.2)',
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}

export function stopAutoSpinGlow(autoBtn) {
  if (!autoBtn) return;
  gsap.killTweensOf(autoBtn);
  autoBtn.style.boxShadow = '';
}
