// ============================================================
// tests/game/random.test.ts
// ============================================================

import { describe, it, expect } from 'vitest';
import { createRng, randInt, randChoice, shuffle, sampleWithout } from '../../src/utils/random';

describe('createRng', () => {
  it('returns values in [0, 1)', () => {
    const rng = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic for the same seed', () => {
    const a = createRng(99);
    const b = createRng(99);
    for (let i = 0; i < 20; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produces different sequences for different seeds', () => {
    const a = Array.from({ length: 10 }, createRng(1));
    const b = Array.from({ length: 10 }, createRng(2));
    expect(a).not.toEqual(b);
  });
});

describe('randInt', () => {
  it('returns integers within [min, max]', () => {
    const rng = createRng(42);
    for (let i = 0; i < 500; i++) {
      const v = randInt(rng, 1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});

describe('randChoice', () => {
  it('always returns a member of the array', () => {
    const rng = createRng(7);
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(randChoice(rng, arr));
    }
  });
});

describe('shuffle', () => {
  it('preserves all elements', () => {
    const rng = createRng(123);
    const arr = [1, 2, 3, 4, 5, 6];
    const shuffled = shuffle(rng, [...arr]);
    expect(shuffled.sort((a, b) => a - b)).toEqual(arr);
  });

  it('is deterministic for same seed', () => {
    const a = shuffle(createRng(55), [1, 2, 3, 4, 5]);
    const b = shuffle(createRng(55), [1, 2, 3, 4, 5]);
    expect(a).toEqual(b);
  });
});

describe('sampleWithout', () => {
  it('returns k unique items', () => {
    const rng = createRng(10);
    const arr = [1, 2, 3, 4, 5, 6];
    const sample = sampleWithout(rng, arr, 3);
    expect(sample).toHaveLength(3);
    expect(new Set(sample).size).toBe(3);
    sample.forEach(v => expect(arr).toContain(v));
  });
});
