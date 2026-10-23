# The Way Out

**GlitchVerse PS01: The World Is Broken** — A first-person puzzle-adventure browser game.

> A student is pulled into a glitching virtual world. Solve six numerical puzzles, collect three hidden digits, and escape through the final door before the world locks you in forever.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 (tested on 22.19) |
| npm | ≥ 9 (tested on 10.9) |

---

## Installation

```bash
cd "d:/Downloads/Game"
npm install
```

---

## Development Server

```bash
npm run dev
```

Opens at **http://localhost:5173** with hot module replacement.

---

## Production Build

```bash
npm run build
# Output → dist/
```

Preview the production build:
```bash
npm run preview
```

---

## Test Commands

```bash
npm test              # Run all tests once (Vitest)
npm run test:watch    # Watch mode
npm run lint          # TypeScript strict check (tsc --noEmit)
```

---

## Controls

| Input | Action |
|---|---|
| **W A S D** | Move |
| **Mouse** | Look |
| **E** | Interact |
| **Escape** | Pause / release cursor |
| **Click** | Acquire mouse lock |

---

## Project Structure

```
d:/Downloads/Game/
├── index.html                  # HTML shell — overlays and canvas
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── PRD.md                      # Product requirements
├── AGENTS.md                   # AI agent instructions
├── DESIGN.md                   # Visual design reference
├── SKILLS.md                   # Technical skills guide
│
├── public/
│   ├── favicon.svg
│   ├── video/                  # ← Place opening.mp4 / opening.webm here
│   ├── models/                 # ← Optional GLB models
│   ├── textures/               # ← Optional textures
│   ├── audio/                  # ← Optional OGG audio files
│   └── fonts/                  # ← Optional custom fonts
│
├── src/
│   ├── main.ts                 # Entry point
│   ├── styles/main.css         # All CSS
│   │
│   ├── game/
│   │   ├── Game.ts             # Top-level orchestrator, RAF loop
│   │   ├── GameState.ts        # Central observable state
│   │   └── GameTypes.ts        # Shared TypeScript interfaces
│   │
│   ├── scenes/
│   │   ├── OpeningCinematic.ts # HTML video cinematic controller
│   │   ├── EntranceScene.ts    # Fog, door, manuscript
│   │   └── BuildingScene.ts    # 7-room puzzle building
│   │
│   ├── player/
│   │   ├── CameraController.ts # Mouse-look, pitch/yaw
│   │   ├── PlayerController.ts # Movement, pointer lock
│   │   ├── CollisionSystem.ts  # AABB collision resolution
│   │   └── InteractionController.ts # Raycasting, E-key
│   │
│   ├── objects/
│   │   ├── Door.ts             # Animated door with states
│   │   ├── Manuscript.ts       # Floating interactable note
│   │   ├── ClueObject.ts       # Code sign with highlighted digit
│   │   └── Furniture.ts        # 10 procedural furniture types
│   │
│   ├── systems/
│   │   ├── InputSystem.ts      # Keyboard state + one-shot events
│   │   ├── AudioSystem.ts      # Web Audio API wrapper
│   │   ├── AssetManager.ts     # Texture + GLTF loader + cache
│   │   └── PuzzleSystem.ts     # Code validation, state update
│   │
│   ├── puzzles/
│   │   ├── RoomPuzzleGenerator.ts  # Seeded code + highlight generation
│   │   ├── FinalCombination.ts     # Final 3-digit answer
│   │   └── ClueDefinitions.ts      # All story text / manuscripts
│   │
│   ├── ui/
│   │   └── UIManager.ts        # All DOM overlay management
│   │
│   ├── world/
│   │   └── Environment.ts      # Fog, lights, ground
│   │
│   ├── data/
│   │   ├── levelOneConfig.ts   # Room layout, furniture positions
│   │   └── assetManifest.ts    # Asset declarations
│   │
│   └── utils/
│       ├── math.ts             # clamp, lerp, deg2rad, collision helpers
│       ├── random.ts           # Mulberry32 PRNG, shuffle, sample
│       └── disposal.ts         # Three.js memory disposal utilities
│
└── tests/
    ├── game/
    │   ├── GameState.test.ts
    │   └── random.test.ts
    └── puzzles/
        └── RoomPuzzleGenerator.test.ts
```

---

## Placing Your Assets

### Opening Cinematic Video
```
public/video/opening.mp4      ← primary (H.264)
public/video/opening.webm     ← fallback (VP9)
```
The game auto-skips if neither file exists.

### Audio
```
public/audio/ambience.ogg
public/audio/unlock.ogg
public/audio/fail.ogg
public/audio/interact.ogg
public/audio/glitch.ogg
```
The game runs silently if audio files are absent.

### Models
```
public/models/door.glb
```
Declare in `src/data/assetManifest.ts`. The game uses procedural geometry until models are supplied.

### Textures
```
public/textures/concrete_diffuse.jpg
public/textures/wood_diffuse.jpg
```
Declare in `src/data/assetManifest.ts`.

---

## Current Implementation Status

| Feature | Status |
|---|---|
| Project scaffold (Vite + TS + Three.js) | ✅ Complete |
| TypeScript strict — 0 errors | ✅ |
| Vite production build | ✅ |
| Opening cinematic (HTML video) | ✅ |
| Entrance scene (fog, door, manuscript) | ✅ |
| 7-room building geometry | ✅ |
| 10 procedural furniture types | ✅ |
| Room codes — seeded PRNG | ✅ |
| 3 random highlighted digits | ✅ |
| Clue signs (in-world code display) | ✅ |
| AABB collision system | ✅ |
| First-person pointer-lock controls | ✅ |
| Raycasting interaction | ✅ |
| Manuscript overlay (HTML/CSS) | ✅ |
| Code entry numpad | ✅ |
| Final combination (4-attempt limit) | ✅ |
| Pause menu | ✅ |
| Level complete screen | ✅ |
| HUD (crosshair, prompt, room label) | ✅ |
| Audio system (Web Audio, graceful fallback) | ✅ |
| Asset manager (textures, GLTF) | ✅ |
| Unit tests (29/29 passing) | ✅ |
| GLTF model replacement for furniture | ⬜ Awaiting models |
| Opening cinematic video | ⬜ Awaiting video |
| Audio files | ⬜ Awaiting audio |
| Wall / floor textures | ⬜ Awaiting textures |
| Glitch shader post-processing | ⬜ Post-MVP |
| Save/load (localStorage) | ⬜ Post-MVP |
| Mobile touch controls | ⬜ Post-MVP |

---

## License

Game code: proprietary — GlitchVerse PS01 hackathon submission.
Three.js: MIT License — https://github.com/mrdoob/three.js/blob/dev/LICENSE
