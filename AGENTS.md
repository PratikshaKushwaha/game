# AGENTS.md — THE WAY OUT
## Production-Minded Game Development Specification

## 1. Mission and Operating Principles

Build and maintain The Way Out, a complete, playable, single-player game combining 3D narrative exploration, environmental puzzles, and a 2D-style side-scrolling platformer.

The project must be developed using JavaScript, React, Three.js, React Three Fiber, Vite, and Blender.

This document is the authoritative set of project-specific coding-agent instructions. Read it before making changes.

### Core principles

- Build working gameplay, not documentation-only scaffolding.
- Preserve useful existing code and assets.
- Inspect before editing.
- Prefer cohesive systems over isolated feature demonstrations.
- Implement complete gameplay loops, including failure, recovery, restarting, and completion.
- Optimize for ordinary student hardware without sacrificing essential visual quality.
- Keep the implementation maintainable and testable.
- Verify all claims against actual code and test results.
- Do not mark placeholder systems as production-ready.
- Do not silently change game requirements.
- Do not invent completed work, asset files, external integrations, or successful tests.

## 2. Authoritative Technology Stack

### Application

- JavaScript using ES modules.
- React and React DOM.
- Vite.
- React Three Fiber.
- Three.js.
- Drei, selectively.
- CSS for presentation and interface styling.
- Vitest for unit tests.
- React Testing Library for appropriate UI tests.

### Rendering and asset tools

- React Three Fiber for the primary scene graph and render lifecycle.
- Native Three.js APIs for capabilities requiring direct access.
- Drei for supported controls, loaders, text, environment helpers, and related utilities.
- Blender for modelling, materials, animation, and export preparation.
- GLB/GLTF for runtime models where suitable.
- GLSL shaders and compatible Three.js postprocessing for selected effects.
- Blender MCP or other AI integrations only when installed and verified.

### Explicit prohibitions

- No TypeScript migration.
- No vanilla JavaScript application architecture.
- No replacing React with direct DOM application code.
- No independent renderer or competing animation loop outside the established R3F lifecycle.
- No React Three Fiber removal in favour of raw Three.js scene management.
- No unnecessary framework changes.
- No backend, database, or multiplayer without an explicit requirement.
- No paid dependencies or API services without approval.

Native Three.js APIs remain available inside the React Three Fiber architecture. Using `THREE.Vector3`, `Raycaster`, `ShaderMaterial`, loaders, or other native APIs does not make the application a vanilla Three.js application.

## 3. Repository Audit and Change Safety

Before implementation:

1. Inspect the existing repository and current branch.
2. Read `package.json`, the lockfile, Vite configuration, application entry points, and source tree.
3. Inspect the existing scenes, controls, state management, puzzle systems, and UI.
4. Inventory available models, textures, audio, video, fonts, and shaders.
5. Read `PRD.md`, `DESIGN.md`, `SKILLS.md`, `README.md`, `USER_GUIDE.md`, and supporting documentation when present.
6. Check Git status, remotes, and uncommitted changes.
7. Verify installed game-development skills and Blender integrations.
8. Identify implemented, incomplete, broken, and missing features.
9. Produce a migration plan if the repository differs from this specification.
10. Preserve working functionality during migration.

Do not delete or replace the project wholesale to make its structure match an example.

Use the existing package manager and lockfile. Do not change package managers without justification.

Never overwrite user assets or discard uncommitted work without approval.

## 4. Architecture

Organize the application around clear responsibilities.

### React application layer

React owns:

- Application bootstrapping.
- Screen and menu composition.
- DOM-based HUD and overlays.
- React-level game-state subscriptions.
- Loading, pause, settings, error, and completion interfaces.
- Lifecycle management for non-rendering systems.

### React Three Fiber rendering layer

R3F owns:

- Canvas and scene composition.
- Cameras and lights.
- Environment rendering.
- 3D model placement.
- Interactive 3D objects.
- Scene-local animations.
- Rendering lifecycle and frame updates.

### Game logic layer

Ordinary JavaScript modules own:

- Puzzle validation.
- Room progression.
- Randomized puzzle configuration.
- Final combination validation.
- Life and damage rules.
- Checkpoint state.
- Enemy decision logic.
- Restart behaviour.
- Level completion and transition rules.

