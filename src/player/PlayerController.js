// ============================================================
// PlayerController.ts — Movement, Sprint, Pointer Lock, and Physics
// ============================================================
import * as THREE from 'three';
import { CollisionSystem as CS } from './CollisionSystem';
import { gameState } from '../game/GameState';
const WALK_SPEED = 4.8;
const SPRINT_SPEED = 8.2;
export class PlayerController {
    position = new THREE.Vector3(0, 0, 5);
    input;
    collision;
    camera;
    _lockChangeHandler;
    _clickHandler;
    isLocked = false;
    constructor(input, collision, camera) {
        this.input = input;
        this.collision = collision;
        this.camera = camera;
        this._lockChangeHandler = this._onLockChange.bind(this);
        this._clickHandler = this._onClick.bind(this);
        document.addEventListener('pointerlockchange', this._lockChangeHandler);
        document.addEventListener('click', this._clickHandler);
        this._syncCameraToPosition();
    }
    _onLockChange() {
        this.isLocked = !!document.pointerLockElement;
    }
    _onClick() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas)
            return;
        if (gameState.phase === 'start_menu' || gameState.phase === 'cinematic' || gameState.phase === 'loading')
            return;
        if (gameState.isManuscriptOpen || gameState.isCodeEntryOpen || gameState.isFinalEntryOpen || gameState.isSettingsOpen || gameState.isHowToPlayOpen || gameState.isLevelSelectOpen || gameState.isDialogueActive)
            return;
        if (!document.pointerLockElement) {
            canvas.requestPointerLock();
        }
    }
    requestLock() {
        const canvas = document.getElementById('game-canvas');
        canvas?.requestPointerLock();
    }
    exitLock() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
    update(dt, blocked) {
        if (!this.isLocked || blocked)
            return;
        const baseSpeed = this.input.isSprinting ? SPRINT_SPEED : WALK_SPEED;
        const speed = baseSpeed * dt;
        const delta = new THREE.Vector3();
        if (this.input.moveForward)
            delta.addScaledVector(this.camera.getForwardXZ(), speed);
        if (this.input.moveBackward)
            delta.addScaledVector(this.camera.getForwardXZ(), -speed);
        if (this.input.moveRight)
            delta.addScaledVector(this.camera.getRightXZ(), speed);
        if (this.input.moveLeft)
            delta.addScaledVector(this.camera.getRightXZ(), -speed);
        if (delta.lengthSq() > 0) {
            this.position = this.collision.resolve(this.position, delta);
        }
        this._syncCameraToPosition();
    }
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this._syncCameraToPosition();
    }
    _syncCameraToPosition() {
        // If gravity inverted, player head is near ceiling
        const eyeOffset = gameState.gravityInverted ? (2.8 - CS.EYE_HEIGHT) : CS.EYE_HEIGHT;
        this.camera.camera.position.set(this.position.x, this.position.y + eyeOffset, this.position.z);
    }
    dispose() {
        document.removeEventListener('pointerlockchange', this._lockChangeHandler);
        document.removeEventListener('click', this._clickHandler);
    }
}
//# sourceMappingURL=PlayerController.js.map