// ============================================================
// CollisionSystem.ts — AABB collision against world obstacles
// ============================================================

import * as THREE from 'three';

const PLAYER_RADIUS  = 0.35;
const PLAYER_HEIGHT  = 1.75;
const EYE_HEIGHT     = 1.65;

export class CollisionSystem {
  private obstacles: THREE.Box3[] = [];

  /** Replace the full obstacle set (call when room changes). */
  setObstacles(boxes: THREE.Box3[]): void {
    this.obstacles = boxes;
  }

  addObstacle(box: THREE.Box3): void {
    this.obstacles.push(box);
  }

  clearObstacles(): void {
    this.obstacles = [];
  }

  /**
   * Move `position` by `delta` and resolve against all obstacles.
   * Modifies `delta` in place and returns the safe next position.
   */
  resolve(position: THREE.Vector3, delta: THREE.Vector3): THREE.Vector3 {
    // Try X move
    const nextX = position.clone();
    nextX.x += delta.x;
    if (this._overlapsAny(nextX)) delta.x = 0;

    // Try Z move
    const nextZ = position.clone();
    nextZ.x += delta.x; // apply resolved X
    nextZ.z += delta.z;
    if (this._overlapsAny(nextZ)) delta.z = 0;

    return position.clone().add(delta);
  }

  private _overlapsAny(pos: THREE.Vector3): boolean {
    const box = this._playerBox(pos);
    return this.obstacles.some(o => box.intersectsBox(o));
  }

  private _playerBox(pos: THREE.Vector3): THREE.Box3 {
    return new THREE.Box3(
      new THREE.Vector3(pos.x - PLAYER_RADIUS, pos.y - 0.05, pos.z - PLAYER_RADIUS),
      new THREE.Vector3(pos.x + PLAYER_RADIUS, pos.y + PLAYER_HEIGHT, pos.z + PLAYER_RADIUS),
    );
  }

  static get EYE_HEIGHT(): number { return EYE_HEIGHT; }
}
