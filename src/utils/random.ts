// ============================================================
// random.ts — Seeded deterministic random utilities
// ============================================================

/**
 * Mulberry32 seeded PRNG — fast, good distribution, 32-bit seed.
 * Returns a new function that produces numbers in [0, 1).
 */
export function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return function (): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
  };
}

/** Integer in [min, max] inclusive. */
export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Pick a random element from an array. */
export function randChoice<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Shuffle array in-place using Fisher-Yates. */
export function shuffle<T>(rng: () => number, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Sample k unique items from arr without replacement. */
export function sampleWithout<T>(rng: () => number, arr: T[], k: number): T[] {
  const copy = [...arr];
  shuffle(rng, copy);
  return copy.slice(0, k);
}
