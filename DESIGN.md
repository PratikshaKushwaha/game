# DESIGN.md — Visual and Audio Design Reference
**The Way Out | GlitchVerse PS01**

> This document describes the intended visual direction. Sections marked **[DEFAULT]** reflect sensible defaults pending the delivery of visual references or assets. Sections marked **[REFERENCE REQUIRED]** should be updated once the actual assets and references are received.

---

## 1. Visual Direction

**Theme:** Digital corruption. A world mid-glitch — not fully broken, not fully intact. Eerie, readable, atmospheric.

**Palette:**
- Background / void: `#080810` (near-black, slightly blue)
- Surfaces: `#111120` — `#1a1a28`
- Accent purple: `#6655ff`
- Danger / highlight red: `#ff2200`
- Warm amber (manuscript): `#ffaa00`
- Success green: `#22dd88`
- Text: `#e0ddf0`

**Tone:** Unsettling but not horror. The player should feel curious and slightly anxious, not jump-scared. Like navigating a corrupted save file that is still partially running.

---

## 2. Entrance Scene

### Environment [DEFAULT]
- Large flat ground plane: dark stone / concrete — `color: 0x111118`.
- `THREE.FogExp2` — density `0.07`, colour `#0a0a12`. Objects dissolve into the void beyond ~15 units.
- Sky: no sky object — background colour matches fog.
- Subtle point light (blue tint, `0x003366`) at low height gives faint ground bounce.
- Directional "key light" at 45° from above: `0x7070ff`, low intensity — creates visible shadows without washing out the dark tone.

### The Door [DEFAULT — replace with supplied model]
- Dimensions: 1.0 m wide × 2.2 m tall × 0.08 m deep.
- Frame: dark grey metal — `0x2a2a2a`.
- Panel: weathered dark wood — `0x4a3520`.
- When locked (not applicable at entrance): panel turns deep red (`0x8b1a1a`) with a subtle red emissive glow.
- On hover: subtle warm emissive (`0x331100`) — tells the player "this is interactable".
- Open animation: hinge-pivot swing (90° in ~0.67 s, eased).
- A small cylindrical handle in aged gold (`0xc0a060`, high metalness).

### The Manuscript [DEFAULT]
- Floating at eye height (~1.2 m off ground), ~2.5 m to the right of the door.
- Paper body: `0xf5e6c8` (parchment). Subtle ruled lines.
- Idle animation: gentle Y sine-wave ±0.08 m at 1.2 Hz, slow Y-axis rotation sway ±0.15 rad at 0.4 Hz.
- Point light underneath: amber, `0xffcc66`, short range.
- On hover: emissive intensity increases; paper brightens.

### Silhouettes
- Distant broken wall segments barely visible through fog — dark `0x080810`.
- No vegetation, no mailboxes, no unrelated props.
- Establishes spatial depth without cluttering the composition.

---

## 3. Building Interior

### Global Interior
- Fog: `THREE.Fog(0x0d0d10, 8, 35)` — linear, near clip 8 m, far clip 35 m.
- Ambient light: `0x202028`, intensity 2 — just enough to see geometry.
- Each room has one `PointLight` at ~80% ceiling height.

### Per-Room Lighting Accent Colours

| Room | Accent | Mood |
|---|---|---|
| 1 — Waiting Room | `#fff8e1` warm dim | Bureaucratic dread |
| 2 — Archive | `#e8f4fd` cool blue | Sterile records |
| 3 — Laboratory | `#e8fde8` green tint | Failed experiment |
| 4 — Dormitory | `#fce4ec` dim pink | Abandoned life |
| 5 — Server Room | `#e0f7fa` cyan | Machine persistence |
| 6 — Director's Office | `#fff3e0` amber | Authority, decay |
| 7 — The Exit | `#ffffff` pure white | Stark revelation |

### Walls / Floor / Ceiling [DEFAULT]
- Walls: `0x1a1a20`, roughness 0.95 — dark, slightly textured.
- Floor: `0x111115`, roughness 0.9 — darker than walls.
- Ceiling: `0x0e0e12` — darkest, recedes visually.
- No tiling texture applied yet. [REFERENCE REQUIRED for final texture]

### Room Dimensions
- Width: 9 m, Depth: 8 m, Height: 3.2 m.
- Wall thickness: 0.25 m.
- Scale is chosen to feel slightly oversized and oppressive.

---

## 4. Furniture

Ten procedural types — all rendered with `MeshStandardMaterial`, shadows enabled.

| Type | Material | Notes |
|---|---|---|
| Desk | Dark wood `0x5c3d1e` | 4 legs, flat top |
| Chair | Dark `0x1a1a20`, metal legs | Seat + backrest |
| Bookshelf | Wood + dark shelves | 4 shelves, tall |
| Cabinet | Metal `0x4a4a52` | 3 drawers |
| Table | Wood | Large, 4 legs |
| Locker | Metal | Full height, door panel |
| Crate | Wood | Simple box |
| Barrel | Wood | Cylinder |
| Lamp | Metal pole + point light | Ambient pool of light |
| Computer | Dark + emissive screen | Blue screen glow |

