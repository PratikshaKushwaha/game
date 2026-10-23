// ============================================================
// PuzzleSystem.ts — Room code validation and state tracking
// ============================================================

import { gameState } from '../game/GameState';
import type { RoomConfig, RoomId } from '../game/GameTypes';
import type { AudioSystem } from './AudioSystem';

export class PuzzleSystem {
  private rooms: Map<RoomId, RoomConfig> = new Map();
  private audio: AudioSystem;

  constructor(rooms: RoomConfig[], audio: AudioSystem) {
    this.audio = audio;
    rooms.forEach(r => this.rooms.set(r.id, r));

    // Initialise puzzle state for rooms 1–7
    rooms.forEach(r => {
      gameState.puzzles.set(r.id, {
        roomId: r.id,
        solved: false,
        code: r.code,
        highlightedDigit: r.highlightedDigit,
      });
    });
  }

  /** Try to solve a room. Returns true on success. */
  attemptRoomCode(roomId: RoomId, guess: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (gameState.isRoomSolved(roomId)) return true;

    const correct = guess === room.code;
    if (correct) {
      gameState.solveRoom(roomId);
      this.audio.playOneShot('unlock', 0.9);
    } else {
      this.audio.playOneShot('fail', 0.7);
    }
    return correct;
  }

  /** 
   * Try the final 3-digit combination for Room 7.
   * Exactly 4 valid attempts. Empty/incomplete/invalid format inputs consume NO attempts.
   * 4th valid wrong attempt triggers Level 1 restart.
   */
  attemptFinalCode(guess: string, answer: string): 'invalid_format' | 'correct' | 'wrong' | 'restart' {
    if (!guess || typeof guess !== 'string') return 'invalid_format';
    const trimmed = guess.trim();
    if (trimmed.length !== 3 || !/^\d{3}$/.test(trimmed)) {
      return 'invalid_format';
    }

    if (gameState.finalAttemptsRemaining <= 0) {
      return 'restart';
    }

    if (trimmed === answer) {
      gameState.finalPermutationSolved = true;
      gameState.solveRoom(7 as RoomId);
      this.audio.playOneShot('unlock', 1.0);
      return 'correct';
    }

    // Deduct exactly one attempt
    gameState.finalAttemptsRemaining = Math.max(0, gameState.finalAttemptsRemaining - 1);
    this.audio.playOneShot('fail', 0.8);

    if (gameState.finalAttemptsRemaining === 0) {
      return 'restart';
    }

    return 'wrong';
  }

  getRoomConfig(roomId: RoomId): RoomConfig | undefined {
    return this.rooms.get(roomId);
  }

  allRoomsSolved(): boolean {
    for (let id = 1; id <= 7; id++) {
      if (!gameState.isRoomSolved(id as RoomId)) return false;
    }
    return true;
  }
}
