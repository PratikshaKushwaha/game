// ============================================================
// StartMenuScene.ts — Peaceful 3D House & Greenery with Orbit Camera
// ============================================================
import * as THREE from 'three';
import { disposeObject } from '../utils/disposal';
export class StartMenuScene {
    scene;
    camera;
    objects = [];
    time = 0;
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this._setupEnvironment();
        this._buildHouse();
        this._buildGarden();
    }
    _setupEnvironment() {
        // Warm clear daytime sky
        this.scene.background = new THREE.Color(0xa0d8ef);
        this.scene.fog = new THREE.Fog(0xa0d8ef, 20, 70);
        // Warm daylight sun
        const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
        sunLight.position.set(15, 25, 12);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.set(1024, 1024);
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 60;
        sunLight.shadow.camera.left = -20;
        sunLight.shadow.camera.right = 20;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;
        this.scene.add(sunLight);
        this.objects.push(sunLight);
        // Soft sky blue ambient
        const hemiLight = new THREE.HemisphereLight(0xecf8ff, 0x4d7c35, 0.8);
        this.scene.add(hemiLight);
        this.objects.push(hemiLight);
        // Gentle ground terrain
        const groundGeo = new THREE.PlaneGeometry(120, 120, 24, 24);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x4f8f3c,
            roughness: 0.85,
            metalness: 0.05,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.objects.push(ground);
        // Cobblestone path leading to house
        const pathGeo = new THREE.BoxGeometry(2.4, 0.05, 12);
        const pathMat = new THREE.MeshStandardMaterial({ color: 0xbdbaa8, roughness: 0.9 });
        const path = new THREE.Mesh(pathGeo, pathMat);
        path.position.set(0, 0.02, 6);
        path.receiveShadow = true;
        this.scene.add(path);
        this.objects.push(path);
    }
    _buildHouse() {
        const houseGroup = new THREE.Group();
        houseGroup.position.set(0, 0, 0);
        // Main house body
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xfaebd7, roughness: 0.7 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.0, 5.0), bodyMat);
        body.position.y = 2.0;
        body.castShadow = true;
        body.receiveShadow = true;
        houseGroup.add(body);
        // Sloping gabled roof
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x993322, roughness: 0.6 });
        const roofGeo = new THREE.ConeGeometry(4.8, 2.4, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 5.2;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        houseGroup.add(roof);
        // Front door
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.5 });
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), doorMat);
        door.position.set(0, 1.1, 2.52);
        houseGroup.add(door);
        // Windows with warm light inside
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0xffe899,
            emissive: 0xffd24d,
            emissiveIntensity: 0.6,
            roughness: 0.2,
        });
        const winLeft = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.08), windowMat);
        winLeft.position.set(-2.0, 2.2, 2.52);
        houseGroup.add(winLeft);
        const winRight = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.08), windowMat);
        winRight.position.set(2.0, 2.2, 2.52);
        houseGroup.add(winRight);
        // Chimney
        const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x733020, roughness: 0.9 });
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.0, 0.7), chimneyMat);
        chimney.position.set(1.8, 5.2, -0.8);
        chimney.castShadow = true;
        houseGroup.add(chimney);
        this.scene.add(houseGroup);
        this.objects.push(houseGroup);
    }
    _buildGarden() {
        const gardenGroup = new THREE.Group();
        // Stylized Trees
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 });
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e6b27, roughness: 0.6 });
        const brightLeavesMat = new THREE.MeshStandardMaterial({ color: 0x3d8234, roughness: 0.6 });
        const treePositions = [
            [-6, 0, 3],
            [-8, 0, -2],
            [-5, 0, -6],
            [6, 0, 2],
            [8, 0, -3],
            [5, 0, -7],
            [-3, 0, 9],
            [4, 0, 8],
        ];
        treePositions.forEach(([x, y, z], i) => {
            const tree = new THREE.Group();
            tree.position.set(x, y, z);
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 2.5, 8), trunkMat);
            trunk.position.y = 1.25;
            trunk.castShadow = true;
            tree.add(trunk);
            const foliageMat = i % 2 === 0 ? leavesMat : brightLeavesMat;
            const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), foliageMat);
            foliage1.position.y = 2.8;
            foliage1.castShadow = true;
            tree.add(foliage1);
            const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), foliageMat);
            foliage2.position.set(0.3, 3.8, 0.2);
            foliage2.castShadow = true;
            tree.add(foliage2);
            gardenGroup.add(tree);
        });
        // Flowering bushes
        const bushMat = new THREE.MeshStandardMaterial({ color: 0x38732a, roughness: 0.8 });
        const flowerMat = new THREE.MeshStandardMaterial({ color: 0xfa648c, emissive: 0xfa648c, emissiveIntensity: 0.2 });
        const bushPos = [
            [-2.5, 0, 3], [2.5, 0, 3],
            [-3.5, 0, 2.6], [3.5, 0, 2.6]
        ];
        bushPos.forEach(([bx, by, bz]) => {
            const bush = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), bushMat);
            bush.position.set(bx, by + 0.4, bz);
            bush.castShadow = true;
            gardenGroup.add(bush);
            // Flowers on bush
            for (let f = 0; f < 3; f++) {
                const flower = new THREE.Mesh(new THREE.SphereGeometry(0.1, 4, 4), flowerMat);
                flower.position.set(bx + (Math.random() - 0.5) * 0.6, by + 0.5 + Math.random() * 0.4, bz + 0.45);
                gardenGroup.add(flower);
            }
        });
        this.scene.add(gardenGroup);
        this.objects.push(gardenGroup);
    }
    update(dt) {
        this.time += dt;
        // Soft gentle camera orbit / parallax around house
        const radius = 13.5;
        const angle = Math.sin(this.time * 0.08) * 0.45 - 0.2;
        this.camera.position.x = Math.sin(angle) * radius;
        this.camera.position.z = Math.cos(angle) * radius + 3.0;
        this.camera.position.y = 3.6 + Math.sin(this.time * 0.15) * 0.3;
        this.camera.lookAt(0, 2.0, 0);
    }
    dispose() {
        this.objects.forEach(o => {
            this.scene.remove(o);
            disposeObject(o);
        });
        this.objects = [];
        this.scene.fog = null;
        this.scene.background = null;
    }
}
//# sourceMappingURL=StartMenuScene.js.map