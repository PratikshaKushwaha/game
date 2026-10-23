# THE WAY OUT

**GlitchVerse PS01: The World Is Broken** — A 3D first-person puzzle-adventure browser game.

Built with **Pure Three.js, TypeScript, and Vite** (Zero React / Zero JSX).

---

## Story Overview

A frustrated student opens his favorite game and discovers that the game's developer is trapped inside. The developer calls the student "the chosen one" and begs for help. Transported into the corrupted GlitchVerse, the player must master four reality-bending mechanics across 4 levels to unlock the exit and free the developer.

---

## Game Progression & Levels

1. **Start Menu**: Peaceful 3D house surrounded by greenery, warm daylight, gentle orbit camera, calming audio.
2. **Intro Video**: Video slot with skip button and auto-continue.
3. **Hub Scene**: Foggy open world, floating Ancient Script, Teleport Door, visual novel developer walkie-talkie narration.
4. **Level 1 (Glitch Vision)**: Abandoned building with 8 rooms. Hold `[Q]` to reveal hidden codes. Find the 3 golden digits to unlock Room 8 within 3 lives.
5. **Level 2 (Gravity Flip)**: Press `[F]` to reverse gravity, walk on ceilings, trigger the ceiling switch, and escape via the ceiling portal.
6. **Level 3 (Time Freeze)**: Press `[T]` to freeze time for 5 seconds to cross moving hazard platforms.
7. **Level 4 (Dimension Switch)**: Press `[R]` to switch between Clean and Glitched dimensions to reach the Core Terminal and free the developer.

---

## Controls

| Key | Action |
|---|---|
| **W A S D** | Move |
| **Shift** (Hold) | Sprint |
| **Mouse** | Look around (Click canvas to capture cursor) |
| **E** | Interact (Doors, Script, Keypads, Terminals) |
| **Q** (Hold) | **Glitch Vision** (Level 1) |
| **F** | **Gravity Flip** (Level 2) |
| **T** | **Time Freeze** (Level 3) |
| **R** | **Dimension Switch** (Level 4) |
| **Esc** | Pause Menu / Release cursor |

---

## Development & Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests (Vitest)
npm test

# TypeScript type check
npm run lint

# Production build
npm run build
```

---

## Asset Guide

The game features **procedural 3D geometry** and **real-time synthesized Web Audio**, so it is **100% playable with zero asset files**.

If you wish to provide custom assets, place them in `public/` following this structure:

### 1. Opening Video (`public/video/`)
- `opening.mp4` — MP4 (H.264 video, AAC audio, 1920×1080, 16:9)
- `opening.webm` *(optional fallback)*

### 2. 3D Models (`public/models/` or `public/assets/WorldGen/pack/`)
- Format: Binary glTF (`.glb`), scale: 1 unit = 1 meter.
- `door.glb` (~1.0m × 2.2m)
- Optional furniture: `desk.glb`, `chair.glb`, `bookshelf.glb`, `cabinet.glb`, `computer.glb`

### 3. Audio (`public/audio/`)
- Format: `.ogg` (preferred) or `.mp3`, 44.1/48 kHz, 16-bit
- `ambience.ogg` — Looping ambient drone
- `unlock.ogg` — Correct code / door open chime
- `fail.ogg` — Wrong code buzzer
- `interact.ogg` — Click / paper rustle
- `glitch.ogg` — Digital static burst

### 4. Textures (`public/textures/`)
- `concrete_diffuse.jpg` — 1024×1024 / 2048×2048 seamless tileable texture
- `wood_diffuse.jpg` — Seamless wood texture
