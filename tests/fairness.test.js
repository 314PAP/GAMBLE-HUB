import { describe, it, expect } from 'vitest';
import { sha256Hex, generateFairSeedPair, verifyFairSeed } from '../src/fairness.js';

describe('Provably Fair helpers', () => {
  it('sha256Hex produces deterministic hex digest', async () => {
    const h1 = await sha256Hex('test-seed');
    const h2 = await sha256Hex('test-seed');
    expect(h1).toBe(h2);
    expect(h1.length).toBeGreaterThanOrEqual(8);
  });

  it('generateFairSeedPair and verifyFairSeed validate matching seeds', async () => {
    const pair = await generateFairSeedPair('client-123');
    expect(pair.clientSeed).toBe('client-123');
    expect(await verifyFairSeed(pair.serverSeed, pair.serverSeedHash)).toBe(true);
    expect(await verifyFairSeed('wrong-seed', pair.serverSeedHash)).toBe(false);
  });
});
