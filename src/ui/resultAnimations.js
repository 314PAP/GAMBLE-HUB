import gsap from "gsap";
import confetti from "canvas-confetti";
import DOMPurify from "dompurify";

import { formatLargeNumber } from "../utils.js";

/**
 * Trigger win confetti (normal burst or jackpot explosion).
 * @param {import('../ui.js').GameUI} ui
 * @param {boolean} isJackpot
 */
export function triggerWinConfetti(ui, isJackpot) {
  cancelWinConfetti(ui);

  if (isJackpot) {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    ui._confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        cancelWinConfetti(ui);
        return;
      }

      const particleCount = Math.max(1, Math.floor(50 * (timeLeft / duration)));
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.3, y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 },
      });
    }, 250);
  } else {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
    });
  }
}

/**
 * Cancel any active jackpot confetti interval.
 * @param {import('../ui.js').GameUI} ui
 */
export function cancelWinConfetti(ui) {
  if (ui._confettiInterval) {
    clearInterval(ui._confettiInterval);
    ui._confettiInterval = null;
  }
}

/**
 * Animate the win result banner with GSAP.
 */
export function animateWinResult(
  resBox,
  winAmount,
  resultText,
  isJackpot,
  _resultContainerClass = "game-result",
  resultColor = "var(--neon-orange)",
) {
  if (!resBox) return;

  const container = document.getElementById("screen-game");
  if (isJackpot && container) {
    gsap.fromTo(
      container,
      { x: -6, y: 4 },
      { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1.2, 0.25)" },
    );
  }

  gsap.killTweensOf(resBox);
  resBox.classList.remove("hidden");
  resBox.classList.add("block");
  resBox.classList.remove("visibility-hidden");
  resBox.innerHTML = `
    <span class="text-neon-gold text-lg font-bold text-glow-gold flex items-center justify-center gap-1.5">
      <span>🎉 +${formatLargeNumber(winAmount)}</span>
      <svg class="coin-icon-svg w-[1.1em] h-[1.1em]" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="url(#goldGradient)"/><text x="12" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#1a1a2e">$</text></svg>
      ${isJackpot ? "🔥" : ""}
    </span>
    <small class="font-['Press_Start_2P',monospace] block mt-1.5 text-[10px] tracking-wider text-glow-orange" style="color:${resultColor}">${DOMPurify.sanitize(resultText)}</small>
  `;

  gsap.set(resBox, {
    borderColor: "var(--neon-gold)",
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.5), 0 0 20px var(--neon-gold-glow), 0 0 40px var(--neon-gold-glow)",
  });
  gsap.set(resBox, { opacity: 0, scale: 0.8, y: 20 });
  const multiplierEl = resBox.querySelector(".hilo-result-multiplier");
  const tl = gsap.timeline();
  tl.to(resBox, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.4,
    ease: "back.out(1.7)",
  }).to(resBox, {
    opacity: 0,
    scale: 0.9,
    y: -10,
    duration: 0.5,
    ease: "power2.in",
    delay: 2.5,
    onComplete: () => {
      resBox.classList.add("hidden");
    },
  });

  if (multiplierEl) {
    tl.to(
      multiplierEl,
      { scale: 1.4, duration: 0.35, ease: "power2.out", delay: 2.2 },
      0,
    ).to(
      multiplierEl,
      { opacity: 0, scale: 1.1, duration: 0.4, ease: "power2.in", delay: 2.55 },
      0,
    );
  }

  // Spawn floating arcade coin particles around the win banner
  const parent = resBox.parentElement;
  if (parent) {
    const icons = ["🪙", "✨", "💎", "🪙", "⭐"];
    icons.forEach((icon, i) => {
      const p = document.createElement("span");
      p.textContent = icon;
      p.setAttribute("aria-hidden", "true");
      p.style.cssText =
        "position:fixed;left:50%;top:45%;pointer-events:none;z-index:1200;font-size:1.25rem;";
      document.body.appendChild(p);
      const dx = (i - 2) * 36 + (Math.random() * 20 - 10);
      const dy = -70 - Math.random() * 50;
      gsap.fromTo(
        p,
        { x: 0, y: 0, scale: 0.5, opacity: 1 },
        {
          x: dx,
          y: dy,
          scale: 1.25,
          opacity: 0,
          duration: 0.9 + Math.random() * 0.3,
          ease: "power2.out",
          onComplete: () => p.remove(),
        },
      );
    });
  }

  if (isJackpot) {
    tl.to(resBox, { scale: 1.08, duration: 0.35, ease: "power2.out", delay: 1.8 }, 0)
      .to(resBox, { x: 3, duration: 0.06, repeat: 6, yoyo: true, ease: "none", delay: 2.15 }, 0)
      .to(resBox, { scale: 1.03, duration: 0.25, ease: "power1.inOut", delay: 2.5 }, 0);
  }
}

/**
 * Animate balance elements on a loss.
 */
export function animateLossBalance() {
  const hubMoney = document.getElementById("hub-player-money");
  const gameMoney = document.getElementById("game-player-money");
  const elements = [hubMoney, gameMoney].filter((el) => el);

  if (elements.length === 0) return;

  gsap.killTweensOf(elements);
  gsap.fromTo(
    elements,
    {
      scale: 1,
      color: "var(--neon-green)",
      textShadow: "0 0 5px var(--neon-green-glow)",
    },
    {
      scale: 1.15,
      color: "var(--neon-pink)",
      textShadow: "0 0 15px var(--neon-pink-glow), 0 0 30px var(--neon-pink-glow)",
      duration: 0.15,
      ease: "power2.out",
      yoyo: true,
      repeat: 3,
      repeatDelay: 0.1,
    },
  );

  gsap.to(elements, {
    color: "var(--neon-green)",
    textShadow: "0 0 5px var(--neon-green-glow)",
    duration: 0.6,
    delay: 0.6,
  });
}
