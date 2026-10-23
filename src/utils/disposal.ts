// ============================================================
// disposal.ts — Three.js resource disposal helpers
// ============================================================

import * as THREE from 'three';

/**
 * Recursively dispose all geometries, materials, and textures
 * in a Three.js Object3D hierarchy.
 */
export function disposeObject(obj: THREE.Object3D): void {
  obj.traverse(child => {
    if (child instanceof THREE.Mesh) {
      disposeMesh(child);
    }
  });
}

export function disposeMesh(mesh: THREE.Mesh): void {
  mesh.geometry?.dispose();
  if (Array.isArray(mesh.material)) {
    mesh.material.forEach(disposeMaterial);
  } else if (mesh.material) {
    disposeMaterial(mesh.material);
  }
}

export function disposeMaterial(mat: THREE.Material): void {
  mat.dispose();
  // Dispose known texture slots
  const m = mat as unknown as Record<string, unknown>;
  const textureKeys = [
    'map', 'normalMap', 'roughnessMap', 'metalnessMap',
    'aoMap', 'emissiveMap', 'envMap', 'lightMap',
    'bumpMap', 'displacementMap', 'alphaMap',
  ];
  for (const key of textureKeys) {
    const val = m[key];
    if (val instanceof THREE.Texture) {
      val.dispose();
    }
  }
}

/**
 * Remove object from scene and dispose its resources.
 */
export function removeAndDispose(scene: THREE.Scene, obj: THREE.Object3D): void {
  scene.remove(obj);
  disposeObject(obj);
}
