// ============================================================
// GameState.ts — Central observable game state
// ============================================================

import type { GamePhase, GameSave, PuzzleState, RoomId } from './GameTypes';

type StateListener = (state: GameState) => void;

export class GameState {
  // ─── Phase ──────────────────────────────────────────────
  phase: GamePhase = 'loading';

  // ─── Level ──────────────────────────────────────────────
  currentRoom: RoomId = 1;
  seed: number = Date.now();

  // ─── Puzzles ────────────────────────────────────────────
  puzzles: Map<RoomId, PuzzleState> = new Map();
  collectedHighlights: Array<{ digit: string; roomId: RoomId }> = [];
  finalAttempts: number = 4;
  finalSolved: boolean = false;

  // ─── UI ─────────────────────────────────────────────────
  isPointerLocked: boolean = false;
  isCinematicPlaying: boolean = false;
  isManuscriptOpen: boolean = false;
  isCodeEntryOpen: boolean = false;
  isFinalEntryOpen: boolean = false;
  activeCodeRoomId: RoomId | null = null;

  // ─── Observers ──────────────────────────────────────────
  private listeners: Set<StateListener> = new Set();

  subscribe(fn: StateListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(): void {
    this.listeners.forEach(fn => fn(this));
  }

  // ─── Phase transitions ──────────────────────────────────
  setPhase(phase: GamePhase): void {
    this.phase = phase;
    this.notify();
  }

  // ─── Puzzle helpers ─────────────────────────────────────
  isRoomSolved(id: RoomId): boolean {
    return this.puzzles.get(id)?.solved ?? false;
  }

  solveRoom(id: RoomId): void {
    const p = this.puzzles.get(id);
    if (p) {
      p.solved = true;
      if (p.highlightedDigit !== null) {
        // Only add if not already collected
        const alreadyHave = this.collectedHighlights.some(h => h.roomId === id);
        if (!alreadyHave) {
          this.collectedHighlights.push({ digit: p.highlightedDigit, roomId: id });
        }
      }
      this.notify();
    }
  }

  consumeFinalAttempt(): void {
    if (this.finalAttempts > 0) {
      this.finalAttempts -= 1;
      this.notify();
    }
  }

  // ─── Save / Load ────────────────────────────────────────
  toSave(): GameSave {
    return {
      currentRoom: this.currentRoom,
      solvedRooms: [...this.puzzles.values()].filter(p => p.solved).map(p => p.roomId),
      collectedHighlights: [...this.collectedHighlights],
      finalAttempts: this.finalAttempts,
      seed: this.seed,
    };
  }

  reset(): void {
    this.phase = 'loading';
    this.currentRoom = 1;
    this.puzzles.clear();
    this.collectedHighlights = [];
    this.finalAttempts = 4;
    this.finalSolved = false;
    this.isManuscriptOpen = false;
    this.isCodeEntryOpen = false;
    this.isFinalEntryOpen = false;
    this.activeCodeRoomId = null;
    this.notify();
  }
}

// Singleton
export const gameState = new GameState();
