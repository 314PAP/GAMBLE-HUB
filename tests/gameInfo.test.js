import { describe, it, expect } from 'vitest';
import { GAME_INFOS } from '../src/ui/gameInfo.js';

describe('GAME_INFOS', () => {
  it('should have 6 games defined', () => {
    expect(Object.keys(GAME_INFOS).length).toBe(6);
  });

  it('should have correct game IDs', () => {
    const ids = Object.keys(GAME_INFOS).map(Number).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should have required fields in each game info', () => {
    Object.entries(GAME_INFOS).forEach(([id, info]) => {
      expect(info).toHaveProperty('title');
      expect(info).toHaveProperty('html');
      expect(typeof info.title).toBe('string');
      expect(typeof info.html).toBe('string');
      expect(info.title.length).toBeGreaterThan(0);
      expect(info.html.length).toBeGreaterThan(0);
    });
  });

  it('should have non-empty titles', () => {
    Object.values(GAME_INFOS).forEach((info) => {
      expect(info.title.trim().length).toBeGreaterThan(0);
    });
  });

  it('should have HTML content for each game', () => {
    Object.values(GAME_INFOS).forEach((info) => {
      expect(info.html).toContain('<p>');
      expect(info.html).toContain('<ul>');
    });
  });

  it('should include game info abbreviation button', () => {
    Object.values(GAME_INFOS).forEach((info) => {
      expect(info.html).toContain('otevriAbbrevModal');
    });
  });

  it('should have valid multiplier information', () => {
    // Game 1 (1-10)
    expect(GAME_INFOS[1].html).toContain('10násobek');
    // Game 2 (1-5)
    expect(GAME_INFOS[2].html).toContain('5násobek');
    // Game 3 (dice)
    expect(GAME_INFOS[3].html).toContain('6násobek');
    // Game 4 (roulette)
    expect(GAME_INFOS[4].html).toContain('36násobek');
  });

  it('should have slots payout table', () => {
    expect(GAME_INFOS[5].html).toContain('game-info-table');
    expect(GAME_INFOS[5].html).toContain('JACKPOT');
    expect(GAME_INFOS[5].html).toContain('100x');
  });

  it('should have Hi-Lo game description', () => {
    const hiLo = GAME_INFOS[6];
    expect(hiLo.title).toBe('HI-LOW');
    expect(hiLo.html).toContain('VYŠŠÍ');
    expect(hiLo.html).toContain('NIŽŠÍ');
    expect(hiLo.html).toContain('Výplata');
    expect(hiLo.html).toContain('násobek');
  });

  it('should not contain any script tags', () => {
    Object.values(GAME_INFOS).forEach((info) => {
      expect(info.html).not.toContain('<script');
      expect(info.html).not.toContain('javascript:');
    });
  });
});
