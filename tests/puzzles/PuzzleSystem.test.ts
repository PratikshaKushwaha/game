import { describe, it, expect, beforeEach } from 'vitest';
import { PuzzleSystem } from '../../src/systems/PuzzleSystem';
import { gameState } from '../../src/game/GameState';
import { generateRoomPuzzles, deriveFinalCombination } from '../../src/puzzles/RoomPuzzleGenerator';

// Mock minimal AudioSystem
const mockAudio = {
  playOneShot: () => {},
  playAmbience: () => {},
  stopAmbience: () => {},
} as any;

describe('PuzzleSystem — Section 10 Attempt Rules', () => {
  let rooms: any[];
  let puzzleSystem: PuzzleSystem;
  let finalAnswer: string;

  beforeEach(() => {
    gameState.resetLevel1Run();
    rooms = generateRoomPuzzles(12345);
    finalAnswer = deriveFinalCombination(rooms);
    puzzleSystem = new PuzzleSystem(rooms, mockAudio);
    gameState.finalAttemptsRemaining = 4;
  });

  it('initializes with exactly 4 attempts remaining', () => {
    expect(gameState.finalAttemptsRemaining).toBe(4);
  });

  it('empty input consumes NO attempts', () => {
    const res = puzzleSystem.attemptFinalCode('', finalAnswer);
    expect(res).toBe('invalid_format');
    expect(gameState.finalAttemptsRemaining).toBe(4);
  });

  it('incomplete input consumes NO attempts', () => {
    const res1 = puzzleSystem.attemptFinalCode('1', finalAnswer);
    const res2 = puzzleSystem.attemptFinalCode('12', finalAnswer);
    expect(res1).toBe('invalid_format');
    expect(res2).toBe('invalid_format');
    expect(gameState.finalAttemptsRemaining).toBe(4);
  });

  it('invalid format (letters / symbols) consumes NO attempts', () => {
    const res1 = puzzleSystem.attemptFinalCode('abc', finalAnswer);
    const res2 = puzzleSystem.attemptFinalCode('12a', finalAnswer);
    expect(res1).toBe('invalid_format');
    expect(res2).toBe('invalid_format');
    expect(gameState.finalAttemptsRemaining).toBe(4);
  });

  it('valid incorrect combination deducts exactly ONE attempt', () => {
    const wrongCode = finalAnswer === '000' ? '999' : '000';
    const res = puzzleSystem.attemptFinalCode(wrongCode, finalAnswer);
    expect(res).toBe('wrong');
    expect(gameState.finalAttemptsRemaining).toBe(3);
  });

  it('correct combination unlocks Room 7 without deducting attempts', () => {
    const res = puzzleSystem.attemptFinalCode(finalAnswer, finalAnswer);
    expect(res).toBe('correct');
    expect(gameState.isRoomSolved(7 as any)).toBe(true);
    expect(gameState.finalAttemptsRemaining).toBe(4);
  });

  it('fourth valid incorrect guess triggers Level 1 restart', () => {
    const wrong = finalAnswer === '111' ? '222' : '111';
    expect(puzzleSystem.attemptFinalCode(wrong, finalAnswer)).toBe('wrong');
    expect(gameState.finalAttemptsRemaining).toBe(3);

    expect(puzzleSystem.attemptFinalCode(wrong, finalAnswer)).toBe('wrong');
    expect(gameState.finalAttemptsRemaining).toBe(2);

    expect(puzzleSystem.attemptFinalCode(wrong, finalAnswer)).toBe('wrong');
    expect(gameState.finalAttemptsRemaining).toBe(1);

    expect(puzzleSystem.attemptFinalCode(wrong, finalAnswer)).toBe('restart');
    expect(gameState.finalAttemptsRemaining).toBe(0);
  });
});
