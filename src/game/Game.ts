// ============================================================
// Game.ts — Top-level orchestrator for The Way Out
// ============================================================

import * as THREE from 'three';
import { gameState }            from './GameState';
import { InputSystem }          from '../systems/InputSystem';
import { AudioSystem }          from '../systems/AudioSystem';
import { AssetManager }         from '../systems/AssetManager';
import { PuzzleSystem }         from '../systems/PuzzleSystem';
import { UIManager }            from '../ui/UIManager';
import { CameraController }     from '../player/CameraController';
import { PlayerController }     from '../player/PlayerController';
import { CollisionSystem }      from '../player/CollisionSystem';
import { InteractionController } from '../player/InteractionController';
import { OpeningCinematic }     from '../scenes/OpeningCinematic';
import { EntranceScene }        from '../scenes/EntranceScene';
import { BuildingScene }        from '../scenes/BuildingScene';
import { generateRoomPuzzles }  from '../puzzles/RoomPuzzleGenerator';
import { ASSET_MANIFEST, AUDIO_FILES } from '../data/assetManifest';

export class Game {
  // ── Renderer / camera ───────────────────────────────────
  private renderer: THREE.WebGLRenderer;
  private scene:    THREE.Scene;
  private camera:   THREE.PerspectiveCamera;
  private clock:    THREE.Clock;

  // ── Systems ─────────────────────────────────────────────
  private input:     InputSystem;
  private audio:     AudioSystem;
  private assets:    AssetManager;
  private ui:        UIManager;
  private camCtrl:   CameraController;
  private player:    PlayerController;
  private collision: CollisionSystem;
  private interaction: InteractionController;
  private puzzle!:   PuzzleSystem;

  // ── Active scenes ────────────────────────────────────────
  private cinematic?:  OpeningCinematic;
  private entrance?:   EntranceScene;
  private building?:   BuildingScene;

  // ── Misc ─────────────────────────────────────────────────
  private _animId = 0;
  private _resizeHandler: () => void;

  constructor() {
    // ── Canvas & renderer ───────────────────────────────
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace   = THREE.SRGBColorSpace;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 200);
    this.clock  = new THREE.Clock();

    // ── Systems ─────────────────────────────────────────
    this.input     = new InputSystem();
    this.audio     = new AudioSystem();
    this.assets    = new AssetManager();
    this.ui        = new UIManager();
    this.camCtrl   = new CameraController(this.camera);
    this.collision = new CollisionSystem();
    this.player    = new PlayerController(this.input, this.collision, this.camCtrl);
    this.interaction = new InteractionController(this.camera, this.input);

    // Interaction → HUD hint
    this.interaction.onHighlightChange = info => this.ui.setInteractionHint(info);

    // ── UI callbacks (pause / restart) ──────────────────
    this.ui.onPauseResume  = () => this._resume();
    this.ui.onPauseRestart = () => this._restartLevel();
    this.ui.onCompleteRestart = () => this._restartLevel();
    this.ui.onLockRequest  = () => {
      this.player.requestLock();
      this.ui.hidePointerLockPrompt();
    };

    // ── Resize ──────────────────────────────────────────
    this._resizeHandler = this._onResize.bind(this);
    window.addEventListener('resize', this._resizeHandler);

