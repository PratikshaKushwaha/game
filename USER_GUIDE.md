# USER_GUIDE.md — The Way Out

## 1. Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- Modern WebGL2-compatible browser (Chrome, Edge, Firefox, Brave)
- Blender (v3.6+ or v4.0+) for optional 3D asset generation

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Launch Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 2. Controls Reference

| Input | Mode | Description |
|---|---|---|
| **W / A / S / D** | 3D / Level 1 | Walk forward, left, backward, right |
| **A / D** | Level 2 2D | Move left and right on platforms |
| **Shift** (Hold) | 3D / Level 1 | Sprint (boosts speed to 8.2 m/s) |
| **Space** | Level 2 2D | Jump onto platforms or enemies |
| **Mouse** | 3D / Level 1 | Look around (click canvas to acquire pointer lock) |
| **E** | 3D / Level 1 | Interact with Ancient Script, Doors, Clues, Keypads |
| **Q** (Hold) | Level 1 | Activate Glitch Vision (reveals hidden codes & gold digits) |
| **Esc** | All | Toggle Pause Menu / Release mouse cursor |

---

## 3. Game Flow Walkthrough

1. **Start Menu**: Press **START GAME** to begin. Click **SETTINGS** to adjust audio volume or mouse sensitivity.
2. **Opening Cinematic**: Watch the intro video or click **SKIP** to proceed.
3. **The Entrance**: Walk forward to the floating Ancient Script. Press **E** to read the transmission. Click through the developer's walkie-talkie dialogue to unlock the Teleport Door. Walk up to the door and press **E** to enter Level 1.
4. **Level 1 (Abandoned Building)**:
   - Navigate rooms 1 to 6. Search desks and bookshelves for numeric clues.
   - Hold **[Q]** to illuminate glowing text and reveal the golden digits.
   - Enter each room's code on the digital door keypad to unlock the next room.
   - In Room 7, enter the 3 golden digits into the Vault Lock terminal. You have 4 valid attempts.
5. **Level 2 (2D Platformer)**:
   - Run and jump across moving platforms and pit gaps.
   - Defeat patrol enemies by jumping directly on top of them (stomp).
   - Reach the midway Checkpoint Flag to save progress.
   - You have 3 lives. Take damage from contacts with temporary invulnerability cooldown.
   - Reach the exit portal at the far right to finish the game and free the developer!

---

## 4. Blender 3D Asset Authoring

The project includes an automated headless Blender pipeline:

```bash
# Run Blender Python generation script
blender --background --python scripts/blender/generate_game_assets.py
```

This exports low-poly models (`terminal_keypad.glb`, `containment_pod.glb`, `glitch_core.glb`, `script_pedestal.glb`) into `public/assets/models/`.

---

## 5. Testing & Verification

```bash
# Run Vitest test suite (41 tests)
npm test

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build
```

---

## 6. Troubleshooting

- **Mouse look doesn't work:** Click on the 3D canvas to engage browser Pointer Lock. Ensure your browser allows pointer lock.
- **Audio does not play:** Modern browsers require user interaction (a click) before playing audio. Clicking **START GAME** unlocks the Web Audio engine.
- **Low frame rate on weak GPUs:** Disable high-DPI scaling; the renderer clamps pixel ratio to `Math.min(window.devicePixelRatio, 2)`.
