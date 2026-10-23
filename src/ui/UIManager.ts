// ============================================================
// UIManager.ts — DOM overlay state management
// ============================================================

import { gameState }                    from '../game/GameState';
import type { InteractableInfo, RoomId } from '../game/GameTypes';

export class UIManager {
  // ── Element refs ────────────────────────────────────────
  private loadingScreen      = this._el('loading-screen');
  private loadingBar         = this._el('loading-bar');
  private loadingStatus      = this._el('loading-status');
  private cinematicScreen    = this._el('cinematic-screen');
  private hud                = this._el('hud');
  private interactionPrompt  = this._el('interaction-prompt');
  private interactionLabel   = this._el('interaction-label');
  private roomIndicator      = this._el('room-indicator');
  private roomLabel          = this._el('room-label');
  private attemptIndicator   = this._el('attempt-indicator');
  private attemptCount       = this._el('attempt-count');
  private manuscriptOverlay  = this._el('manuscript-overlay');
  private manuscriptTitle    = this._el('manuscript-title');
  private manuscriptBody     = this._el('manuscript-body');
  private codeOverlay        = this._el('code-overlay');
  private codeDisplay        = this._el('code-display');
  private codeFeedback       = this._el('code-feedback');
  private codeTitle          = this._el('code-title');
  private finalOverlay       = this._el('final-overlay');
  private finalDisplay       = this._el('final-display');
  private finalFeedback      = this._el('final-feedback');
  private finalAttemptCount  = this._el('final-attempt-count');
  private pauseMenu          = this._el('pause-menu');
  private levelComplete      = this._el('level-complete');
  private pointerLockPrompt  = this._el('pointer-lock-prompt');

  // ── Callbacks ────────────────────────────────────────────
  onManuscriptClose?: () => void;
  onCodeSubmit?:      (guess: string, roomId: RoomId) => void;
  onCodeCancel?:      () => void;
  onFinalSubmit?:     (guess: string) => void;
  onFinalCancel?:     () => void;
  onPauseResume?:     () => void;
  onPauseRestart?:    () => void;
  onCompleteRestart?: () => void;
  onLockRequest?:     () => void;

  private _codeBuffer = '';
  private _finalBuffer = '';

  constructor() {
    this._bindButtons();
  }

