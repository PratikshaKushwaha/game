// ============================================================
// InputSystem.ts — Keyboard, Mouse, and Abilities Input Tracking
// ============================================================

export type KeyBinding = {
  moveForward: string[];
  moveBackward: string[];
  moveLeft: string[];
  moveRight: string[];
  sprint: string[];
  interact: string[];
  glitchVision: string[];
  gravityFlip: string[];
  timeFreeze: string[];
  dimensionSwitch: string[];
  pause: string[];
};

const DEFAULT_BINDINGS: KeyBinding = {
  moveForward:     ['KeyW', 'ArrowUp'],
  moveBackward:    ['KeyS', 'ArrowDown'],
  moveLeft:        ['KeyA', 'ArrowLeft'],
  moveRight:       ['KeyD', 'ArrowRight'],
  sprint:          ['ShiftLeft', 'ShiftRight'],
  interact:        ['KeyE'],
  glitchVision:    ['KeyQ'],
  gravityFlip:     ['KeyF'],
  timeFreeze:      ['KeyT'],
  dimensionSwitch: ['KeyR'],
  pause:           ['Escape'],
};

export class InputSystem {
  private keys: Set<string> = new Set();
  private bindings: KeyBinding = DEFAULT_BINDINGS;

  // One-shot triggers
  private _interactPressed = false;
  private _gravityFlipPressed = false;
  private _timeFreezePressed = false;
  private _dimensionSwitchPressed = false;
  private _pausePressed = false;

  private _boundKeyDown: (e: KeyboardEvent) => void;
  private _boundKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);
  }

  private _onKeyDown(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT') return;

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

  private _onKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.code);
  }

  isDown(codes: string[]): boolean {
    return codes.some(c => this.keys.has(c));
  }

  get moveForward(): boolean { return this.isDown(this.bindings.moveForward); }
  get moveBackward(): boolean { return this.isDown(this.bindings.moveBackward); }
  get moveLeft(): boolean { return this.isDown(this.bindings.moveLeft); }
  get moveRight(): boolean { return this.isDown(this.bindings.moveRight); }
  get isSprinting(): boolean { return this.isDown(this.bindings.sprint); }
  get isHoldingGlitchVision(): boolean { return this.isDown(this.bindings.glitchVision); }

  consumeInteract(): boolean {
    if (this._interactPressed) {
      this._interactPressed = false;
      return true;
    }
    return false;
  }

  consumeGravityFlip(): boolean {
    if (this._gravityFlipPressed) {
      this._gravityFlipPressed = false;
      return true;
    }
    return false;
  }

  consumeTimeFreeze(): boolean {
    if (this._timeFreezePressed) {
      this._timeFreezePressed = false;
      return true;
    }
    return false;
  }

  consumeDimensionSwitch(): boolean {
    if (this._dimensionSwitchPressed) {
      this._dimensionSwitchPressed = false;
      return true;
    }
    return false;
  }

  consumePause(): boolean {
    if (this._pausePressed) {
      this._pausePressed = false;
      return true;
    }
    return false;
  }

  flush(): void {
    this.keys.clear();
    this._interactPressed = false;
    this._gravityFlipPressed = false;
    this._timeFreezePressed = false;
    this._dimensionSwitchPressed = false;
    this._pausePressed = false;
  }

  dispose(): void {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup', this._boundKeyUp);
    this.keys.clear();
  }
}