> [REFERENCE REQUIRED] Replace with GLTF models when supplied. `AssetManager.cloneModel()` supports instancing.

---

## 5. Clue Sign (Code Display)

- Board: dark `0x1a1a1a`, metal frame `0x888888`.
- Size: 0.7 m wide, 0.35 m tall.
- Three digit "blocks" — light `0xe0d0b0` for normal digits.
- **Highlighted digit**: deep red `0xff2200`, emissive intensity 0.6, accompanied by a close `PointLight(0xff3300)`.
- On hover: board emissive flickers on (`0x222200`).
- The player reads the 3-digit code directly from the sign in 3D space.

---

## 6. First-Person Camera

- FOV: 75°.
- Near clip: 0.05 m (allows close inspection of objects).
- Far clip: 200 m.
- Eye height: 1.65 m above player position.
- Pitch clamped ±80°.
- Mouse sensitivity: 0.002 rad/px (configurable in `CameraController.ts`).
- No head bob in MVP (can be added later).

---

## 7. Interaction Feedback

### Crosshair
- 20×20 px white cross. Subtle alpha (0.75).
- No dot — lines only. Readable against all surfaces.

### Hover highlight
- Object emissive intensity increases on hover.
- Interaction prompt ("E — Interact") appears below crosshair.
- No world-space floating labels (readability issue at distance).

### Door states
- **Locked**: deep red panel, red emissive glow.
- **Unlocked / closed**: normal wood colour.
- **Opening**: 90° swing animation.
- **Open**: panel fixed at 90°, doorway passable.

---

## 8. HTML/CSS Interface

### Design language
- Monospace font (`Courier New`) — reinforces the "broken computer" aesthetic.
- Dark backgrounds (`#111120`).
- Purple accent (`#6655ff`) for primary actions.
- Red accent (`#ff4422`) for danger / final combination.
- All overlays use `backdrop-filter: blur(4–8px)`.

### Manuscript overlay
- Parchment background (`#f5e6c8`), serif body font (Georgia).
- Slightly off-white text on warm beige — deliberate contrast with the cold game world.
- Drop shadow box glow.

### Code entry panel
- Monospace digit display — large, clear, centred.
- 3×4 numpad grid.
- Clear backspace and submit buttons with distinct colours.
- Feedback text animates in below numpad.

### Glitch text effect (CSS)
- `::before` and `::after` pseudo-elements with `data-text` attribute.
- Red and cyan offset clones, triggered by a CSS `@keyframes` animation.
- Disabled when `prefers-reduced-motion: reduce`.

---

## 9. Transitions

| Transition | Implementation |
|---|---|
| Loading → Cinematic | Fade-out loading screen (opacity CSS), show video overlay |
| Cinematic → Entrance | Hide video overlay, scene renders underneath |
| Entrance → Building | `EntranceScene.dispose()`, `BuildingScene` constructor, 400 ms delay after door open |
| Room to Room | Seamless — no loading screen; player walks through doorway |
| Building → Level Complete | Hide HUD, show level-complete overlay |
| Level Complete → Restart | Dispose building, generate fresh seed, re-enter building |

> [TODO] Add glitch-flash screen transition effect using a full-screen `ShaderMaterial` quad.

---

## 10. Shaders (Planned)

### Glitch Shader (`src/shaders/glitchShader.ts`)
- Full-screen post-processing quad.
- UV displacement + RGB channel split + scan line noise.
- Triggered on scene transitions and when the player enters Room 7.
- **Status: planned for post-MVP.**

### Distortion Shader (`src/shaders/distortionShader.ts`)
- Subtle world-space UV distortion for the entrance scene atmosphere.
- **Status: planned for post-MVP.**

---

## 11. Sound and Ambience

> All audio is optional. The game runs silently if files are absent.

| Sound | Character |
|---|---|
| Ambience | Low industrial hum, distant fan noise, occasional glitch crackle |
| Unlock | Electronic chime, satisfying resolve |
| Fail | Short buzzer / error tone |
| Interact | Soft click or paper rustle |
| Glitch | Digital stutter, pitch-shift |

---

## 12. Accessibility

- `prefers-reduced-motion`: all CSS animations disabled, no glitch text.
- ARIA roles on all overlay dialogs (`role="dialog"`, `aria-modal`).
- Focus management: overlays trap focus and return it on close.
- All interactive elements keyboard-operable.
- Colour contrast: white text on dark backgrounds meets WCAG AA.
- `aria-label` on crosshair (`aria-hidden="true"`) — decorative.
