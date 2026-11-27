import { describe, it, expect, vi, afterEach } from 'vitest';
import { vibrate, vibrateTap, vibrateWin, vibrateLoss } from '../src/haptics.js';

describe('Haptics helper', () => {
  const originalVibrate = navigator.vibrate;

  afterEach(() => {
    Object.defineProperty(navigator, 'vibrate', {
      value: originalVibrate,
      configurable: true,
    });
  });

  it('calls navigator.vibrate when available', () => {
    const mockVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      configurable: true,
    });

    expect(vibrateTap()).toBe(true);
    expect(mockVibrate).toHaveBeenCalledWith(15);

    expect(vibrateWin()).toBe(true);
    expect(mockVibrate).toHaveBeenCalledWith([25, 40, 45]);

    expect(vibrateLoss()).toBe(true);
    expect(mockVibrate).toHaveBeenCalledWith([60, 30, 60]);
  });

  it('returns false gracefully when navigator.vibrate is unavailable', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      configurable: true,
    });
    expect(vibrate(20)).toBe(false);
  });
});
