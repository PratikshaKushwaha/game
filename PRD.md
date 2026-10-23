# The Way Out — Product Requirements Document
**GlitchVerse PS01: The World Is Broken**
Version 0.1 | October 2026

---

## 1. Product Overview

**The Way Out** is a single-player, first-person, 3D puzzle-adventure browser game built for the GlitchVerse PS01 hackathon theme: _The World Is Broken_.

A student finishes academic work and opens a favourite game. The screen glitches. A voice reveals that the game's developer is trapped inside the virtual world. The student is pulled in — and must escape by solving six interconnected numerical puzzles to unlock a final exit door.

The game runs entirely in the browser using Three.js, TypeScript, and Vite. No server, no database, no authentication.

---

## 2. Narrative Summary

| Beat | Description |
|---|---|
| Opening | Video cinematic — screen glitch, voice-over, player pulled into the game |
| Entrance | Foggy exterior world. One door ahead. Floating manuscript explains the objective. |
| Building | Seven-room abandoned building. Six puzzles. Three hidden highlighted digits. |
| Room 7 | Enter the three-digit combination. Four attempts. Escape or restart. |
| Ending | Level-complete screen — "The way out was through the code." |

---

## 3. Player Journey

1. **Loading screen** → assets load → loading bar fills.
2. **Opening cinematic** plays (or is skipped).
3. **Entrance scene**: player spawns facing a door in a foggy landscape. A floating manuscript hovers nearby. Reading it reveals the premise and objective.
4. Player **walks to the door** and presses **E** to enter the building.
5. **Building, Room 1–6**: player explores each room, finds the clue sign displaying a 3-digit code (one digit glows red in highlighted rooms), interacts with the keypad, enters the code, unlocks the door, advances.
6. **Room 7**: a final keypad demands the three highlighted digits in room-number order. Player has four attempts.
7. **Success**: level-complete screen. **Failure** (four wrong attempts): level restarts from Room 1 with fresh codes.

---

## 4. Gameplay Loop

```
Spawn → Explore Room → Find Clue Sign → Open Keypad → Enter Code
     → Correct: Unlock Door → Advance Room
     → Wrong: Feedback, retry (no per-room attempt limit)
→ Rooms 1–6 solved → Enter Room 7 → Enter Final Combination
     → Correct: WIN
     → Wrong × 4: RESTART ALL
```

---

## 5. Controls

| Input | Action |
|---|---|
| W / A / S / D | Move forward / left / back / right |
| Mouse | Look (first-person) |
| E | Interact (door, manuscript, clue sign) |
| Escape | Pause menu / release pointer lock |
| Click | Acquire pointer lock |
| Mouse click / keyboard | Operate UI numpad and buttons |

---

## 6. Scene Progression

### 6.1 Loading Screen
- Loading bar driven by AssetManager progress events.
- Tolerates missing assets — gracefully continues.

### 6.2 Opening Cinematic
- HTML `<video>` element. Sources: `/video/opening.mp4`, `/video/opening.webm`.
- Skip button visible. Keyboard skip (Space, Enter, Escape).
- On playback error → auto-skip to entrance scene.
- Event listeners cleaned up on dismiss.

### 6.3 Entrance Scene
- Ground plane, exponential fog, `THREE.FogExp2`.
- One prominent door (procedural BoxGeometry until model supplied).
- Floating manuscript — idle Y-oscillation, raycasting detect, highlight on hover.
- Atmospheric silhouette walls at distance.
- Point light and spot light illuminate door and manuscript.
- Player spawns at Z+8, facing door (–Z direction).

### 6.4 Building Scene
- Seven rooms in a 2-column × 3-row grid plus Room 7 corridor.
- Rooms built from BoxGeometry walls, floor, ceiling.
- Furniture: 10 procedural types (desk, chair, bookshelf, cabinet, table, locker, crate, barrel, lamp, computer).
- Clue sign in each room (1–6) displays 3-digit code; highlighted digit glows red.
- Room manuscript (floating) provides narrative flavour.
- Doors: locked (red tint) until room code is solved, then animate open.
- Room 7 has a final keypad instead of a clue sign.

### 6.5 Pause Menu
- Resume, Restart Level, control reference.

### 6.6 Level Complete
- Glitch-text "YOU ESCAPED" + Play Again button.

---

## 7. Puzzle System

### 7.1 Room Codes
- Each room 1–6 has a **deterministic 3-digit code** generated from a timestamp seed using the Mulberry32 PRNG.
- Code is displayed on the in-world clue sign — the player reads it in 3D space.
- The player must open the keypad (interact with the clue sign) and enter the 3 digits.
- No per-room attempt limit (the player can keep trying).
- ✅ Confirmed requirement.

