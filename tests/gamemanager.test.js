import { describe, it, expect } from 'vitest';
import { GAME_CONFIG, DISPLAY_STATES } from '../src/games.js';

describe('GAME_CONFIG', () => {
  it('should have 6 games defined', () => {
    expect(Object.keys(GAME_CONFIG).length).toBe(6);
  });

  it('should have required fields for each game', () => {
    Object.values(GAME_CONFIG).forEach((cfg) => {
      expect(cfg).toHaveProperty('resultBox');
      expect(cfg).toHaveProperty('hiloColor');
      expect(cfg).toHaveProperty('label');
      expect(cfg).toHaveProperty('minVal');
      expect(cfg).toHaveProperty('maxVal');
      expect(cfg).toHaveProperty('multVal');
    });
  });

  it('should have valid resultBox values', () => {
    const validBoxes = ['resBoxClassic', 'resBoxDice', 'resBoxSlots', 'resBoxHilo'];
    Object.values(GAME_CONFIG).forEach((cfg) => {
      expect(validBoxes).toContain(cfg.resultBox);
    });
  });
});

describe('DISPLAY_STATES', () => {
  it('should have 6 games defined', () => {
    expect(Object.keys(DISPLAY_STATES).length).toBe(6);
  });

  it('should have title and display flags for each game', () => {
    Object.values(DISPLAY_STATES).forEach((state) => {
      expect(state).toHaveProperty('title');
      expect(state).toHaveProperty('classic');
      expect(state).toHaveProperty('dice');
      expect(state).toHaveProperty('slots');
      expect(state).toHaveProperty('hilo');
    });
  });

  it('should have exactly one true display flag per game', () => {
    Object.values(DISPLAY_STATES).forEach((state) => {
      const flags = [state.classic, state.dice, state.slots, state.hilo];
      expect(flags.filter(Boolean).length).toBe(1);
    });
  });
});
