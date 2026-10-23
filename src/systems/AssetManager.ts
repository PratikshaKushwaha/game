// ============================================================
// AssetManager.ts — Centralised texture / model / audio loader
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

export type AssetEntry =
  | { type: 'texture'; url: string }
  | { type: 'gltf';    url: string }
  | { type: 'audio';   url: string };

export interface AssetManifest {
  [key: string]: AssetEntry;
}

export class AssetManager {
  private textures: Map<string, THREE.Texture> = new Map();
  private models:   Map<string, GLTF>          = new Map();
  private pending   = 0;
  private loaded    = 0;

  private textureLoader = new THREE.TextureLoader();
  private gltfLoader    = new GLTFLoader();

  onProgress?: (ratio: number, label: string) => void;

  async loadManifest(manifest: AssetManifest): Promise<void> {
    const entries = Object.entries(manifest);
    this.pending = entries.length;
    this.loaded  = 0;

    if (this.pending === 0) return;

    await Promise.allSettled(
      entries.map(([key, entry]) => this._loadEntry(key, entry)),
    );
  }

  private async _loadEntry(key: string, entry: AssetEntry): Promise<void> {
    try {
      if (entry.type === 'texture') {
        const tex = await this.textureLoader.loadAsync(entry.url);
        tex.colorSpace = THREE.SRGBColorSpace;
        this.textures.set(key, tex);
      } else if (entry.type === 'gltf') {
        const gltf = await this.gltfLoader.loadAsync(entry.url);
        this.models.set(key, gltf);
      }
      // audio is handled by AudioSystem separately
    } catch {
      console.warn(`[AssetManager] Failed to load "${key}" from ${entry.url}`);
    } finally {
      this.loaded++;
      this.onProgress?.(this.loaded / this.pending, key);
    }
  }

  getTexture(key: string): THREE.Texture | undefined {
    return this.textures.get(key);
  }

  getModel(key: string): GLTF | undefined {
    return this.models.get(key);
  }

  /** Clone a loaded GLTF scene so it can be reused multiple times. */
  cloneModel(key: string): THREE.Object3D | undefined {
    const gltf = this.models.get(key);
    if (!gltf) return undefined;
    return gltf.scene.clone(true);
  }

  dispose(): void {
    this.textures.forEach(t => t.dispose());
    this.textures.clear();
    this.models.clear();
  }
}
