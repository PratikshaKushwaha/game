// ============================================================
// Game.ts — Main Engine Orchestrator for The Way Out
// ============================================================

import * as THREE from 'three';
import { gameState }            from './GameState';
import { InputSystem }          from '../systems/InputSystem';
import { AudioSystem }          from '../systems/AudioSystem';
import { AssetManager }         from '../systems/AssetManager';
import { PuzzleSystem }         from '../systems/PuzzleSystem';
import { SaveSystem }           from '../systems/SaveSystem';
import { UIManager }            from '../ui/UIManager';
import { CameraController }     from '../player/CameraController';
import { PlayerController }     from '../player/PlayerController';
import { CollisionSystem }      from '../player/CollisionSystem';
import { InteractionController } from '../player/InteractionController';
import { StartMenuScene }       from '../scenes/StartMenuScene';
import { OpeningCinematic }     from '../scenes/OpeningCinematic';
import { HubScene }             from '../scenes/HubScene';
import { BuildingScene }        from '../scenes/BuildingScene';
import { Level2Scene }          from '../scenes/Level2Scene';
import { Level3Scene }          from '../scenes/Level3Scene';
import { Level4Scene }          from '../scenes/Level4Scene';
import { generateRoomPuzzles }  from '../puzzles/RoomPuzzleGenerator';
import { ASSET_MANIFEST, AUDIO_FILES } from '../data/assetManifest';

export class Game {
  // ── Three.js Core ──
  private renderer: THREE.WebGLRenderer;
  private scene:    THREE.Scene;
  private camera:   THREE.PerspectiveCamera;
  private clock:    THREE.Clock;

  // ── Engine Systems ──
  private input:       InputSystem;
  private audio:       AudioSystem;
  private assets:      AssetManager;
  private ui:          UIManager;
  private camCtrl:     CameraController;
  private player:      PlayerController;
  private collision:   CollisionSystem;
  private interaction: InteractionController;
  private puzzle?:     PuzzleSystem;

  // ── Active Scenes ──
  private menuScene?:    StartMenuScene;
  private cinematic?:    OpeningCinematic;
  private hubScene?:     HubScene;
  private buildingScene?:BuildingScene;
  private level2Scene?:  Level2Scene;
  private level3Scene?:  Level3Scene;
  private level4Scene?:  Level4Scene;

  private _animId = 0;
  private _resizeHandler: () => void;

