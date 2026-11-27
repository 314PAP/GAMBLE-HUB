/**
 * Lightweight Provably Fair seed generator and local SHA-256 verifier.
 */

export async function sha256Hex(input) {
  if (typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined") {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Deterministic fallback for non-secure contexts
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function randomSeedHex(bytes = 16) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(16).slice(2).padEnd(bytes * 2, "0").slice(0, bytes * 2);
}

export async function generateFairSeedPair(clientSeed = randomSeedHex(8)) {
  const serverSeed = randomSeedHex(16);
  const serverSeedHash = await sha256Hex(serverSeed);
  return { serverSeed, serverSeedHash, clientSeed, nonce: 1 };
}

export async function verifyFairSeed(serverSeed, expectedHash) {
  const actual = await sha256Hex(serverSeed);
  return actual === expectedHash;
}
