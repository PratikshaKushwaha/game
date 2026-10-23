// ============================================================
// GameTypes.ts — Shared type definitions for The Way Out
// ============================================================

export type GamePhase =
  | 'loading'
  | 'cinematic'
  | 'entrance'
  | 'building'
  | 'level_complete'
  | 'paused';

export type RoomId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface RoomConfig {
  id: RoomId;
  name: string;
  code: string;           // 3-digit room unlock code
  highlightedDigit: string | null; // null if not one of the 3 special rooms
  highlightedPosition: number | null; // 0,1,2 index within code
  furniture: FurnitureConfig[];
  cluePosition: CluePosition;
  doorConnections: DoorConnection[];
  lightColor: number;
  lightIntensity: number;
  ambientNote: string;    // description for audio ambience
}

export interface FurnitureConfig {
  type: FurnitureType;
  position: [number, number, number];
  rotation: [number, number, number]; // euler radians
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
  label: string; // descriptive label for accessibility / debugging
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

export interface GameSave {
  currentRoom: RoomId;
  solvedRooms: RoomId[];
  collectedHighlights: Array<{ digit: string; roomId: RoomId }>;
  finalAttempts: number;
  seed: number;
}

export interface InteractableInfo {
  type: 'manuscript' | 'door' | 'clue' | 'keypad';
  label: string;
  roomId?: RoomId;
}

export interface ManuscriptContent {
  title: string;
  body: string[];
}

export interface AudioConfig {
  ambience?: string;
  interact?: string;
  unlock?: string;
  fail?: string;
  glitch?: string;
}
