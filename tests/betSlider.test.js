import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BetSlider } from '../src/ui/BetSlider.js';

function createMockElement(tag = 'div') {
  return {
    tagName: tag.toUpperCase(),
    className: '',
    classList: { add: vi.fn(), remove: vi.fn() },
    dataset: {},
    onclick: null,
    innerHTML: '',
    textContent: '',
    appendChild: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(() => ''),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    style: { width: '', left: '' },
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
  };
}

function createMockContainer() {
  const el = createMockElement('div');
  el.querySelector = vi.fn((sel) => {
    if (!sel) return createMockElement();
    if (sel.includes('bet-slider')) return createMockElement();
    return createMockElement();
  });
  el.querySelectorAll = vi.fn(() => []);
  return el;
}

describe('BetSlider', () => {
  let container;
  let onChange;
  let slider;

  beforeEach(() => {
    container = createMockContainer();
    onChange = vi.fn();
  });

  afterEach(() => {
    if (slider && typeof slider.destroy === 'function') {
      slider.destroy();
    }
  });

  describe('constructor', () => {
    it('should initialize with provided values', () => {
      slider = new BetSlider({
        container,
        min: 10,
        max: 1000,
        step: 10,
        value: 100,
        onChange,
      });
      expect(slider.value).toBe(100);
      expect(slider.min).toBe(10);
      expect(slider.max).toBe(1000);
      expect(slider.step).toBe(10);
    });

    it('should clamp value to min/max range', () => {
      const lowSlider = new BetSlider({
        container,
        min: 10,
        max: 100,
        value: 5,
        onChange,
      });
      expect(lowSlider.value).toBe(10);

      const highSlider = new BetSlider({
        container,
        min: 10,
        max: 100,
        value: 150,
        onChange,
      });
      expect(highSlider.value).toBe(100);
    });

    it('should build DOM structure with appendChild', () => {
      slider = new BetSlider({
        container,
        min: 10,
        max: 100,
        step: 10,
        value: 50,
        onChange,
      });
      expect(container.appendChild).toHaveBeenCalled();
    });
  });

  describe('setValue', () => {
    beforeEach(() => {
      slider = new BetSlider({
        container,
        min: 10,
        max: 1000,
        step: 10,
        value: 100,
        onChange,
      });
    });

    it('should update value without calling onChange', () => {
      slider.setValue(200);
      expect(slider.value).toBe(200);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should clamp value to min/max', () => {
      slider.setValue(5);
      expect(slider.value).toBe(10);
      expect(onChange).not.toHaveBeenCalled();

      slider.setValue(2000);
      expect(slider.value).toBe(1000);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('step up/down', () => {
    beforeEach(() => {
      slider = new BetSlider({
        container,
        min: 10,
        max: 100,
        step: 10,
        value: 50,
        onChange,
      });
    });

    it('should step up by step amount', () => {
      slider._setValue(60);
      expect(slider.value).toBe(60);
      expect(onChange).toHaveBeenCalledWith(60);
    });

    it('should not exceed max on step up', () => {
      slider.setValue(100);
      expect(slider.value).toBe(100);
    });

    it('should not go below min on step down', () => {
      slider.setValue(10);
      expect(slider.value).toBe(10);
    });
  });

  describe('formatLargeNumber', () => {
    it('should format 1000 as 1K', () => {
      const sliderK = new BetSlider({
        container,
        min: 10,
        max: 2000,
        step: 10,
        value: 1000,
        onChange,
      });
      expect(sliderK.value).toBe(1000);
    });

    it('should format 1000000 as 1M', () => {
      const sliderM = new BetSlider({
        container,
        min: 1,
        max: 2000000,
        step: 1,
        value: 1000000,
        onChange,
      });
      expect(sliderM.value).toBe(1000000);
    });
  });
});
