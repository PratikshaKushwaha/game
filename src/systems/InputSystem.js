// ============================================================
// InputSystem.ts — Keyboard, Mouse, and Abilities Input Tracking
// ============================================================
const DEFAULT_BINDINGS = {
    moveForward: ['KeyW', 'ArrowUp'],
    moveBackward: ['KeyS', 'ArrowDown'],
    moveLeft: ['KeyA', 'ArrowLeft'],
    moveRight: ['KeyD', 'ArrowRight'],
    sprint: ['ShiftLeft', 'ShiftRight'],
    interact: ['KeyE'],
    glitchVision: ['KeyQ'],
    gravityFlip: ['KeyF'],
    timeFreeze: ['KeyT'],
    dimensionSwitch: ['KeyR'],
    pause: ['Escape'],
};
export class InputSystem {
    keys = new Set();
    bindings = DEFAULT_BINDINGS;
    // One-shot triggers
    _interactPressed = false;
    _gravityFlipPressed = false;
    _timeFreezePressed = false;
    _dimensionSwitchPressed = false;
    _pausePressed = false;
    _boundKeyDown;
    _boundKeyUp;
    constructor() {
        this._boundKeyDown = this._onKeyDown.bind(this);
        this._boundKeyUp = this._onKeyUp.bind(this);
        window.addEventListener('keydown', this._boundKeyDown);
        window.addEventListener('keyup', this._boundKeyUp);
    }
    _onKeyDown(e) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT')
            return;
        this.keys.add(e.code);
        if (this.bindings.interact.includes(e.code)) {
            this._interactPressed = true;
            e.preventDefault();
        }
        if (this.bindings.gravityFlip.includes(e.code)) {
            this._gravityFlipPressed = true;
            e.preventDefault();
        }
        if (this.bindings.timeFreeze.includes(e.code)) {
            this._timeFreezePressed = true;
            e.preventDefault();
        }
        if (this.bindings.dimensionSwitch.includes(e.code)) {
            this._dimensionSwitchPressed = true;
            e.preventDefault();
        }
        if (this.bindings.pause.includes(e.code)) {
            this._pausePressed = true;
            e.preventDefault();
        }
    }
    _onKeyUp(e) {
        this.keys.delete(e.code);
    }
    isDown(codes) {
        return codes.some(c => this.keys.has(c));
    }
    get moveForward() { return this.isDown(this.bindings.moveForward); }
    get moveBackward() { return this.isDown(this.bindings.moveBackward); }
    get moveLeft() { return this.isDown(this.bindings.moveLeft); }
    get moveRight() { return this.isDown(this.bindings.moveRight); }
    get isSprinting() { return this.isDown(this.bindings.sprint); }
    get isHoldingGlitchVision() { return this.isDown(this.bindings.glitchVision); }
    consumeInteract() {
        if (this._interactPressed) {
            this._interactPressed = false;
            return true;
        }
        return false;
    }
    consumeGravityFlip() {
        if (this._gravityFlipPressed) {
            this._gravityFlipPressed = false;
            return true;
        }
        return false;
    }
    consumeTimeFreeze() {
        if (this._timeFreezePressed) {
            this._timeFreezePressed = false;
            return true;
        }
        return false;
    }
    consumeDimensionSwitch() {
        if (this._dimensionSwitchPressed) {
            this._dimensionSwitchPressed = false;
            return true;
        }
        return false;
    }
    consumePause() {
        if (this._pausePressed) {
            this._pausePressed = false;
            return true;
        }
        return false;
    }
    flush() {
        this.keys.clear();
        this._interactPressed = false;
        this._gravityFlipPressed = false;
        this._timeFreezePressed = false;
        this._dimensionSwitchPressed = false;
        this._pausePressed = false;
    }
    dispose() {
        window.removeEventListener('keydown', this._boundKeyDown);
        window.removeEventListener('keyup', this._boundKeyUp);
        this.keys.clear();
    }
}
//# sourceMappingURL=InputSystem.js.map