// ============================================================
// tests/puzzles/RoomPuzzleGenerator.test.ts
// ============================================================

import { describe, it, expect } from 'vitest';
import { generateRoomPuzzles, deriveFinalCombination } from '../../src/puzzles/RoomPuzzleGenerator';

describe('generateRoomPuzzles', () => {
  it('generates exactly 7 rooms', () => {
    const rooms = generateRoomPuzzles(42);
    expect(rooms).toHaveLength(7);
  });

  it('rooms 1–6 each have a 3-digit code', () => {
    const rooms = generateRoomPuzzles(12345);
    rooms.filter(r => r.id !== 7).forEach(r => {
      expect(r.code).toMatch(/^\d{3}$/);
    });
  });

  it('exactly 3 rooms among 1–6 have a highlighted golden digit', () => {
    const rooms = generateRoomPuzzles(99999);
    const highlighted = rooms.filter(r => r.id !== 7 && r.highlightedDigit !== null);
    expect(highlighted).toHaveLength(3);
  });

  it('highlighted digit matches the digit at the highlighted position', () => {
    const rooms = generateRoomPuzzles(7777);
    rooms.filter(r => r.highlightedDigit !== null).forEach(r => {
      expect(r.highlightedDigit).toBe(r.code[r.highlightedPosition!]);
    });
  });

  it('is deterministic for the same seed', () => {
    const a = generateRoomPuzzles(1234567890);
    const b = generateRoomPuzzles(1234567890);
    a.forEach((room, i) => {
      expect(room.code).toBe(b[i].code);
      expect(room.highlightedDigit).toBe(b[i].highlightedDigit);
    });
  });

  it('produces different results for different seeds', () => {
    const a = generateRoomPuzzles(1);
    const b = generateRoomPuzzles(2);
    const codesA = a.map(r => r.code).join('');
    const codesB = b.map(r => r.code).join('');
    expect(codesA).not.toBe(codesB);
  });

  it('room 7 (vault exit) has no individual code of its own', () => {
    const rooms = generateRoomPuzzles(111);
    const r7 = rooms.find(r => r.id === 7);
    expect(r7?.code).toBe('');
    expect(r7?.highlightedDigit).toBeNull();
  });
});

describe('deriveFinalCombination', () => {
  it('returns 3 digits in room-id order', () => {
    const rooms = generateRoomPuzzles(54321);
    const combo = deriveFinalCombination(rooms);
    expect(combo).toHaveLength(3);
    expect(combo).toMatch(/^\d{3}$/);
  });

  it('digits match highlighted rooms in sorted order', () => {
    const rooms = generateRoomPuzzles(88888);
    const combo = deriveFinalCombination(rooms);
    const highlighted = rooms
      .filter(r => r.highlightedDigit !== null)
      .sort((a, b) => a.id - b.id)
      .map(r => r.highlightedDigit!);
    expect(combo).toBe(highlighted.join(''));
  });

  it('is deterministic for same seed', () => {
    const seed = 202610231700;
    expect(deriveFinalCombination(generateRoomPuzzles(seed)))
      .toBe(deriveFinalCombination(generateRoomPuzzles(seed)));
  });
});