Game rules must not depend on a component being mounted or on a particular rendering frame.

### Systems layer

Use dedicated modules where justified for:

- Asset loading and caching.
- Audio playback.
- Input and interaction.
- Collision and movement.
- Save and run-state handling.
- Performance settings.
- Scene and level transitions.
- Diagnostics and error reporting.

Avoid excessive abstraction. Introduce a system when it has a clear responsibility or is reused, not merely to increase the number of files.

## 5. Recommended Directory Structure

Adapt to the current project. Do not create empty modules or duplicate existing responsibilities.

    public/
      video/
      models/
      textures/
      audio/
      fonts/
      images/

    src/
      main.jsx
      App.jsx

      app/
        AppProviders.jsx
        AppRouter.jsx
        ErrorBoundary.jsx

      components/
        layout/
        ui/
        hud/

      game/
        GameProvider.jsx
        GameState.js
        GameConfig.js
        GameManager.js
        LevelRegistry.js

      scenes/
        OpeningCinematic.jsx
        EntranceScene.jsx
        BuildingScene.jsx
        PlatformerScene.jsx
        LevelCompleteScene.jsx

      player/
        PlayerController.jsx
        PlayerMovement.js
        PlayerCollision.js
        PlayerInteraction.js

      world/
        Environment.jsx
        Lighting.jsx
        Fog.jsx
        WorldBoundaries.js

      objects/
        Door.jsx
        Manuscript.jsx
        Furniture.jsx
        ClueObject.jsx
        Collectible.jsx

      systems/
        AssetManager.js
        AudioManager.js
        InteractionManager.js
        CollisionManager.js
        CheckpointManager.js

      puzzles/
        RoomPuzzleGenerator.js
        ClueDefinitions.js
        PuzzleSystem.js
        FinalCombination.js

      platformer/
        PlatformerScene.jsx
        PlatformerPlayer.jsx
        Enemy.jsx
        Zombie.jsx
        Platform.jsx
        Hazard.jsx
        LifeSystem.js
        LevelTwoManager.js

      shaders/
        glitchShader.js
        distortionShader.js

      hooks/
        useGameState.js
        useKeyboard.js

      data/
        levelOneConfig.js
        levelTwoConfig.js
        assetManifest.js

      styles/
        main.css
        game.css
        ui.css

      utils/
        random.js
        math.js
        disposal.js

    tests/
      puzzles/
      platformer/
      systems/
      ui/

    docs/
      ARCHITECTURE.md
      ASSETS.md
      IMPLEMENTATION_PLAN.md
      TESTING.md

    AGENTS.md
    PRD.md
    DESIGN.md
    SKILLS.md
    USER_GUIDE.md
    README.md

## 6. React Three Fiber Implementation Standards

### Component architecture

- Use `<Canvas>` as the primary 3D rendering surface.
- Compose scene objects as focused React components.
- Keep DOM interface components outside the WebGL scene unless using an explicitly selected overlay approach.
- Use `useFrame` for time-sensitive scene updates.
- Use refs for frame-critical transforms and mutable Three.js objects.
- Do not update React state on every animation frame for ordinary movement.
- Use React state or a suitable state store for meaningful interface and game-state transitions.
- Avoid remounting entire scenes for minor state changes.
- Memoize expensive static geometries, materials, and calculations where useful.
- Keep component keys stable for repeated objects.
- Use suspense and loading boundaries where appropriate.
- Handle failed models, textures, and audio without crashing the entire game.

### State management

Start with React Context and reducer-based state where sufficient. Introduce a lightweight state-management library only if shared state complexity justifies it.

Separate:

- Persistent user preferences.
- Current run state.
- Current level state.
- Transient interface state.
- High-frequency movement state.

Do not place rapidly changing player coordinates in a global store if refs or local simulation state are more suitable.

### Rendering lifecycle

- Use R3F's existing frame loop.
- Avoid calling an independent `renderer.render()` in parallel.
- Avoid unmanaged animation loops.
- Keep imperative Three.js operations inside controlled lifecycle effects or frame callbacks.
- Clean up listeners, subscriptions, and resources correctly.
- Ensure scene transitions do not leave stale interactables or active updates.

## 7. Game Identity and Narrative

The player finishes academic submissions and opens their favourite game. The screen glitches. A mysterious voice reveals that the developer is trapped inside his own creation.