    // ── Pointer lock change → show prompt ───────────────
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement && gameState.phase === 'entrance' || gameState.phase === 'building') {
        if (!gameState.isManuscriptOpen && !gameState.isCodeEntryOpen && !gameState.isFinalEntryOpen) {
          // Show unlock prompt briefly
        }
      }
    });

    // ── Asset progress → loading bar ────────────────────
    this.assets.onProgress = (ratio, label) => {
      this.ui.setLoadingProgress(ratio, label);
    };
  }

  // ─── Boot sequence ──────────────────────────────────────
  async start(): Promise<void> {
    gameState.setPhase('loading');

    // Generate deterministic puzzles
    gameState.seed = Date.now();
    const rooms    = generateRoomPuzzles(gameState.seed);

    // Load assets (tolerates missing files)
    this.ui.setLoadingProgress(0, 'Loading assets…');
    await this.assets.loadManifest(ASSET_MANIFEST);

    // Load audio (non-blocking)
    Object.entries(AUDIO_FILES).forEach(([key, url]) => {
      this.audio.loadBuffer(key, url);
    });

    this.ui.setLoadingProgress(1, 'Ready');
    await this._sleep(400);
    this.ui.hideLoading();

    // Try cinematic first
    this._playCinematic(rooms);

    // Start render loop
    this._loop();
  }

  // ─── Cinematic ──────────────────────────────────────────
  private _playCinematic(rooms: ReturnType<typeof generateRoomPuzzles>): void {
    gameState.setPhase('cinematic');
    this.ui.showCinematic();
    this.audio.unlock();

    this.cinematic = new OpeningCinematic({
      onComplete: () => {
        this.ui.hideCinematic();
        this.cinematic?.dispose();
        this.cinematic = undefined;
        this._startEntrance(rooms);
      },
    });
    this.cinematic.play();
  }

  // ─── Entrance scene ─────────────────────────────────────
  private _startEntrance(rooms: ReturnType<typeof generateRoomPuzzles>): void {
    gameState.setPhase('entrance');
    this.ui.showHUD();

    // Clear scene
    this._clearScene();

    // Player start
    this.player.setPosition(0, 0, 8);
    this.camCtrl.reset(Math.PI, 0); // face door (negative Z)

    this.entrance = new EntranceScene({
      scene:       this.scene,
      interaction: this.interaction,
      ui:          this.ui,
      onEnterBuilding: () => {
        this.entrance?.dispose();
        this.entrance = undefined;
        this._startBuilding(rooms);
      },
    });

    this.player.requestLock();
  }

  // ─── Building scene ─────────────────────────────────────
  private _startBuilding(rooms: ReturnType<typeof generateRoomPuzzles>): void {
    gameState.setPhase('building');

    this._clearScene();
    this.collision.clearObstacles();
    this.interaction.clearAll();

    this.puzzle = new PuzzleSystem(rooms, this.audio);

    this.building = new BuildingScene({
      scene:       this.scene,
      rooms,
      interaction: this.interaction,
      collision:   this.collision,
      player:      this.player,
      ui:          this.ui,
      puzzle:      this.puzzle,
      onComplete:  () => this._handleLevelEnd(),
    });

    this.player.requestLock();
    this.audio.playAmbience('ambience', 0.25);
  }

  private _handleLevelEnd(): void {
    if (gameState.finalSolved) {
      this._showLevelComplete();
    } else {
      // All attempts used — restart
      this._restartLevel();
    }
  }

  private _showLevelComplete(): void {
    gameState.setPhase('level_complete');
    this.audio.stopAmbience();
    this.player.exitLock();
    this.ui.hideHUD();
    this.ui.showLevelComplete();
  }

  // ─── Pause ──────────────────────────────────────────────
  private _pause(): void {
    if (gameState.phase !== 'entrance' && gameState.phase !== 'building') return;
    gameState.setPhase('paused');
    this.player.exitLock();
    this.ui.showPause();
  }

  private _resume(): void {
    gameState.setPhase(this.building ? 'building' : 'entrance');
    this.ui.hidePause();
    this.player.requestLock();
  }

  private _restartLevel(): void {
    this.ui.hidePause();
    this.ui.hideLevelComplete();
    this.building?.dispose();
    this.building = undefined;
    this.audio.stopAmbience();
    gameState.reset();

    const rooms = generateRoomPuzzles(Date.now());
    gameState.seed = Date.now();
    this._startBuilding(rooms);
  }

  // ─── Main loop ──────────────────────────────────────────
  private _loop(): void {
    this._animId = requestAnimationFrame(() => this._loop());
    const dt = Math.min(this.clock.getDelta(), 0.1);

    const blocked =
      gameState.isManuscriptOpen ||
      gameState.isCodeEntryOpen  ||
      gameState.isFinalEntryOpen ||
      gameState.phase === 'paused';

    // Handle pause toggle
    if (this.input.consumePause()) {
      if (gameState.phase === 'paused') {
        this._resume();
      } else if (gameState.isManuscriptOpen) {
        this.ui.hideManuscript();
        gameState.isManuscriptOpen = false;
        this.player.requestLock();
      } else if (gameState.isCodeEntryOpen) {
        this.ui.hideCodeEntry();
        gameState.isCodeEntryOpen  = false;
        gameState.activeCodeRoomId = null;
        this.player.requestLock();
      } else if (gameState.isFinalEntryOpen) {
        this.ui.hideFinalEntry();
        gameState.isFinalEntryOpen = false;
        this.player.requestLock();
      } else {
        this._pause();
      }
    }

    // Update active scene
    this.entrance?.update(dt);
    this.building?.update(dt);

    // Player movement
    this.player.update(dt, blocked);

    // Interaction raycasting
    this.interaction.update(blocked);

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  // ─── Helpers ────────────────────────────────────────────
  private _clearScene(): void {
    // Remove all scene children except core
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.scene.remove(child);
    }
    this.scene.fog        = null;
    this.scene.background = null;
  }

  private _onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  dispose(): void {
    cancelAnimationFrame(this._animId);
    this.input.dispose();
    this.audio.dispose();
    this.assets.dispose();
    this.camCtrl.dispose();
    this.player.dispose();
    this.renderer.dispose();
    window.removeEventListener('resize', this._resizeHandler);
  }
}
