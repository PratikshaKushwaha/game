// ============================================================
// BuildingScene.ts — Level 1: The Abandoned Building (8 Rooms)
// ============================================================
import * as THREE from 'three';
import { createBuildingEnvironment } from '../world/Environment';
import { Door } from '../objects/Door';
import { Manuscript } from '../objects/Manuscript';
import { ClueObject } from '../objects/ClueObject';
import { buildFurniture, furnitureColliderBox } from '../objects/Furniture';
import { ROOM_MANUSCRIPTS } from '../puzzles/ClueDefinitions';
import { ROOM_SIZE, WALL_THICKNESS, getRoomOrigin, getRoomSpawn, getRoomFurniture, getClueOffset, } from '../data/levelOneConfig';
import { FinalCombination } from '../puzzles/FinalCombination';
import { gameState } from '../game/GameState';
import { disposeObject } from '../utils/disposal';
const WALL_MAT = () => new THREE.MeshStandardMaterial({
    color: 0x1b1c24, roughness: 0.95, metalness: 0.05,
});
const FLOOR_MAT = () => new THREE.MeshStandardMaterial({
    color: 0x111218, roughness: 0.9, metalness: 0.05,
});
const CEIL_MAT = () => new THREE.MeshStandardMaterial({
    color: 0x0c0d12, roughness: 1.0, metalness: 0.0,
});
export class BuildingScene {
    scene;
    objects = [];
    doors = new Map();
    clues = new Map();
    manuscripts = new Map();
    colliders = [];
    finalComb;
    interaction;
    collision;
    player;
    ui;
    puzzle;
    input;
    audio;
    assets;
    rooms;
    _currentRoom = 1;
    _onComplete;
    constructor(opts) {
        this.scene = opts.scene;
        this.rooms = opts.rooms;
        this.interaction = opts.interaction;
        this.collision = opts.collision;
        this.player = opts.player;
        this.ui = opts.ui;
        this.puzzle = opts.puzzle;
        this.input = opts.input;
        this.audio = opts.audio;
        this.assets = opts.assets;
        this._onComplete = opts.onComplete;
        this.finalComb = new FinalCombination(opts.rooms);
        createBuildingEnvironment(this.scene);
        this._buildAllRooms();
        this._spawnInRoom(1);
        this._setupUICallbacks();
    }
    getColliders() { return this.colliders; }
    _buildAllRooms() {
        const allBoxes = [];
        this.rooms.forEach(room => {
            const origin = getRoomOrigin(room.id);
            this._buildRoomGeometry(room, origin, allBoxes);
            this._placeFurniture(room, origin, allBoxes);
            this._placeClue(room, origin);
            if (room.id < 8) {
                this._placeDoor(room, origin);
            }
            this._placeRoomManuscript(room, origin);
        });
        this.collision.setObstacles(allBoxes);
        this.colliders = allBoxes;
    }
    _buildRoomGeometry(room, origin, boxes) {
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
        // Atmospheric overhead light
        const ptLight = new THREE.PointLight(room.lightColor, room.lightIntensity, 16);
        ptLight.position.set(cx, h * 0.85, cz);
        ptLight.castShadow = true;
        ptLight.shadow.mapSize.set(512, 512);
        this.scene.add(ptLight);
        this.objects.push(ptLight);
        // Walls
        const wallConfigs = [
            { pos: [cx, h / 2, origin.z + T / 2], size: [w, h, T] },
            { pos: [cx, h / 2, origin.z - d - T / 2], size: [w, h, T] },
            { pos: [origin.x + T / 2, h / 2, cz], size: [T, h, d] },
            { pos: [origin.x + w - T / 2, h / 2, cz], size: [T, h, d] },
        ];
        const wMat = WALL_MAT();
        wallConfigs.forEach(wc => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(...wc.size), wMat);
            wall.position.set(...wc.pos);
            wall.castShadow = wall.receiveShadow = true;
            this.scene.add(wall);
            this.objects.push(wall);
            boxes.push(new THREE.Box3().setFromObject(wall));
        });
    }
    _placeFurniture(room, origin, boxes) {
        const configs = getRoomFurniture(room.id);
        configs.forEach(cfg => {
            const absPos = [
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
    _placeClue(room, origin) {
        if (room.id === 8)
            return;
        const offset = getClueOffset(room.id);
        const pos = new THREE.Vector3(origin.x + offset.x, offset.y, origin.z - offset.z);
        const clue = new ClueObject({
            position: pos,
            roomId: room.id,
            code: room.code,
            highlightedIndex: room.highlightedPosition,
            onInteract: () => this._openCodeEntry(room.id),
        });
        this.scene.add(clue.mesh);
        this.objects.push(clue.mesh);
        this.clues.set(room.id, clue);
        this.interaction.register(clue);
    }
    _placeDoor(room, origin) {
        const isOdd = room.id % 2 === 1;
        const doorModel = this.assets?.cloneModel('prop-door');
        if (isOdd) {
            // Connects horizontally to adjacent room
            const pos = new THREE.Vector3(origin.x + ROOM_SIZE.w, 0, origin.z - ROOM_SIZE.d / 2);
            const door = new Door({
                position: pos,
                rotation: Math.PI / 2,
                locked: !gameState.isRoomSolved(room.id),
                model: doorModel,
            });
            this.doors.set(room.id, door);
            this.scene.add(door.root);
            this.objects.push(door.root);
            const targetId = (room.id + 1);
            this.interaction.register({
                mesh: door.root,
                info: { type: 'door', label: `Door to Room ${targetId}`, roomId: room.id },
                highlight: (on) => door.setHighlight(on),
                onInteract: () => this._tryOpenDoor(room.id),
            });
        }
        else {
            // Even room connects down to next tier
            const pos = new THREE.Vector3(origin.x + ROOM_SIZE.w / 2, 0, origin.z - ROOM_SIZE.d);
            const door = new Door({
                position: pos,
                locked: !gameState.isRoomSolved(room.id),
                model: doorModel,
            });
            this.doors.set(room.id, door);
            this.scene.add(door.root);
            this.objects.push(door.root);
            const targetId = (room.id + 1);
            this.interaction.register({
                mesh: door.root,
                info: { type: 'door', label: `Door to Room ${targetId}`, roomId: room.id },
                highlight: (on) => door.setHighlight(on),
                onInteract: () => this._tryOpenDoor(room.id),
            });
        }
    }
    _placeRoomManuscript(room, origin) {
        const pos = new THREE.Vector3(origin.x + 1.8, 1.3, origin.z - 1.2);
        const manuscriptTitle = ROOM_MANUSCRIPTS[room.id]?.title ?? `Room ${room.id} Log`;
        const ms = new Manuscript(pos, `Read: ${manuscriptTitle}`, () => {
            const content = ROOM_MANUSCRIPTS[room.id];
            if (content) {
                this.audio.playOneShot('interact');
                this.ui.showManuscript(content.title, content.body);
            }
        });
        this.scene.add(ms.mesh);
        this.objects.push(ms.mesh);
        this.manuscripts.set(room.id, ms);
        this.interaction.register(ms);
    }
    _openCodeEntry(roomId) {
        if (gameState.isRoomSolved(roomId)) {
            this.ui.showCodeFeedback('✓ Room code already solved!', true);
            return;
        }
        if (roomId === 8) {
            this._openFinalEntry();
            return;
        }
        gameState.activeCodeRoomId = roomId;
        gameState.isCodeEntryOpen = true;
        const room = this.puzzle.getRoomConfig(roomId);
        this.ui.showCodeEntry(room?.name ?? `Room ${roomId}`, roomId);
        this.player.exitLock();
    }
    _openFinalEntry() {
        if (gameState.lives <= 0) {
            this._restartToRoom1();
            return;
        }
        gameState.isFinalEntryOpen = true;
        this.ui.showFinalEntry();
        this.player.exitLock();
    }
    _setupUICallbacks() {
        this.ui.onCodeSubmit = (guess, roomId) => {
            const ok = this.puzzle.attemptRoomCode(roomId, guess);
            if (ok) {
                this.ui.showCodeFeedback('✓ Correct! Door unlocked.', true);
                this.ui.hideCodeEntry();
                gameState.isCodeEntryOpen = false;
                gameState.activeCodeRoomId = null;
                this._unlockDoor(roomId);
                this.player.requestLock();
            }
            else {
                this.ui.showCodeFeedback('✗ Wrong code. Check room clues with [Q] Glitch Vision!', false);
            }
        };
        this.ui.onCodeCancel = () => {
            gameState.isCodeEntryOpen = false;
            gameState.activeCodeRoomId = null;
            this.player.requestLock();
        };
        this.ui.onFinalSubmit = (guess) => {
            const isCorrect = this.finalComb.check(guess);
            if (isCorrect) {
                this.audio.playOneShot('unlock', 1.0);
                this.ui.showFinalFeedback('✓ CORRECT! Glitch Core Deactivated!', true);
                setTimeout(() => {
                    this.ui.hideFinalEntry();
                    gameState.isFinalEntryOpen = false;
                    this._onComplete();
                }, 1200);
            }
            else {
                const hasLives = gameState.loseLife();
                this.audio.playOneShot('fail', 1.0);
                if (!hasLives) {
                    this.ui.showFinalFeedback('✗ ALL LIVES LOST! Returning to Room 1...', false);
                    setTimeout(() => {
                        this.ui.hideFinalEntry();
                        gameState.isFinalEntryOpen = false;
                        this._restartToRoom1();
                    }, 1800);
                }
                else {
                    this.ui.updateFinalAttempts(gameState.lives);
                    this.ui.showFinalFeedback(`✗ Wrong combination! ${gameState.lives} lives remaining.`, false);
                }
            }
        };
        this.ui.onFinalCancel = () => {
            gameState.isFinalEntryOpen = false;
            this.player.requestLock();
        };
    }
    _restartToRoom1() {
        gameState.restartCount += 1;
        gameState.applyPenalty(250);
        gameState.lives = gameState.maxLives;
        this._spawnInRoom(1);
        this.player.requestLock();
        this.ui.showCodeFeedback('Level restarted! Codes have glitched back to room 1.', false);
    }
    _unlockDoor(roomId) {
        const door = this.doors.get(roomId);
        if (door) {
            door.unlock();
            door.open();
        }
    }
    _tryOpenDoor(roomId) {
        if (gameState.isRoomSolved(roomId)) {
            const door = this.doors.get(roomId);
            if (door && !door.isOpen)
                door.open();
        }
        else {
            this._openCodeEntry(roomId);
        }
    }
    _spawnInRoom(id) {
        this._currentRoom = id;
        gameState.currentRoom = id;
        const spawn = getRoomSpawn(id);
        this.player.setPosition(spawn.x, 0, spawn.z);
        const room = this.rooms.find(r => r.id === id);
        if (room)
            this.ui.setRoomLabel(room.name);
    }
    update(dt) {
        // ── Glitch Vision Mechanic (Hold Q) ──
        const isHolding = this.input.isHoldingGlitchVision;
        if (isHolding && gameState.glitchVisionEnergy > 0.05) {
            gameState.glitchVisionActive = true;
            gameState.glitchVisionEnergy = Math.max(0, gameState.glitchVisionEnergy - dt * 0.35);
        }
        else {
            gameState.glitchVisionActive = false;
            gameState.glitchVisionEnergy = Math.min(1.0, gameState.glitchVisionEnergy + dt * 0.25);
        }
        // Apply Glitch Vision glow to all clue objects
        this.clues.forEach(c => c.setGlitchVision(gameState.glitchVisionActive));
        // Update doors and manuscripts
        this.doors.forEach(d => d.update(dt));
        this.manuscripts.forEach(m => m.update(dt));
        this._checkRoomTransition();
    }
    _checkRoomTransition() {
        const px = this.player.position.x;
        const pz = this.player.position.z;
        for (const room of this.rooms) {
            const origin = getRoomOrigin(room.id);
            const inX = px >= origin.x && px <= origin.x + ROOM_SIZE.w;
            const inZ = pz <= origin.z && pz >= origin.z - ROOM_SIZE.d;
            if (inX && inZ && room.id !== this._currentRoom) {
                this._currentRoom = room.id;
                gameState.currentRoom = room.id;
                this.ui.setRoomLabel(room.name);
                break;
            }
        }
    }
    dispose() {
        this.interaction.clearAll();
        this.objects.forEach(o => {
            this.scene.remove(o);
            disposeObject(o);
        });
        this.doors.forEach(d => d.dispose());
        this.clues.forEach(c => c.dispose());
        this.manuscripts.forEach(m => m.dispose());
        this.objects = [];
        this.doors.clear();
        this.clues.clear();
        this.manuscripts.clear();
    }
}
//# sourceMappingURL=BuildingScene.js.map