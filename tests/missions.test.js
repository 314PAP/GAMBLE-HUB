import { describe, it, expect, beforeEach } from 'vitest';
import { getPlayerMissions, updateMissionsProgress, DAILY_MISSIONS } from '../src/missions.js';

describe('Daily Missions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial uncompleted missions for a player', () => {
    const missions = getPlayerMissions('Alice');
    expect(missions).toHaveLength(DAILY_MISSIONS.length);
    expect(missions.every((m) => m.progress === 0 && !m.completed)).toBe(true);
  });

  it('tracks progress and completes a mission with reward', () => {
    expect(updateMissionsProgress('Alice', { gameName: 'Miny', isWin: true })).toEqual([]);
    expect(updateMissionsProgress('Alice', { gameName: 'Miny', isWin: true })).toEqual([]);
    const completed = updateMissionsProgress('Alice', { gameName: 'Miny', isWin: true });
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe('mines_3');
    expect(completed[0].reward).toBe(150);
  });

  it('ignores losses and respects minMult for Crash', () => {
    expect(updateMissionsProgress('Bob', { gameName: 'Crash', isWin: false, multiplier: 5 })).toEqual([]);
    expect(updateMissionsProgress('Bob', { gameName: 'Crash', isWin: true, multiplier: 2 })).toEqual([]);
    const completed = updateMissionsProgress('Bob', { gameName: 'Crash', isWin: true, multiplier: 3.5 });
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe('crash_3x');
  });
});
