// ============================================================
// InteractionController.ts — Raycasting, highlight, and E-key
// ============================================================

import * as THREE from 'three';
import type { InputSystem }      from '../systems/InputSystem';
import type { InteractableInfo } from '../game/GameTypes';

const INTERACTION_RANGE = 3.5; // world units

export interface Interactable {
  mesh: THREE.Object3D;
  info: InteractableInfo;
  onInteract(): void;
  highlight(on: boolean): void;
}

export class InteractionController {
  private raycaster  = new THREE.Raycaster();
  private center     = new THREE.Vector2(0, 0);
  private camera:    THREE.PerspectiveCamera;
  private input:     InputSystem;
  private interactables: Interactable[] = [];
  private current:   Interactable | null = null;

  onHighlightChange?: (info: InteractableInfo | null) => void;

  constructor(camera: THREE.PerspectiveCamera, input: InputSystem) {
    this.camera = camera;
    this.input  = input;
  }

  register(item: Interactable): void {
    this.interactables.push(item);
  }

  unregister(item: Interactable): void {
    this.interactables = this.interactables.filter(i => i !== item);
    if (this.current === item) {
      this.current = null;
      this.onHighlightChange?.(null);
    }
  }

  clearAll(): void {
    this.current?.highlight(false);
    this.current = null;
    this.interactables = [];
    this.onHighlightChange?.(null);
  }

  update(blocked: boolean): void {
    if (blocked) {
      if (this.current) {
        this.current.highlight(false);
        this.current = null;
        this.onHighlightChange?.(null);
      }
      return;
    }

    this.raycaster.setFromCamera(this.center, this.camera);

    const targets = this.interactables.map(i => i.mesh);
    const hits    = this.raycaster.intersectObjects(targets, true);

    let nearest: Interactable | null = null;

    for (const hit of hits) {
      if (hit.distance > INTERACTION_RANGE) break;
      // Walk up to find registered object
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        const found = this.interactables.find(i => i.mesh === obj);
        if (found) { nearest = found; break; }
        obj = obj.parent;
      }
      if (nearest) break;
    }

    if (nearest !== this.current) {
      this.current?.highlight(false);
      this.current = nearest;
      this.current?.highlight(true);
      this.onHighlightChange?.(this.current?.info ?? null);
    }

    if (this.current && this.input.consumeInteract()) {
      this.current.onInteract();
    }
  }
}
