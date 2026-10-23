// ============================================================
// InteractionController.ts — Raycasting, highlight, and E-key
// ============================================================
import * as THREE from 'three';
const INTERACTION_RANGE = 3.5; // world units
export class InteractionController {
    raycaster = new THREE.Raycaster();
    center = new THREE.Vector2(0, 0);
    camera;
    input;
    interactables = [];
    current = null;
    onHighlightChange;
    constructor(camera, input) {
        this.camera = camera;
        this.input = input;
    }
    register(item) {
        this.interactables.push(item);
    }
    unregister(item) {
        this.interactables = this.interactables.filter(i => i !== item);
        if (this.current === item) {
            this.current = null;
            this.onHighlightChange?.(null);
        }
    }
    clearAll() {
        this.current?.highlight(false);
        this.current = null;
        this.interactables = [];
        this.onHighlightChange?.(null);
    }
    update(blocked) {
        if (blocked) {
            if (this.current) {
                this.current.highlight(false);
                this.current = null;
                this.onHighlightChange?.(null);
            }
            return;
        }
        this.raycaster.setFromCamera(this.center, this.camera);
        const targets = this.interactables.map(i => i.mesh);
        const hits = this.raycaster.intersectObjects(targets, true);
        let nearest = null;
        for (const hit of hits) {
            if (hit.distance > INTERACTION_RANGE)
                break;
            // Walk up to find registered object
            let obj = hit.object;
            while (obj) {
                const found = this.interactables.find(i => i.mesh === obj);
                if (found) {
                    nearest = found;
                    break;
                }
                obj = obj.parent;
            }
            if (nearest)
                break;
        }
        if (nearest !== this.current) {
            this.current?.highlight(false);
            this.current = nearest;
            this.current?.highlight(true);
            this.onHighlightChange?.(this.current?.info ?? null);
        }
        if (this.current && this.input.consumeInteract()) {
            this.current.onInteract();
        }
    }
}
//# sourceMappingURL=InteractionController.js.map