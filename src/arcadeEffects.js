import gsap from "gsap";

/**
 * Spawn a floating arcade text banner (e.g. "+500 🪙", "JACKPOT!").
 * @param {string} text
 * @param {object} [options]
 * @param {string} [options.color]
 * @param {number} [options.yOffset]
 * @param {string} [options.fontSize]
 */
export function spawnFloatingText(text, options = {}) {
  if (typeof document === "undefined" || !document.body) return;

  const {
    color = "var(--neon-gold)",
    yOffset = -90,
    fontSize = "1.35rem",
  } = options;

  const el = document.createElement("div");
  el.textContent = text;
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `
    position: fixed;
    left: 50%;
    top: 48%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1300;
    font-family: 'Press Start 2P', monospace;
    font-size: ${fontSize};
    font-weight: bold;
    color: ${color};
    text-shadow: 0 0 10px ${color}, 0 2px 6px rgba(0, 0, 0, 0.85);
    white-space: nowrap;
  `;
  document.body.appendChild(el);

  gsap.fromTo(
    el,
    { opacity: 0, scale: 0.5, y: 10 },
    {
      opacity: 1,
      scale: 1.15,
      y: yOffset * 0.4,
      duration: 0.25,
      ease: "back.out(2)",
      onComplete: () => {
        gsap.to(el, {
          opacity: 0,
          scale: 0.9,
          y: yOffset,
          duration: 0.75,
          delay: 0.35,
          ease: "power2.in",
          onComplete: () => el.remove(),
        });
      },
    },
  );
}

/**
 * Trigger a brief neon screen-edge flash overlay.
 * @param {string} [color]
 * @param {number} [duration]
 */
export function triggerScreenFlash(color = "rgba(255, 215, 0, 0.35)", duration = 0.45) {
  if (typeof document === "undefined" || !document.body) return;

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1250;
    box-shadow: inset 0 0 90px 25px ${color};
    background: radial-gradient(circle, transparent 55%, ${color} 100%);
    opacity: 0;
  `;
  document.body.appendChild(overlay);

  gsap.to(overlay, {
    opacity: 1,
    duration: duration * 0.25,
    ease: "power2.out",
    onComplete: () => {
      gsap.to(overlay, {
        opacity: 0,
        duration: duration * 0.75,
        ease: "power2.in",
        onComplete: () => overlay.remove(),
      });
    },
  });
}

/**
 * Shake the active game screen for impact (jackpot, mine explosion, crash).
 * @param {number} [intensity]
 * @param {number} [duration]
 */
export function triggerCameraShake(intensity = 8, duration = 0.4) {
  if (typeof document === "undefined") return;
  const target = document.getElementById("screen-game") || document.body;
  if (!target) return;

  gsap.killTweensOf(target, "x,y");
  const tl = gsap.timeline({
    onComplete: () => gsap.set(target, { x: 0, y: 0 }),
  });

  const steps = 6;
  const stepDur = duration / steps;
  for (let i = 0; i < steps; i++) {
    const decay = 1 - i / steps;
    const dx = (Math.random() * 2 - 1) * intensity * decay;
    const dy = (Math.random() * 2 - 1) * intensity * decay;
    tl.to(target, { x: dx, y: dy, duration: stepDur, ease: "none" });
  }
  tl.to(target, { x: 0, y: 0, duration: stepDur, ease: "power1.out" });
}

/**
 * Spawn an arcade coin & sparkle shower across the viewport.
 * @param {number} [count]
 */
export function spawnCoinShower(count = 22) {
  if (typeof document === "undefined" || !document.body) return;

  const icons = ["🪙", "💰", "✨", "💎", "⭐"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.textContent = icons[i % icons.length];
    p.setAttribute("aria-hidden", "true");
    const startX = Math.random() * 100;
    p.style.cssText = `
      position: fixed;
      left: ${startX}vw;
      top: -40px;
      pointer-events: none;
      z-index: 1220;
      font-size: ${1.1 + Math.random() * 0.8}rem;
    `;
    document.body.appendChild(p);

    const driftX = (Math.random() - 0.5) * 140;
    const fallY = (typeof window !== "undefined" ? window.innerHeight : 800) + 80;
    gsap.to(p, {
      x: driftX,
      y: fallY,
      rotation: (Math.random() - 0.5) * 720,
      opacity: 0.9,
      duration: 1.4 + Math.random() * 1.1,
      delay: Math.random() * 0.45,
      ease: "power1.in",
      onComplete: () => p.remove(),
    });
  }
}

/**
 * Quick chip-toss bounce animation on a bet button.
 * @param {HTMLElement|null} element
 */
export function animateBetChip(element) {
  if (!element) return;
  gsap.fromTo(
    element,
    { scale: 0.9 },
    { scale: 1, duration: 0.25, ease: "back.out(2.5)" },
  );
}
