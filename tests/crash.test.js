import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CrashGame, generateCrashPoint, multiplierAtElapsed } from '../src/games/crash.js';

vi.mock('../src/sound.js', () => ({
  sound: {
    playClick: vi.fn(),
    playWin: vi.fn(),
    playLoss: vi.fn(),
  },
}));

describe('CrashGame', () => {
  let crash;

  beforeEach(() => {
    vi.useFakeTimers();
    crash = new CrashGame();
    crash.init();
  });

  afterEach(() => {
    crash.cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('generateCrashPoint returns 1.00 for instant-crash band and caps at 100', () => {
    expect(generateCrashPoint(0.01)).toBe(1.0);
    expect(generateCrashPoint(0.5)).toBeCloseTo(1.92, 2);
    expect(generateCrashPoint(0.9999)).toBe(100);
  });

  it('multiplierAtElapsed climbs monotonically from 1.00', () => {
    expect(multiplierAtElapsed(0)).toBe(1.0);
    expect(multiplierAtElapsed(5800)).toBeGreaterThanOrEqual(2.0);
  });

  it('allows cashOut before crashPoint and returns winAmount', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.8); // crashPoint ~ 4.80x
    const onCrash = vi.fn();
    crash.start(100, onCrash);
    expect(crash.isActive).toBe(true);

    vi.advanceTimersByTime(6000); // ~2.05x
    const res = crash.cashOut();

    expect(res).not.toBeNull();
    expect(res.bet).toBe(100);
    expect(res.multiplier).toBeGreaterThan(1.5);
    expect(res.winAmount).toBe(Math.floor(100 * res.multiplier));
    expect(crash.isActive).toBe(false);
    expect(onCrash).not.toHaveBeenCalled();
  });

  it('triggers onCrash when multiplier reaches crashPoint', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01); // instant 1.00x crash
    const onCrash = vi.fn();
    crash.start(50, onCrash);

    vi.advanceTimersByTime(100);
    expect(crash.isActive).toBe(false);
    expect(onCrash).toHaveBeenCalledTimes(1);
    expect(onCrash.mock.calls[0][0].bet).toBe(50);
  });
});