The player is pulled into a malfunctioning virtual world.

The opening leads into a foggy entrance with a door and floating manuscript. The manuscript introduces the objective. The player enters an abandoned building and solves connected puzzles.

Level 2 shifts into a corrupted side-scrolling platformer featuring hostile game entities, survival mechanics, and an exit.

Maintain narrative continuity between both levels through environmental details, visual corruption, sound design, and restrained storytelling.

Do not add unrelated narrative systems without approval.

## 8. Opening Cinematic and Entrance

### Cinematic

- Use the supplied video as the opening sequence.
- Do not recreate the supplied cinematic as a 3D scene unless explicitly requested.
- Handle loading, playback, skip, completion, and unsupported media.
- Account for browser autoplay restrictions.
- Provide an accessible skip control.
- Transition into the entrance scene only once.
- Avoid duplicate event listeners and duplicate transitions.
- Keep the media path configurable.

### Entrance scene

Create a sparse, atmospheric environment containing:

- A readable ground plane.
- Controlled fog and depth.
- A prominent door.
- A floating manuscript.
- Appropriate lighting.
- Bounded player movement.
- Clear interaction feedback.

Follow supplied references rather than adding unrelated props.

The manuscript must:

- Float through a controlled animation.
- Indicate when it can be interacted with.
- Open a readable interface.
- Support closing and reopening.
- Prevent gameplay controls from activating while its interface has focus.
- Present configurable narrative instructions.

The door must have explicit interaction and progression states.

## 9. Level 1 — 3D Exploration and Puzzles

### Building

Implement seven interconnected rooms.

Rooms 1–6 each contain a numerical puzzle. Each room has:

- A defined layout.
- A door and progression condition.
- One discoverable numerical clue.
- An input interface.
- Feedback for correct and incorrect codes.
- Appropriate object interactions.

Use configuration-driven puzzle data. Do not scatter hardcoded puzzle rules throughout visual components.

### Clue placement

Hide numerical clues among furniture and environmental objects.

Clues should be discoverable through observation, not through arbitrary invisible triggers.

Use different object arrangements and controlled visual variations across rooms. Ensure the clue remains distinguishable from decorative detail.

### Room progression

- Correct room code: unlock the corresponding next door.
- Incorrect room code: display clear feedback.
- Prevent repeated submissions from triggering multiple state changes.
- Persist solved-room state during the current run.
- Allow revisiting solved rooms without rerolling their clues.

## 10. Final Combination and Attempt Rules

At the start of a run:

1. Select exactly three distinct rooms from rooms 1–6.
2. Assign a special digit to each selected room.
3. Keep the selected rooms, digits, and ordering stable throughout the run.
4. Ensure all three digits are discoverable through gameplay.
5. Make the special digits distinguishable from ordinary puzzle clues.

The final combination contains three digits.

The player has exactly four valid guesses.

- Empty input: no attempt consumed.
- Incomplete input: no attempt consumed.
- Invalid input format: no attempt consumed.
- Valid incorrect combination: deduct exactly one attempt.
- Correct combination: unlock room 7.
- Fourth valid incorrect combination: restart Level 1.

Do not consume multiple attempts from duplicate events or repeated submissions.

The restart must reset all run-specific puzzle progress, room states, discovered digits, and attempts. A new run may generate a new valid puzzle configuration.

Room 7 opens only after the correct combination. Entering it triggers the Level 1 completion sequence.

Test all rules independently of React and rendering.

## 11. Level 2 — 2D-Style Platformer

Level 2 is a side-scrolling platformer inspired by classic Mario-style mechanics, implemented inside the existing React Three Fiber architecture.

### Camera and world

- Use an orthographic camera.
- Use flat geometry, sprites, planes, or suitable low-poly assets.
- Implement camera follow with controlled smoothing.
- Use parallax backgrounds where appropriate.
- Keep the playable route readable.
- Prevent the camera from exposing unintended empty areas.

### Player movement

Implement:

- Horizontal movement.
- Jumping.
- Gravity.
- Ground detection.
- Platform collision.
- Hazard detection.
- Damage response.
- Checkpoint respawning.

Use stable, delta-time-aware movement. Ensure jump distances and platform heights are fair and achievable.

### Enemies and zombies

Implement enemy types with clear behavioural differences where justified.

