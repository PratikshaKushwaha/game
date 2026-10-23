// ============================================================
// levelOneConfig.ts — Building layout for Level 1
// ============================================================

import * as THREE from 'three';
import type { FurnitureConfig, RoomId } from '../game/GameTypes';

export const ROOM_SIZE = { w: 9, h: 3.2, d: 8 };
export const WALL_THICKNESS = 0.25;

// Rooms are arranged in a 2-column × 3-row grid, then room 7 at end of corridor
// Layout (top-down, each cell = one room):
//
//  [R1][R2]
//  [R3][R4]
//  [R5][R6]
//  [ corridor ]
//      [R7]
//
// Each room origin (bottom centre of floor):
export function getRoomOrigin(id: RoomId): THREE.Vector3 {
  const col = (id - 1) % 2;          // 0 = left, 1 = right
  const row = Math.floor((id - 1) / 2); // 0,1,2
  if (id === 7) {
    return new THREE.Vector3(
      ROOM_SIZE.w / 2,  // centred
      0,
      -(3 * ROOM_SIZE.d + 4), // past corridor
    );
  }
  return new THREE.Vector3(
    col * ROOM_SIZE.w,
    0,
    -row * ROOM_SIZE.d,
  );
}

// Spawn point inside each room (player enters from south wall)
export function getRoomSpawn(id: RoomId): THREE.Vector3 {
  const origin = getRoomOrigin(id);
  return new THREE.Vector3(
    origin.x + ROOM_SIZE.w / 2,
    0,
    origin.z + ROOM_SIZE.d * 0.15,
  );
}

// Door position between rooms — simplified: door at north wall centre
export function getNorthDoorPos(id: RoomId): THREE.Vector3 {
  const origin = getRoomOrigin(id);
  return new THREE.Vector3(
    origin.x + ROOM_SIZE.w / 2,
    0,
    origin.z - ROOM_SIZE.d / 2,
  );
}

// ── Furniture layouts per room ───────────────────────────────
export function getRoomFurniture(id: RoomId): FurnitureConfig[] {
  // All positions relative to room origin
  const configs: Record<RoomId, FurnitureConfig[]> = {
    1: [ // Waiting Room — chairs and a reception desk
      { type: 'desk',  position: [4.5, 0, -1.5], rotation: [0,0,0], scale: [1,1,1] },
      { type: 'chair', position: [3.0, 0,  0.5], rotation: [0, Math.PI,0], scale: [1,1,1] },
      { type: 'chair', position: [5.0, 0,  0.5], rotation: [0, Math.PI,0], scale: [1,1,1] },
      { type: 'chair', position: [7.0, 0,  0.5], rotation: [0, Math.PI,0], scale: [1,1,1] },
      { type: 'lamp',  position: [1.0, 0, -2.5], rotation: [0,0,0], scale: [1,1,1] },
    ],
    2: [ // Archive — bookshelves and filing cabinet
      { type: 'bookshelf', position: [1.0, 0, -2.0], rotation: [0, Math.PI/2,0], scale: [1,1,1] },
      { type: 'bookshelf', position: [3.0, 0, -2.0], rotation: [0, Math.PI/2,0], scale: [1,1,1] },
      { type: 'cabinet',   position: [8.0, 0, -1.5], rotation: [0,0,0],          scale: [1,1,1] },
      { type: 'table',     position: [5.0, 0,  1.5], rotation: [0,0,0],          scale: [1,1,1] },
      { type: 'chair',     position: [5.0, 0,  2.8], rotation: [0,0,0],          scale: [1,1,1] },
    ],
    3: [ // Laboratory
      { type: 'table',    position: [2.5, 0,  0.0], rotation: [0,0,0], scale: [1,1,1] },
      { type: 'computer', position: [2.5, 0.8, 0.0], rotation: [0, Math.PI,0], scale: [1,1,1] },
      { type: 'cabinet',  position: [8.0, 0, -2.0], rotation: [0,0,0], scale: [1,1,1] },
      { type: 'crate',    position: [1.0, 0,  2.0], rotation: [0,0,0], scale: [1,1,1] },
      { type: 'barrel',   position: [0.5, 0, -1.0], rotation: [0,0,0], scale: [1,1,1] },
    ],
    4: [ // Dormitory
      { type: 'table',  position: [8.0, 0, -2.0], rotation: [0,0,0], scale: [0.8,1,0.8] },
      { type: 'chair',  position: [8.0, 0, -0.5], rotation: [0,0,0], scale: [1,1,1] },
      { type: 'locker', position: [1.0, 0, -2.5], rotation: [0, Math.PI/2,0], scale: [1,1,1] },
      { type: 'locker', position: [1.0, 0, -1.0], rotation: [0, Math.PI/2,0], scale: [1,1,1] },
      { type: 'lamp',   position: [5.0, 0, -2.5], rotation: [0,0,0], scale: [1,1,1] },
    ],
    5: [ // Server Room
      { type: 'cabinet',  position: [1.0, 0, -2.0], rotation: [0,0,0], scale: [1, 1.4, 0.8] },
      { type: 'cabinet',  position: [2.5, 0, -2.0], rotation: [0,0,0], scale: [1, 1.4, 0.8] },
      { type: 'cabinet',  position: [4.0, 0, -2.0], rotation: [0,0,0], scale: [1, 1.4, 0.8] },
      { type: 'cabinet',  position: [5.5, 0, -2.0], rotation: [0,0,0], scale: [1, 1.4, 0.8] },
      { type: 'computer', position: [4.5, 0,  1.5], rotation: [0, Math.PI,0], scale: [1,1,1] },
    ],
    6: [ // Director's Office
      { type: 'desk',      position: [4.5, 0, -1.5], rotation: [0,0,0],          scale: [1.2,1,1.2] },
      { type: 'chair',     position: [4.5, 0, -2.8], rotation: [0,0,0],          scale: [1,1,1]     },
      { type: 'bookshelf', position: [8.5, 0, -1.0], rotation: [0, Math.PI/2,0], scale: [1,1,1]     },
      { type: 'computer',  position: [4.5, 0.78, -1.5], rotation: [0, Math.PI,0],scale: [1,1,1]     },
      { type: 'lamp',      position: [7.5, 0, -2.5], rotation: [0,0,0],          scale: [1,1,1]     },
    ],
    7: [ // The Exit — sparse, dramatic
      { type: 'lamp', position: [ROOM_SIZE.w/2 - 3, 0, 0], rotation: [0,0,0], scale: [1,1,1] },
      { type: 'lamp', position: [ROOM_SIZE.w/2 + 3, 0, 0], rotation: [0,0,0], scale: [1,1,1] },
    ],
  };
  return configs[id] ?? [];
}

// Clue positions relative to room origin (where the code sign sits)
export function getClueOffset(_id: RoomId): THREE.Vector3 {
  return new THREE.Vector3(4.5, 1.2, 0.5);
}
