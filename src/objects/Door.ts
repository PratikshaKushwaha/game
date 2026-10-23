// ============================================================
// Door.ts — Door object with procedural and GLTF model support
// ============================================================

import * as THREE from 'three';
import { disposeObject } from '../utils/disposal';

type DoorState = 'closed' | 'opening' | 'open' | 'locked';

export interface DoorOptions {
  position:  THREE.Vector3;
  rotation?: number; // Y rotation in radians
  color?:    number;
  height?:   number;
  width?:    number;
  locked?:   boolean;
  model?:    THREE.Object3D;
}

export class Door {
  readonly root: THREE.Group;
  readonly colliderBox: THREE.Box3;

  private panel:   THREE.Object3D;
  private frame:   THREE.Mesh;
  private state:   DoorState;
  private _openAngle   = 0;
  private _targetAngle = 0;

  private _mat:       THREE.MeshStandardMaterial;
  private _frameMat:  THREE.MeshStandardMaterial;

  private _onOpenComplete?: () => void;

  constructor(opts: DoorOptions) {
    const W = opts.width  ?? 1.0;
    const H = opts.height ?? 2.2;
    const D = 0.08;

    this.state = opts.locked ? 'locked' : 'closed';

    this.root = new THREE.Group();
    this.root.position.copy(opts.position);
    this.root.rotation.y = opts.rotation ?? 0;

    // ── Frame ───────────────────────────────────────────
    this._frameMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a, roughness: 0.9, metalness: 0.1,
    });
    const frameGeo = new THREE.BoxGeometry(W + 0.12, H + 0.12, D + 0.02);
    this.frame = new THREE.Mesh(frameGeo, this._frameMat);
    this.frame.position.y = H / 2;
    this.frame.receiveShadow = true;
    this.root.add(this.frame);

    // ── Door panel — pivot at left edge ─────────────────
    const pivotGroup = new THREE.Group();
    pivotGroup.position.set(-W / 2, 0, 0);
    this.root.add(pivotGroup);

    const panelColor = this.state === 'locked' ? 0x8b1a1a : (opts.color ?? 0x4a3520);
    this._mat = new THREE.MeshStandardMaterial({
      color: panelColor, roughness: 0.7, metalness: 0.15,
      emissive: this.state === 'locked' ? 0x3a0000 : 0x000000,
      emissiveIntensity: this.state === 'locked' ? 0.4 : 0,
    });

    if (opts.model) {
      // Use supplied 3D GLTF model
      const modelObj = opts.model;
      const bBox = new THREE.Box3().setFromObject(modelObj);
      const size = bBox.getSize(new THREE.Vector3());
      const scaleY = H / (size.y || 1);
      const scaleX = W / (size.x || 1);
      const scaleZ = D / (size.z || 0.1);
      modelObj.scale.set(scaleX, scaleY, Math.min(scaleZ, scaleX));
      modelObj.position.set(W / 2, H / 2, 0);
      modelObj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      pivotGroup.add(modelObj);
      this.panel = modelObj;
    } else {
      // Procedural door panel
      const panelGeo = new THREE.BoxGeometry(W, H, D);
      const mesh = new THREE.Mesh(panelGeo, this._mat);
      mesh.position.set(W / 2, H / 2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = 'door-panel';
      pivotGroup.add(mesh);
      this.panel = mesh;

      // Door handle
      const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xc0a060, metalness: 0.9, roughness: 0.2 });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(W / 2 - 0.1, 0, D / 2 + 0.04);
      mesh.add(handle);
    }

    // Store pivot group for animation
    (this as unknown as Record<string, unknown>)['_pivot'] = pivotGroup;

    // ── Collider ────────────────────────────────────────
    const worldPos = opts.position;
    this.colliderBox = new THREE.Box3(
      new THREE.Vector3(worldPos.x - W / 2 - 0.06, worldPos.y, worldPos.z - D / 2 - 0.01),
      new THREE.Vector3(worldPos.x + W / 2 + 0.06, worldPos.y + H + 0.06, worldPos.z + D / 2 + 0.01),
    );
  }

  get isLocked(): boolean { return this.state === 'locked'; }
  get isOpen():   boolean { return this.state === 'open'; }

  unlock(): void {
    if (this.state === 'locked') {
      this.state = 'closed';
      this._mat.color.setHex(0x4a3520);
      this._mat.emissiveIntensity = 0;
      this._applyEmissive(0x000000, 0);
    }
  }

  open(onComplete?: () => void): void {
    if (this.state !== 'closed') return;
    this.state = 'opening';
    this._targetAngle = Math.PI / 2;
    this._onOpenComplete = onComplete;
  }

  update(dt: number): void {
    if (this.state !== 'opening') return;

    const pivot = (this as unknown as Record<string, unknown>)['_pivot'] as THREE.Group;
    this._openAngle = Math.min(this._openAngle + dt * 1.5, this._targetAngle);
    pivot.rotation.y = this._openAngle;

    if (this._openAngle >= this._targetAngle) {
      this.state = 'open';
      this._onOpenComplete?.();
      this._onOpenComplete = undefined;
    }
  }

  /** Apply locked tint and highlight */
  setLocked(locked: boolean): void {
    if (locked) {
      this.state = 'locked';
      this._applyEmissive(0x3a0000, 0.4);
    } else {
      this.state = 'closed';
      this._applyEmissive(0x000000, 0);
    }
  }

  setHighlight(on: boolean): void {
    if (this.state === 'locked') {
      this._applyEmissive(on ? 0x660000 : 0x3a0000, on ? 0.7 : 0.4);
    } else {
      this._applyEmissive(on ? 0x331100 : 0x000000, on ? 0.4 : 0);
    }
  }

  private _applyEmissive(colorHex: number, intensity: number): void {
    this._mat.emissive.setHex(colorHex);
    this._mat.emissiveIntensity = intensity;
    this.panel.traverse(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive.setHex(colorHex);
        child.material.emissiveIntensity = intensity;
      }
    });
  }

  dispose(): void {
    disposeObject(this.root);
  }
}
