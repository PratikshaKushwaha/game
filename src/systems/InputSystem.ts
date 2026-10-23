// ============================================================
// InputSystem.ts — Keyboard and mouse state tracking
// ============================================================

export type KeyBinding = {
  moveForward: string[];
  moveBackward: string[];
  moveLeft: string[];
  moveRight: string[];
  interact: string[];
  pause: string[];
};

const DEFAULT_BINDINGS: KeyBinding = {
  moveForward:  ['KeyW', 'ArrowUp'],
  moveBackward: ['KeyS', 'ArrowDown'],
  moveLeft:     ['KeyA', 'ArrowLeft'],
  moveRight:    ['KeyD', 'ArrowRight'],
  interact:     ['KeyE'],
  pause:        ['Escape'],
};

export class InputSystem {
  private keys: Set<string> = new Set();
  private bindings: KeyBinding = DEFAULT_BINDINGS;

  // One-shot events — consumed on read
  private _interactPressed = false;
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
    // Do not capture events when a text input or button is focused
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;

    this.keys.add(e.code);

    if (this.bindings.interact.includes(e.code)) {
      this._interactPressed = true;
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

  /** Consume interact press — returns true only once per press. */
  consumeInteract(): boolean {
    if (this._interactPressed) {
      this._interactPressed = false;
      return true;
    }
    return false;
  }

  /** Consume pause press — returns true only once per press. */
  consumePause(): boolean {
    if (this._pausePressed) {
      this._pausePressed = false;
      return true;
    }
    return false;
  }

  /** Call during overlay/dialog open to discard buffered inputs. */
  flush(): void {
    this.keys.clear();
    this._interactPressed = false;
    this._pausePressed = false;
  }

  dispose(): void {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup', this._boundKeyUp);
    this.keys.clear();
  }
}