  constructor() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 200);
    this.clock  = new THREE.Clock();

    this.input       = new InputSystem();
    this.audio       = new AudioSystem();
    this.assets      = new AssetManager();
    this.ui          = new UIManager();
    this.camCtrl     = new CameraController(this.camera);
    this.collision   = new CollisionSystem();
    this.player      = new PlayerController(this.input, this.collision, this.camCtrl);
    this.interaction = new InteractionController(this.camera, this.input);

    this.interaction.onHighlightChange = (info) => this.ui.setInteractionHint(info);

    this._bindUICallbacks();

    this._resizeHandler = this._onResize.bind(this);
    window.addEventListener('resize', this._resizeHandler);

    this.assets.onProgress = (ratio, label) => {
      this.ui.setLoadingProgress(ratio, label);
    };
  }

  private _bindUICallbacks(): void {
    // Start Menu
    this.ui.onStartGame = () => {
      this.audio.unlock();
      this.ui.hideStartMenu();
      this._disposeCurrentScene();
      this._startCinematic();
    };

    this.ui.onContinueGame = () => {
      this.audio.unlock();
      this.ui.hideStartMenu();
      this._disposeCurrentScene();
      const targetLvl = gameState.progress.unlockedLevels || 1;
      this._startLevel(targetLvl);
    };

    this.ui.onSelectLevel = (level: number) => {
      this.audio.unlock();
      this.ui.hideStartMenu();
      this._disposeCurrentScene();
      this._startLevel(level);
    };

    // Pause Menu
    this.ui.onPauseResume   = () => this._resume();
    this.ui.onPauseRestart  = () => this._restartCurrentLevel();
    this.ui.onReturnToMenu  = () => {
      this.ui.hidePause();
      this.ui.hideLevelComplete();
      this.ui.hideGameWon();
      this._startStartMenu();
    };

    // Level progression
    this.ui.onNextLevel = () => {
      this.ui.hideLevelComplete();
      const nextLvl = gameState.currentLevel + 1;
      if (nextLvl <= 4) {
        this._startLevel(nextLvl);
      } else {
        this._triggerGameWon();
      }
    };
  }

  // ─── Engine Boot ─────────────────────────────────────────
  async start(): Promise<void> {
    gameState.setPhase('loading');

    this.ui.setLoadingProgress(0.1, 'Loading assets...');
    await this.assets.loadManifest(ASSET_MANIFEST);

    Object.entries(AUDIO_FILES).forEach(([key, url]) => {
      this.audio.loadBuffer(key, url);
    });

    this.ui.setLoadingProgress(1.0, 'Ready');
    await this._sleep(300);
    this.ui.hideLoading();

    // Boot into Start Menu
    this._startStartMenu();
    this._loop();
  }

  // ─── Start Menu ──────────────────────────────────────────
  private _startStartMenu(): void {
    this._disposeCurrentScene();
    gameState.setPhase('start_menu');
    this.player.exitLock();
    this.ui.showStartMenu();

    this.menuScene = new StartMenuScene(this.scene, this.camera);
    this.audio.playAmbience('ambience', 0.2);
  }

  // ─── Opening Cinematic ───────────────────────────────────
  private _startCinematic(): void {
    this._disposeCurrentScene();
    gameState.setPhase('cinematic');
    this.ui.showCinematic();

    this.cinematic = new OpeningCinematic({
      onComplete: () => {
        this.ui.hideCinematic();
        this.cinematic?.dispose();
        this.cinematic = undefined;
        this._startHub();
      },
    });
    this.cinematic.play();
  }

  // ─── Hub Scene (After Intro) ─────────────────────────────
  private _startHub(): void {
    this._disposeCurrentScene();
    gameState.setPhase('hub');
    this.ui.showHUD();
    this.ui.setRoomLabel('THE HUB — Foggy Void');

    this.player.setPosition(-0.78, 0, 5.5);
    this.camCtrl.reset(0, 0);

    this.hubScene = new HubScene({
      scene:       this.scene,
      interaction: this.interaction,
      ui:          this.ui,
      audio:       this.audio,
      assets:      this.assets,
      onEnterLevel1: () => this._startLevel(1),
    });

    this.player.requestLock();
    this.audio.playAmbience('ambience', 0.25);
  }

  // ─── Level Progression Router ────────────────────────────
  private _startLevel(levelNumber: number): void {
    this._disposeCurrentScene();
    gameState.currentLevel = levelNumber;
    gameState.resetLevelStats();
    this.ui.showHUD();

    if (levelNumber === 1) {
      gameState.setPhase('level_1');
      gameState.seed = Date.now();
      const rooms = generateRoomPuzzles(gameState.seed);
      this.puzzle = new PuzzleSystem(rooms, this.audio);

      this.buildingScene = new BuildingScene({
        scene:       this.scene,
        rooms,
        interaction: this.interaction,
        collision:   this.collision,
        player:      this.player,
        ui:          this.ui,
        puzzle:      this.puzzle,
        input:       this.input,
        audio:       this.audio,
        assets:      this.assets,
        onComplete:  () => this._handleLevelCleared(1),
      });
    } else if (levelNumber === 2) {
      gameState.setPhase('level_2');
      this.level2Scene = new Level2Scene({
        scene:       this.scene,
        interaction: this.interaction,
        collision:   this.collision,
        player:      this.player,
        ui:          this.ui,
        input:       this.input,
        audio:       this.audio,
        onComplete:  () => this._handleLevelCleared(2),
      });
    } else if (levelNumber === 3) {
      gameState.setPhase('level_3');
      this.level3Scene = new Level3Scene({
        scene:       this.scene,
        interaction: this.interaction,
        collision:   this.collision,
        player:      this.player,
        ui:          this.ui,
        input:       this.input,
        audio:       this.audio,
        onComplete:  () => this._handleLevelCleared(3),
      });
    } else if (levelNumber === 4) {
      gameState.setPhase('level_4');
      this.level4Scene = new Level4Scene({
        scene:       this.scene,
        interaction: this.interaction,
        collision:   this.collision,
        player:      this.player,
        ui:          this.ui,
        input:       this.input,
        audio:       this.audio,
        onComplete:  () => this._handleLevelCleared(4),
      });
    }

    this.player.requestLock();
    this.audio.playAmbience('ambience', 0.3);
  }

  private _handleLevelCleared(level: number): void {
    const breakdown = gameState.calculateFinalScore();
    SaveSystem.recordLevelCompletion(level, gameState.levelTime, breakdown.total, breakdown.stars);
    gameState.progress = SaveSystem.loadProgress();

    this.player.exitLock();
    this.audio.playOneShot('unlock', 1.0);

    if (level === 4) {
      this._triggerGameWon();
    } else {
      gameState.setPhase('level_complete');
      this.ui.showLevelComplete(gameState.levelTime, breakdown);
    }
  }

  private _triggerGameWon(): void {
    gameState.setPhase('game_won');
    this.player.exitLock();
    this._disposeCurrentScene();
    const finalScore = gameState.score + 1000;
    this.ui.showGameWon(finalScore, gameState.levelTime);
  }

  // ─── Pause & Controls ────────────────────────────────────
  private _pause(): void {
    if (gameState.phase === 'start_menu' || gameState.phase === 'cinematic' || gameState.phase === 'paused') return;
    gameState.setPhase('paused');
    this.player.exitLock();
    this.ui.showPause();
  }

  private _resume(): void {
    this.ui.hidePause();
    if (this.buildingScene) gameState.setPhase('level_1');
    else if (this.level2Scene) gameState.setPhase('level_2');
    else if (this.level3Scene) gameState.setPhase('level_3');
    else if (this.level4Scene) gameState.setPhase('level_4');
    else if (this.hubScene) gameState.setPhase('hub');
    this.player.requestLock();
  }

  private _restartCurrentLevel(): void {
    this.ui.hidePause();
    this._startLevel(gameState.currentLevel);
  }

  // ─── Main Game Loop (RAF) ────────────────────────────────
  private _loop(): void {
    this._animId = requestAnimationFrame(() => this._loop());
    const dt = Math.min(this.clock.getDelta(), 0.1);

    const isUIBlocking =
      gameState.phase === 'start_menu' ||
      gameState.phase === 'cinematic' ||
      gameState.phase === 'paused' ||
      gameState.phase === 'level_complete' ||
      gameState.phase === 'game_won' ||
      gameState.isManuscriptOpen ||
      gameState.isCodeEntryOpen ||
      gameState.isFinalEntryOpen ||
      gameState.isSettingsOpen ||
      gameState.isHowToPlayOpen ||
      gameState.isLevelSelectOpen ||
      gameState.isDialogueActive;

    // Handle Pause Key
    if (this.input.consumePause()) {
      if (gameState.phase === 'paused') {
        this._resume();
      } else if (!isUIBlocking) {
        this._pause();
      }
    }

    // Update level timer during active gameplay
    if (!isUIBlocking && (gameState.phase === 'level_1' || gameState.phase === 'level_2' || gameState.phase === 'level_3' || gameState.phase === 'level_4')) {
      gameState.levelTime += dt;
      this.ui.updateHUD(dt);
    }

    // Update active scene
    if (this.menuScene) this.menuScene.update(dt);
    if (this.hubScene) this.hubScene.update(dt);
    if (this.buildingScene) this.buildingScene.update(dt);
    if (this.level2Scene) this.level2Scene.update(dt);
    if (this.level3Scene) this.level3Scene.update(dt);
    if (this.level4Scene) this.level4Scene.update(dt);

    // Update Player & Camera
    if (!isUIBlocking) {
      this.player.update(dt, false);
      this.camCtrl.update(dt);
      this.interaction.update(false);
    }

    // Native Three.js Render
    this.renderer.render(this.scene, this.camera);
  }

  private _disposeCurrentScene(): void {
    this.menuScene?.dispose();
    this.menuScene = undefined;
    this.hubScene?.dispose();
    this.hubScene = undefined;
    this.buildingScene?.dispose();
    this.buildingScene = undefined;
    this.level2Scene?.dispose();
    this.level2Scene = undefined;
    this.level3Scene?.dispose();
    this.level3Scene = undefined;
    this.level4Scene?.dispose();
    this.level4Scene = undefined;

    this.interaction.clearAll();
    this.collision.clearObstacles();

    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.scene.remove(child);
    }
    this.scene.fog = null;
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
    this._disposeCurrentScene();
    this.input.dispose();
    this.audio.dispose();
    this.assets.dispose();
    this.player.dispose();
    this.camCtrl.dispose();
    this.renderer.dispose();
    window.removeEventListener('resize', this._resizeHandler);
  }
}
