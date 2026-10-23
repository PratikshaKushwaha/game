// ============================================================
// Furniture.ts — Procedural furniture meshes
// ============================================================
import * as THREE from 'three';
const WOOD_MAT = () => new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.85, metalness: 0.05 });
const METAL_MAT = () => new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.4, metalness: 0.8 });
const DARK_MAT = () => new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.9, metalness: 0.05 });
function buildDesk() {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.7), WOOD_MAT());
    top.position.y = 0.75;
    top.castShadow = top.receiveShadow = true;
    g.add(top);
    const legPos = [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]];
    legPos.forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.06), WOOD_MAT());
        leg.position.set(x, 0.375, z);
        leg.castShadow = true;
        g.add(leg);
    });
    return g;
}
function buildChair() {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), DARK_MAT());
    seat.position.y = 0.45;
    seat.castShadow = seat.receiveShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.05), DARK_MAT());
    back.position.set(0, 0.72, -0.22);
    back.castShadow = true;
    g.add(back);
    const legPos = [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]];
    legPos.forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.04), METAL_MAT());
        leg.position.set(x, 0.225, z);
        g.add(leg);
    });
    return g;
}
function buildBookshelf() {
    const g = new THREE.Group();
    const side = (x) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.8, 0.35), WOOD_MAT());
        m.position.set(x, 0.9, 0);
        m.castShadow = true;
        g.add(m);
    };
    side(-0.42);
    side(0.42);
    for (let i = 0; i < 4; i++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.35), WOOD_MAT());
        shelf.position.y = 0.15 + i * 0.45;
        shelf.castShadow = true;
        g.add(shelf);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.04, 0.37), WOOD_MAT());
    top.position.y = 1.82;
    g.add(top);
    return g;
}
function buildCabinet() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.45), METAL_MAT());
    body.position.y = 0.6;
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    // Drawer lines
    for (let i = 0; i < 3; i++) {
        const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.02), DARK_MAT());
        drawer.position.set(0, 0.17 + i * 0.33, 0.22);
        g.add(drawer);
    }
    return g;
}
function buildTable() {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.9), WOOD_MAT());
    top.position.y = 0.8;
    top.castShadow = top.receiveShadow = true;
    g.add(top);
    const legPos = [[-0.68, -0.38], [0.68, -0.38], [-0.68, 0.38], [0.68, 0.38]];
    legPos.forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.8, 0.07), WOOD_MAT());
        leg.position.set(x, 0.4, z);
        g.add(leg);
    });
    return g;
}
function buildLocker() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 0.4), METAL_MAT());
    body.position.y = 0.9;
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.76, 0.02), DARK_MAT());
    door.position.set(0, 0.9, 0.21);
    g.add(door);
    return g;
}
function buildCrate() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), WOOD_MAT());
    body.position.y = 0.25;
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    return g;
}
function buildBarrel() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.65, 12), WOOD_MAT());
    body.position.y = 0.325;
    body.castShadow = true;
    g.add(body);
    return g;
}
function buildLamp() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.08, 8), METAL_MAT());
    base.position.y = 0.04;
    g.add(base);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8), METAL_MAT());
    pole.position.y = 0.79;
    g.add(pole);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.28, 16, 1, true), DARK_MAT());
    shade.position.y = 1.65;
    g.add(shade);
    const bulb = new THREE.PointLight(0xffe680, 1.5, 8);
    bulb.position.y = 1.58;
    g.add(bulb);
    return g;
}
function buildComputer() {
    const g = new THREE.Group();
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.05), DARK_MAT());
    monitor.position.set(0, 0.96, 0);
    monitor.castShadow = true;
    g.add(monitor);
    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x001133, emissive: 0x002266, emissiveIntensity: 1, roughness: 0.1,
    });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.33, 0.01), screenMat);
    screen.position.set(0, 0.96, 0.03);
    g.add(screen);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), METAL_MAT());
    stand.position.set(0, 0.72, 0);
    g.add(stand);
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.15), DARK_MAT());
    kb.position.set(0, 0.78, 0.2);
    g.add(kb);
    return g;
}
const BUILDERS = {
    desk: buildDesk,
    chair: buildChair,
    bookshelf: buildBookshelf,
    cabinet: buildCabinet,
    table: buildTable,
    locker: buildLocker,
    crate: buildCrate,
    barrel: buildBarrel,
    lamp: buildLamp,
    computer: buildComputer,
};
export function buildFurniture(config) {
    const builder = BUILDERS[config.type];
    const group = builder ? builder() : buildCrate();
    group.position.set(...config.position);
    group.rotation.set(...config.rotation);
    group.scale.set(...config.scale);
    group.name = `furniture-${config.type}`;
    group.traverse(c => {
        if (c instanceof THREE.Mesh) {
            c.castShadow = true;
            c.receiveShadow = true;
        }
    });
    return group;
}
/** Compute an AABB for collision from a furniture group. */
export function furnitureColliderBox(group) {
    const box = new THREE.Box3().setFromObject(group);
    return box;
}
//# sourceMappingURL=Furniture.js.map