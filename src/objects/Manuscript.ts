// ============================================================
// Manuscript.ts — Floating interactable manuscript prop
// ============================================================

import * as THREE from 'three';
import type { Interactable } from '../player/InteractionController';
import type { InteractableInfo } from '../game/GameTypes';

export class Manuscript implements Interactable {
  readonly mesh: THREE.Group;
  readonly info: InteractableInfo;

  private _mat:    THREE.MeshStandardMaterial;
  private _glowMat: THREE.MeshStandardMaterial;
  private _baseY:  number;
  private _time = 0;
  private _onInteractCb: () => void;

  constructor(
    position: THREE.Vector3,
    label: string,
    onInteract: () => void,
  ) {
    this._onInteractCb = onInteract;
    this._baseY = position.y;

    this.info = { type: 'manuscript', label };

    this.mesh = new THREE.Group();
    this.mesh.position.copy(position);
    this.mesh.name = 'manuscript';

    // ── Paper body ──────────────────────────────────────
    this._mat = new THREE.MeshStandardMaterial({
      color: 0xf5e6c8, roughness: 0.9, metalness: 0,
      emissive: 0x332200, emissiveIntensity: 0.15,
    });
    const paperGeo = new THREE.BoxGeometry(0.5, 0.65, 0.01);
    const paper    = new THREE.Mesh(paperGeo, this._mat);
    paper.castShadow = true;
    paper.name = 'paper';
    this.mesh.add(paper);

    // ── Faint ruled lines ────────────────────────────────
    for (let i = 0; i < 6; i++) {
      const lineGeo = new THREE.BoxGeometry(0.38, 0.005, 0.015);
      const lineMat = new THREE.MeshStandardMaterial({ color: 0xccbbaa, roughness: 1 });
      const line    = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(0, 0.22 - i * 0.08, 0.006);
      this.mesh.add(line);
    }

    // ── Glow aura ───────────────────────────────────────
    this._glowMat = new THREE.MeshStandardMaterial({
      color: 0xffdd88,
      emissive: 0xffaa00,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.15,
      roughness: 1,
    });
    const glowGeo = new THREE.PlaneGeometry(0.8, 1.0);
    const glow    = new THREE.Mesh(glowGeo, this._glowMat);
    glow.position.z = -0.02;
    glow.name = 'glow';
    this.mesh.add(glow);

    // ── Point light ─────────────────────────────────────
    const light = new THREE.PointLight(0xffcc66, 0.8, 4);
    light.position.set(0, 0, 0.3);
    this.mesh.add(light);
  }

  highlight(on: boolean): void {
    this._mat.emissiveIntensity = on ? 0.5 : 0.15;
    this._glowMat.opacity       = on ? 0.3  : 0.15;
  }

  onInteract(): void {
    this._onInteractCb();
  }

  update(dt: number): void {
    this._time += dt;
    // Gentle float
    this.mesh.position.y = this._baseY + Math.sin(this._time * 1.2) * 0.08;
    // Slow Y rotation
    this.mesh.rotation.y = Math.sin(this._time * 0.4) * 0.15;
  }

  dispose(): void {
    this.mesh.traverse(c => {
      if (c instanceof THREE.Mesh) {
        c.geometry.dispose();
        if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
        else c.material.dispose();
      }
    });
  }
}
