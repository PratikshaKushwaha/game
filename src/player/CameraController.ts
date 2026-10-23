// ============================================================
// CameraController.ts — First-person look with pointer lock
// ============================================================

import * as THREE from 'three';
import { clamp } from '../utils/math';

const LOOK_SENSITIVITY = 0.002;
const MAX_PITCH_DEG    = 80;
const MAX_PITCH_RAD    = (MAX_PITCH_DEG * Math.PI) / 180;

export class CameraController {
  readonly camera: THREE.PerspectiveCamera;

  private yaw   = 0;  // radians, horizontal rotation
  private pitch = 0;  // radians, vertical tilt

  private _boundMouseMove: (e: MouseEvent) => void;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this._boundMouseMove = this._onMouseMove.bind(this);
    document.addEventListener('mousemove', this._boundMouseMove);
  }

  private _onMouseMove(e: MouseEvent): void {
    if (!document.pointerLockElement) return;

    this.yaw   -= e.movementX * LOOK_SENSITIVITY;
    this.pitch -= e.movementY * LOOK_SENSITIVITY;
    this.pitch  = clamp(this.pitch, -MAX_PITCH_RAD, MAX_PITCH_RAD);

    this._applyRotation();
  }

  private _applyRotation(): void {
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }

  /** Snap yaw to face a direction (radians from +Z axis). */
  setYaw(yaw: number): void {
    this.yaw = yaw;
    this._applyRotation();
  }

  /** Reset pitch/yaw entirely. */
  reset(yaw = 0, pitch = 0): void {
    this.yaw   = yaw;
    this.pitch = pitch;
    this._applyRotation();
  }

  /** Forward direction in world XZ. */
  getForwardXZ(): THREE.Vector3 {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    return dir;
  }

  /** Right direction in world XZ. */
  getRightXZ(): THREE.Vector3 {
    const forward = this.getForwardXZ();
    return new THREE.Vector3(forward.z, 0, -forward.x);
  }

  dispose(): void {
    document.removeEventListener('mousemove', this._boundMouseMove);
  }
}
