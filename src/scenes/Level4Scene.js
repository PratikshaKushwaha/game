// ============================================================
// Level4Scene.ts — Level 4: Dimension Switch & Freeing Developer
// ============================================================
import * as THREE from 'three';
import { gameState } from '../game/GameState';
import { disposeObject } from '../utils/disposal';
export class Level4Scene {
    scene;
    interaction;
    collision;
    player;
    ui;
    input;
    audio;
    objects = [];
    cleanObjects = [];
    glitchedObjects = [];
    developerPod;
    isDeveloperFreed = false;
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
        this._buildDimensionBridges();
        this._buildDeveloperTerminal();
        this.player.setPosition(0, 0, 12);
        this.ui.setRoomLabel('LEVEL 4: DIMENSION SWITCH — Press [R] to Shift Dimensions');
        this._updateDimensionVisibility();
    }
    _buildEnvironment() {
        this.scene.fog = new THREE.Fog(0x120824, 15, 60);
        this.scene.background = new THREE.Color(0x120824);
        const ambient = new THREE.AmbientLight(0x351f50, 1.4);
        this.scene.add(ambient);
        this.objects.push(ambient);
        const dirLight = new THREE.DirectionalLight(0xb388ff, 1.2);
        dirLight.position.set(0, 20, 0);
        this.scene.add(dirLight);
        this.objects.push(dirLight);
        // Starting platform
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f1730, roughness: 0.85 });
        const startPlat = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 8), floorMat);
        startPlat.position.set(0, -0.3, 10);
        this.scene.add(startPlat);
        this.objects.push(startPlat);
        // Final Core platform
        const corePlat = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 10), floorMat);
        corePlat.position.set(0, -0.3, -14);
        this.scene.add(corePlat);
        this.objects.push(corePlat);
        this.collision.setObstacles([
            new THREE.Box3().setFromObject(startPlat),
            new THREE.Box3().setFromObject(corePlat),
        ]);
    }
    _buildDimensionBridges() {
        // ── Dimension A (Clean World) Bridges ──
        const cleanMat = new THREE.MeshStandardMaterial({
            color: 0x00e5ff,
            emissive: 0x0066aa,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9,
        });
        const cleanPositions = [
            [-2, 0, 5],
            [-2, 0, 2],
            [-2, 0, -1],
            [1, 0, -7],
            [1, 0, -10],
        ];
        cleanPositions.forEach(([x, y, z]) => {
            const b = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 2.5), cleanMat);
            b.position.set(x, y, z);
            this.scene.add(b);
            this.cleanObjects.push(b);
            this.objects.push(b);
        });
        // ── Dimension B (Glitched World) Bridges ──
        const glitchMat = new THREE.MeshStandardMaterial({
            color: 0xff0055,
            emissive: 0x990022,
            emissiveIntensity: 0.6,
            roughness: 0.4,
            wireframe: false,
        });
        const glitchPositions = [
            [2, 0, 5],
            [2, 0, 2],
            [2, 0, -1],
            [0, 0, -4],
            [-2, 0, -7],
            [-2, 0, -10],
        ];
        glitchPositions.forEach(([x, y, z]) => {
            const b = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 2.5), glitchMat);
            b.position.set(x, y, z);
            this.scene.add(b);
            this.glitchedObjects.push(b);
            this.objects.push(b);
        });
    }
    _buildDeveloperTerminal() {
        this.developerPod = new THREE.Group();
        this.developerPod.position.set(0, 0, -14);
        // Terminal Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x241d33, roughness: 0.6 }));
        base.position.y = 0.25;
        this.developerPod.add(base);
        // Glowing Containment Cylinder (Imprisoned Developer)
        const podMat = new THREE.MeshStandardMaterial({
            color: 0x7c4dff,
            emissive: 0x651fff,
            emissiveIntensity: 0.9,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
        });
        const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.6, 16), podMat);
        pod.position.y = 1.6;
        this.developerPod.add(pod);
        // Inner figure hologram
        const figure = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 0.2), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 }));
        figure.position.y = 1.5;
        this.developerPod.add(figure);
        // Beacon Light
        const light = new THREE.PointLight(0xb388ff, 2.0, 10);
        light.position.y = 2.0;
        this.developerPod.add(light);
        this.scene.add(this.developerPod);
        this.objects.push(this.developerPod);
        this.interaction.register({
            mesh: this.developerPod,
            info: { type: 'terminal', label: 'Release The Trapped Developer' },
            highlight: (on) => {
                podMat.emissiveIntensity = on ? 1.6 : 0.9;
            },
            onInteract: () => this._freeDeveloper(),
        });
    }
    _updateDimensionVisibility() {
        const isClean = gameState.activeDimension === 'clean';
        this.cleanObjects.forEach(obj => { obj.visible = isClean; });
        this.glitchedObjects.forEach(obj => { obj.visible = !isClean; });
        // Update ambient fog color based on dimension
        if (this.scene.fog instanceof THREE.Fog) {
            this.scene.fog.color.setHex(isClean ? 0x0a1a2e : 0x2e0a1a);
            this.scene.background = new THREE.Color(isClean ? 0x0a1a2e : 0x2e0a1a);
        }
    }
    _freeDeveloper() {
        if (this.isDeveloperFreed)
            return;
        this.isDeveloperFreed = true;
        this.audio.playOneShot('unlock', 1.0);
        this.audio.playOneShot('glitch', 0.8);
        this.ui.showDialogue([
            { speaker: 'DEVELOPER [FREE AT LAST]', text: 'You did it! The containment protocol has collapsed! You actually saved me!' },
            { speaker: 'DEVELOPER [FREE AT LAST]', text: 'The GlitchVerse is stabilizing... the exit portal back to reality is opening.' },
            { speaker: 'DEVELOPER [FREE AT LAST]', text: 'Thank you, Chosen One. Let us return home together.' }
        ], () => {
            this.onComplete();
        });
    }
    update(dt) {
        // Dimension Switch [R] input
        if (this.input.consumeDimensionSwitch()) {
            gameState.activeDimension = gameState.activeDimension === 'clean' ? 'glitched' : 'clean';
            this.audio.playOneShot('glitch', 0.9);
            this._updateDimensionVisibility();
            this.ui.showCodeFeedback(gameState.activeDimension === 'clean'
                ? 'DIMENSION SHIFT: CLEAN WORLD (Cyan Bridges Active)'
                : 'DIMENSION SHIFT: GLITCHED WORLD (Crimson Bridges Active)', true);
        }
        if (this.developerPod) {
            this.developerPod.rotation.y += dt * 0.5;
        }
    }
    dispose() {
        this.interaction.clearAll();
        this.objects.forEach(o => {
            this.scene.remove(o);
            disposeObject(o);
        });
        this.objects = [];
        this.cleanObjects = [];
        this.glitchedObjects = [];
    }
}
//# sourceMappingURL=Level4Scene.js.map