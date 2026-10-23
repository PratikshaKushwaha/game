---
name: game-development
description: "Expert engineering patterns and architectural guidelines for 3D web game development with Three.js, WebGL, custom game loops, player controls, physics, collision detection, and scene management."
risk: low
source: workspace
date_added: "2026-10-23"
---

# 3D Web Game Development Skill

This skill documents production-tested patterns for building performant, modular 3D desktop and browser games using **native Three.js, TypeScript, and Vite**.

---

## 1. Core Architecture Principles

### Separation of Concerns
1. **Rendering Layer (`src/scenes/`)**: Visual scene graph (`THREE.Scene`, `THREE.Mesh`, lights, materials, particle systems). Never stores canonical game rules.
2. **Game State Layer (`src/game/GameState.ts`)**: Single source of truth. Pure state machine observing score, timer, lives, active abilities, and phase transitions.
3. **Player & Controller Layer (`src/player/`)**:
   - `CameraController`: First-person/third-person camera with mouse-look, dynamic sensitivity, pitch clamp, and roll interpolation (for gravity shifts).
   - `PlayerController`: Pointer-lock movement, WASD integration, sprint modifiers, collision resolution.
4. **Collision & Physics (`src/player/CollisionSystem.ts`)**: Axis-Aligned Bounding Box (AABB) or cylinder collision resolution against static world colliders and dynamic props.
5. **UI & HUD (`src/ui/UIManager.ts`)**: Zero-overhead DOM overlays (HTML/CSS) decoupled from the WebGL canvas. Never poll; update on state changes.

---

## 2. The Deterministic Game Loop

A resilient game loop must handle variable frame rates and tab switching gracefully:

```typescript
private _loop = (timestamp: number): void => {
  this._rafId = requestAnimationFrame(this._loop);

  // Delta time with clamp to prevent spiral-of-death when tab loses focus
  const rawDt = (timestamp - this.lastTime) / 1000;
  const dt = Math.min(rawDt, 0.1);
  this.lastTime = timestamp;

  if (this.isPaused) return;

  // 1. Process inputs
  this.input.update();

  // 2. Update active scene logic & animations
  this.currentScene?.update(dt);

  // 3. Update player physics & collision
  this.player.update(dt, this.isBlocked());

  // 4. Update camera
  this.camCtrl.update(dt);

  // 5. Render active Three.js scene
  this.renderer.render(this.scene, this.camera);
};
```

---

## 3. Scene Lifecycle & Memory Management

Every scene must strictly implement lifecycle creation and disposal:

```typescript
export interface IScene {
  update(dt: number): void;
  dispose(): void;
}
```

### Disposal Protocol
- Unregister all raycasting targets from `InteractionController`.
- Traverse meshes: dispose `mesh.geometry`, all slots of `mesh.material` (including `map`, `normalMap`, `roughnessMap`, `emissiveMap`).
- Clear parent scene children and reset background/fog.

---

## 4. Interactive Object System

Use raycasting with dedicated interaction proxies rather than checking every triangle:

```typescript
// Register an object with a bounding mesh proxy
interactionController.register({
  mesh: interactiveBox,
  info: { type: 'keypad', label: 'Enter Room Code [E]' },
  highlight: (on: boolean) => {
    material.emissive.setHex(on ? 0x00e5ff : 0x000000);
  },
  onInteract: () => {
    uiManager.openCodeEntry(currentRoom);
  }
});
```

---

## 5. Performance Checklist

- **Shadow Maps**: 512×512 or 1024×1024 for directional sun/moon light only. Disable shadows on dynamic point lights.
- **Draw Calls**: Reuse geometries and materials (`cloneModel` with shared materials).
- **Pixel Ratio**: Clamp renderer pixel ratio: `Math.min(window.devicePixelRatio, 2)`.
- **Garbage Collection**: Reuse `THREE.Vector3`, `THREE.Euler`, and `THREE.Quaternion` objects within the game loop rather than allocating `new THREE.Vector3()` each frame.
