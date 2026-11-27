import gsap from "gsap";

import { sound } from "../sound.js";
import { formatLargeNumber } from "../utils.js";

export const WHEEL_SEGMENTS = {
  low: [0, 1.2, 1.5, 0, 1.2, 2, 1.2, 0],
  medium: [0, 1.5, 0, 2, 0, 3, 1.5, 0],
  high: [0, 0, 5, 0, 0, 10, 0, 0],
};

export class WheelGame {
  constructor() {
    this.risk = "medium";
    this.isSpinning = false;
    this.currentRotation = 0;
  }

  init() {
    this.isSpinning = false;
    this.renderSegments();
    this.setRisk(this.risk);
  }

  setRisk(risk) {
    if (!WHEEL_SEGMENTS[risk] || this.isSpinning) return;
    this.risk = risk;
    document.querySelectorAll(".wheel-risk-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.risk === risk);
    });
    this.renderSegments();
  }

  renderSegments() {
    const labelsEl = document.getElementById("wheel-labels");
    if (!labelsEl) return;
    const segments = WHEEL_SEGMENTS[this.risk];
    const step = 360 / segments.length;
    labelsEl.innerHTML = segments
      .map((mult, i) => {
        const angle = i * step + step / 2;
        const cls = mult === 0 ? "wheel-seg-zero" : mult >= 5 ? "wheel-seg-high" : "wheel-seg-win";
        return `<span class="wheel-label ${cls}" style="transform: rotate(${angle}deg) translateY(-58px)">${mult}×</span>`;
      })
      .join("");
  }

  async spinAsync(bet) {
    if (this.isSpinning) return null;
    this.isSpinning = true;

    const segments = WHEEL_SEGMENTS[this.risk];
    const index = Math.floor(Math.random() * segments.length);
    const multiplier = segments[index];
    const step = 360 / segments.length;
    const targetAngle = 360 - (index * step + step / 2);
    const extraSpins = 360 * 4;
    const nextRotation = this.currentRotation + extraSpins + ((targetAngle - (this.currentRotation % 360) + 360) % 360);
    this.currentRotation = nextRotation;

    sound.playSpin?.();

    const spinner = document.getElementById("wheel-spinner");
    if (spinner) {
      await new Promise((resolve) => {
        gsap.to(spinner, {
          rotation: nextRotation,
          duration: 2.2,
          ease: "power3.out",
          onComplete: resolve,
        });
      });
    }

    this.isSpinning = false;
    const winAmount = Math.round(bet * multiplier);
    const isWin = winAmount > 0;
    const resultText = isWin
      ? `Kolo štěstí: ${multiplier}× (+${formatLargeNumber(winAmount)})`
      : `Kolo štěstí: 0× (Prohra)`;

    return { isWin, winAmount, multiplier, resultText, bet };
  }
}
