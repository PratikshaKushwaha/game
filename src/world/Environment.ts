// ============================================================
// Environment.ts — Ground, fog, and skybox for the entrance
// ============================================================

import * as THREE from 'three';

export function createEntranceEnvironment(scene: THREE.Scene): void {
  // ── Fog ─────────────────────────────────────────────────
  scene.fog = new THREE.FogExp2(0x0a0a12, 0.07);
  scene.background = new THREE.Color(0x0a0a12);

  // ── Ground ──────────────────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(200, 200, 32, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x111118,
    roughness: 0.95,
    metalness: 0.05,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'entrance-ground';
  scene.add(ground);

  // ── Ambient light ───────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x1a1a2e, 1.5);
  scene.add(ambient);

  // ── Directional key light ───────────────────────────────
  const keyLight = new THREE.DirectionalLight(0x7070ff, 0.8);
  keyLight.position.set(5, 12, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.far = 60;
  scene.add(keyLight);

  // ── Subtle fill light from below ────────────────────────
  const rimLight = new THREE.PointLight(0x003366, 1.2, 30);
  rimLight.position.set(-3, 0.5, 2);
  scene.add(rimLight);
}

export function createBuildingEnvironment(scene: THREE.Scene): void {
  scene.fog = new THREE.Fog(0x0d0d10, 8, 35);
  scene.background = new THREE.Color(0x0d0d10);

  const ambient = new THREE.AmbientLight(0x202028, 2);
  scene.add(ambient);
}