Requirements:

- Patrol routes.
- Movement boundaries.
- Collision with the world.
- Player detection where appropriate.
- Contact damage.
- Enemy defeat mechanics.
- Readable damage and defeat feedback.
- Correct cleanup when an enemy is removed or reset.

The player may defeat designated enemies by jumping on them or avoid them. Do not make every enemy invulnerable unless the level design requires it.

### Three-life system

The player starts with exactly three lives.

- Deduct one life per valid damage event.
- Apply temporary invulnerability or another reliable collision cooldown.
- Prevent repeated frame-by-frame deductions from a single contact.
- Respawn at the latest checkpoint or designated starting position.
- Reset relevant player movement and damage state during respawn.
- Trigger Game Over when lives reach zero.
- Allow restarting Level 2.
- Reset lives, enemies, collectibles, checkpoints, and level progress correctly on restart.

### Additional mechanics

Use selected combinations of:

- Collectibles.
- Spikes and lethal gaps.
- Moving platforms.
- Checkpoints.
- Enemy stomping.
- Temporary invulnerability.
- Doors and exits.
- Environmental animations.
- Damage and checkpoint effects.

Every mechanic must serve the level's objective and be fully functional. Avoid unnecessary feature accumulation.

### Completion

Reaching the exit triggers a Level 2 completion state.

Do not build an additional level unless requested.

## 12. Blender and AI Asset Pipeline

Blender is the authoring environment. R3F is the runtime integration layer.

### Connection verification

Before claiming Blender automation works:

- Verify Blender is installed.
- Verify the add-on or integration is installed.
- Verify the MCP server is configured and running.
- Verify Antigravity can access its tools.
- Perform a non-destructive test operation.

If automation is unavailable, provide a transparent manual or procedural alternative.

### Asset generation

For each new asset:

1. Define its gameplay purpose.
2. Specify shape, scale, materials, animation, and performance needs.
3. Check for reusable existing assets.
4. Use available AI generation or procedural modelling.
5. Verify generated files and their actual location.
6. Inspect the mesh, materials, textures, scale, origin, and animation.
7. Export as GLB when suitable.
8. Load it into the running game.
9. Document its origin, license, and limitations.

Do not assume that a generated model is game-ready. Check topology, texture quality, draw-call impact, file size, and runtime behaviour.

### Runtime loading

- Use R3F-compatible GLTF loading, including `useGLTF` where appropriate.
- Centralize asset paths and loading conventions.
- Cache shared models appropriately.
- Avoid mutating shared cached geometry or materials without cloning where necessary.
- Handle loading failures gracefully.
- Dispose of resources correctly without destroying resources still used elsewhere.

Do not fabricate file paths or silently replace missing assets.

## 13. Shaders, Lighting, and Audio

### Visual effects

Use shaders and postprocessing where they improve the game.

Possible effects:

- Glitch distortion.
- Chromatic offset.
- Scanlines.
- Corrupted transitions.
- Localized visual interference.
- Atmospheric fog.
- Controlled lighting changes.

Effects must not obscure puzzle clues, UI text, platform boundaries, or enemies.

Provide a way to reduce expensive effects on weaker hardware.

### Audio

Support configurable:

- Cinematic audio.
- Ambient sound.
- Manuscript interaction.
- Door sounds.
- Puzzle feedback.
- Enemy sounds.
- Damage and defeat.
- Checkpoints.
- Level transitions.
- Completion.

Respect browser audio restrictions and provide mute and volume controls. Missing audio must not prevent gameplay.

## 14. Performance Engineering

Optimize the real bottlenecks instead of applying arbitrary restrictions everywhere.

### Rendering

- Set a sensible device-pixel-ratio cap.
- Use appropriate geometry and texture sizes.
- Reuse materials and geometries.
- Use instancing for repeated objects when beneficial.
- Avoid excessive dynamic shadows.
- Limit expensive postprocessing.
- Use culling and visibility management where appropriate.
- Avoid unnecessary transparent layers.
- Avoid unnecessary React rerenders.
- Keep frame-critical movement in refs or simulation state.
- Avoid allocations inside hot animation loops.

### Asset performance

