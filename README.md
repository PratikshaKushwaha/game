# THE WAY OUT

**GlitchVerse PS01: The World Is Broken** — A single-player 3D narrative puzzle-adventure and 2D-style side-scrolling platformer.

Built with **JavaScript, React 18, React Three Fiber (R3F), Three.js, Drei, Vite, and Blender**.

---

## Narrative Overview

A frustrated student finishes academic submissions and opens their favourite game. The screen glitches. A mysterious transceiver broadcast reveals that the game's developer is trapped inside his own creation. Pulled into the malfunctioning GlitchVerse, the player must navigate the foggy entrance, solve the 7 connected rooms of the Abandoned Building in Level 1, and conquer the hostile corrupted platformer world in Level 2 to free the developer.

---

## Game Progression & Levels

1. **Start Menu**: Peaceful 3D house surrounded by greenery, warm daylight, gentle orbit camera, calming audio.
2. **Opening Cinematic**: Fullscreen video playback with skip control and auto-transition to the entrance.
3. **Entrance Scene**: Sparse, atmospheric foggy void, floating animated Ancient Script, and locked Teleport Door. Interacting with the manuscript triggers transceiver dialogue and unlocks the door to Level 1.
4. **Level 1 (Abandoned Building & Environmental Puzzles)**:
   - 7 interconnected rooms.
   - Rooms 1–6 each contain a discoverable numerical code hidden on furniture and props.
   - Holding `[Q]` activates **Glitch Vision** to reveal obscured codes.
   - 3 distinct rooms contain special golden digits.
   - Room 7 Vault Lock requires entering the 3 golden digits in order.
   - Exactly 4 valid attempts: 4th incorrect attempt restarts Level 1.
   - Correct combination unlocks Room 7, completing Level 1.
5. **Level 2 (2D-Style Side-Scrolling Platformer)**:
   - Mario-inspired side-scrolling platformer in R3F with orthographic camera follow.
   - Running, jumping, gravity, ground detection, moving platforms, and lethal gaps.
   - Patrolling enemies/zombies that can be stomped from above or avoided.
   - 3-life system (`LifeSystem`): contact damage, invulnerability cooldown window, checkpoint respawn, and Game Over.
   - Collectibles and Level 2 Exit Door.

---

## Authoritative Technology Stack

- **Application:** React 18, React DOM, Vite.
- **3D Scene Graph:** React Three Fiber (`<Canvas>`), Three.js, `@react-three/drei`.
- **Game Logic:** Pure JavaScript/TypeScript modules (`GameState.js`, `RoomPuzzleGenerator.js`, `PuzzleSystem.js`, `LifeSystem.js`).
- **Asset Authoring:** Blender (`scripts/blender/generate_game_assets.py` for headless glTF export).
- **Testing:** Vitest (`41/41 unit tests passing`).

---

## Controls

| Key | Action |
|---|---|
| **W A S D** | First-person move (Level 1 / Entrance) / Left & Right move (Level 2) |
| **Shift** (Hold) | Sprint |
| **Space** | Jump (Level 2 Platformer) |
| **Mouse** | First-person look (Click canvas to capture cursor) |
| **E** | Interact (Doors, Ancient Script, Clues, Keypads) |
| **Q** (Hold) | **Glitch Vision** (Level 1: reveal hidden codes & golden digits) |
| **Esc** | Pause Menu / Release cursor |

---

## Development & Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit test suite
npm test

# Type-check TypeScript
npm run lint

# Production build
npm run build
```

---

## Blender Asset Pipeline

Procedural 3D game models can be generated headlessly via Blender's Python runtime:

```bash
blender --background --python scripts/blender/generate_game_assets.py
```

Exports optimized `.glb` assets into `public/assets/models/`.
