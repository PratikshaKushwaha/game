# The Way Out — Product Requirements Document
**GlitchVerse PS01: The World Is Broken**
Version 0.2 | October 2026

---

## 1. Product Overview

**The Way Out** is a single-player, first-person 3D puzzle-adventure browser game developed for the hackathon challenge: **PS01: GlitchVerse — The World Is Broken**.

Built entirely with **Three.js, TypeScript, and Vite** (no React, no wrapper libraries), the game features:
- Desktop first-person controls (WASD movement, Shift to sprint, mouse look, E to interact).
- A peaceful 3D Start Menu with ambient house/greenery and slow orbit camera.
- An Opening Video placeholder with skip button and auto-continue.
- A mysterious Hub Scene covered in fog with an Ancient Script and a Teleport Door.
- Visual-novel narration widget with typewriter text and walkie-talkie audio distortion.
- 4 distinct playable levels, each introducing a signature reality-bending mechanic:
  1. **Level 1: The Abandoned Building** — 8 rooms, Glitch Vision (hold Q), digital keypad locks, 3 golden digits, Room 8 permutation lock with 3 lives.
  2. **Level 2: Gravity Flip** — Reverse gravity (F) to walk on ceilings and access ceiling switches and exit.
  3. **Level 3: Time Freeze** — Freeze time (T) for 5 seconds to navigate moving hazards and frozen stepping stones.
  4. **Level 4: Dimension Switch** — Shift between Clean and Glitched dimensions (R) to solve cross-reality puzzles and free the trapped developer.
- Comprehensive game systems: Live scoring, level timer, lives system, pause menu, settings, level select, star ratings, and local persistence.

---

## 2. Controls

| Input | Action |
|---|---|
| **W / A / S / D** | Walk forward / left / backward / right |
| **Shift** (Hold) | Sprint |
| **Mouse** | First-person look (click canvas to lock cursor) |
| **E** | Interact (Doors, Ancient Script, Clues, Keypads, Terminals) |
| **Q** (Hold) | **Glitch Vision** (Level 1: reveals hidden codes and golden digits) |
| **F** | **Gravity Flip** (Level 2: reverses gravity to ceiling) |
| **T** | **Time Freeze** (Level 3: freezes platforms/hazards for 5 seconds) |
| **R** | **Dimension Switch** (Level 4: toggles Clean vs. Glitched dimensions) |
| **Escape** | Pause menu / release cursor |

---

## 3. Level Breakdown

### 3.1 Start Menu & Intro Video
- 3D house with garden, warm ambient lighting, gentle camera orbit.
- Buttons: Start Game, Continue, Level Select, Settings, How to Play.
- Intro video playback with skip button.

### 3.2 Hub Scene
- Open foggy void with floating Ancient Script and locked Teleport Door.
- Interacting with the script opens glowing parchment and triggers the developer's walkie-talkie narration.
- Reading the script unlocks the teleport door to Level 1.

### 3.3 Level 1: The Abandoned Building (Glitch Vision)
- 8 rooms with scattered furniture and clues.
- Holding [Q] activates Glitch Vision to reveal hidden codes.
- 3 randomly chosen rooms contain a golden highlighted digit.
- Room 8 requires the 3 golden digits in the correct order.
- Player has 3 lives. Losing all 3 lives resets the run to Room 1 with a score penalty.

### 3.4 Level 2: Gravity Flip
- Pressing [F] reverses gravity, flipping the camera and walking on ceilings.
- Player navigates across floating platforms, triggers the ceiling anchor switch, and exits through the ceiling portal.

### 3.5 Level 3: Time Freeze
- Pressing [T] freezes moving platforms and hazards in mid-air for 5 seconds.
- Player walks across frozen obstacles to reach the temporal exit.

### 3.6 Level 4: Dimension Switch & Finale
- Pressing [R] switches between Clean and Glitched dimensions, revealing alternate bridges and paths.
- Reaching the central Core Terminal releases the developer from the containment pod, triggering the ending cutscene and victory summary.

---

## 4. Scoring & Systems
- Base 1000 points per level + Time Bonus + Lives Bonus − Penalties.
- Persistent progress saved via `localStorage` (unlocked levels, best times, star ratings).
