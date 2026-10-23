// ============================================================
// ClueObject.ts — In-world Code Sign with Glitch Vision Support
// ============================================================
import * as THREE from 'three';
import { disposeObject } from '../utils/disposal';
export class ClueObject {
    mesh;
    info;
    _mats = [];
    _boardMat;
    _onInteractCb;
    _isHighlighted = false;
    _glitchActive = false;
    _goldIndex = null;
    _goldLight = null;
    constructor(opts) {
        this._onInteractCb = opts.onInteract;
        this._goldIndex = opts.highlightedIndex;
        this.info = { type: 'clue', label: `Room ${opts.roomId} Keypad / Code Sign`, roomId: opts.roomId };
        this.mesh = new THREE.Group();
        this.mesh.position.copy(opts.position);
        this.mesh.name = `clue-room-${opts.roomId}`;
        // Backing panel
        this._boardMat = new THREE.MeshStandardMaterial({
            color: 0x181a24,
            roughness: 0.85,
            metalness: 0.2,
        });
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.05), this._boardMat);
        board.castShadow = true;
        this.mesh.add(board);
        // Frame
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a4055, metalness: 0.6, roughness: 0.3 });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.49, 0.03), frameMat);
        frame.position.z = -0.02;
        this.mesh.add(frame);
        // Digits
        opts.code.split('').forEach((_ch, i) => {
            const isGold = i === opts.highlightedIndex;
            // Normal: faint digital white; Gold: glowing golden yellow
            const col = isGold ? 0xffd700 : 0xe0e6ed;
            const mat = new THREE.MeshStandardMaterial({
                color: col,
                roughness: 0.4,
                metalness: 0.1,
                emissive: isGold ? 0xffb700 : 0x000000,
                emissiveIntensity: isGold ? 0.75 : 0.05,
            });
            this._mats.push(mat);
            const block = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.06), mat);
            block.position.set(-0.24 + i * 0.24, 0, 0.01);
            block.castShadow = true;
            this.mesh.add(block);
            if (isGold) {
                // Point light for golden glow
                this._goldLight = new THREE.PointLight(0xffaa00, 1.2, 2.5);
                this._goldLight.position.set(-0.24 + i * 0.24, 0, 0.3);
                this.mesh.add(this._goldLight);
            }
        });
    }
    setGlitchVision(active) {
        if (this._glitchActive === active)
            return;
        this._glitchActive = active;
        this._mats.forEach((mat, i) => {
            const isGold = i === this._goldIndex;
            if (active) {
                mat.emissive.setHex(isGold ? 0xffdd00 : 0x00e5ff);
                mat.emissiveIntensity = isGold ? 1.5 : 0.8;
            }
            else {
                mat.emissive.setHex(isGold ? 0xffb700 : 0x000000);
                mat.emissiveIntensity = isGold ? 0.75 : 0.05;
            }
        });
        if (this._goldLight) {
            this._goldLight.intensity = active ? 2.5 : 1.2;
        }
    }
    highlight(on) {
        if (this._isHighlighted === on)
            return;
        this._isHighlighted = on;
        this._boardMat.emissive.setHex(on ? 0x223355 : 0x000000);
        this._boardMat.emissiveIntensity = on ? 0.4 : 0;
    }
    onInteract() {
        this._onInteractCb();
    }
    dispose() {
        disposeObject(this.mesh);
    }
}
//# sourceMappingURL=ClueObject.js.map