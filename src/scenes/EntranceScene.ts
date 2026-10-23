// ============================================================
// EntranceScene.ts — Foggy exterior: ground, door, manuscript
// ============================================================

import * as THREE from 'three';
import { createEntranceEnvironment } from '../world/Environment';
import { Door }                       from '../objects/Door';
import { Manuscript }                 from '../objects/Manuscript';
import { ENTRANCE_MANUSCRIPT }        from '../puzzles/ClueDefinitions';
import type { InteractionController } from '../player/InteractionController';
import type { UIManager }             from '../ui/UIManager';
import { disposeObject }              from '../utils/disposal';

export interface EntranceSceneOptions {
  scene:       THREE.Scene;
  interaction: InteractionController;
  ui:          UIManager;
  onEnterBuilding: () => void;
}

export class EntranceScene {
  private scene:      THREE.Scene;
  private objects:    THREE.Object3D[] = [];
  private door:       Door;
  private manuscript: Manuscript;
  private interaction: InteractionController;
  private _onEnterBuilding: () => void;
  private _manuscriptRead  = false;

  constructor(opts: EntranceSceneOptions) {
    this.scene       = opts.scene;
    this.interaction = opts.interaction;
    this._onEnterBuilding = opts.onEnterBuilding;

    // ── Environment ─────────────────────────────────────
    createEntranceEnvironment(this.scene);

    // ── Distant atmospheric pillars / silhouettes ───────
    this._buildSilhouettes();

    // ── Door ────────────────────────────────────────────
    this.door = new Door({
      position: new THREE.Vector3(0, 0, -8),
      color: 0x3a2810,
      locked: false,
    });
    this.scene.add(this.door.root);
    this.objects.push(this.door.root);

    // Door is interactable
    this.interaction.register({
      mesh: this.door.root,
      info: { type: 'door', label: 'Enter Building' },
      highlight: (on) => {
        const mat = this.door['_mat'] as THREE.MeshStandardMaterial;
        mat.emissive.setHex(on ? 0x331100 : 0x000000);
        mat.emissiveIntensity = on ? 0.4 : 0;
      },
      onInteract: () => this._openDoor(),
    });

    // ── Manuscript ──────────────────────────────────────
    this.manuscript = new Manuscript(
      new THREE.Vector3(2.5, 1.2, -6.5),
      'Read Message',
      () => this._openManuscript(opts.ui),
    );
    this.scene.add(this.manuscript.mesh);
    this.objects.push(this.manuscript.mesh);
    this.interaction.register(this.manuscript);

    // ── Atmospheric lights ──────────────────────────────
    const doorSpot = new THREE.SpotLight(0x8888ff, 2, 20, Math.PI / 8, 0.4);
    doorSpot.position.set(0, 10, -4);
    doorSpot.target.position.copy(this.door.root.position);
    this.scene.add(doorSpot);
    this.scene.add(doorSpot.target);
    this.objects.push(doorSpot);
  }

  private _buildSilhouettes(): void {
    // Distant broken wall segments for atmosphere
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 1 });
    const segments = [
      { pos: [-8, 2, -18], size: [0.5, 4, 6] },
      { pos: [ 8, 1.5, -20], size: [0.5, 3, 5] },
      { pos: [-15, 1, -25], size: [0.5, 2, 4] },
      { pos: [ 15, 1, -22], size: [0.5, 2, 4] },
    ] as { pos: [number,number,number]; size: [number,number,number] }[];

    segments.forEach(s => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s.size), wallMat);
      mesh.position.set(...s.pos);
      this.scene.add(mesh);
      this.objects.push(mesh);
    });
  }

  private _openManuscript(ui: UIManager): void {
    if (this._manuscriptRead) return; // allow re-read but track first-read
    this._manuscriptRead = true;
    ui.showManuscript(ENTRANCE_MANUSCRIPT.title, ENTRANCE_MANUSCRIPT.body);
    ui.onManuscriptClose = () => { /* restore pointer lock */ };
  }

  private _openDoor(): void {
    this.door.open(() => {
      setTimeout(() => this._onEnterBuilding(), 400);
    });
  }

  update(dt: number): void {
    this.door.update(dt);
    this.manuscript.update(dt);
  }

  dispose(): void {
    this.interaction.clearAll();
    this.objects.forEach(o => {
      this.scene.remove(o);
      disposeObject(o);
    });
    this.objects = [];
    this.manuscript.dispose();
    this.door.dispose();
  }
}
