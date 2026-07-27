import { describe, it, expect, vi } from 'vitest';

describe('FPS meter logic', () => {
  function calculateFPS(frames, elapsedMs) {
    if (elapsedMs === 0) return 0;
    return Math.round((frames * 1000) / elapsedMs);
  }

  function getFPSColor(fps) {
    if (fps < 30) return 'var(--neon-red)';
    if (fps < 50) return 'var(--neon-orange)';
    return 'var(--neon-green)';
  }

  describe('calculateFPS', () => {
    it('should calculate 60 FPS for 60 frames in 1000ms', () => {
      expect(calculateFPS(60, 1000)).toBe(60);
    });

    it('should calculate 30 FPS for 30 frames in 1000ms', () => {
      expect(calculateFPS(30, 1000)).toBe(30);
    });

    it('should handle 0 elapsed time', () => {
      expect(calculateFPS(60, 0)).toBe(0);
    });

    it('should handle fractional FPS', () => {
      expect(calculateFPS(1, 100)).toBe(10);
    });
  });

  describe('getFPSColor', () => {
    it('should return green for 60 FPS', () => {
      expect(getFPSColor(60)).toBe('var(--neon-green)');
    });

    it('should return green for 50 FPS', () => {
      expect(getFPSColor(50)).toBe('var(--neon-green)');
    });

    it('should return orange for 40 FPS', () => {
      expect(getFPSColor(40)).toBe('var(--neon-orange)');
    });

    it('should return orange for 30 FPS', () => {
      expect(getFPSColor(30)).toBe('var(--neon-orange)');
    });

    it('should return red for 20 FPS', () => {
      expect(getFPSColor(20)).toBe('var(--neon-red)');
    });

    it('should return red for 10 FPS', () => {
      expect(getFPSColor(10)).toBe('var(--neon-red)');
    });
  });
});
