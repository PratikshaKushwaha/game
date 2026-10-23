// ============================================================
// GameTypes.ts — Comprehensive Type Definitions for The Way Out
// ============================================================

export type GamePhase =
  | 'loading'
  | 'start_menu'
  | 'cinematic'
  | 'hub'
  | 'level_1'
  | 'level_2'
  | 'level_3'
  | 'level_4'
  | 'level_complete'
  | 'game_won'
  | 'paused';

export type RoomId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface RoomConfig {
  id: RoomId;
  name: string;
  code: string;                      // 3-digit room unlock code (or 4-digit)
  highlightedDigit: string | null;   // special gold digit
  highlightedPosition: number | null;// index within code
  furniture: FurnitureConfig[];
  cluePosition: CluePosition;
  doorConnections: DoorConnection[];
  lightColor: number;
  lightIntensity: number;
  ambientNote: string;
}

export interface FurnitureConfig {
  type: FurnitureType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export type FurnitureType =
  | 'desk'
  | 'chair'
  | 'bookshelf'
  | 'cabinet'
  | 'table'
  | 'locker'
  | 'crate'
  | 'barrel'
  | 'lamp'
  | 'computer';

export interface CluePosition {
  worldPosition: [number, number, number];
  label: string;
}

export interface DoorConnection {
  direction: 'north' | 'south' | 'east' | 'west';
  targetRoomId: RoomId;
  positionInRoom: [number, number, number];
}

export interface PuzzleState {
  roomId: RoomId;
  solved: boolean;
  code: string;
  highlightedDigit: string | null;
}

export interface GameSettings {
  masterVolume: number;   // 0.0 - 1.0
  musicVolume: number;    // 0.0 - 1.0
  sfxVolume: number;      // 0.0 - 1.0
  mouseSensitivity: number; // 0.5 - 3.0
}

export interface LevelProgress {
  unlockedLevels: number; // 1 to 4
  levelBestTimes: Record<number, number>; // seconds
  levelStars: Record<number, number>;     // 1 to 3 stars
  totalScore: number;
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface InteractableInfo {
  type: 'manuscript' | 'door' | 'clue' | 'keypad' | 'switch' | 'terminal';
  label: string;
  roomId?: RoomId;
}

export interface ManuscriptContent {
  title: string;
  body: string[];
}
