// ============================================================
// GameState.ts — Central Observable Game State with Scoring
// ============================================================

import type { GamePhase, GameSettings, LevelProgress, PuzzleState, RoomId } from './GameTypes';
import { SaveSystem } from '../systems/SaveSystem';

type StateListener = (state: GameState) => void;

export class GameState {
  // ─── Phase ──────────────────────────────────────────────
  phase: GamePhase = 'start_menu';
  currentLevel: number = 1;

  // ─── Level 1 State ──────────────────────────────────────
  currentRoom: RoomId = 1;
  seed: number = Date.now();
  puzzles: Map<RoomId, PuzzleState> = new Map();
  collectedHighlights: Array<{ digit: string; roomId: RoomId }> = [];
  discoveredDigits: Record<number, string> = {};
  unlockedRooms: number[] = [1];
  finalAttemptsRemaining: number = 4;
  finalPermutationSolved: boolean = false;
  lives: number = 3;
  maxLives: number = 3;
  hubScriptRead: boolean = false;
  levelTimer: number = 0;
  checkpoint: number = 0;

  // ─── Abilities State ────────────────────────────────────
  glitchVisionActive: boolean = false;
  glitchVisionEnergy: number = 1.0; // 0.0 to 1.0

  gravityInverted: boolean = false;

  timeFrozen: boolean = false;
  timeFreezeTimer: number = 0.0;
  timeFreezeCooldown: number = 0.0;

  activeDimension: 'clean' | 'glitched' = 'clean';

  // ─── Score & Timer ──────────────────────────────────────
  score: number = 1000;
  levelTime: number = 0;
  wrongAttemptsCount: number = 0;
  restartCount: number = 0;

  // ─── UI Modal States ────────────────────────────────────
  isPointerLocked: boolean = false;
  isCinematicPlaying: boolean = false;
  isManuscriptOpen: boolean = false;
  isCodeEntryOpen: boolean = false;
  isFinalEntryOpen: boolean = false;
  isSettingsOpen: boolean = false;
  isHowToPlayOpen: boolean = false;
  isLevelSelectOpen: boolean = false;
  isDialogueActive: boolean = false;
  activeCodeRoomId: RoomId | null = null;

  // ─── Settings & Persistence ─────────────────────────────
  settings: GameSettings = SaveSystem.loadSettings();
  progress: LevelProgress = SaveSystem.loadProgress();

  // ─── Observers ──────────────────────────────────────────
  private listeners: Set<StateListener> = new Set();

  subscribe(fn: StateListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(): void {
    this.listeners.forEach(fn => fn(this));
  }

  setPhase(phase: GamePhase): void {
    this.phase = phase;
    this.notify();
  }

  updateSettings(partial: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...partial };
    SaveSystem.saveSettings(this.settings);
    this.notify();
  }

  // ─── Scoring & Time ─────────────────────────────────────
  resetLevelStats(): void {
    this.score = 1000;
    this.levelTime = 0;
    this.wrongAttemptsCount = 0;
    this.lives = this.maxLives;
    this.glitchVisionActive = false;
    this.glitchVisionEnergy = 1.0;
    this.gravityInverted = false;
    this.timeFrozen = false;
    this.timeFreezeTimer = 0;
    this.timeFreezeCooldown = 0;
    this.activeDimension = 'clean';
    this.notify();
  }

  addScore(points: number): void {
    this.score = Math.max(0, this.score + points);
    this.notify();
  }

  applyPenalty(penalty: number): void {
    this.score = Math.max(0, this.score - penalty);
    this.notify();
  }

  calculateFinalScore(): { total: number; timeBonus: number; livesBonus: number; stars: number } {
    const timeBonus = Math.max(0, Math.floor(500 - this.levelTime * 2));
    const livesBonus = this.lives * 150;
    const total = Math.max(100, this.score + timeBonus + livesBonus);
    let stars = 1;
    if (total >= 1200) stars = 3;
    else if (total >= 800) stars = 2;
    return { total, timeBonus, livesBonus, stars };
  }

  // ─── Puzzle & Lives ─────────────────────────────────────
  isRoomSolved(id: RoomId): boolean {
    return this.puzzles.get(id)?.solved ?? false;
  }

  solveRoom(id: RoomId): void {
    const p = this.puzzles.get(id);
    if (p && !p.solved) {
      p.solved = true;
      this.addScore(150);
      if (p.highlightedDigit !== null) {
        const alreadyHave = this.collectedHighlights.some(h => h.roomId === id);
        if (!alreadyHave) {
          this.collectedHighlights.push({ digit: p.highlightedDigit, roomId: id });
        }
      }
      this.notify();
    }
  }

  loseLife(): boolean {
    this.lives = Math.max(0, this.lives - 1);
    this.wrongAttemptsCount += 1;
    this.applyPenalty(50);
    this.notify();
    return this.lives > 0;
  }

  resetLevel1Run(): void {
    this.currentRoom = 1;
    this.puzzles.clear();
    this.collectedHighlights = [];
    this.discoveredDigits = {};
    this.unlockedRooms = [1];
    this.finalAttemptsRemaining = 4;
    this.finalPermutationSolved = false;
    this.resetLevelStats();
    this.notify();
  }

  // ─── Reset ──────────────────────────────────────────────
  resetToStartMenu(): void {
    this.phase = 'start_menu';
    this.currentLevel = 1;
    this.currentRoom = 1;
    this.puzzles.clear();
    this.collectedHighlights = [];
    this.hubScriptRead = false;
    this.resetLevelStats();
    this.isManuscriptOpen = false;
    this.isCodeEntryOpen = false;
    this.isFinalEntryOpen = false;
    this.isDialogueActive = false;
    this.notify();
  }
}

export const gameState = new GameState();
