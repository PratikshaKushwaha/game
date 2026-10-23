// ============================================================
// levelOneConfig.ts — 8-Room Layout Configuration for Level 1
// ============================================================
import * as THREE from 'three';
export const ROOM_SIZE = { w: 9, h: 3.2, d: 8 };
export const WALL_THICKNESS = 0.25;
// Rooms 1-6 in a 2-column grid, Room 7 and 8 at the end:
// [R1][R2]
// [R3][R4]
// [R5][R6]
// [R7][R8]
export function getRoomOrigin(id) {
    const col = (id - 1) % 2;
    const row = Math.floor((id - 1) / 2);
    return new THREE.Vector3(col * ROOM_SIZE.w, 0, -row * ROOM_SIZE.d);
}
export function getRoomSpawn(id) {
    const origin = getRoomOrigin(id);
    return new THREE.Vector3(origin.x + ROOM_SIZE.w / 2, 0, origin.z - ROOM_SIZE.d * 0.2);
}
export function getRoomFurniture(id) {
    const configs = {
        1: [
            { type: 'desk', position: [4.5, 0, 2.5], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { type: 'chair', position: [3.0, 0, 5.0], rotation: [0, Math.PI, 0], scale: [1, 1, 1] },
            { type: 'chair', position: [5.0, 0, 5.0], rotation: [0, Math.PI, 0], scale: [1, 1, 1] },
            { type: 'lamp', position: [1.5, 0, 2.0], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { type: 'crate', position: [7.5, 0, 6.0], rotation: [0, 0.4, 0], scale: [1, 1, 1] },
        ],
        2: [
            { type: 'bookshelf', position: [1.2, 0, 2.5], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1] },
            { type: 'bookshelf', position: [1.2, 0, 5.5], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1] },
            { type: 'cabinet', position: [7.8, 0, 2.5], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { type: 'table', position: [4.5, 0, 4.0], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { type: 'chair', position: [4.5, 0, 5.2], rotation: [0, 0, 0], scale: [1, 1, 1] },
        ],
        3: [
            { type: 'table', position: [3.0, 0, 4.0], rotation: [0, 0, 0], scale: [1.2, 1, 1] },
            { type: 'computer', position: [3.0, 0.8, 4.0], rotation: [0, Math.PI, 0], scale: [1, 1, 1] },
            { type: 'cabinet', position: [7.5, 0, 2.5], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { type: 'barrel', position: [1.2, 0, 6.0], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { type: 'barrel', position: [2.0, 0, 6.2], rotation: [0, 0, 0], scale: [0.9, 0.9, 0.9] },
        ],
        4: [
            { type: 'table', position: [7.5, 0, 3.0], rotation: [0, 0, 0], scale: [0.8, 1, 0.8] },
            { type: 'chair', position: [7.5, 0, 4.2], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { type: 'locker', position: [1.2, 0, 3.0], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1] },
            { type: 'locker', position: [1.2, 0, 4.5], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1] },
            { type: 'lamp', position: [4.5, 0, 2.0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        ],
        5: [
            { type: 'cabinet', position: [1.5, 0, 3.0], rotation: [0, 0, 0], scale: [1.1, 1.4, 0.9] },
            { type: 'cabinet', position: [3.2, 0, 3.0], rotation: [0, 0, 0], scale: [1.1, 1.4, 0.9] },
            { type: 'cabinet', position: [4.9, 0, 3.0], rotation: [0, 0, 0], scale: [1.1, 1.4, 0.9] },
            { type: 'computer', position: [4.5, 0, 6.0], rotation: [0, Math.PI, 0], scale: [1, 1, 1] },
        ],
        6: [
            { type: 'desk', position: [4.5, 0, 3.0], rotation: [0, 0, 0], scale: [1.3, 1, 1.2] },
            { type: 'chair', position: [4.5, 0, 2.0], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { type: 'bookshelf', position: [7.8, 0, 4.0], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1] },
            { type: 'computer', position: [4.5, 0.78, 3.0], rotation: [0, Math.PI, 0], scale: [1, 1, 1] },
            { type: 'lamp', position: [2.0, 0, 2.5], rotation: [0, 0, 0], scale: [1, 1, 1] },
        ],
        7: [
            { type: 'crate', position: [2.0, 0, 3.0], rotation: [0, 0.2, 0], scale: [1.2, 1.2, 1.2] },
            { type: 'crate', position: [2.2, 0.6, 3.0], rotation: [0, -0.1, 0], scale: [0.9, 0.9, 0.9] },
            { type: 'barrel', position: [7.0, 0, 5.0], rotation: [0, 0, 0], scale: [1, 1, 1] },
            { type: 'lamp', position: [4.5, 0, 2.0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        ],
        8: [
            { type: 'lamp', position: [2.0, 0, 4.0], rotation: [0, 0, 0], scale: [1.2, 1.2, 1.2] },
            { type: 'lamp', position: [7.0, 0, 4.0], rotation: [0, 0, 0], scale: [1.2, 1.2, 1.2] },
        ],
    };
    return configs[id] ?? [];
}
export function getClueOffset(_id) {
    return new THREE.Vector3(4.5, 1.3, 3.5);
}
//# sourceMappingURL=levelOneConfig.js.map