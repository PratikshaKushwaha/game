# SKILLS.md — Technical Skills Reference
**The Way Out | GlitchVerse PS01**

A practical implementation reference. Each section documents what a skill does in this game, the APIs used, where it lives, common pitfalls, and performance notes.

---

## 1. Three.js Scene and Renderer Setup

**What it does:** Creates the WebGL canvas, renderer, scene graph, and camera.

**APIs:**
```typescript
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.outputColorSpace   = THREE.SRGBColorSpace;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.05, 200);
```

**Location:** `src/game/Game.ts` constructor.

**Pitfalls:**
- Forgetting `outputColorSpace = SRGBColorSpace` makes textures too bright.
- Pixel ratio > 2 is a GPU performance trap on high-DPI displays.
- Always call `renderer.setSize` on window resize via the resize handler.

**Performance:**
- Shadow maps are expensive. Use 512×512 for interior lights; 1024×1024 only for the main entrance directional light.
- `PCFSoftShadowMap` is slower than `BasicShadowMap` but looks much better.

**Docs:** https://threejs.org/docs/#api/en/renderers/WebGLRenderer

---

## 2. TypeScript Architecture

**What it does:** Provides typed interfaces, strict mode, and ES module imports throughout.

**Key conventions:**
- `interface` for data/config shapes (`RoomConfig`, `FurnitureConfig`).
- `class` for stateful objects with behaviour (`Door`, `Manuscript`, `PuzzleSystem`).
- `type` for unions (`GamePhase`, `RoomId`, `FurnitureType`).
- Singleton pattern for `gameState` (exported instance of `GameState` class).
- Never use `any`. Use `unknown` + type guards or `as unknown as T` with a comment.

**Strict flags active:** `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.

**Unused parameter convention:** prefix with `_` (e.g., `_roomId`) to suppress the error when the signature must match an interface.

**Location:** `tsconfig.json`, all `src/**/*.ts`.

---

## 3. Camera and First-Person Controls

**What it does:** Implements a first-person camera that rotates with mouse movement.

**APIs:**
```typescript
// Yaw (horizontal) and pitch (vertical) stored as radians
const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
camera.quaternion.setFromEuler(euler);
```

**Location:** `src/player/CameraController.ts`

**Pitfalls:**
- Use `'YXZ'` Euler order — apply yaw before pitch to avoid gimbal roll.
- Clamp pitch to ±80° to prevent flipping.
- Mouse events fire only when `document.pointerLockElement` is set; guard every `mousemove` handler.

**Performance:** Camera rotation is O(1) per frame — no concern.

---

## 4. Pointer Lock Behaviour

**What it does:** Locks the mouse cursor to the canvas for free-look first-person control.

**APIs:**
```typescript
canvas.requestPointerLock();          // acquire
document.exitPointerLock();           // release
document.addEventListener('pointerlockchange', handler);
// inside handler:
const locked = !!document.pointerLockElement;
```

**Location:** `src/player/PlayerController.ts`

**Pitfalls:**
- `requestPointerLock()` must be called from a user gesture (click handler).
- On Escape keypress the browser releases the lock automatically — handle `pointerlockchange` to sync state.
- Do NOT call `requestPointerLock()` when an overlay dialog is visible.

**Policy:** The game only calls `requestPointerLock` when `gameState.phase` is `'entrance'` or `'building'` and no overlay is open.

---

## 5. Movement and Collision

**What it does:** Moves the player position each frame based on WASD input, then resolves against AABB obstacles.

**APIs / pattern:**
```typescript
// Build delta from camera forward/right XZ projections
const delta = new THREE.Vector3();
delta.addScaledVector(forwardXZ, speed * dt);
// Resolve collision by testing X and Z axes separately
const nextX = position.clone(); nextX.x += delta.x;
if (boxOverlapsAny(nextX)) delta.x = 0;
// ... same for Z
```

**Location:** `src/player/CollisionSystem.ts`, `src/player/PlayerController.ts`

**Pitfalls:**
- Test X and Z separately (split-axis) to allow sliding along walls.
- Always cap `dt` to avoid tunnelling through thin walls on lag spikes.
- Player AABB: radius 0.35 m, height 1.75 m — sized to fit through 1 m doors.

**Performance:** O(n) per frame where n = number of obstacle boxes. Acceptable for ~100 boxes.

---

## 6. Raycasting and Interactions

**What it does:** Casts a ray from the camera centre to detect nearby interactable objects. Highlights them and fires `onInteract()` on E-key press.

**APIs:**
```typescript
raycaster.setFromCamera(new THREE.Vector2(0,0), camera); // centre screen
const hits = raycaster.intersectObjects(meshArray, true); // recursive
```

**Location:** `src/player/InteractionController.ts`

**Pitfalls:**
- Pass `true` as second arg to `intersectObjects` to recurse into groups.
- Walk up `hit.object.parent` chain to find the registered root object.
- Interaction range is 3.5 m — feel free to tune in `InteractionController.ts`.
- Disable interaction (pass `blocked = true`) when any overlay is open.

**Interactable interface:**
```typescript
interface Interactable {
  mesh: THREE.Object3D;
  info: InteractableInfo;
  onInteract(): void;
  highlight(on: boolean): void;
}
```
Register with `interaction.register(item)`. Unregister or call `clearAll()` on scene dispose.

---

## 7. GLTF/GLB Model Loading

**What it does:** Loads external 3D models into the scene.

**APIs:**
```typescript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const loader = new GLTFLoader();
const gltf = await loader.loadAsync('/models/door.glb');
scene.add(gltf.scene);
```

**Location:** `src/systems/AssetManager.ts`

**How to use a loaded model:**
```typescript
// In assetManifest.ts:
'door-model': { type: 'gltf', url: '/models/door.glb' }

