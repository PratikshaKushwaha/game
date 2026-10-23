// ============================================================
// tests/game/GameState.test.ts
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/game/GameState';
import type { RoomId } from '../../src/game/GameTypes';

function makeState(): GameState {
  const s = new GameState();
  // Seed with basic puzzle states for rooms 1–6
  for (let id = 1; id <= 6; id++) {
    s.puzzles.set(id as RoomId, {
      roomId: id as RoomId,
      solved: false,
      code: `${id}${id}${id}`,
      highlightedDigit: id <= 3 ? String(id) : null,
    });
  }
  return s;
}

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => { state = makeState(); });

  it('starts with phase "loading"', () => {
    expect(state.phase).toBe('loading');
  });

  it('isRoomSolved returns false initially', () => {
    expect(state.isRoomSolved(1)).toBe(false);
  });

  it('solveRoom marks puzzle as solved', () => {
    state.solveRoom(1);
    expect(state.isRoomSolved(1)).toBe(true);
  });

  it('solveRoom collects highlighted digit', () => {
    state.solveRoom(1); // has highlightedDigit = '1'
    expect(state.collectedHighlights).toHaveLength(1);
    expect(state.collectedHighlights[0].digit).toBe('1');
  });

  it('solveRoom does not duplicate highlighted digit on re-solve', () => {
    state.solveRoom(1);
    state.solveRoom(1);
    expect(state.collectedHighlights).toHaveLength(1);
  });

  it('solveRoom does not collect digit for non-highlighted room', () => {
    state.solveRoom(4); // no highlightedDigit
    expect(state.collectedHighlights).toHaveLength(0);
  });

  it('consumeFinalAttempt decrements counter', () => {
    state.finalAttempts = 4;
    state.consumeFinalAttempt();
    expect(state.finalAttempts).toBe(3);
  });

  it('consumeFinalAttempt does not go below 0', () => {
    state.finalAttempts = 0;
    state.consumeFinalAttempt();
    expect(state.finalAttempts).toBe(0);
  });

  it('reset clears all state', () => {
    state.solveRoom(1);
    state.consumeFinalAttempt();
    state.reset();
    expect(state.collectedHighlights).toHaveLength(0);
    expect(state.finalAttempts).toBe(4);
    expect(state.puzzles.size).toBe(0);
  });

  it('notifies listeners on phase change', () => {
    let called = false;
    state.subscribe(() => { called = true; });
    state.setPhase('entrance');
    expect(called).toBe(true);
  });

  it('unsubscribe stops notifications', () => {
    let count = 0;
    const unsub = state.subscribe(() => { count++; });
    state.setPhase('entrance');
    unsub();
    state.setPhase('building');
    expect(count).toBe(1);
  });
});
