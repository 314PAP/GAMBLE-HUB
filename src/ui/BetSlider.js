import { formatLargeNumber } from '../utils.js';

/**
 * BetSlider — Interactive bet amount slider module
 *
 * Layout:
 *   [◄]  [track with thumb]  [value]  [►]
 *
 * Features:
 * - Click/hold arrow buttons to step (with acceleration on hold)
 * - Click on track to jump to position
 * - Drag thumb for any value
 * - Value displayed in abbreviated format (K, M, Mld…)
 * - Same visual style as bet-btn components
 */
export class BetSlider {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.container  - Element to mount the slider into
   * @param {number}      opts.min        - Minimum bet (default: 10)
   * @param {number}      opts.max        - Maximum bet (= current balance)
   * @param {number}      opts.step       - Base step for arrow buttons (default: 10)
   * @param {number}      opts.value      - Initial value
   * @param {function}    opts.onChange   - Callback(newValue: number)
   */
  constructor({ container, min = 10, max = 1000, step = 10, value = 10, onChange = () => {} }) {
    this.container = container;
    this.min = min;
    this.max = max;
    this.step = step;
    this.value = Math.max(min, Math.min(max, value));
    this.onChange = onChange;

    // Hold-to-repeat state
    this._holdTimer = null;
    this._holdInterval = null;
    this._holdCount = 0;

    // Drag state
    this._dragging = false;

    this._build();
    this._render();
  }

  // ─── Build DOM ───────────────────────────────────────────────────────────────

  _build() {
    this.container.innerHTML = '';
    this.container.className = 'bet-slider-root';
    this.container.setAttribute('role', 'group');
    this.container.setAttribute('aria-label', 'Výše sázky');

    // Left arrow button
    this.btnLeft = document.createElement('button');
    this.btnLeft.className = 'btn bet-btn bet-slider-arrow';
    this.btnLeft.setAttribute('aria-label', 'Snížit sázku');
    this.btnLeft.setAttribute('type', 'button');
    this.btnLeft.innerHTML = '&#9664;'; // ◄

    // Track wrapper
    this.trackWrap = document.createElement('div');
    this.trackWrap.className = 'bet-slider-track-wrap';

    // Track background
    this.track = document.createElement('div');
    this.track.className = 'bet-slider-track';
    this.track.setAttribute('role', 'none');

    // Fill bar
    this.fill = document.createElement('div');
    this.fill.className = 'bet-slider-fill';

    // Thumb
    this.thumb = document.createElement('div');
    this.thumb.className = 'bet-slider-thumb';
    this.thumb.setAttribute('role', 'slider');
    this.thumb.setAttribute('tabindex', '0');
    this.thumb.setAttribute('aria-valuemin', String(this.min));
    this.thumb.setAttribute('aria-valuemax', String(this.max));
    this.thumb.setAttribute('aria-valuenow', String(this.value));

    this.track.appendChild(this.fill);
    this.track.appendChild(this.thumb);
    this.trackWrap.appendChild(this.track);

    // Value display
    this.valueDisplay = document.createElement('div');
    this.valueDisplay.className = 'bet-slider-value';
    this.valueDisplay.setAttribute('aria-live', 'polite');
    this.valueDisplay.setAttribute('aria-atomic', 'true');

    // Right arrow button
    this.btnRight = document.createElement('button');
    this.btnRight.className = 'btn bet-btn bet-slider-arrow';
    this.btnRight.setAttribute('aria-label', 'Zvýšit sázku');
    this.btnRight.setAttribute('type', 'button');
    this.btnRight.innerHTML = '&#9654;'; // ►

    this.container.appendChild(this.btnLeft);
    this.container.appendChild(this.trackWrap);
    this.container.appendChild(this.btnRight);
    this.container.appendChild(this.valueDisplay);

    this._bindEvents();
  }

  // ─── Events ──────────────────────────────────────────────────────────────────

