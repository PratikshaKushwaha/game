// ============================================================
// PlayerController.ts — Movement, pointer lock, and position
// ============================================================

import * as THREE from 'three';
import type { InputSystem }    from '../systems/InputSystem';
import type { CollisionSystem } from './CollisionSystem';
import type { CameraController } from './CameraController';
import { CollisionSystem as CS } from './CollisionSystem';

const MOVE_SPEED = 5.0; // units per second

export class PlayerController {
  position: THREE.Vector3 = new THREE.Vector3(0, 0, 5);

  private input:     InputSystem;
  private collision: CollisionSystem;
  private camera:    CameraController;

  private _lockChangeHandler: () => void;
  private _clickHandler: () => void;

  isLocked = false;

  constructor(
    input:     InputSystem,
    collision: CollisionSystem,
    camera:    CameraController,
  ) {
    this.input     = input;
    this.collision = collision;
    this.camera    = camera;

    this._lockChangeHandler = this._onLockChange.bind(this);
    this._clickHandler      = this._onClick.bind(this);

    document.addEventListener('pointerlockchange', this._lockChangeHandler);
    document.addEventListener('click',             this._clickHandler);

    this._syncCameraToPosition();
  }

  private _onLockChange(): void {
    this.isLocked = !!document.pointerLockElement;
  }

  private _onClick(): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    // Only lock when the game is in an interactive phase
    if (!document.pointerLockElement) {
      canvas.requestPointerLock();
    }
  }

  requestLock(): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
    canvas?.requestPointerLock();
  }

  exitLock(): void {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  update(dt: number, blocked: boolean): void {
    if (!this.isLocked || blocked) return;

    const speed = MOVE_SPEED * dt;
    const delta = new THREE.Vector3();

    if (this.input.moveForward)  delta.addScaledVector(this.camera.getForwardXZ(),  speed);
    if (this.input.moveBackward) delta.addScaledVector(this.camera.getForwardXZ(), -speed);
    if (this.input.moveRight)    delta.addScaledVector(this.camera.getRightXZ(),    speed);
    if (this.input.moveLeft)     delta.addScaledVector(this.camera.getRightXZ(),   -speed);

    if (delta.lengthSq() === 0) return;

    this.position = this.collision.resolve(this.position, delta);
    this._syncCameraToPosition();
  }

  setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
    this._syncCameraToPosition();
  }

  private _syncCameraToPosition(): void {
    this.camera.camera.position.set(
      this.position.x,
      this.position.y + CS.EYE_HEIGHT,
      this.position.z,
    );
  }

  dispose(): void {
    document.removeEventListener('pointerlockchange', this._lockChangeHandler);
    document.removeEventListener('click',             this._clickHandler);
  }
}
