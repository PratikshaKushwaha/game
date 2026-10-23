# AGENTS.md — Instructions for AI Coding Agents

This document provides all instructions necessary for an AI coding agent to work safely and effectively on **The Way Out**.

---

## ⛔ HARD RULES — Never Violate

1. **Do NOT introduce React, React Three Fiber, Drei, or any JSX-based rendering.**
2. **Do NOT use a React-based UI architecture.** HTML, CSS, and TypeScript only for UI.
3. **Do NOT use Three.js through a wrapper library.** Use the native Three.js API directly.
4. **Do NOT overwrite working code without an explicit approved reason.**
5. **Do NOT force-push, rewrite, or reset Git history.**
6. **Do NOT fabricate test results, build output, or asset existence.**
7. **Do NOT add a backend, database, or multiplayer without a stated requirement.**
8. **Do NOT add paid or subscription-dependent dependencies.**

---

## Architecture Overview

```
The Way Out
├── Pure Three.js rendering (NO React)
├── TypeScript strict (noUnusedLocals, noImplicitReturns, etc.)
├── Vite build tool
├── Vitest test runner (pure TS logic only — no DOM in tests)
└── HTML + CSS overlays (NO React components)
```

### Layer Responsibilities

| Layer | Location | Responsibility |
|---|---|---|
| Entry | `src/main.ts` | Create `Game`, call `.start()` |
| Game loop | `src/game/Game.ts` | RAF loop, scene switching, pause |
| State | `src/game/GameState.ts` | Single mutable state object, observer pattern |
| Types | `src/game/GameTypes.ts` | All shared TypeScript interfaces and types |
| Scenes | `src/scenes/` | EntranceScene, BuildingScene, OpeningCinematic |
| Player | `src/player/` | CameraController, PlayerController, CollisionSystem, InteractionController |
| World | `src/world/` | Environment setup (fog, lights, ground) |
| Objects | `src/objects/` | Door, Manuscript, ClueObject, Furniture |
| Systems | `src/systems/` | InputSystem, AudioSystem, AssetManager, PuzzleSystem |
| Puzzles | `src/puzzles/` | RoomPuzzleGenerator, FinalCombination, ClueDefinitions |
| UI | `src/ui/UIManager.ts` | All DOM overlay manipulation |
| Data | `src/data/` | Level config, asset manifest |
| Utils | `src/utils/` | math.ts, random.ts, disposal.ts |
| Shaders | `src/shaders/` | GLSL ShaderMaterial definitions |
| Styles | `src/styles/main.css` | All CSS |
| Tests | `tests/` | Pure TS unit tests (Vitest) |
| Assets | `public/` | video/, models/, textures/, audio/, fonts/ |

---

## Entry Point and Game Loop

**`src/main.ts`** — creates a `Game` instance and calls `game.start()`.

**`src/game/Game.ts`** — `Game` class:
- Creates renderer, scene, camera, clock.
- Instantiates all systems (Input, Audio, Assets, UI, Camera, Collision, Interaction).
- Runs `start()` → loading → cinematic → entrance → building.
- Private RAF loop `_loop()` calls `update()` on the active scene every frame.
- Manages phase transitions via `gameState.setPhase(...)`.

**Do not put game logic in `main.ts`.** It is an entry point only.

---

## How to Run, Test, Build

```bash
# Install
npm install

# Development server (hot reload)
npm run dev          # → http://localhost:5173

# Type check only (no emit)
npm run lint         # npx tsc --noEmit

# Unit tests
npm test             # vitest run
npm run test:watch   # vitest (watch mode)

# Production build
npm run build        # tsc + vite build → dist/

# Preview production build
npm run preview
```

---

## How to Add a New Scene

1. Create `src/scenes/YourScene.ts` — a plain TypeScript class.
2. Constructor receives `{ scene, interaction, collision, player, ui, ... }`.
3. Add objects to `scene`, register interactables with `interaction`.
4. Expose an `update(dt: number)` method.
5. Expose a `dispose()` method that:
   - Calls `this.interaction.clearAll()` or selectively unregisters.
   - Removes all objects from `scene` and calls `disposeObject()` on each.
6. In `Game.ts`, add a phase transition method (e.g., `_startYourScene()`).
7. Transition from the appropriate existing phase.
8. Update `PRD.md` and `DESIGN.md` if the scene changes the game flow.

---

## How to Add a New Puzzle Type

1. Extend `src/game/GameTypes.ts` with the new type if needed.
2. Generate puzzle data in `src/puzzles/RoomPuzzleGenerator.ts`.
3. Add clue content in `src/puzzles/ClueDefinitions.ts`.
4. Validate in `src/systems/PuzzleSystem.ts`.
5. Write unit tests in `tests/puzzles/`.

---

## Asset Loading and Disposal

### Loading
- Textures and GLTF models: declare in `src/data/assetManifest.ts` and load via `AssetManager`.
- Audio: declare in `AUDIO_FILES` in `assetManifest.ts`; `AudioSystem` loads them separately.
- All asset paths are relative to `public/` (Vite serves `public/` at root).

### Disposal
- **Every scene** must call `disposeObject(obj)` from `src/utils/disposal.ts` when removing Three.js objects.
- Geometries, materials, and textures all need explicit `.dispose()`.
- `AssetManager.dispose()` disposes all loaded textures on game shutdown.
- Never leave orphaned event listeners — use the pattern in `OpeningCinematic.ts`.

---

## Rendering Performance Rules

- Shadow maps: max 512×512 per light; disable for secondary lights.
- Pixel ratio: capped at `Math.min(devicePixelRatio, 2)`.
- Fog: use `THREE.FogExp2` for exterior; `THREE.Fog` for interior.
- Materials: prefer `MeshStandardMaterial`; avoid creating new materials per frame.
- Geometry: reuse geometries where possible; do not create geometry in the render loop.
- Never call `renderer.render()` outside the RAF loop.
- Delta time: capped at 0.1 s to prevent spiral-of-death on tab refocus.

---

## TypeScript Conventions

- `strict: true` is mandatory. All errors must be resolved.
- `noUnusedLocals: true` — remove or prefix with `_` if intentionally unused.
- `noUnusedParameters: true` — use `_paramName` for intentionally unused params.
- Use `interface` for data shapes; `class` for objects with behaviour.
- Avoid `any`. Use `unknown` and narrow with guards, or `as unknown as T` with a comment.
- Event handler methods should be stored as bound references so they can be removed.

---

## Testing Expectations

- Tests live in `tests/` and are pure TypeScript logic (no DOM, no Three.js instantiation).
- Use Vitest (`describe`, `it`, `expect`).
- Test: puzzle generation, state transitions, RNG, math utilities.
- Do NOT test Three.js rendering (not worth mocking).
- Run `npm test` before committing. All tests must pass.

---

## Git Safety Rules

- Commit after each verified milestone.
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Never force-push.
- Never commit `node_modules/`, `dist/`, or `.env`.
- Game asset files (`public/models/`, `public/textures/`, etc.) ARE committed.

---

## Documentation Maintenance

When you change:
- **Game flow or rules** → update `PRD.md`.
- **Architecture** → update `AGENTS.md` and `docs/ARCHITECTURE.md`.
- **Visual design** → update `DESIGN.md`.
- **New API or pattern** → update `SKILLS.md`.
- **New asset requirement** → update `docs/ASSETS.md`.
- **Implementation status** → update `README.md` status table.
