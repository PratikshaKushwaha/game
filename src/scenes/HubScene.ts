// ============================================================
// HubScene.ts — Foggy Void, Ancient Script, and Teleport Door
// ============================================================

import * as THREE from 'three';
import { Door }                       from '../objects/Door';
import { Manuscript }                 from '../objects/Manuscript';
import { ENTRANCE_MANUSCRIPT }        from '../puzzles/ClueDefinitions';
import type { InteractionController } from '../player/InteractionController';
import type { UIManager }             from '../ui/UIManager';
import type { AudioSystem }           from '../systems/AudioSystem';
import type { AssetManager }          from '../systems/AssetManager';
import { gameState }                  from '../game/GameState';
import { disposeObject }              from '../utils/disposal';

export interface HubSceneOptions {
  scene:       THREE.Scene;
  interaction: InteractionController;
  ui:          UIManager;
  audio:       AudioSystem;
  assets?:     AssetManager;
  onEnterLevel1: () => void;
}

export class HubScene {
  private scene:       THREE.Scene;
  private interaction: InteractionController;
  private ui:          UIManager;
  private audio:       AudioSystem;
  private objects:     THREE.Object3D[] = [];
  private door!:       Door;
  private manuscript!: Manuscript;
  private onEnterLevel1: () => void;

  constructor(opts: HubSceneOptions) {
    this.scene       = opts.scene;
    this.interaction = opts.interaction;
    this.ui          = opts.ui;
    this.audio       = opts.audio;
    this.onEnterLevel1 = opts.onEnterLevel1;

    this._setupAtmosphere(opts.assets);
    this._setupDoor(opts.assets);
    this._setupAncientScript();
  }

  private _setupAtmosphere(assets?: AssetManager): void {
    // Quiet, eerie atmosphere with dense fog
    this.scene.fog = new THREE.FogExp2(0x0a0c14, 0.065);
    this.scene.background = new THREE.Color(0x0a0c14);

    // Ambient light
    const ambient = new THREE.AmbientLight(0x1a2035, 1.2);
    this.scene.add(ambient);
    this.objects.push(ambient);

    // Cold overhead key light
    const keyLight = new THREE.DirectionalLight(0x7588b5, 0.9);
    keyLight.position.set(4, 16, 6);
    keyLight.castShadow = true;
    this.scene.add(keyLight);
    this.objects.push(keyLight);

    // Ground platform
    const groundGeo = new THREE.CylinderGeometry(25, 28, 1.5, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x121520,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.75;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.objects.push(ground);

    // Optional WorldGen terrain collider if loaded
    if (assets) {
      const worldCollider = assets.cloneModel('world-collider');
      if (worldCollider) {
        worldCollider.position.set(0, -1.0, -10);
        worldCollider.traverse(c => {
          if (c instanceof THREE.Mesh) {
            c.material = new THREE.MeshStandardMaterial({
              color: 0x0f121d,
              roughness: 0.95,
            });
            c.receiveShadow = true;
          }
        });
        this.scene.add(worldCollider);
        this.objects.push(worldCollider);
      }
    }
  }

  private _setupDoor(assets?: AssetManager): void {
    const doorModel = assets?.cloneModel('prop-door');
    const isUnlocked = gameState.hubScriptRead;

    this.door = new Door({
      position: new THREE.Vector3(0, 0, -6),
      color: 0x223355,
      locked: !isUnlocked,
      model: doorModel,
    });
    this.scene.add(this.door.root);
    this.objects.push(this.door.root);

    // Portal glow behind door
    const portalLight = new THREE.PointLight(isUnlocked ? 0x00ffcc : 0xff2200, 1.5, 8);
    portalLight.position.set(0, 1.5, -6.1);
    this.scene.add(portalLight);
    this.objects.push(portalLight);
    (this as unknown as Record<string, unknown>)['_portalLight'] = portalLight;

    this.interaction.register({
      mesh: this.door.root,
      info: { type: 'door', label: isUnlocked ? 'Step Through Teleport Door' : 'Door Locked (Read Ancient Script First)' },
      highlight: (on) => {
        this.door.setHighlight(on);
      },
      onInteract: () => this._onDoorInteract(),
    });
  }

  private _setupAncientScript(): void {
    // Floating on the right side of the door
    this.manuscript = new Manuscript(
      new THREE.Vector3(2.2, 1.3, -5.2),
      'Read Ancient Script',
      () => this._readScript(),
    );
    this.scene.add(this.manuscript.mesh);
    this.objects.push(this.manuscript.mesh);
    this.interaction.register(this.manuscript);
  }

  private _readScript(): void {
    this.audio.playOneShot('interact');
    this.audio.playOneShot('glitch');

    // Show manuscript glowing parchment
    this.ui.showManuscript(ENTRANCE_MANUSCRIPT.title, ENTRANCE_MANUSCRIPT.body);

    // Trigger visual-novel narration widget with developer's walkie-talkie voice
    this.ui.showDialogue([
      { speaker: 'DEVELOPER [WALKIE-TALKIE]', text: 'Can you hear me?! You... you are the chosen one! I am trapped inside the game code.' },
      { speaker: 'DEVELOPER [WALKIE-TALKIE]', text: 'The world is broken — corrupted by glitches. To free me, you must clear 4 corrupted sectors.' },
      { speaker: 'DEVELOPER [WALKIE-TALKIE]', text: 'Level 1 lies ahead: The Abandoned Building. Hold [Q] for GLITCH VISION to uncover hidden codes.' },
      { speaker: 'DEVELOPER [WALKIE-TALKIE]', text: 'Remember the 3 golden highlighted digits. The teleport door is now unlocked. Step through!' }
    ], () => {
      this._unlockDoor();
    });
  }

  private _unlockDoor(): void {
    if (!gameState.hubScriptRead) {
      gameState.hubScriptRead = true;
      this.door.unlock();
      this.audio.playOneShot('unlock', 1.0);

      const portalLight = (this as unknown as Record<string, unknown>)['_portalLight'] as THREE.PointLight;
      if (portalLight) {
        portalLight.color.setHex(0x00ffcc);
      }
    }
  }

  private _onDoorInteract(): void {
    if (!gameState.hubScriptRead) {
      this.audio.playOneShot('fail');
      this.ui.showCodeFeedback('The door is locked by corrupted code. Read the Ancient Script first!', false);
      return;
    }

    this.audio.playOneShot('unlock');
    this.door.open(() => {
      this.onEnterLevel1();
    });
  }

  update(dt: number): void {
    this.door.update(dt);
    this.manuscript.update(dt);
  }

  dispose(): void {
    this.interaction.clearAll();
    this.objects.forEach(o => {
      this.scene.remove(o);
      disposeObject(o);
    });
    this.objects = [];
    this.manuscript.dispose();
    this.door.dispose();
    this.scene.fog = null;
    this.scene.background = null;
  }
}
