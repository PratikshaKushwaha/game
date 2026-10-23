// ============================================================
// HubScene.ts — Foggy Void with WorldGen Pack 3D Assets
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
    this._setupWorldGenObjects(opts.assets);
    this._setupDoor(opts.assets);
    this._setupAncientScript();
  }

  private _setupAtmosphere(assets?: AssetManager): void {
    // Eerie void covered in thick fog
    this.scene.fog = new THREE.FogExp2(0x0a0c14, 0.065);
    this.scene.background = new THREE.Color(0x0a0c14);

    // Ambient light
    const ambient = new THREE.AmbientLight(0x222a40, 1.4);
    this.scene.add(ambient);
    this.objects.push(ambient);

    // Cold overhead key light
    const keyLight = new THREE.DirectionalLight(0x7588b5, 1.1);
    keyLight.position.set(4, 18, 6);
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

    // ── 3D Environment Scan Mesh from WorldGen pack ──
    if (assets) {
      const worldCollider = assets.cloneModel('world-collider');
      if (worldCollider) {
        worldCollider.position.set(0, -0.2, 0);
        worldCollider.traverse(c => {
          if (c instanceof THREE.Mesh) {
            c.geometry.computeVertexNormals();
            c.material = new THREE.MeshStandardMaterial({
              color: 0x161c2c,
              roughness: 0.88,
              metalness: 0.15,
            });
            c.receiveShadow = true;
          }
        });
        this.scene.add(worldCollider);
        this.objects.push(worldCollider);
      }
    }
  }

  private _setupWorldGenObjects(assets?: AssetManager): void {
    if (!assets) return;

    // ── Object 0001: 3D Structure / Pedestal for Ancient Script ──
    const prop1 = assets.cloneModel('prop-structure');
    if (prop1) {
      const diff1 = assets.getTexture('prop-structure-diffuse');
      prop1.traverse(c => {
        if (c instanceof THREE.Mesh) {
          if (diff1) {
            c.material = new THREE.MeshStandardMaterial({
              map: diff1,
              roughness: 0.65,
              metalness: 0.2,
            });
          }
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });
      // Exact transform from transform_matrix.json
      prop1.position.set(0.814, 0.106, 0.275);
      prop1.scale.set(0.57, 0.57, 0.57);
      this.scene.add(prop1);
      this.objects.push(prop1);
    }
  }

  private _setupDoor(assets?: AssetManager): void {
    // ── Object 0000: 3D Door Model from WorldGen pack ──
    const doorModel = assets?.cloneModel('prop-door');
    if (doorModel) {
      const diff0 = assets?.getTexture('prop-door-diffuse');
      doorModel.traverse(c => {
        if (c instanceof THREE.Mesh) {
          if (diff0) {
            c.material = new THREE.MeshStandardMaterial({
              map: diff0,
              roughness: 0.6,
              metalness: 0.2,
            });
          }
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });
    }

    const isUnlocked = gameState.hubScriptRead;

    // Position from transform_matrix.json
    this.door = new Door({
      position: new THREE.Vector3(-0.814, 0, -0.275),
      color: 0x223355,
      locked: !isUnlocked,
      model: doorModel,
    });
    this.scene.add(this.door.root);
    this.objects.push(this.door.root);

    // Glowing teleport aura behind door
    const portalLight = new THREE.PointLight(isUnlocked ? 0x00ffcc : 0xff2200, 1.8, 8);
    portalLight.position.set(-0.814, 1.5, -0.35);
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
    // Floating directly above the structure pedestal at [0.814, 0.106, 0.275]
    this.manuscript = new Manuscript(
      new THREE.Vector3(0.814, 1.35, 0.275),
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

    this.ui.showManuscript(ENTRANCE_MANUSCRIPT.title, ENTRANCE_MANUSCRIPT.body);

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
