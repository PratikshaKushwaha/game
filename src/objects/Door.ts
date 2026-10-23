// ============================================================
// Door.ts — Procedural door object with open/close animation
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
}

export class Door {
  readonly root: THREE.Group;
  readonly colliderBox: THREE.Box3;

  private panel:   THREE.Mesh;
  private frame:   THREE.Mesh;
  private state:   DoorState;
  private _openAngle   = 0;
  private _targetAngle = 0;

  private _mat:       THREE.MeshStandardMaterial;
  private _frameMat:  THREE.MeshStandardMaterial;
  private _lockedMat: THREE.MeshStandardMaterial;

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
    this.frame.receiveShadow = true;
    this.root.add(this.frame);

    // ── Door panel — pivot at left edge ─────────────────
    // The panel group's origin is the left hinge edge
    const pivotGroup = new THREE.Group();
    pivotGroup.position.x = -W / 2;
    this.root.add(pivotGroup);

    const panelColor = this.state === 'locked' ? 0x8b1a1a : (opts.color ?? 0x4a3520);
    this._mat = new THREE.MeshStandardMaterial({
      color: panelColor, roughness: 0.7, metalness: 0.15,
    });
    this._lockedMat = new THREE.MeshStandardMaterial({
      color: 0x8b1a1a, roughness: 0.7, metalness: 0.2,
      emissive: 0x3a0000, emissiveIntensity: 0.4,
    });

    const panelGeo = new THREE.BoxGeometry(W, H, D);
    this.panel = new THREE.Mesh(panelGeo, this._mat);
    this.panel.position.x = W / 2;   // offset so left edge is at pivot
    this.panel.castShadow = true;
    this.panel.receiveShadow = true;
    this.panel.name = 'door-panel';
    pivotGroup.add(this.panel);
    this.panel = this.panel; // keep ref

    // Store pivot group for animation
    (this as unknown as Record<string, unknown>)['_pivot'] = pivotGroup;

    // ── Collider ────────────────────────────────────────
    const worldPos = opts.position;
    this.colliderBox = new THREE.Box3(
      new THREE.Vector3(worldPos.x - W / 2 - 0.06, worldPos.y, worldPos.z - D / 2 - 0.01),
      new THREE.Vector3(worldPos.x + W / 2 + 0.06, worldPos.y + H + 0.06, worldPos.z + D / 2 + 0.01),
    );

    // ── Door handle ─────────────────────────────────────
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xc0a060, metalness: 0.9, roughness: 0.2 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(W / 2 - 0.1, 0, D / 2 + 0.04);
    this.panel.add(handle);
  }

  get isLocked(): boolean { return this.state === 'locked'; }
  get isOpen():   boolean { return this.state === 'open'; }

  unlock(): void {
    if (this.state === 'locked') {
      this.state = 'closed';
      this._mat.color.setHex(0x4a3520);
      this._mat.emissiveIntensity = 0;
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

  /** Apply glitch tint for locked rooms. */
  setLocked(locked: boolean): void {
    if (locked) {
      this._mat.copy(this._lockedMat);
      this.state = 'locked';
    } else {
      this._mat.color.setHex(0x4a3520);
      this._mat.emissiveIntensity = 0;
    }
  }

  dispose(): void {
    disposeObject(this.root);
  }
}
