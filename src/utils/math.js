// ============================================================
// math.ts — Shared math helpers
// ============================================================
import * as THREE from 'three';
/** Clamp a value between min and max. */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/** Linear interpolation. */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}
/** Convert degrees to radians. */
export function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
/** Convert radians to degrees. */
export function rad2deg(rad) {
    return rad * (180 / Math.PI);
}
/** Check AABB overlap between two Box3. */
export function boxesOverlap(a, b) {
    return a.intersectsBox(b);
}
/**
 * Move a point by a delta, then resolve against an array of AABB obstacles.
 * Returns the safe resolved position.
 */
export function resolveCollision(position, delta, radius, obstacles) {
    const next = position.clone().add(delta);
    const playerBox = new THREE.Box3(new THREE.Vector3(next.x - radius, next.y - 0.9, next.z - radius), new THREE.Vector3(next.x + radius, next.y + 1.7, next.z + radius));
    for (const obs of obstacles) {
        if (playerBox.intersectsBox(obs)) {
            // Simple push-out: try x then z separately
            const testX = new THREE.Vector3(position.x + delta.x, position.y, position.z);
            const boxX = new THREE.Box3(new THREE.Vector3(testX.x - radius, testX.y - 0.9, testX.z - radius), new THREE.Vector3(testX.x + radius, testX.y + 1.7, testX.z + radius));
            if (boxX.intersectsBox(obs))
                delta.x = 0;
            const testZ = new THREE.Vector3(position.x, position.y, position.z + delta.z);
            const boxZ = new THREE.Box3(new THREE.Vector3(testZ.x - radius, testZ.y - 0.9, testZ.z - radius), new THREE.Vector3(testZ.x + radius, testZ.y + 1.7, testZ.z + radius));
            if (boxZ.intersectsBox(obs))
                delta.z = 0;
        }
    }
    return position.clone().add(delta);
}
//# sourceMappingURL=math.js.map