// In scene code:
const doorMesh = assets.cloneModel('door-model');
if (doorMesh) scene.add(doorMesh);
```

**Pitfalls:**
- Always clone (`gltf.scene.clone(true)`) if you use the same model multiple times.
- Set `mesh.castShadow = mesh.receiveShadow = true` after load.
- Traverse and set `colorSpace = SRGBColorSpace` on all loaded textures if they look washed out.

---

## 8. Materials, Textures, and Lighting

**Standard material:**
```typescript
new THREE.MeshStandardMaterial({
  color: 0x4a3520,
  roughness: 0.7,
  metalness: 0.1,
  map: assets.getTexture('wood-diffuse'),
})
```

**Lights used:**
- `AmbientLight` — base fill, low intensity.
- `PointLight` — per-room, cast shadows.
- `DirectionalLight` — entrance key light.
- `SpotLight` — entrance door spotlight.

**Pitfalls:**
- Always set `tex.colorSpace = THREE.SRGBColorSpace` for diffuse/albedo maps.
- Keep emissiveIntensity ≤ 1 for subtlety; higher values blow out.
- Dispose materials when removing objects — see `src/utils/disposal.ts`.

---

## 9. Fog and Atmospheric Environments

**Entrance — exponential fog:**
```typescript
scene.fog = new THREE.FogExp2(0x0a0a12, 0.07);
scene.background = new THREE.Color(0x0a0a12);
```

**Building — linear fog:**
```typescript
scene.fog = new THREE.Fog(0x0d0d10, 8, 35);
scene.background = new THREE.Color(0x0d0d10);
```

**Pitfalls:**
- `scene.background` must match fog colour exactly to avoid a visible horizon line.
- `FogExp2` density > 0.1 becomes very thick; 0.07 is the tested sweet spot for the entrance.
- Reset `scene.fog = null` and `scene.background = null` before switching scenes.

---

## 10. GLSL and ShaderMaterial

**Pattern (not yet in use — planned for glitch transitions):**
```typescript
const mat = new THREE.ShaderMaterial({
  vertexShader:   `/* glsl */ ...`,
  fragmentShader: `/* glsl */ ...`,
  uniforms: {
    uTime:    { value: 0 },
    uTexture: { value: texture },
  },
});
// Update in render loop:
mat.uniforms['uTime'].value = clock.getElapsedTime();
```

**Location (planned):** `src/shaders/glitchShader.ts`

**Pitfalls:**
- GLSL errors are silent in production; use browser dev-tools WebGL inspector.
- Uniforms must be defined in both JS and the shader source.
- Use `precision mediump float;` in fragment shaders for mobile compatibility.

---

## 11. Post-Processing

**Planned:** `EffectComposer` with a custom glitch pass on scene transitions.

**Pattern:**
```typescript
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass }     from 'three/addons/postprocessing/ShaderPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new ShaderPass(GlitchShader));
// In loop: composer.render() instead of renderer.render()
```

**Status:** Not in MVP. Add to `Game.ts` when implementing.

---

## 12. Animation and Transitions

**Door animation:**
```typescript
// In Door.update(dt):
pivot.rotation.y = Math.min(pivot.rotation.y + dt * 1.5, Math.PI / 2);
```

**Manuscript idle:**
```typescript
// In Manuscript.update(dt):
mesh.position.y = baseY + Math.sin(time * 1.2) * 0.08;
mesh.rotation.y = Math.sin(time * 0.4) * 0.15;
```

**AnimationMixer (for GLTF animations):**
```typescript
const mixer = new THREE.AnimationMixer(gltf.scene);
const action = mixer.clipAction(gltf.animations[0]);
action.play();
// In loop:
mixer.update(dt);
```

---

## 13. HTML/CSS Game UI Integration

**Pattern:** All game UI is pure HTML + CSS. Never use a JS framework.

**Overlay visibility:**
```typescript
el.classList.remove('hidden'); el.classList.add('active'); // show
el.classList.remove('active'); el.classList.add('hidden'); // hide
```

**Keyboard input isolation:** `InputSystem._onKeyDown` checks `e.target.tagName` and ignores events from `INPUT`, `TEXTAREA`, `BUTTON` elements so typing in the numpad doesn't move the player.

**Focus management:** Call `.focus()` on the first button when showing an overlay. Return focus to the canvas on close.

**Location:** `src/ui/UIManager.ts`, `src/styles/main.css`, `index.html`.

---

## 14. Puzzle Logic and Deterministic Randomness

**PRNG:** Mulberry32 seeded with a timestamp.
```typescript
// src/utils/random.ts
export function createRng(seed: number): () => number { ... }
```

**Code generation:**
```typescript
// In RoomPuzzleGenerator.ts
const code = `${randInt(rng,0,9)}${randInt(rng,0,9)}${randInt(rng,0,9)}`;
```

**Highlighted room selection:**
```typescript
const highlighted = sampleWithout(rng, [1,2,3,4,5,6], 3);
```

**Final combination derivation:**
```typescript
const combo = rooms
  .filter(r => r.highlightedDigit !== null)
  .sort((a, b) => a.id - b.id)
  .map(r => r.highlightedDigit!)
  .join('');