- Compress large textures where appropriate.
- Optimize GLB geometry and animation data.
- Avoid unnecessarily high-poly props.
- Reuse materials and texture resources.
- Load large assets deliberately.
- Avoid blocking the game with unnecessary synchronous work.
- Handle disposal and cached resources carefully.

### Verification

Use actual profiling and testing to identify performance problems. Do not claim a particular frame rate without measuring it in a stated environment.

## 15. UI and Accessibility

Use React components and CSS for all ordinary game interfaces.

Implement:

- Loading screens.
- Interaction prompts.
- Manuscript dialogue.
- Puzzle input.
- Attempt counters.
- Lives and collectibles.
- Pause menus.
- Audio settings.
- Restart controls.
- Game Over.
- Completion screens.

Ensure readable contrast, clear feedback, predictable keyboard controls, and sensible focus behaviour.

Prevent UI input from leaking into gameplay. Support appropriate window resizing and handle pointer-lock loss if first-person controls use pointer lock.

## 16. Testing and Reliability

Use Vitest for pure game logic and React Testing Library for meaningful UI interactions.

Test:

- Puzzle generation.
- Three distinct special-digit rooms.
- Stable run configuration.
- Room-code validation.
- Exactly four valid final attempts.
- Invalid submissions not consuming attempts.
- Room unlocking.
- Restart behaviour.
- Level transitions.
- Platformer movement calculations.
- Enemy damage.
- One-life-per-hit behaviour.
- Checkpoint respawning.
- Game Over.
- Level restart.
- UI focus and input handling.
- Asset-loading failures.

Run actual scripts from `package.json`. Add missing test scripts only when justified.

Run the production build and resolve errors. When browser or gameplay testing is available, verify the complete user flow.

Never fabricate test results.

## 17. Documentation and User Instructions

Maintain:

- `PRD.md`: requirements, story, mechanics, and acceptance criteria.
- `DESIGN.md`: visual direction and interface design.
- `SKILLS.md`: project-specific development patterns.
- `USER_GUIDE.md`: installation, controls, Blender workflow, testing, and troubleshooting.
- `README.md`: actual setup instructions and feature status.
- `docs/ARCHITECTURE.md`: module responsibilities and data flow.
- `docs/ASSETS.md`: assets, licensing, paths, and replacements.
- `docs/IMPLEMENTATION_PLAN.md`: stages, dependencies, blockers, and progress.
- `docs/TESTING.md`: commands, coverage, and manual test procedures.

Keep the documentation synchronized with the actual source code.

## 18. Git and Security

- Preserve Git history, remotes, and user changes.
- Never force-push or reset history.
- Never delete assets without checking references.
- Do not commit credentials or API keys.
- Do not commit `node_modules` or generated build directories.
- Check asset licenses before redistribution.
- Request approval for destructive changes and paid services.

## 19. Development Stages

Execute in this order, adjusting only after repository inspection.

### Stage 0: Audit

Identify current functionality, dependencies, assets, broken systems, and migration needs.

### Stage 1: Application foundation

Establish or repair React, JavaScript, Vite, R3F, loading, error handling, and a working 3D scene.

### Stage 2: Asset pipeline

Verify Blender integration, export a test GLB, load it in the game, and document the workflow.

### Stage 3: Opening and entrance

Integrate the cinematic, foggy environment, door, manuscript, movement, and interactions.

### Stage 4: Level 1 building

Implement interconnected rooms, navigation, clues, room codes, and unlocking.

### Stage 5: Final combination

Implement three special digits, four valid attempts, restart behaviour, and room 7 completion.

### Stage 6: Level 2 platformer

Implement movement, platforms, enemies, hazards, checkpoints, three lives, Game Over, and completion.

### Stage 7: Visual and audio polish

Integrate verified assets, shaders, lighting, sound, and performance improvements.

### Stage 8: QA and final build

Test complete gameplay flows, resolve critical issues, run production build, and update documentation.

## 20. Definition of Done

A feature is complete only when it is implemented, integrated, and verified to the extent possible.

For each milestone, report:

- Existing state.
- Changes made.
- Files modified.
- Assets created or imported.
- Tests and build commands run.
- Actual results.
- Known limitations.
- Remaining work.
- Recommended next stage.

**Priority order:** preserve working code, implement complete gameplay, use React Three Fiber and Three.js correctly, integrate verifiable Blender assets, optimize measured bottlenecks, and deliver a stable playable game.
