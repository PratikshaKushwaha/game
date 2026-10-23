// ============================================================
// FinalCombination.ts — Validates the player's final guess
// ============================================================

import type { RoomConfig } from '../game/GameTypes';
import { deriveFinalCombination } from './RoomPuzzleGenerator';

export class FinalCombination {
  private answer: string;

  constructor(rooms: RoomConfig[]) {
    this.answer = deriveFinalCombination(rooms);
  }

  check(guess: string): boolean {
    return guess === this.answer;
  }

  getAnswer(): string {
    return this.answer;
  }
}