  _bindEvents() {
    // Arrow buttons — click + hold
    this.btnLeft.addEventListener('pointerdown', (e) => { e.preventDefault(); this._startHold(-1); });
    this.btnRight.addEventListener('pointerdown', (e) => { e.preventDefault(); this._startHold(1); });

    const stopHold = () => this._stopHold();
    document.addEventListener('pointerup', stopHold);
    document.addEventListener('pointercancel', stopHold);

    // Track click to jump
    this.track.addEventListener('pointerdown', (e) => {
      if (e.target === this.thumb) return;
      e.preventDefault();
      this._jumpToPointer(e);
    });

    // Thumb drag — pointer events
    this.thumb.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._dragging = true;
      this.thumb.setPointerCapture(e.pointerId);
    });
    this.thumb.addEventListener('pointermove', (e) => {
      if (!this._dragging) return;
      e.preventDefault();
      this._moveToPointer(e);
    });
    this.thumb.addEventListener('pointerup', () => { this._dragging = false; });
    this.thumb.addEventListener('pointercancel', () => { this._dragging = false; });

    // Keyboard on thumb
    this.thumb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        this._step(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        this._step(1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        this._setValue(this.min);
      } else if (e.key === 'End') {
        e.preventDefault();
        this._setValue(this.max);
      }
    });
  }

  // ─── Hold-to-repeat with acceleration ────────────────────────────────────────

  _startHold(dir) {
    this._holdCount = 0;
    this._step(dir);

    this._holdTimer = setTimeout(() => {
      this._holdInterval = setInterval(() => {
        this._holdCount++;
        // Accelerate: every 10 ticks, double the step (up to 64×)
        const accel = Math.min(64, Math.pow(2, Math.floor(this._holdCount / 10)));
        this._step(dir, accel);
      }, 80);
    }, 350);
  }

  _stopHold() {
    clearTimeout(this._holdTimer);
    clearInterval(this._holdInterval);
    this._holdTimer = null;
    this._holdInterval = null;
    this._holdCount = 0;
  }

  // ─── Value manipulation ───────────────────────────────────────────────────────

  _step(dir, accel = 1) {
    const delta = dir * this.step * accel;
    this._setValue(this.value + delta);
  }

  _jumpToPointer(e) {
    const rect = this.track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const raw = this.min + ratio * (this.max - this.min);
    this._setValue(Math.round(raw / this.step) * this.step);
  }

  _moveToPointer(e) {
    const rect = this.track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const raw = this.min + ratio * (this.max - this.min);
    this._setValue(Math.round(raw / this.step) * this.step);
  }

  _setValue(val) {
    const clamped = Math.max(this.min, Math.min(this.max, Math.round(val)));
    if (clamped === this.value) return;
    this.value = clamped;
    this._render();
    this.onChange(this.value);
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  _render() {
    const pct = this.max > this.min
      ? ((this.value - this.min) / (this.max - this.min)) * 100
      : 0;

    this.fill.style.width = `${pct}%`;
    this.thumb.style.left = `${pct}%`;
    this.thumb.setAttribute('aria-valuenow', String(this.value));
    this.valueDisplay.textContent = formatLargeNumber(this.value);

    // Disable arrows at limits
    this.btnLeft.disabled = this.value <= this.min;
    this.btnRight.disabled = this.value >= this.max;
  }

  // ─── Public API ───────────────────────────────────────────────────────────────

  /** Set slider value programmatically (no onChange callback fired) */
  setValue(val) {
    const clamped = Math.max(this.min, Math.min(this.max, Math.round(val)));
    this.value = clamped;
    this._render();
  }

  /** Update the maximum (e.g. after balance change) */
  setMax(newMax) {
    this.max = Math.max(this.min, newMax);
    this.thumb.setAttribute('aria-valuemax', String(this.max));
    // Clamp current value to new max
    if (this.value > this.max) {
      this.value = this.max;
      this.onChange(this.value);
    }
    this._render();
  }

  /** Destroy the slider (remove DOM and listeners) */
  destroy() {
    this._stopHold();
    this.container.innerHTML = '';
  }
}
