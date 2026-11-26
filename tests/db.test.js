import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameDatabase } from '../src/db.js';

describe('GameDatabase', () => {
  let db;

  beforeEach(() => {
    localStorage.clear();
    db = new GameDatabase();
  });

  it('should create a new player with starting balance', () => {
    const result = db.createPlayer('test');
    expect(result.success).toBe(true);
    expect(db.getPlayerBalance('test')).toBe(GameDatabase.STARTING_BALANCE);
  });

  it('should not create player with empty name', () => {
    const result = db.createPlayer('');
    expect(result.success).toBe(false);
  });

  it('should not create player with name > 5 chars', () => {
    const result = db.createPlayer('toolong');
    expect(result.success).toBe(false);
  });

  it('should not create duplicate player', () => {
    db.createPlayer('test');
    const result = db.createPlayer('test');
    expect(result.success).toBe(false);
  });

  it('should delete player', () => {
    db.createPlayer('test');
    expect(db.deletePlayer('test')).toBe(true);
    expect(db.deletePlayer('test')).toBe(false);
  });

  it('should update player balance', () => {
    db.createPlayer('test');
    db.updatePlayerBalance('test', 1000);
    expect(db.getPlayerBalance('test')).toBe(1000);
  });

  it('should not allow negative balance', () => {
    db.createPlayer('test');
    db.updatePlayerBalance('test', -100);
    expect(db.getPlayerBalance('test')).toBe(0);
  });

  it('should record match and update stats', () => {
    db.createPlayer('test');
    db.recordMatch('test', 'Hádanka', 10, 'VÝHRA', true);
    const stats = db.getStats('test');
    expect(stats.vyhry).toBe(1);
    expect(stats.prohry).toBe(0);
    expect(stats.historie.length).toBe(1);
  });

  it('should keep only last 10 history records', () => {
    db.createPlayer('test');
    for (let i = 0; i < 15; i++) {
      db.recordMatch('test', 'Hráda', 10, i % 2 === 0 ? 'VÝHRA' : 'PROHRA', i % 2 === 0);
    }
    expect(db.getStats('test').historie.length).toBeLessThanOrEqual(GameDatabase.MAX_HISTORY);
  });

  it('should export and import data', () => {
    db.createPlayer('test');
    db.recordMatch('test', 'Hádanka', 10, 'VÝHRA', true);
    const exported = db.exportData();
    expect(exported.u).toBeDefined();
    expect(exported.s).toBeDefined();
    expect(exported.h).toBeDefined();
  });

  it('should return default stats for non-existent player', () => {
    const stats = db.getStats('nonexistent');
    expect(stats.vyhry).toBe(0);
    expect(stats.prohry).toBe(0);
    expect(stats.historie).toEqual([]);
  });

  it('should return empty leaderboard when no players', () => {
    const leaderboard = db.getLeaderboard();
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBe(0);
  });

  it('should update leaderboard with milestones', () => {
    db.createPlayer('test');
    db.updatePlayerBalance('test', 1000);
    db.checkMilestones('test', GameDatabase.STARTING_BALANCE, 1000);
    const leaderboard = db.getLeaderboard();
    expect(leaderboard.length).toBeGreaterThan(0);
    expect(leaderboard[0].jmeno).toBe('test');
  });

  it('should not add to leaderboard below starting balance', () => {
    db.createPlayer('test');
    db.updatePlayerBalance('test', 300);
    db.checkMilestones('test', GameDatabase.STARTING_BALANCE, 300);
    const leaderboard = db.getLeaderboard();
    expect(leaderboard.length).toBe(0);
  });

  it('should record multiple matches correctly', () => {
    db.createPlayer('test');
    db.recordMatch('test', 'Hádanka', 10, 'VÝHRA', true);
    db.recordMatch('test', 'Kostka', 20, 'PROHRA', false);
    db.recordMatch('test', 'Ruleta', 30, 'VÝHRA', true);
    const stats = db.getStats('test');
    expect(stats.vyhry).toBe(2);
    expect(stats.prohry).toBe(1);
    expect(stats.historie.length).toBe(3);
  });

  it('should claim daily bonus once per day and increment streak on consecutive days', () => {
    db.createPlayer('test');
    const day1 = new Date('2026-11-20T12:00:00Z');
    const day2 = new Date('2026-11-21T12:00:00Z');

    const res1 = db.claimDailyBonus('test', 250, day1);
    expect(res1).toEqual({ success: true, amount: 250, streak: 1 });
    expect(db.getPlayerBalance('test')).toBe(750);

    const res1Again = db.claimDailyBonus('test', 250, day1);
    expect(res1Again).toEqual({ success: false, amount: 0, streak: 1 });

    const res2 = db.claimDailyBonus('test', 250, day2);
    expect(res2).toEqual({ success: true, amount: 300, streak: 2 });
    expect(db.getPlayerBalance('test')).toBe(1050);
  });

  it('should allow bailout only at zero balance and enforce cooldown', () => {
    db.createPlayer('test');
    expect(db.claimBailout('test', 200, 1000).success).toBe(false);

    db.updatePlayerBalance('test', 0);
    const first = db.claimBailout('test', 200, 1000);
    expect(first).toEqual({ success: true, amount: 200, remainingMs: 0 });
    expect(db.getPlayerBalance('test')).toBe(200);

    db.updatePlayerBalance('test', 0);
    const tooSoon = db.claimBailout('test', 200, 1000 + 60_000);
    expect(tooSoon.success).toBe(false);
    expect(tooSoon.remainingMs).toBe(120_000);

    const afterCooldown = db.claimBailout('test', 200, 1000 + 180_000);
    expect(afterCooldown).toEqual({ success: true, amount: 200, remainingMs: 0 });
    expect(db.getPlayerBalance('test')).toBe(200);
  });

  it('should track perGame stats and balanceHistory on recordMatch', () => {
    db.createPlayer('test');
    db.recordMatch('test', 'Kostka', 50, '6', true, 300, 750);
    db.recordMatch('test', 'Kostka', 100, '2', false, 0, 650);

    const stats = db.getStats('test');
    expect(stats.perGame.Kostka).toEqual({
      wins: 1,
      losses: 1,
      totalBet: 150,
      totalWon: 300,
      highestWin: 300,
    });
    expect(stats.balanceHistory).toEqual([750, 650]);
  });
});
