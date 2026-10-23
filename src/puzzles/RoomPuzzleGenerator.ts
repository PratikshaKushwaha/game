// ============================================================
// RoomPuzzleGenerator.ts — Generates room codes with
// deterministic randomness from a seed.
// ============================================================

import type { RoomConfig, RoomId } from '../game/GameTypes';
import { createRng, randInt, sampleWithout } from '../utils/random';

const ROOM_NAMES: Record<RoomId, string> = {
  1: 'The Waiting Room',
  2: 'The Archive',
  3: 'The Laboratory',
  4: 'The Dormitory',
  5: 'The Server Room',
  6: 'The Director\'s Office',
  7: 'The Exit',
};

/**
 * Generate a 3-digit code string (digits 0-9, leading zeros allowed).
 */
function generateCode(rng: () => number): string {
  const d0 = randInt(rng, 0, 9);
  const d1 = randInt(rng, 0, 9);
  const d2 = randInt(rng, 0, 9);
  return `${d0}${d1}${d2}`;
}

/**
 * Generate all room puzzle configurations from a seed.
 * Three rooms among 1–6 are randomly chosen to have highlighted digits.
 * The highlighted digit is always one of the digits in that room's code.
 */
export function generateRoomPuzzles(seed: number): RoomConfig[] {
  const rng = createRng(seed);

  const roomIds: RoomId[] = [1, 2, 3, 4, 5, 6];
  const highlightedRooms = sampleWithout(rng, roomIds, 3) as RoomId[];

  const rooms: RoomConfig[] = roomIds.map(id => {
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
      furniture: [], // populated by LevelLayout
      cluePosition: {
        worldPosition: [0, 1, 0],
        label: `Room ${id} clue`,
      },
      doorConnections: [],
      lightColor: getLightColor(id),
      lightIntensity: 0.8,
      ambientNote: getAmbientNote(id),
    };
  });

  // Room 7 (the exit) has no code of its own
  rooms.push({
    id: 7,
    name: ROOM_NAMES[7],
    code: '',
    highlightedDigit: null,
    highlightedPosition: null,
    furniture: [],
    cluePosition: { worldPosition: [0, 1, 0], label: 'Exit' },
    doorConnections: [],
    lightColor: 0xffffff,
    lightIntensity: 1.2,
    ambientNote: 'exit',
  });

  return rooms;
}

/**
 * Derive the final 3-digit combination from the highlighted rooms,
 * preserving the order in which rooms are numbered.
 */
export function deriveFinalCombination(rooms: RoomConfig[]): string {
  const highlights = rooms
    .filter(r => r.highlightedDigit !== null)
    .sort((a, b) => a.id - b.id);

  return highlights.map(r => r.highlightedDigit!).join('');
}

function getLightColor(id: RoomId): number {
  const colors: Record<RoomId, number> = {
    1: 0xfff8e1, // warm dim
    2: 0xe8f4fd, // cool blue
    3: 0xe8fde8, // lab green tint
    4: 0xfce4ec, // dim pink
    5: 0xe0f7fa, // cyan server glow
    6: 0xfff3e0, // amber office
    7: 0xffffff, // pure white
  };
  return colors[id];
}

function getAmbientNote(id: RoomId): string {
  const notes: Record<RoomId, string> = {
    1: 'hum',
    2: 'paper',
    3: 'equipment',
    4: 'silence',
    5: 'server',
    6: 'clock',
    7: 'exit',
  };
  return notes[id];
}
