// ============================================================
// RoomPuzzleGenerator.ts — Generates 7-room building puzzles
// ============================================================

import type { RoomConfig, RoomId } from '../game/GameTypes';
import { createRng, randInt, sampleWithout } from '../utils/random';

const ROOM_NAMES: Record<RoomId, string> = {
  1: 'Room 1 — The Waiting Room',
  2: 'Room 2 — The Archive',
  3: 'Room 3 — The Laboratory',
  4: 'Room 4 — The Dormitory',
  5: 'Room 5 — The Server Room',
  6: 'Room 6 — The Director\'s Office',
  7: 'Room 7 — The Maintenance Vault (Exit)',
  8: 'Room 8 — Legacy Core',
};

function generateCode(rng: () => number): string {
  const d0 = randInt(rng, 0, 9);
  const d1 = randInt(rng, 0, 9);
  const d2 = randInt(rng, 0, 9);
  return `${d0}${d1}${d2}`;
}

export function generateRoomPuzzles(seed: number): RoomConfig[] {
  const rng = createRng(seed);

  // Rooms 1 to 6 have standard numerical unlock codes
  const standardRoomIds: RoomId[] = [1, 2, 3, 4, 5, 6];
  // Exactly 3 distinct rooms selected from rooms 1–6
  const highlightedRooms = sampleWithout(rng, standardRoomIds, 3) as RoomId[];

  const rooms: RoomConfig[] = standardRoomIds.map(id => {
    const code = generateCode(rng);
    const isHighlighted = highlightedRooms.includes(id);

    let highlightedDigit: string | null = null;
    let highlightedPosition: number | null = null;

    if (isHighlighted) {
      highlightedPosition = randInt(rng, 0, 2);
      highlightedDigit = code[highlightedPosition];
    }

    return {
      id,
      name: ROOM_NAMES[id],
      code,
      highlightedDigit,
      highlightedPosition,
      furniture: [],
      cluePosition: {
        worldPosition: [0, 1, 0],
        label: `Room ${id} Clue`,
      },
      doorConnections: [],
      lightColor: getLightColor(id),
      lightIntensity: 0.8,
      ambientNote: getAmbientNote(id),
    };
  });

  // Room 7 — Unlocked only by the 3-digit final combination
  rooms.push({
    id: 7,
    name: ROOM_NAMES[7],
    code: '',
    highlightedDigit: null,
    highlightedPosition: null,
    furniture: [],
    cluePosition: { worldPosition: [0, 1, 0], label: 'Room 7 Vault Door' },
    doorConnections: [],
    lightColor: 0x00e5ff,
    lightIntensity: 1.4,
    ambientNote: 'vault',
  });

  return rooms;
}

export function deriveFinalCombination(rooms: RoomConfig[]): string {
  const highlights = rooms
    .filter(r => r.highlightedDigit !== null)
    .sort((a, b) => a.id - b.id);

  return highlights.map(r => r.highlightedDigit!).join('');
}

function getLightColor(id: RoomId): number {
  const colors: Record<RoomId, number> = {
    1: 0xfff0d0, // warm dim
    2: 0xd0e8ff, // cool archive blue
    3: 0xd0ffd0, // lab green tint
    4: 0xffd0e0, // dim pink
    5: 0x00e5ff, // cyan server glow
    6: 0xffd54f, // amber office
    7: 0xff7043, // vault warning orange
    8: 0x00e5ff, // glitch cyan core
  };
  return colors[id] ?? 0xffffff;
}

function getAmbientNote(id: RoomId): string {
  const notes: Record<RoomId, string> = {
    1: 'hum',
    2: 'paper',
    3: 'equipment',
    4: 'silence',
    5: 'server',
    6: 'clock',
    7: 'steam',
    8: 'core',
  };
  return notes[id] ?? 'ambient';
}
