import { describe, it, expect } from 'vitest';
import { formatLargeNumber, parseSuffixes } from '../src/utils.js';

describe('formatLargeNumber', () => {
  it('should return 0 for 0', () => {
    expect(formatLargeNumber(0)).toBe('0');
  });

  it('should return number as string for values below 1000', () => {
    expect(formatLargeNumber(500)).toBe('500');
  });

  it('should format 1500 as 1.5 K', () => {
    expect(formatLargeNumber(1500)).toBe('1.5 K');
  });

  it('should format 1000000 as 1 M', () => {
    expect(formatLargeNumber(1000000)).toBe('1 M');
  });

  it('should format 2500000 as 2.5 M', () => {
    expect(formatLargeNumber(2500000)).toBe('2.5 M');
  });

  it('should format 1000000000 as 1 Mld', () => {
    expect(formatLargeNumber(1000000000)).toBe('1 Mld');
  });

  it('should handle negative numbers', () => {
    expect(formatLargeNumber(-1500)).toBe('-1.5 K');
  });
});

describe('parseSuffixes', () => {
  it('should return array of suffix mappings', () => {
    const suffixes = parseSuffixes();
    expect(Array.isArray(suffixes)).toBe(true);
    expect(suffixes.length).toBeGreaterThan(0);
    expect(suffixes[0]).toHaveProperty('key');
    expect(suffixes[0]).toHaveProperty('val');
  });
});