### 7.2 Highlighted Digits
- Exactly **3 rooms** among rooms 1–6 are randomly chosen to have one highlighted digit.
- The highlighted digit glows red on the clue sign and is a digit from that room's own code.
- The player must collect all three and remember which they found.
- ✅ Confirmed requirement.

### 7.3 Final Combination
- Room 7 keypad accepts a 3-digit combination.
- Combination = highlighted digits in **ascending room-ID order** (e.g., digit from room 2, then room 4, then room 5).
- Player has exactly **4 attempts**. On the 4th failure, the level restarts.
- ✅ Confirmed requirement.

### 7.4 Deterministic Randomness
- All codes and highlight assignments derive from the timestamp seed via `createRng(seed)`.
- Same seed → same codes every time (useful for replay / debugging).
- On restart, a new seed is drawn so codes are fresh.

---

## 8. UI and Accessibility

### HUD
- Crosshair: centred, always visible during gameplay.
- Interaction prompt: "E — Interact" label near crosshair bottom.
- Room indicator: current room name, top-centre.
- Attempt counter: visible when in Room 7.

### Overlays
- Manuscript: parchment-style overlay, serif font, readable body text, close button.
- Code entry: dark panel, digit display, 0–9 numpad, backspace, submit, cancel.
- Final combination: same layout, red accent, attempt counter.
- Pause menu: resume, restart, control reference.
- Level complete: large glitch-text, play-again button.

### Accessibility
- All interactive overlays use `role="dialog"` and `aria-modal="true"`.
- Focus is moved to the first button on overlay open.
- Keyboard-operable numpad.
- `prefers-reduced-motion`: glitch animations disabled.
- WCAG AA colour contrast targeted for all text.

---

## 9. Audio

> **Status: optional / graceful fallback.** Audio files are loaded from `/audio/` but the game runs silently if they are absent.

| Key | File | Usage |
|---|---|---|
| `ambience` | `/audio/ambience.ogg` | Looping background in building |
| `unlock` | `/audio/unlock.ogg` | Correct code / door open |
| `fail` | `/audio/fail.ogg` | Wrong code |
| `interact` | `/audio/interact.ogg` | E-key interact |
| `glitch` | `/audio/glitch.ogg` | Scene transitions |

- Web Audio API. Unlocked on first user gesture.
- `AudioSystem.setMuted()` exposed for future settings menu.

---

## 10. Performance Requirements

- Target: 60 fps on a mid-range laptop with integrated graphics.
- Shadow maps: 512 × 512 per room light (soft PCF).
- Pixel ratio capped at 2×.
- All objects disposed on scene change to prevent memory leaks.
- No physics engine — lightweight AABB collision.
- No runtime asset generation (textures baked in materials).

---

## 11. MVP Scope

### In scope
- [x] Opening cinematic (HTML video)
- [x] Entrance scene
- [x] 7-room building
- [x] 6 room codes with seeded randomness
- [x] 3 highlighted digits
- [x] Final combination with 4-attempt limit
- [x] First-person pointer-lock controls
- [x] AABB collision
- [x] Raycasting interaction
- [x] Full UI overlay suite
- [x] TypeScript strict / Vitest tests

### Out of scope (MVP)
- [ ] Animated GLTF characters
- [ ] Save/load (localStorage persistence)
- [ ] Multiple levels
- [ ] Multiplayer
- [ ] Mobile touch controls
- [ ] Settings menu (audio volume, sensitivity)
- [ ] Post-processing (glitch shader)

---

## 12. Acceptance Criteria

| Criterion | Status |
|---|---|
| Game loads and renders in Chrome / Firefox / Edge without errors | ✅ Build passes |
| Cinematic plays and can be skipped | ✅ Implemented |
| Player can walk in entrance, read manuscript, enter building | ✅ |
| Exactly 3 rooms have a highlighted digit | ✅ Tested |
| Correct code unlocks room door | ✅ |
| Wrong final code after 4 attempts restarts level | ✅ |
| All 29 unit tests pass | ✅ |
| TypeScript strict: 0 errors | ✅ |
| Vite production build succeeds | ✅ |

---

## 13. Risks and Unresolved Decisions

| Item | Status |
|---|---|
| Opening video not yet supplied | ⚠️ Skip auto-fires if video absent |
| GLB door / furniture models not yet supplied | ⚠️ Procedural geometry used as placeholder |
| Audio files not yet supplied | ⚠️ Silent fallback |
| Room layout confirmed by visual reference? | ❓ Using 2×3 grid default — awaiting reference |
| Exact digit collection order (room order vs. discovery order)? | 📌 **Default: ascending room-ID order** |
| Should the highlighted digit be revealed only after solving the room? | 📌 **Default: visible from the start** |
| Per-room attempt limit needed? | 📌 **Default: no limit** |
