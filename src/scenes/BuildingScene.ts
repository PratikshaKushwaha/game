// ============================================================
// BuildingScene.ts — Seven-room abandoned building
// ============================================================

import * as THREE             from 'three';
import { createBuildingEnvironment } from '../world/Environment';
import { Door }                      from '../objects/Door';
import { Manuscript }                from '../objects/Manuscript';
import { ClueObject }                from '../objects/ClueObject';
import { buildFurniture, furnitureColliderBox } from '../objects/Furniture';
import type { RoomConfig, RoomId }   from '../game/GameTypes';
import { ROOM_MANUSCRIPTS } from '../puzzles/ClueDefinitions';
import {
  ROOM_SIZE, WALL_THICKNESS,
  getRoomOrigin, getRoomSpawn,
  getRoomFurniture, getClueOffset,
} from '../data/levelOneConfig';
import type { InteractionController } from '../player/InteractionController';
import type { CollisionSystem }       from '../player/CollisionSystem';
import type { PlayerController }      from '../player/PlayerController';
import type { UIManager }             from '../ui/UIManager';
import type { PuzzleSystem }          from '../systems/PuzzleSystem';
import { FinalCombination }           from '../puzzles/FinalCombination';
import { gameState }                  from '../game/GameState';
import { disposeObject }              from '../utils/disposal';

const WALL_MAT = () => new THREE.MeshStandardMaterial({
  color: 0x1a1a20, roughness: 0.95, metalness: 0.0,
});
const FLOOR_MAT = () => new THREE.MeshStandardMaterial({
  color: 0x111115, roughness: 0.9, metalness: 0.0,
});
const CEIL_MAT = () => new THREE.MeshStandardMaterial({
  color: 0x0e0e12, roughness: 1.0, metalness: 0.0,
});

export class BuildingScene {
  private scene:       THREE.Scene;
  private objects:     THREE.Object3D[]  = [];
  private doors:       Map<RoomId, Door> = new Map();
  private clues:       Map<RoomId, ClueObject> = new Map();
  private manuscripts: Map<RoomId, Manuscript> = new Map();
  private colliders:   THREE.Box3[] = [];  // kept for debug export
  private finalComb:   FinalCombination;

  private interaction: InteractionController;
  private collision:   CollisionSystem;
  private player:      PlayerController;
  private ui:          UIManager;
  private puzzle:      PuzzleSystem;
  private rooms:       RoomConfig[];
  private _currentRoom: RoomId = 1;
  private _onComplete: () => void;

  constructor(opts: {
    scene: THREE.Scene;
    rooms: RoomConfig[];
    interaction: InteractionController;
    collision: CollisionSystem;
    player: PlayerController;
    ui: UIManager;
    puzzle: PuzzleSystem;
    onComplete: () => void;
  }) {
    this.scene       = opts.scene;
    this.rooms       = opts.rooms;
    this.interaction = opts.interaction;
    this.collision   = opts.collision;
    this.player      = opts.player;
    this.ui          = opts.ui;
    this.puzzle      = opts.puzzle;
    this._onComplete = opts.onComplete;
    this.finalComb   = new FinalCombination(opts.rooms);

    createBuildingEnvironment(this.scene);
    this._buildAllRooms();
    this._spawnInRoom(1);
    this._setupUICallbacks();
  }

  // ─── Build all room geometry ────────────────────────────
  private _buildAllRooms(): void {
    const allBoxes: THREE.Box3[] = [];

    this.rooms.forEach(room => {
      const origin = getRoomOrigin(room.id);
      this._buildRoomGeometry(room, origin, allBoxes);
      this._placeFurniture(room, origin, allBoxes);
      this._placeClue(room, origin);
      if (room.id < 7) {
        this._placeDoor(room, origin);
      }
      this._placeRoomManuscript(room, origin);
    });

    this.collision.setObstacles(allBoxes);
    // Store colliders for reference (used in future debug/export)
    this.colliders = allBoxes;
  }

