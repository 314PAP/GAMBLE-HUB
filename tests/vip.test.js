import { describe, it, expect, beforeEach } from 'vitest';
import { getPlayerVip, addPlayerXp, getVipLevelInfo } from '../src/vip.js';

describe('VIP / XP system', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts at Level 1 (Nováček) with 0 XP', () => {
    const info = getPlayerVip('Alice');
    expect(info.level).toBe(1);
    expect(info.name).toBe('Nováček');
    expect(info.xp).toBe(0);
  });

  it('adds XP from bets and triggers leveledUp', () => {
    const res = addPlayerXp('Alice', 1000); // +100 XP -> Level 2
    expect(res.leveledUp).toBe(true);
    expect(res.info.level).toBe(2);
    expect(res.info.name).toBe('Hráč');
  });

  it('caps at max level gracefully', () => {
    const info = getVipLevelInfo(5000);
    expect(info.level).toBe(6);
    expect(info.nextLevel).toBeNull();
  });
});
