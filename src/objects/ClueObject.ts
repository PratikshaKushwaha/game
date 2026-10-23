// ============================================================
// ClueObject.ts — In-world clue displaying room code
// ============================================================

import * as THREE from 'three';
import type { Interactable }    from '../player/InteractionController';
import type { InteractableInfo, RoomId } from '../game/GameTypes';
import { disposeObject }        from '../utils/disposal';

export interface ClueOptions {
  position:         THREE.Vector3;
  roomId:           RoomId;
  code:             string;
  highlightedIndex: number | null;
  onInteract:       () => void;
}

/**
 * Renders a sign/board showing the 3-digit room code.
 * If a digit is "highlighted" it glows red.
 */
export class ClueObject implements Interactable {
  readonly mesh:  THREE.Group;
  readonly info:  InteractableInfo;

  private _mats:         THREE.MeshStandardMaterial[] = [];
  private _boardMat:     THREE.MeshStandardMaterial;
  private _onInteractCb: () => void;
  // Track highlight state to avoid redundant material updates
  private _isHighlighted = false;

  constructor(opts: ClueOptions) {
    this._onInteractCb = opts.onInteract;
    this.info = { type: 'clue', label: `Room ${opts.roomId} clue`, roomId: opts.roomId };

    this.mesh = new THREE.Group();
    this.mesh.position.copy(opts.position);
    this.mesh.name = `clue-room-${opts.roomId}`;

    // Board backing
    this._boardMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a, roughness: 0.9, metalness: 0.1,
    });
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.35, 0.04),
      this._boardMat,
    );
    board.castShadow = true;
    this.mesh.add(board);

    // Three digit blocks
    opts.code.split('').forEach((_ch, i) => {
      const isHighlighted = i === opts.highlightedIndex;
      const col = isHighlighted ? 0xff2200 : 0xe0d0b0;
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.5,
        metalness: 0.0,
        emissive:          isHighlighted ? 0xff2200 : 0x000000,
        emissiveIntensity: isHighlighted ? 0.6      : 0.0,
      });
      this._mats.push(mat);

      const block = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.045), mat);
      block.position.set(-0.22 + i * 0.22, 0, 0.002);
      this.mesh.add(block);

      // Glow light for highlighted digit
      if (isHighlighted) {
        const glow = new THREE.PointLight(0xff3300, 0.6, 1.5);
        glow.position.set(-0.22 + i * 0.22, 0, 0.2);
        this.mesh.add(glow);
      }
    });

    // Border frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.4 });
    const frame    = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.39, 0.02), frameMat);
    frame.position.z = -0.02;
    this.mesh.add(frame);
  }

  highlight(on: boolean): void {
    if (this._isHighlighted === on) return;
    this._isHighlighted = on;
    this._boardMat.emissive.setHex(on ? 0x222200 : 0x000000);
    this._boardMat.emissiveIntensity = on ? 0.3 : 0;
  }

  onInteract(): void {
    this._onInteractCb();
  }

  dispose(): void {
    disposeObject(this.mesh);
  }
}