```

**Pitfall:** Use the same `rng` instance sequentially for all rooms. Creating a new `rng(seed)` for each room would produce the same sequence every time.

---

## 15. Audio Handling

**Unlock AudioContext from user gesture:**
```typescript
// Call in a click handler or pointer-lock acquire
audio.unlock(); // creates AudioContext
```

**Load a buffer:**
```typescript
await audio.loadBuffer('unlock', '/audio/unlock.ogg');
```

**Play:**
```typescript
audio.playOneShot('unlock', 0.9);   // one-shot
audio.playAmbience('ambience', 0.3); // looping
audio.stopAmbience();
```

**Location:** `src/systems/AudioSystem.ts`

**Pitfalls:**
- Always guard with `if (!this.ctx)` — AudioContext not created until user gesture.
- OGG is widely supported but provide MP3 fallback if needed.
- `AudioContext` must be resumed if it is suspended (browser policy).

---

## 16. Asset Optimisation and Memory Management

**Disposal chain:**
```typescript
// src/utils/disposal.ts
disposeObject(obj);   // traverses all Mesh children
disposeMesh(mesh);    // disposes geometry + material
disposeMaterial(mat); // disposes mat + all texture slots
```

**Scene clear:**
```typescript
// Remove all objects before loading a new scene
while (scene.children.length > 0) scene.remove(scene.children[0]);
scene.fog = null;
scene.background = null;
```

**Model instancing:** Use `gltf.scene.clone(true)` to share geometry data while having independent transform nodes.

**Texture reuse:** `AssetManager` caches textures by key — loading the same URL twice returns the same `THREE.Texture` instance.

---

## 17. Testing and Debugging

**Run tests:** `npm test` (Vitest)

**TypeScript check:** `npm run lint` (`tsc --noEmit`)

**Dev server:** `npm run dev` → `http://localhost:5173`

**Dev console access:**
```javascript
// In browser console:
window.__game  // Game instance
```

**Three.js inspector:** Install the [Three.js DevTools](https://github.com/threejs/three.js-devtools) browser extension for scene graph inspection.

**Common issues:**
- Black screen: check `scene.background`, fog colour, and camera near/far.
- Textures wrong colour: check `colorSpace = SRGBColorSpace`.
- Pointer lock not acquiring: must be inside a user gesture handler.
- `dispose()` not called: check browser memory tab for growing GPU memory.

---

## 18. Git Workflow and Asset Licensing

**Commit format:** `type(scope): message`
- `feat:` new feature
- `fix:` bug fix
- `refactor:` code restructure
- `docs:` documentation
- `test:` test changes
- `chore:` config, deps

**Asset licensing rules:**
- Only use assets you own or that are licensed for commercial use (CC0, CC-BY, MIT).
- Document asset source and license in `docs/ASSETS.md`.
- Never commit assets with unknown or proprietary licenses.

**`.gitignore` rules:** `node_modules/`, `dist/`, `coverage/`, `.env`. Game assets in `public/` ARE committed.
