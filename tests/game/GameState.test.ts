// ============================================================
// tests/game/GameState.test.ts
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/game/GameState';
import type { RoomId } from '../../src/game/GameTypes';

function makeState(): GameState {
  const s = new GameState();
  for (let id = 1; id <= 7; id++) {
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

  it('starts with phase "start_menu"', () => {
    expect(state.phase).toBe('start_menu');
  });

  it('isRoomSolved returns false initially', () => {
    expect(state.isRoomSolved(1)).toBe(false);
  });

  it('solveRoom marks puzzle as solved and adds score', () => {
    const initialScore = state.score;
    state.solveRoom(1);
    expect(state.isRoomSolved(1)).toBe(true);
    expect(state.score).toBeGreaterThan(initialScore);
  });

  it('solveRoom collects highlighted digit', () => {
    state.solveRoom(1);
    expect(state.collectedHighlights).toHaveLength(1);
    expect(state.collectedHighlights[0].digit).toBe('1');
  });

  it('solveRoom does not duplicate highlighted digit on re-solve', () => {
    state.solveRoom(1);
    state.solveRoom(1);
    expect(state.collectedHighlights).toHaveLength(1);
  });

  it('solveRoom does not collect digit for non-highlighted room', () => {
    state.solveRoom(4);
    expect(state.collectedHighlights).toHaveLength(0);
  });

  it('loseLife decrements lives and applies penalty', () => {
    state.lives = 3;
    const initialScore = state.score;
    const alive = state.loseLife();
    expect(alive).toBe(true);
    expect(state.lives).toBe(2);
    expect(state.score).toBeLessThan(initialScore);
  });

  it('loseLife returns false when out of lives', () => {
    state.lives = 1;
    const alive = state.loseLife();
    expect(alive).toBe(false);
    expect(state.lives).toBe(0);
  });

  it('calculateFinalScore produces valid breakdown and stars', () => {
    state.score = 1000;
    state.levelTime = 60;
    state.lives = 3;
    const result = state.calculateFinalScore();
    expect(result.total).toBeGreaterThan(1000);
    expect(result.stars).toBeGreaterThanOrEqual(1);
    expect(result.stars).toBeLessThanOrEqual(3);
  });

  it('resetLevelStats resets timers and ability meters', () => {
    state.levelTime = 120;
    state.lives = 1;
    state.glitchVisionActive = true;
    state.resetLevelStats();
    expect(state.levelTime).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.glitchVisionActive).toBe(false);
  });

  it('notifies listeners on phase change', () => {
    let called = false;
    state.subscribe(() => { called = true; });
    state.setPhase('level_1');
    expect(called).toBe(true);
  });
});
