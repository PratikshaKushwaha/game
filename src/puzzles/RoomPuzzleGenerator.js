// ============================================================
// RoomPuzzleGenerator.ts — Generates 8-room building puzzles
// ============================================================
import { createRng, randInt, sampleWithout } from '../utils/random';
const ROOM_NAMES = {
    1: 'Room 1 — The Waiting Room',
    2: 'Room 2 — The Archive',
    3: 'Room 3 — The Laboratory',
    4: 'Room 4 — The Dormitory',
    5: 'Room 5 — The Server Room',
    6: 'Room 6 — The Director\'s Office',
    7: 'Room 7 — The Maintenance Vault',
    8: 'Room 8 — The Glitch Core (Exit)',
};
function generateCode(rng) {
    const d0 = randInt(rng, 0, 9);
    const d1 = randInt(rng, 0, 9);
    const d2 = randInt(rng, 0, 9);
    return `${d0}${d1}${d2}`;
}
export function generateRoomPuzzles(seed) {
    const rng = createRng(seed);
    // Rooms 1 to 7 have unlock codes
    const roomIds = [1, 2, 3, 4, 5, 6, 7];
    // Exactly 3 rooms out of 1-7 have golden highlighted digits
    const highlightedRooms = sampleWithout(rng, roomIds, 3);
    const rooms = roomIds.map(id => {
        const code = generateCode(rng);
        const isHighlighted = highlightedRooms.includes(id);
        let highlightedDigit = null;
        let highlightedPosition = null;
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
    // Room 8 (The Glitch Core) — final permutation puzzle
    rooms.push({
        id: 8,
        name: ROOM_NAMES[8],
        code: '',
        highlightedDigit: null,
        highlightedPosition: null,
        furniture: [],
        cluePosition: { worldPosition: [0, 1, 0], label: 'Room 8 Final Lock' },
        doorConnections: [],
        lightColor: 0xaa22ff,
        lightIntensity: 1.4,
        ambientNote: 'core',
    });
    return rooms;
}
export function deriveFinalCombination(rooms) {
    const highlights = rooms
        .filter(r => r.highlightedDigit !== null)
        .sort((a, b) => a.id - b.id);
    return highlights.map(r => r.highlightedDigit).join('');
}
function getLightColor(id) {
    const colors = {
        1: 0xfff0d0, // warm dim
        2: 0xd0e8ff, // cool archive blue
        3: 0xd0ffd0, // lab green tint
        4: 0xffd0e0, // dim pink
        5: 0x00e5ff, // cyan server glow
        6: 0xffd54f, // amber office
        7: 0xff7043, // vault warning orange
        8: 0xd500f9, // glitch purple core
    };
    return colors[id] ?? 0xffffff;
}
function getAmbientNote(id) {
    const notes = {
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
//# sourceMappingURL=RoomPuzzleGenerator.js.map