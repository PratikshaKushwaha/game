// ============================================================
// Level3Scene.ts — Level 3: Time Freeze (Temporal Mechanics)
// ============================================================

import * as THREE from 'three';
import { Door }                       from '../objects/Door';
import type { InteractionController } from '../player/InteractionController';
import type { CollisionSystem }       from '../player/CollisionSystem';
import type { PlayerController }      from '../player/PlayerController';
import type { UIManager }             from '../ui/UIManager';
import type { InputSystem }           from '../systems/InputSystem';
import type { AudioSystem }           from '../systems/AudioSystem';
import { gameState }                  from '../game/GameState';
import { disposeObject }              from '../utils/disposal';

export class Level3Scene {
  private scene:       THREE.Scene;
  private interaction: InteractionController;
  private collision:   CollisionSystem;
  private player:      PlayerController;
  private ui:          UIManager;
  private input:       InputSystem;
  private audio:       AudioSystem;
  private objects:     THREE.Object3D[] = [];
  private exitDoor!:   Door;
  private movingPlatforms: Array<{ mesh: THREE.Mesh; startX: number; amplitude: number; speed: number; phase: number }> = [];
  private time:        number = 0;
  private onComplete:  () => void;

  constructor(opts: {
    scene:       THREE.Scene;
    interaction: InteractionController;
    collision:   CollisionSystem;
    player:      PlayerController;
    ui:          UIManager;
    input:       InputSystem;
    audio:       AudioSystem;
    onComplete:  () => void;
  }) {
    this.scene       = opts.scene;
    this.interaction = opts.interaction;
    this.collision   = opts.collision;
    this.player      = opts.player;
    this.ui          = opts.ui;
    this.input       = opts.input;
    this.audio       = opts.audio;
    this.onComplete  = opts.onComplete;

    this._buildChamber();
    this._buildMovingHazards();
    this._buildExit();

    this.player.setPosition(0, 0, 12);
    this.ui.setRoomLabel('LEVEL 3: TIME FREEZE — Press [T] to Freeze Time (5s)');
  }

  private _buildChamber(): void {
    this.scene.fog = new THREE.Fog(0x0e111a, 15, 55);
    this.scene.background = new THREE.Color(0x0e111a);

    const ambient = new THREE.AmbientLight(0x203050, 1.4);
    this.scene.add(ambient);
    this.objects.push(ambient);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight.position.set(0, 18, 5);
    this.scene.add(dirLight);
    this.objects.push(dirLight);

    // Starting platform
    const startMat = new THREE.MeshStandardMaterial({ color: 0x1a2235, roughness: 0.85 });
    const startPlat = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 8), startMat);
    startPlat.position.set(0, -0.3, 10);
    this.scene.add(startPlat);
    this.objects.push(startPlat);

    // Goal platform
    const goalPlat = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 8), startMat);
    goalPlat.position.set(0, -0.3, -12);
    this.scene.add(goalPlat);
    this.objects.push(goalPlat);

    // Side safety barriers
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x121724, roughness: 0.95 });
    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 36), wallMat);
    wallLeft.position.set(-6, 2.7, -1);
    this.scene.add(wallLeft);
    this.objects.push(wallLeft);

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 36), wallMat);
    wallRight.position.set(6, 2.7, -1);
    this.scene.add(wallRight);
    this.objects.push(wallRight);

    this.collision.setObstacles([
      new THREE.Box3().setFromObject(startPlat),
      new THREE.Box3().setFromObject(goalPlat),
      new THREE.Box3().setFromObject(wallLeft),
      new THREE.Box3().setFromObject(wallRight),
    ]);
  }

  private _buildMovingHazards(): void {
    // Fast moving energy platforms crossing the void gap (Z = 5 to Z = -7)
    const hazardMat = new THREE.MeshStandardMaterial({
      color: 0x00d9ff,
      emissive: 0x0088cc,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });

    const configs = [
      { z: 4,  startX: 0, amp: 3.5, speed: 3.2, phase: 0 },
      { z: 0,  startX: 0, amp: 3.8, speed: 4.0, phase: Math.PI / 2 },
      { z: -4, startX: 0, amp: 3.2, speed: 3.6, phase: Math.PI },
      { z: -8, startX: 0, amp: 3.5, speed: 4.2, phase: 1.5 * Math.PI },
    ];

    configs.forEach(cfg => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 2.2), hazardMat);
      mesh.position.set(cfg.startX, 0, cfg.z);
      this.scene.add(mesh);
      this.objects.push(mesh);
      this.movingPlatforms.push({
        mesh,
        startX: cfg.startX,
        amplitude: cfg.amp,
        speed: cfg.speed,
        phase: cfg.phase,
      });
    });
  }

  private _buildExit(): void {
    this.exitDoor = new Door({
      position: new THREE.Vector3(0, 0, -15),
      color: 0x007799,
      locked: false,
    });
    this.scene.add(this.exitDoor.root);
    this.objects.push(this.exitDoor.root);

    this.interaction.register({
      mesh: this.exitDoor.root,
      info: { type: 'door', label: 'Step Into Level 3 Temporal Exit' },
      highlight: (on) => this.exitDoor.setHighlight(on),
      onInteract: () => {
        this.audio.playOneShot('unlock');
        this.exitDoor.open(() => this.onComplete());
      },
    });
  }

  update(dt: number): void {
    // Handle Time Freeze [T] input
    if (this.input.consumeTimeFreeze()) {
      if (gameState.timeFreezeCooldown <= 0 && !gameState.timeFrozen) {
        gameState.timeFrozen = true;
        gameState.timeFreezeTimer = 5.0; // 5 seconds freeze
        this.audio.playOneShot('glitch', 1.0);
        this.ui.showCodeFeedback('⚡ TIME FROZEN! Platforms Locked (5s) — Cross Now!', true);
      } else if (gameState.timeFreezeCooldown > 0) {
        this.audio.playOneShot('fail', 0.5);
        this.ui.showCodeFeedback(`Time Freeze Recharging... (${Math.ceil(gameState.timeFreezeCooldown)}s)`, false);
      }
    }

    // Update Time Freeze timer & cooldown
    if (gameState.timeFrozen) {
      gameState.timeFreezeTimer -= dt;
      if (gameState.timeFreezeTimer <= 0) {
        gameState.timeFrozen = false;
        gameState.timeFreezeCooldown = 4.0; // 4s cooldown
        this.audio.playOneShot('fail', 0.6);
        this.ui.showCodeFeedback('Time flow resumed!', false);
      }
    } else if (gameState.timeFreezeCooldown > 0) {
      gameState.timeFreezeCooldown = Math.max(0, gameState.timeFreezeCooldown - dt);
    }

    // Only move platforms when time is NOT frozen
    if (!gameState.timeFrozen) {
      this.time += dt;
      this.movingPlatforms.forEach(p => {
        p.mesh.position.x = p.startX + Math.sin(this.time * p.speed + p.phase) * p.amplitude;
      });
    }

    this.exitDoor.update(dt);
  }

  dispose(): void {
    gameState.timeFrozen = false;
    this.interaction.clearAll();
    this.objects.forEach(o => {
      this.scene.remove(o);
      disposeObject(o);
    });
    this.objects = [];
    this.movingPlatforms = [];
    this.exitDoor.dispose();
  }
}
