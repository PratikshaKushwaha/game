# IMPLEMENTATION_PLAN.md — Migration to React Three Fiber (R3F)
## The Way Out — Production Implementation Plan

---

## 1. Stage 0: Audit Summary

### Current Repository State
- **Core Stack:** Native Three.js (`three@0.169.0`), TypeScript, Vite 5.4.
- **Rendering Architecture:** Custom manual `requestAnimationFrame` loop in `Game.ts` directly manipulating `THREE.WebGLRenderer`, `THREE.Scene`, `THREE.PerspectiveCamera`.
- **UI Architecture:** Imperative HTML strings and DOM element querying in `UIManager.ts`.
- **Game Logic:** Modular pure TypeScript/JavaScript modules:
  - `src/game/GameState.ts` — Observable singleton state.
  - `src/puzzles/RoomPuzzleGenerator.ts` — Mulberry32 PRNG room generation.
  - `src/puzzles/FinalCombination.ts` & `PuzzleSystem.ts` — Room code and permutation validation.
  - `src/systems/SaveSystem.ts` & `AudioSystem.ts` — Persistence and Web Audio synthesis.
- **Assets Inventory:**
  - `public/assets/WorldGen/pack/gaussian_splatting/environment_collider.glb` (Ground environment mesh)
  - `public/assets/WorldGen/pack/separated_objects/glb/object_0000/model_shaded.glb` & `model_shaded_diffuse.jpg` (Teleport Door)
  - `public/assets/WorldGen/pack/separated_objects/glb/object_0001/model_shaded.glb` & `model_shaded_diffuse.jpg` (Structure / Pedestal)
  - `public/video/opening.mp4` (27.9MB full opening sequence video)
  - `scripts/blender/generate_game_assets.py` (Blender headless asset generator)
- **Test Status:** 29 Vitest tests passing (`GameState.test.ts`, `random.test.ts`, `RoomPuzzleGenerator.test.ts`).

---

## 2. Gap Analysis vs. Authoritative AGENTS.md

| Requirement | Current State | Required R3F State |
|---|---|---|
| **Framework** | Vanilla TS / DOM | React 18 + React DOM + Vite |
| **3D Engine** | Native `new WebGLRenderer()` in RAF | React Three Fiber `<Canvas>` + Drei |
| **Scene Composition** | Imperative classes (`HubScene`, `BuildingScene`) | Composable R3F JSX components (`<EntranceScene />`, `<BuildingScene />`, `<PlatformerScene />`) |
| **UI & Overlays** | DOM element query + CSS classes | Composable React components (`<HUD />`, `<DialogueBox />`, `<KeypadModal />`, `<SettingsModal />`) |
| **Level 1** | 8 rooms | 7 rooms (rooms 1–6 numeric puzzles, 3 special digits, 4 guesses, room 7 vault completion) |
| **Level 2** | 3D Gravity Flip | 2D-style side-scrolling platformer (Mario-style, orthographic camera follow, patrol enemies/zombies with stomp mechanics, 3 lives system, checkpoints, collectibles, exit door) |
| **Asset Pipeline** | Blender Python script ready | Verified automated Blender generation + R3F `useGLTF` loading |

---

## 3. Migration Roadmap (Preserving Working Systems)

1. **Stage 1: Application Foundation & React Bootstrapping**
   - Configure React 18, React DOM, `@react-three/fiber`, `@react-three/drei`, `@vitejs/plugin-react`.
   - Create `src/App.jsx`, `src/main.jsx`, `src/game/GameProvider.jsx`.
   - Setup `<Canvas>` with proper DPR clamping, shadows, and camera lifecycle.
   - Setup DOM UI overlay shell in React.

2. **Stage 2: Asset Pipeline Verification**
   - Provide R3F hooks for loading GLTF assets (`useGLTF` / custom caching wrapper).
   - Verify Blender generator script compatibility.

3. **Stage 3: Opening Cinematic & Entrance Scene in R3F**
   - `OpeningCinematic.jsx`: React video overlay with skip and auto-transition.
   - `EntranceScene.jsx`: Fog, directional lighting, ground plane, WorldGen 3D models, floating animated manuscript, teleport door.
   - First-person pointer-lock player controller adapted for R3F frame loop (`useFrame`).

4. **Stage 4: Level 1 — 3D Building & Environmental Puzzles**
   - 7 interconnected rooms with modular layouts and lighting.
   - Numerical clues placed on furniture/environmental props.
   - React-driven Roblox-style digital keypad UI with sound feedback.
   - Room unlocking and persistence.

5. **Stage 5: Final Combination & Attempt Rules**
   - 3 distinct rooms selected at run start with special golden digits.
   - Exactly 4 valid attempts. Incorrect guess deducts 1 attempt. 4th incorrect attempt restarts Level 1.
   - Correct combination unlocks Room 7, triggering Level 1 completion.

6. **Stage 6: Level 2 — 2D-Style Platformer in R3F**
   - Orthographic camera with smooth horizontal/vertical follow.
   - 2D side-scrolling physics: horizontal movement, gravity, jump, ground raycasts, platforms.
   - Moving platforms, lethal spikes, and pit hazards.
   - Patrol enemies/zombies with bounce-stomp defeat mechanics.
   - 3-life system: damage cooldown, invulnerability frames, checkpoint respawn, Game Over.
   - Collectibles and Level 2 Exit Door.

7. **Stage 7: Audio, Shaders & Visual Polish**
   - Purged purple palette: cyan/amber/emerald cyber aesthetic.
   - Web Audio synthesizer + sound effects.
   - Responsive UI styling and accessibility.

8. **Stage 8: QA & Production Build**
   - Unit tests running and passing via Vitest.
   - Production bundle verification via `npm run build`.
