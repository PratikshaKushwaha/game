// ============================================================
// Level2Scene.ts — Level 2: Gravity Flip (Ceiling Walking)
// ============================================================
import * as THREE from 'three';
import { Door } from '../objects/Door';
import { gameState } from '../game/GameState';
import { disposeObject } from '../utils/disposal';
export class Level2Scene {
    scene;
    interaction;
    collision;
    player;
    ui;
    input;
    audio;
    objects = [];
    exitDoor;
    switchActive = false;
    onComplete;
    constructor(opts) {
        this.scene = opts.scene;
        this.interaction = opts.interaction;
        this.collision = opts.collision;
        this.player = opts.player;
        this.ui = opts.ui;
        this.input = opts.input;
        this.audio = opts.audio;
        this.onComplete = opts.onComplete;
        this._buildEnvironment();
        this._buildPlatforms();
        this._buildCeilingSwitch();
        this._buildCeilingExit();
        this.player.setPosition(0, 0, 10);
        this.ui.setRoomLabel('LEVEL 2: GRAVITY FLIP — Press [F] to Invert');
    }
    _buildEnvironment() {
        this.scene.fog = new THREE.Fog(0x101525, 12, 45);
        this.scene.background = new THREE.Color(0x101525);
        const ambient = new THREE.AmbientLight(0x283555, 1.5);
        this.scene.add(ambient);
        this.objects.push(ambient);
        const light = new THREE.DirectionalLight(0x5599ff, 1.2);
        light.position.set(0, 15, 0);
        this.scene.add(light);
        this.objects.push(light);
        // Floor (Normal ground)
        const floorGeo = new THREE.BoxGeometry(16, 0.5, 30);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x181e30, roughness: 0.9 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.set(0, -0.25, 0);
        this.scene.add(floor);
        this.objects.push(floor);
        // Ceiling (Inverted walking surface)
        const ceilGeo = new THREE.BoxGeometry(16, 0.5, 30);
        const ceilMat = new THREE.MeshStandardMaterial({ color: 0x223050, roughness: 0.85 });
        const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
        ceiling.position.set(0, 8.25, 0);
        this.scene.add(ceiling);
        this.objects.push(ceiling);
        // Boundary walls
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x141824, roughness: 1.0 });
        const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8.5, 30), wallMat);
        wallLeft.position.set(-8.25, 4, 0);
        this.scene.add(wallLeft);
        this.objects.push(wallLeft);
        const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8.5, 30), wallMat);
        wallRight.position.set(8.25, 4, 0);
        this.scene.add(wallRight);
        this.objects.push(wallRight);
        // Set AABB colliders
        this.collision.setObstacles([
            new THREE.Box3().setFromObject(floor),
            new THREE.Box3().setFromObject(wallLeft),
            new THREE.Box3().setFromObject(wallRight),
        ]);
    }
    _buildPlatforms() {
        // Floating stepping platforms suspended in mid-air
        const platMat = new THREE.MeshStandardMaterial({ color: 0x334870, roughness: 0.7 });
        const positions = [
            [-3, 3.5, 5],
            [3, 4.5, 1],
            [-2, 5.0, -3],
            [2, 6.0, -7],
        ];
        positions.forEach(([x, y, z]) => {
            const plat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 3), platMat);
            plat.position.set(x, y, z);
            this.scene.add(plat);
            this.objects.push(plat);
            this.collision.addObstacle(new THREE.Box3().setFromObject(plat));
        });
    }
    _buildCeilingSwitch() {
        // Magnetic switch attached to the ceiling
        const switchGroup = new THREE.Group();
        switchGroup.position.set(0, 8.0, -8);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), baseMat);
        switchGroup.add(base);
        const buttonMat = new THREE.MeshStandardMaterial({
            color: 0xff3300,
            emissive: 0xff2200,
            emissiveIntensity: 0.8,
        });
        const button = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16), buttonMat);
        button.position.y = -0.15;
        switchGroup.add(button);
        this['_switchButton'] = button;
        this.scene.add(switchGroup);
        this.objects.push(switchGroup);
        this.interaction.register({
            mesh: switchGroup,
            info: { type: 'switch', label: 'Activate Gravity Anchor Switch' },
            highlight: (on) => {
                buttonMat.emissiveIntensity = on ? 1.5 : 0.8;
            },
            onInteract: () => this._activateSwitch(),
        });
    }
    _buildCeilingExit() {
        // Exit door suspended on the ceiling platform at Z -12
        this.exitDoor = new Door({
            position: new THREE.Vector3(0, 5.8, -13),
            color: 0x116644,
            locked: true,
        });
        this.scene.add(this.exitDoor.root);
        this.objects.push(this.exitDoor.root);
        this.interaction.register({
            mesh: this.exitDoor.root,
            info: { type: 'door', label: 'Level 2 Exit Door (Ceiling Portal)' },
            highlight: (on) => this.exitDoor.setHighlight(on),
            onInteract: () => {
                if (!this.switchActive) {
                    this.audio.playOneShot('fail');
                    this.ui.showCodeFeedback('Locked! Flip gravity [F] and trigger the ceiling switch first.', false);
                }
                else {
                    this.audio.playOneShot('unlock');
                    this.exitDoor.open(() => this.onComplete());
                }
            },
        });
    }
    _activateSwitch() {
        if (this.switchActive)
            return;
        this.switchActive = true;
        this.audio.playOneShot('unlock', 1.0);
        this.exitDoor.unlock();
        this.exitDoor.open();
        const btn = this['_switchButton'];
        if (btn && btn.material instanceof THREE.MeshStandardMaterial) {
            btn.material.color.setHex(0x00ff88);
            btn.material.emissive.setHex(0x00ff88);
        }
        this.ui.showCodeFeedback('✓ Gravity Anchor Engaged! Ceiling Exit Door Unlocked!', true);
    }
    update(dt) {
        // Check Gravity Flip [F] key
        if (this.input.consumeGravityFlip()) {
            gameState.gravityInverted = !gameState.gravityInverted;
            this.audio.playOneShot('glitch', 0.8);
            this.ui.showCodeFeedback(gameState.gravityInverted ? 'GRAVITY REVERSED [CEILING]' : 'GRAVITY RESTORED [FLOOR]', true);
        }
        this.exitDoor.update(dt);
    }
    dispose() {
        gameState.gravityInverted = false;
        this.interaction.clearAll();
        this.objects.forEach(o => {
            this.scene.remove(o);
            disposeObject(o);
        });
        this.objects = [];
        this.exitDoor.dispose();
    }
}
//# sourceMappingURL=Level2Scene.js.map