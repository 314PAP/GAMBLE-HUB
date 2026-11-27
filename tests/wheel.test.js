import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/sound.js', () => ({
  sound: {
    playSpin: vi.fn(),
  },
}));

import { WheelGame, WHEEL_SEGMENTS } from '../src/games/wheel.js';

describe('WheelGame', () => {
  let wheel;

  beforeEach(() => {
    wheel = new WheelGame();
  });

  it('has 3 risk levels with 8 segments each', () => {
    expect(WHEEL_SEGMENTS.low).toHaveLength(8);
    expect(WHEEL_SEGMENTS.medium).toHaveLength(8);
    expect(WHEEL_SEGMENTS.high).toHaveLength(8);
  });

  it('changes risk level when not spinning', () => {
    wheel.setRisk('high');
    expect(wheel.risk).toBe('high');
  });

  it('spinAsync resolves with valid result object', async () => {
    const res = await wheel.spinAsync(100);
    expect(res).toBeTruthy();
    expect(res.bet).toBe(100);
    expect(typeof res.isWin).toBe('boolean');
    expect(typeof res.winAmount).toBe('number');
  });
});
