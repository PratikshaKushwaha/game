// ============================================================
// CameraController.ts — First-person Look with Dynamic Sensitivity
// ============================================================
import * as THREE from 'three';
import { clamp } from '../utils/math';
import { gameState } from '../game/GameState';
const BASE_SENSITIVITY = 0.002;
const MAX_PITCH_DEG = 80;
const MAX_PITCH_RAD = (MAX_PITCH_DEG * Math.PI) / 180;
export class CameraController {
    camera;
    yaw = 0;
    pitch = 0;
    roll = 0;
    targetRoll = 0;
    _boundMouseMove;
    constructor(camera) {
        this.camera = camera;
        this._boundMouseMove = this._onMouseMove.bind(this);
        document.addEventListener('mousemove', this._boundMouseMove);
    }
    _onMouseMove(e) {
        if (!document.pointerLockElement)
            return;
        const sens = BASE_SENSITIVITY * (gameState.settings.mouseSensitivity || 1.0);
        this.yaw -= e.movementX * sens;
        this.pitch -= e.movementY * sens;
        this.pitch = clamp(this.pitch, -MAX_PITCH_RAD, MAX_PITCH_RAD);
        this._applyRotation();
    }
    update(dt) {
        // Smooth roll transition for gravity flip (0 rad normal, Math.PI inverted)
        this.targetRoll = gameState.gravityInverted ? Math.PI : 0;
        this.roll = THREE.MathUtils.lerp(this.roll, this.targetRoll, dt * 6.0);
        this._applyRotation();
    }
    _applyRotation() {
        const euler = new THREE.Euler(this.pitch, this.yaw, this.roll, 'YXZ');
        this.camera.quaternion.setFromEuler(euler);
    }
    setYaw(yaw) {
        this.yaw = yaw;
        this._applyRotation();
    }
    reset(yaw = 0, pitch = 0) {
        this.yaw = yaw;
        this.pitch = pitch;
        this.roll = 0;
        this._applyRotation();
    }
    getForwardXZ() {
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        return dir;
    }
    getRightXZ() {
        const forward = this.getForwardXZ();
        return new THREE.Vector3(forward.z, 0, -forward.x);
    }
    dispose() {
        document.removeEventListener('mousemove', this._boundMouseMove);
    }
}
//# sourceMappingURL=CameraController.js.map