  // ─── Element helper ─────────────────────────────────────
  private _el(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`UIManager: element #${id} not found`);
    return el;
  }

  // ─── Visibility helpers ─────────────────────────────────
  private _show(el: HTMLElement): void {
    el.classList.remove('hidden');
    el.classList.add('active');
  }
  private _hide(el: HTMLElement): void {
    el.classList.remove('active');
    el.classList.add('hidden');
  }

  // ─── Loading screen ─────────────────────────────────────
  setLoadingProgress(ratio: number, label: string): void {
    (this.loadingBar as HTMLElement).style.width = `${Math.round(ratio * 100)}%`;
    this.loadingStatus.textContent = label;
  }

  hideLoading(): void {
    this._hide(this.loadingScreen);
  }

  // ─── Cinematic ──────────────────────────────────────────
  showCinematic(): void { this._show(this.cinematicScreen); }
  hideCinematic(): void { this._hide(this.cinematicScreen); }

  // ─── HUD ────────────────────────────────────────────────
  showHUD(): void { this._show(this.hud); }
  hideHUD(): void { this._hide(this.hud); }

  setInteractionHint(info: InteractableInfo | null): void {
    if (info) {
      this._show(this.interactionPrompt);
      this.interactionLabel.textContent = info.label;
    } else {
      this._hide(this.interactionPrompt);
    }
  }

  setRoomLabel(name: string): void {
    this._show(this.roomIndicator);
    this.roomLabel.textContent = name;
  }

  setAttempts(n: number): void {
    this._show(this.attemptIndicator);
    this.attemptCount.textContent = String(n);
  }

  hideAttempts(): void { this._hide(this.attemptIndicator); }

  // ─── Manuscript ─────────────────────────────────────────
  showManuscript(title: string, bodyLines: string[]): void {
    this.manuscriptTitle.textContent = title;
    this.manuscriptBody.innerHTML = bodyLines
      .map(l => l === '' ? '<br>' : `<p>${l}</p>`)
      .join('');
    this._show(this.manuscriptOverlay);
    document.getElementById('manuscript-close')?.focus();
  }

  hideManuscript(): void {
    this._hide(this.manuscriptOverlay);
    this.onManuscriptClose?.();
  }

  // ─── Code entry ─────────────────────────────────────────
  showCodeEntry(roomName: string, _roomId: RoomId): void {
    this._codeBuffer = '';
    this.codeTitle.textContent = `${roomName} — Enter Code`;
    this._updateCodeDisplay();
    this._hide(this.codeFeedback);
    this._show(this.codeOverlay);
  }

  hideCodeEntry(): void {
    this._hide(this.codeOverlay);
    this.onCodeCancel?.();
  }

  private _updateCodeDisplay(): void {
    const digits = this.codeDisplay.querySelectorAll('.code-digit');
    digits.forEach((d, i) => {
      d.textContent = this._codeBuffer[i] ?? '_';
    });
  }

  private _updateFinalDisplay(): void {
    const digits = this.finalDisplay.querySelectorAll('.code-digit');
    digits.forEach((d, i) => {
      d.textContent = this._finalBuffer[i] ?? '_';
    });
  }

  showCodeFeedback(msg: string, ok: boolean): void {
    this.codeFeedback.textContent = msg;
    this.codeFeedback.className = `code-feedback ${ok ? 'success' : 'error'}`;
    this._show(this.codeFeedback);
  }

  showFinalFeedback(msg: string, ok: boolean): void {
    this.finalFeedback.textContent = msg;
    this.finalFeedback.className = `code-feedback ${ok ? 'success' : 'error'}`;
    this._show(this.finalFeedback);
  }

  // ─── Final combination ──────────────────────────────────
  showFinalEntry(): void {
    this._finalBuffer = '';
    this._updateFinalDisplay();
    this._hide(this.finalFeedback);
    this.finalAttemptCount.textContent = String(gameState.finalAttempts);
    this._show(this.finalOverlay);
  }

  hideFinalEntry(): void {
    this._hide(this.finalOverlay);
    this.onFinalCancel?.();
  }

  updateFinalAttempts(n: number): void {
    this.finalAttemptCount.textContent = String(n);
  }

  // ─── Pause menu ─────────────────────────────────────────
  showPause(): void  { this._show(this.pauseMenu); }
  hidePause(): void  { this._hide(this.pauseMenu); }

  // ─── Level complete ─────────────────────────────────────
  showLevelComplete(): void { this._show(this.levelComplete); }
  hideLevelComplete(): void { this._hide(this.levelComplete); }

  // ─── Pointer lock prompt ────────────────────────────────
  showPointerLockPrompt(): void { this._show(this.pointerLockPrompt); }
  hidePointerLockPrompt(): void { this._hide(this.pointerLockPrompt); }

  // ─── Button bindings ────────────────────────────────────
  private _bindButtons(): void {
    // Manuscript close
    document.getElementById('manuscript-close')?.addEventListener('click', () => {
      this.hideManuscript();
    });

    // Code numpad
    document.getElementById('code-numpad')?.addEventListener('click', e => {
      const btn = (e.target as HTMLElement).closest('.numpad-btn') as HTMLElement | null;
      if (!btn) return;
      const digit  = btn.dataset['digit'];
      const action = btn.dataset['action'];
      if (digit !== undefined && this._codeBuffer.length < 3) {
        this._codeBuffer += digit;
        this._updateCodeDisplay();
      } else if (action === 'clear') {
        this._codeBuffer = this._codeBuffer.slice(0, -1);
        this._updateCodeDisplay();
      } else if (action === 'submit' && this._codeBuffer.length === 3) {
        const roomId = gameState.activeCodeRoomId;
        if (roomId !== null) this.onCodeSubmit?.(this._codeBuffer, roomId);
      }
    });

    document.getElementById('code-cancel')?.addEventListener('click', () => this.hideCodeEntry());

    // Final numpad
    document.getElementById('final-numpad')?.addEventListener('click', e => {
      const btn = (e.target as HTMLElement).closest('.numpad-btn') as HTMLElement | null;
      if (!btn) return;
      const digit  = btn.dataset['digit'];
      const action = btn.dataset['action'];
      if (digit !== undefined && this._finalBuffer.length < 3) {
        this._finalBuffer += digit;
        this._updateFinalDisplay();
      } else if (action === 'clear') {
        this._finalBuffer = this._finalBuffer.slice(0, -1);
        this._updateFinalDisplay();
      } else if (action === 'submit' && this._finalBuffer.length === 3) {
        this.onFinalSubmit?.(this._finalBuffer);
      }
    });

    document.getElementById('final-cancel')?.addEventListener('click', () => this.hideFinalEntry());

    // Pause
    document.getElementById('pause-resume')?.addEventListener('click',  () => this.onPauseResume?.());
    document.getElementById('pause-restart')?.addEventListener('click', () => this.onPauseRestart?.());

    // Level complete
    document.getElementById('complete-restart')?.addEventListener('click', () => this.onCompleteRestart?.());

    // Pointer lock prompt
    document.getElementById('lock-btn')?.addEventListener('click', () => this.onLockRequest?.());
  }
}