  private _buildRoomGeometry(room: RoomConfig, origin: THREE.Vector3, boxes: THREE.Box3[]): void {
    const { w, h, d } = ROOM_SIZE;
    const T = WALL_THICKNESS;
    const cx = origin.x + w / 2;
    const cz = origin.z - d / 2;

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), FLOOR_MAT());
    floor.position.set(cx, -T / 2, cz);
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.objects.push(floor);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), CEIL_MAT());
    ceil.position.set(cx, h + T / 2, cz);
    this.scene.add(ceil);
    this.objects.push(ceil);

    // Room light
    const ptLight = new THREE.PointLight(room.lightColor, room.lightIntensity, 15);
    ptLight.position.set(cx, h * 0.8, cz);
    ptLight.castShadow = true;
    ptLight.shadow.mapSize.set(512, 512);
    this.scene.add(ptLight);
    this.objects.push(ptLight);

    // Walls: north, south, west, east — leaving door gaps on shared walls
    const wallConfigs = [
      // South wall (no door hole for room 1 entry)
      { pos: [cx, h/2, origin.z + T/2],        size: [w, h, T] },
      // North wall (door hole handled below)
      { pos: [cx, h/2, origin.z - d - T/2],    size: [w, h, T] },
      // West wall
      { pos: [origin.x + T/2, h/2, cz],        size: [T, h, d] },
      // East wall
      { pos: [origin.x + w - T/2, h/2, cz],    size: [T, h, d] },
    ] as { pos: [number,number,number]; size: [number,number,number] }[];

    const wMat = WALL_MAT();
    wallConfigs.forEach(wc => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(...wc.size), wMat);
      wall.position.set(...wc.pos);
      wall.castShadow = wall.receiveShadow = true;
      this.scene.add(wall);
      this.objects.push(wall);
      const box = new THREE.Box3().setFromObject(wall);
      boxes.push(box);
    });
  }

  private _placeFurniture(room: RoomConfig, origin: THREE.Vector3, boxes: THREE.Box3[]): void {
    const configs = getRoomFurniture(room.id);
    configs.forEach(cfg => {
      const absPos: [number,number,number] = [
        origin.x + cfg.position[0],
        cfg.position[1],
        origin.z - cfg.position[2],
      ];
      const group = buildFurniture({ ...cfg, position: absPos });
      this.scene.add(group);
      this.objects.push(group);
      boxes.push(furnitureColliderBox(group));
    });
  }

  private _placeClue(room: RoomConfig, origin: THREE.Vector3): void {
    if (room.id === 7) return;
    const offset = getClueOffset(room.id);
    const pos    = new THREE.Vector3(
      origin.x + offset.x,
      offset.y,
      origin.z - offset.z,
    );

    const clue = new ClueObject({
      position:         pos,
      roomId:           room.id,
      code:             room.code,
      highlightedIndex: room.highlightedPosition,
      onInteract:       () => this._openCodeEntry(room.id),
    });
    this.scene.add(clue.mesh);
    this.objects.push(clue.mesh);
    this.clues.set(room.id, clue);
    this.interaction.register(clue);
  }

  private _placeDoor(room: RoomConfig, origin: THREE.Vector3): void {
    if (room.id === 6) {
      // Room 6 door leads to room 7 (corridor)
      const pos = new THREE.Vector3(origin.x + ROOM_SIZE.w / 2, 0, origin.z - ROOM_SIZE.d);
      const door = new Door({ position: pos, locked: true });
      this.doors.set(room.id, door);
      this.scene.add(door.root);
      this.objects.push(door.root);

      this.interaction.register({
        mesh: door.root,
        info: { type: 'door', label: 'Door to Exit [locked]', roomId: room.id },
        highlight: (on) => { (door['_mat'] as THREE.MeshStandardMaterial).emissiveIntensity = on ? 0.6 : 0.4; },
        onInteract: () => this._tryOpenDoor(room.id),
      });
    } else if (room.id <= 5 && room.id % 2 === 1) {
      // Odd rooms 1,3,5 have a connecting door to the next room row
      // Door on east wall connecting to adjacent room
      const pos = new THREE.Vector3(origin.x + ROOM_SIZE.w, 0, origin.z - ROOM_SIZE.d / 2);
      const door = new Door({ position: pos, rotation: Math.PI / 2, locked: !gameState.isRoomSolved(room.id) });
      this.doors.set(room.id, door);
      this.scene.add(door.root);
      this.objects.push(door.root);

      const targetId = (room.id + 1) as RoomId;
      this.interaction.register({
        mesh: door.root,
        info: { type: 'door', label: `Door to ${ROOM_MANUSCRIPTS[targetId].title}`, roomId: room.id },
        highlight: (on) => { (door['_mat'] as THREE.MeshStandardMaterial).emissiveIntensity = on ? 0.4 : (door.isLocked ? 0.4 : 0); },
        onInteract: () => this._tryOpenDoor(room.id),
      });
    }
  }

  private _placeRoomManuscript(room: RoomConfig, origin: THREE.Vector3): void {
    const pos = new THREE.Vector3(
      origin.x + 1.5,
      1.3,
      origin.z - 1.0,
    );
    const ms = new Manuscript(
      pos,
      `Read: ${ROOM_MANUSCRIPTS[room.id].title}`,
      () => {
        const content = ROOM_MANUSCRIPTS[room.id];
        this.ui.showManuscript(content.title, content.body);
      },
    );
    this.scene.add(ms.mesh);
    this.objects.push(ms.mesh);
    this.manuscripts.set(room.id, ms);
    this.interaction.register(ms);
  }

  // ─── Code entry flow ────────────────────────────────────
  private _openCodeEntry(roomId: RoomId): void {
    if (gameState.isRoomSolved(roomId)) {
      this.ui.showCodeFeedback('Already solved!', true);
      return;
    }
    if (roomId === 7) {
      this._openFinalEntry();
      return;
    }
    gameState.activeCodeRoomId = roomId;
    gameState.isCodeEntryOpen  = true;
    const room = this.puzzle.getRoomConfig(roomId);
    this.ui.showCodeEntry(room?.name ?? `Room ${roomId}`, roomId);
    this.player.exitLock();
  }

  private _openFinalEntry(): void {
    if (gameState.finalAttempts <= 0) {
      // Restart
      this._onComplete(); // signal restart
      return;
    }
    gameState.isFinalEntryOpen = true;
    this.ui.showFinalEntry();
    this.player.exitLock();
  }

  private _setupUICallbacks(): void {
    this.ui.onCodeSubmit = (guess, roomId) => {
      const ok = this.puzzle.attemptRoomCode(roomId, guess);
      if (ok) {
        this.ui.showCodeFeedback('✓ Correct! Door unlocked.', true);
        this.ui.hideCodeEntry();
        gameState.isCodeEntryOpen  = false;
        gameState.activeCodeRoomId = null;
        this._unlockDoor(roomId);
        this.player.requestLock();
      } else {
        this.ui.showCodeFeedback('✗ Wrong code. Try again.', false);
      }
    };

    this.ui.onCodeCancel = () => {
      gameState.isCodeEntryOpen  = false;
      gameState.activeCodeRoomId = null;
      this.player.requestLock();
    };

    this.ui.onFinalSubmit = (guess) => {
      const result = this.puzzle.attemptFinalCode(guess, this.finalComb.getAnswer());
      if (result === 'correct') {
        this.ui.showFinalFeedback('✓ The way out is open!', true);
        setTimeout(() => {
          this.ui.hideFinalEntry();
          gameState.isFinalEntryOpen = false;
          this._onComplete();
        }, 1500);
      } else if (result === 'lockout') {
        this.ui.showFinalFeedback('All attempts used. Restarting…', false);
        setTimeout(() => {
          this.ui.hideFinalEntry();
          gameState.isFinalEntryOpen = false;
          this._onComplete(); // restart
        }, 2000);
      } else {
        this.ui.updateFinalAttempts(gameState.finalAttempts);
        this.ui.showFinalFeedback(`✗ Wrong. ${gameState.finalAttempts} attempt${gameState.finalAttempts === 1 ? '' : 's'} left.`, false);
      }
    };

    this.ui.onFinalCancel = () => {
      gameState.isFinalEntryOpen = false;
      this.player.requestLock();
    };
  }

  private _unlockDoor(roomId: RoomId): void {
    const door = this.doors.get(roomId);
    if (door) {
      door.unlock();
      door.open();
    }
  }

  private _tryOpenDoor(roomId: RoomId): void {
    if (gameState.isRoomSolved(roomId) || roomId === 6) {
      if (roomId === 6 && !gameState.isRoomSolved(6)) {
        this.ui.showCodeFeedback('Solve this room first!', false);
        return;
      }
      const door = this.doors.get(roomId);
      if (door && !door.isOpen) door.open();
    } else {
      this.ui.showCodeFeedback('Locked — find the code first.', false);
    }
  }

  // ─── Player spawn ───────────────────────────────────────
  private _spawnInRoom(id: RoomId): void {
    this._currentRoom = id;
    const spawn = getRoomSpawn(id);
    this.player.setPosition(spawn.x, 0, spawn.z);
    const room = this.rooms.find(r => r.id === id);
    if (room) this.ui.setRoomLabel(room.name);
  }

  // ─── Update ─────────────────────────────────────────────
  /** Expose collider list for debug/tooling purposes. */
  getColliders(): THREE.Box3[] { return this.colliders; }

  update(dt: number): void {
    // Update door animations
    this.doors.forEach(d => d.update(dt));
    // Update manuscript floats
    this.manuscripts.forEach(m => m.update(dt));
    // Update clue highlights via interaction system — handled externally
    this._checkRoomTransition();
  }

  private _checkRoomTransition(): void {
    // Detect which room the player is in based on position
    const px = this.player.position.x;
    const pz = this.player.position.z;

    for (const room of this.rooms) {
      const origin = getRoomOrigin(room.id);
      const inX = px >= origin.x && px <= origin.x + ROOM_SIZE.w;
      const inZ = pz <= origin.z && pz >= origin.z - ROOM_SIZE.d;
      if (inX && inZ && room.id !== this._currentRoom) {
        this._currentRoom = room.id;
        this.ui.setRoomLabel(room.name);
        if (room.id === 7) {
          this.ui.setAttempts(gameState.finalAttempts);
        }
        break;
      }
    }
  }

  dispose(): void {
    this.interaction.clearAll();
    this.objects.forEach(o => {
      this.scene.remove(o);
      disposeObject(o);
    });
    this.doors.forEach(d => d.dispose());
    this.clues.forEach(c => c.dispose());
    this.manuscripts.forEach(m => m.dispose());
    this.objects     = [];
    this.doors.clear();
    this.clues.clear();
    this.manuscripts.clear();
  }
}
