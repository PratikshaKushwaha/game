// ============================================================
// UIManager.ts — Complete DOM UI Overlay Management
// ============================================================

import { gameState } from '../game/GameState';
import type { DialogueLine, InteractableInfo, RoomId } from '../game/GameTypes';

export class UIManager {
  // ── Screens & Modals ──
  private loadingScreen     = this._el('loading-screen');
  private loadingBar        = this._el('loading-bar');
  private loadingStatus     = this._el('loading-status');
  private startMenu         = this._el('start-menu');
  private cinematicScreen   = this._el('cinematic-screen');
  private hud               = this._el('hud');
  private settingsModal     = this._el('settings-modal');
  private howToPlayModal    = this._el('how-to-play-modal');
  private levelSelectModal  = this._el('level-select-modal');
  private pauseMenu         = this._el('pause-menu');
  private levelComplete     = this._el('level-complete');
  private gameWonScreen     = this._el('game-won');

  // ── HUD Elements ──
  private hudScore          = this._el('hud-score');
  private hudTimer          = this._el('hud-timer');
  private hudLives          = this._el('hud-lives');
  private roomLabel         = this._el('room-label');
  private interactionPrompt = this._el('interaction-prompt');
  private interactionLabel  = this._el('interaction-label');
  private abilityQBar       = this._el('ability-q-bar');
  private abilityFCard      = this._el('ability-f');
  private abilityTCard      = this._el('ability-t');
  private abilityRCard      = this._el('ability-r');

  // ── Dialogue Elements ──
  private vnDialogue        = this._el('vn-dialogue');
  private dialogueSpeaker   = this._el('dialogue-speaker');
  private dialogueText      = this._el('dialogue-text');

  // ── Manuscript Elements ──
  private manuscriptOverlay = this._el('manuscript-overlay');
  private manuscriptTitle   = this._el('manuscript-title');
  private manuscriptBody    = this._el('manuscript-body');

  // ── Code Entry Elements ──
  private codeOverlay       = this._el('code-overlay');
  private codeTitle         = this._el('code-title');
  private codeDisplay       = this._el('code-display');
  private codeFeedback      = this._el('code-feedback');
  private finalOverlay      = this._el('final-overlay');
  private finalDisplay      = this._el('final-display');
  private finalFeedback     = this._el('final-feedback');
  private finalAttemptCount = this._el('final-attempt-count');

  // ── Callbacks ──
  onStartGame?:       () => void;
  onContinueGame?:    () => void;
  onSelectLevel?:     (level: number) => void;
  onManuscriptClose?: () => void;
  onCodeSubmit?:      (guess: string, roomId: RoomId) => void;
  onCodeCancel?:      () => void;
  onFinalSubmit?:     (guess: string) => void;
  onFinalCancel?:     () => void;
  onPauseResume?:     () => void;
  onPauseRestart?:    () => void;
  onNextLevel?:       () => void;
  onReturnToMenu?:    () => void;

  private _codeBuffer = '';
  private _finalBuffer = '';
  private _dialogueQueue: DialogueLine[] = [];
  private _dialogueIndex = 0;
  private _typewriterTimer: number | null = null;
  private _onDialogueDone?: () => void;

  constructor() {
    this._bindAllButtons();
    this._bindSettings();
  }

  private _el(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`UIManager: element #${id} not found`);
    return el;
  }

  private _show(el: HTMLElement): void {
    el.classList.remove('hidden');
    el.classList.add('active');
  }

  private _hide(el: HTMLElement): void {
    el.classList.remove('active');
    el.classList.add('hidden');
  }

  // ─── Loading Screen ─────────────────────────────────────
  setLoadingProgress(ratio: number, label: string): void {
    this.loadingBar.style.width = `${Math.round(ratio * 100)}%`;
    this.loadingStatus.textContent = label;
  }

  hideLoading(): void { this._hide(this.loadingScreen); }

  // ─── Start Menu ─────────────────────────────────────────
  showStartMenu(): void {
    this._hideAllModals();
    this.hideHUD();
    const btnContinue = document.getElementById('btn-continue') as HTMLButtonElement | null;
    if (btnContinue) {
      btnContinue.disabled = gameState.progress.unlockedLevels <= 1 && gameState.progress.totalScore === 0;
    }
    this._show(this.startMenu);
  }

  hideStartMenu(): void { this._hide(this.startMenu); }

  // ─── Cinematic Screen ───────────────────────────────────
  showCinematic(): void { this._show(this.cinematicScreen); }
  hideCinematic(): void { this._hide(this.cinematicScreen); }

  // ─── HUD ────────────────────────────────────────────────
  showHUD(): void { this._show(this.hud); }
  hideHUD(): void { this._hide(this.hud); }

  updateHUD(_dt: number): void {
    this.hudScore.textContent = gameState.score.toLocaleString();

    // Format MM:SS
    const mins = Math.floor(gameState.levelTime / 60);
    const secs = Math.floor(gameState.levelTime % 60);
    this.hudTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Lives
    const hearts = '❤️'.repeat(gameState.lives) + '🖤'.repeat(Math.max(0, gameState.maxLives - gameState.lives));
    this.hudLives.textContent = hearts;

    // Glitch vision recharge bar
    this.abilityQBar.style.width = `${Math.round(gameState.glitchVisionEnergy * 100)}%`;

    // Ability visibility per level
    const lvl = gameState.currentLevel;
    this.abilityFCard.classList.toggle('hidden', lvl < 2);
    this.abilityTCard.classList.toggle('hidden', lvl < 3);
    this.abilityRCard.classList.toggle('hidden', lvl < 4);
  }

  setInteractionHint(info: InteractableInfo | null): void {
    if (info) {
      this._show(this.interactionPrompt);
      this.interactionLabel.textContent = info.label;
    } else {
      this._hide(this.interactionPrompt);
    }
  }

  setRoomLabel(name: string): void {
    this.roomLabel.textContent = name;
  }

  // ─── Visual Novel Narration Dialogue ────────────────────
  showDialogue(lines: DialogueLine[], onDone?: () => void): void {
    this._dialogueQueue = lines;
    this._dialogueIndex = 0;
    this._onDialogueDone = onDone;
    gameState.isDialogueActive = true;
    this._show(this.vnDialogue);
    this._advanceDialogue();
  }

  hideDialogue(): void {
    this._hide(this.vnDialogue);
    gameState.isDialogueActive = false;
    if (this._typewriterTimer) clearInterval(this._typewriterTimer);
    this._onDialogueDone?.();
  }

  private _advanceDialogue(): void {
    if (this._dialogueIndex >= this._dialogueQueue.length) {
      this.hideDialogue();
      return;
    }

    const current = this._dialogueQueue[this._dialogueIndex];
    this.dialogueSpeaker.textContent = current.speaker;
    this._typewriter(current.text);
    this._dialogueIndex++;
  }

  private _typewriter(text: string): void {
    if (this._typewriterTimer) clearInterval(this._typewriterTimer);
    this.dialogueText.textContent = '';
    let idx = 0;
    this._typewriterTimer = window.setInterval(() => {
      if (idx < text.length) {
        this.dialogueText.textContent += text[idx];
        idx++;
      } else {
        if (this._typewriterTimer) clearInterval(this._typewriterTimer);
      }
    }, 20);
  }

  // ─── Manuscript ─────────────────────────────────────────
  showManuscript(title: string, bodyLines: string[]): void {
    gameState.isManuscriptOpen = true;
    this.manuscriptTitle.textContent = title;
    this.manuscriptBody.innerHTML = bodyLines
      .map(l => l === '' ? '<br>' : `<p>${l}</p>`)
      .join('');
    this._show(this.manuscriptOverlay);
    document.getElementById('manuscript-close')?.focus();
  }

  hideManuscript(): void {
    this._hide(this.manuscriptOverlay);
    gameState.isManuscriptOpen = false;
    this.onManuscriptClose?.();
  }

  // ─── Code Entry ─────────────────────────────────────────
  showCodeEntry(roomName: string, _roomId: RoomId): void {
    gameState.isCodeEntryOpen = true;
    this._codeBuffer = '';
    this.codeTitle.textContent = `${roomName} — Enter Code`;
    this._updateCodeDisplay();
    this._hide(this.codeFeedback);
    this._show(this.codeOverlay);
  }

  hideCodeEntry(): void {
    this._hide(this.codeOverlay);
    gameState.isCodeEntryOpen = false;
    this.onCodeCancel?.();
  }

  private _updateCodeDisplay(): void {
    const digits = this.codeDisplay.querySelectorAll('.code-digit');
    digits.forEach((d, i) => {
      d.textContent = this._codeBuffer[i] ?? '_';
    });
  }

  showCodeFeedback(msg: string, ok: boolean): void {
    this.codeFeedback.textContent = msg;
    this.codeFeedback.className = `code-feedback ${ok ? 'success' : 'error'}`;
    this._show(this.codeFeedback);
  }

  // ─── Final Permutation Combination ──────────────────────
  showFinalEntry(): void {
    gameState.isFinalEntryOpen = true;
    this._finalBuffer = '';
    this._updateFinalDisplay();
    this._hide(this.finalFeedback);
    this.finalAttemptCount.textContent = String(gameState.lives);
    this._show(this.finalOverlay);
  }

  hideFinalEntry(): void {
    this._hide(this.finalOverlay);
    gameState.isFinalEntryOpen = false;
    this.onFinalCancel?.();
  }

  private _updateFinalDisplay(): void {
    const digits = this.finalDisplay.querySelectorAll('.code-digit');
    digits.forEach((d, i) => {
      d.textContent = this._finalBuffer[i] ?? '_';
    });
  }

  updateFinalAttempts(lives: number): void {
    this.finalAttemptCount.textContent = String(lives);
  }

  showFinalFeedback(msg: string, ok: boolean): void {
    this.finalFeedback.textContent = msg;
    this.finalFeedback.className = `code-feedback ${ok ? 'success' : 'error'}`;
    this._show(this.finalFeedback);
  }

  // ─── Pause & Modals ─────────────────────────────────────
  showPause(): void { this._show(this.pauseMenu); }
  hidePause(): void { this._hide(this.pauseMenu); }

  showSettings(): void {
    gameState.isSettingsOpen = true;
    this._show(this.settingsModal);
  }
  hideSettings(): void {
    this._hide(this.settingsModal);
    gameState.isSettingsOpen = false;
  }

  showHowToPlay(): void {
    gameState.isHowToPlayOpen = true;
    this._show(this.howToPlayModal);
  }
  hideHowToPlay(): void {
    this._hide(this.howToPlayModal);
    gameState.isHowToPlayOpen = false;
  }

  showLevelSelect(): void {
    gameState.isLevelSelectOpen = true;
    const cards = document.querySelectorAll('.level-card-btn');
    cards.forEach(c => {
      const el = c as HTMLButtonElement;
      const lvl = Number(el.dataset['level']);
      const isUnlocked = lvl <= gameState.progress.unlockedLevels;
      el.disabled = !isUnlocked;
      const starsEl = document.getElementById(`ls-stars-1`);
      if (starsEl) {
        const count = gameState.progress.levelStars[lvl] || 0;
        starsEl.textContent = '★'.repeat(count) + '☆'.repeat(3 - count);
      }
    });
    this._show(this.levelSelectModal);
  }
  hideLevelSelect(): void {
    this._hide(this.levelSelectModal);
    gameState.isLevelSelectOpen = false;
  }

  private _hideAllModals(): void {
    this.hideSettings();
    this.hideHowToPlay();
    this.hideLevelSelect();
    this.hidePause();
    this.hideManuscript();
    this.hideCodeEntry();
    this.hideFinalEntry();
    this.hideDialogue();
  }

  // ─── Level Complete & Game Won ──────────────────────────
  showLevelComplete(timeSec: number, scoreBreakdown: { total: number; timeBonus: number; livesBonus: number; stars: number }): void {
    this.hideHUD();
    const mins = Math.floor(timeSec / 60);
    const secs = Math.floor(timeSec % 60);
    document.getElementById('result-time')!.textContent = `${mins}m ${secs}s`;
    document.getElementById('result-bonus-time')!.textContent = `+${scoreBreakdown.timeBonus}`;
    document.getElementById('result-bonus-lives')!.textContent = `+${scoreBreakdown.livesBonus}`;
    document.getElementById('result-total-score')!.textContent = scoreBreakdown.total.toLocaleString();
    document.getElementById('result-stars')!.textContent = '★'.repeat(scoreBreakdown.stars) + '☆'.repeat(3 - scoreBreakdown.stars);
    this._show(this.levelComplete);
  }

  hideLevelComplete(): void { this._hide(this.levelComplete); }

  showGameWon(finalScore: number, totalTimeSec: number): void {
    this.hideHUD();
    const mins = Math.floor(totalTimeSec / 60);
    const secs = Math.floor(totalTimeSec % 60);
    document.getElementById('won-score')!.textContent = finalScore.toLocaleString();
    document.getElementById('won-time')!.textContent = `${mins}m ${secs}s`;
    this._show(this.gameWonScreen);
  }

  hideGameWon(): void { this._hide(this.gameWonScreen); }

  // ─── Button & Input Handlers ────────────────────────────
  private _bindAllButtons(): void {
    // Start Menu
    document.getElementById('btn-start')?.addEventListener('click', () => this.onStartGame?.());
    document.getElementById('btn-continue')?.addEventListener('click', () => this.onContinueGame?.());
    document.getElementById('btn-level-select')?.addEventListener('click', () => this.showLevelSelect());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.showSettings());
    document.getElementById('btn-how-to-play')?.addEventListener('click', () => this.showHowToPlay());

    // Dialogue skip / advance
    this.vnDialogue.addEventListener('click', () => this._advanceDialogue());
    window.addEventListener('keydown', (e) => {
      if (gameState.isDialogueActive && (e.code === 'Space' || e.code === 'KeyE')) {
        this._advanceDialogue();
      }
    });

    // Modals Close
    document.getElementById('settings-close')?.addEventListener('click', () => this.hideSettings());
    document.getElementById('how-to-play-close')?.addEventListener('click', () => this.hideHowToPlay());
    document.getElementById('level-select-close')?.addEventListener('click', () => this.hideLevelSelect());
    document.getElementById('manuscript-close')?.addEventListener('click', () => this.hideManuscript());

    // Level Select Cards
    document.querySelectorAll('.level-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('.level-card-btn') as HTMLElement;
        const lvl = Number(card?.dataset['level']);
        if (lvl) {
          this.hideLevelSelect();
          this.onSelectLevel?.(lvl);
        }
      });
    });

    // Keypads
    document.getElementById('code-numpad')?.addEventListener('click', e => {
      const btn = (e.target as HTMLElement).closest('.numpad-btn') as HTMLElement | null;
      if (!btn) return;
      const digit = btn.dataset['digit'];
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

    document.getElementById('final-numpad')?.addEventListener('click', e => {
      const btn = (e.target as HTMLElement).closest('.numpad-btn') as HTMLElement | null;
      if (!btn) return;
      const digit = btn.dataset['digit'];
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
    document.getElementById('pause-resume')?.addEventListener('click', () => this.onPauseResume?.());
    document.getElementById('pause-restart')?.addEventListener('click', () => this.onPauseRestart?.());
    document.getElementById('pause-settings')?.addEventListener('click', () => this.showSettings());
    document.getElementById('pause-menu-btn')?.addEventListener('click', () => this.onReturnToMenu?.());

    // Results & Victory
    document.getElementById('btn-next-level')?.addEventListener('click', () => this.onNextLevel?.());
    document.getElementById('btn-level-menu')?.addEventListener('click', () => this.onReturnToMenu?.());
    document.getElementById('btn-won-restart')?.addEventListener('click', () => this.onReturnToMenu?.());
  }

  private _bindSettings(): void {
    const sMaster = document.getElementById('setting-master') as HTMLInputElement | null;
    const sMusic  = document.getElementById('setting-music') as HTMLInputElement | null;
    const sSFX    = document.getElementById('setting-sfx') as HTMLInputElement | null;
    const sSens   = document.getElementById('setting-sens') as HTMLInputElement | null;

    sMaster?.addEventListener('input', () => {
      const val = Number(sMaster.value);
      document.getElementById('val-master')!.textContent = String(val);
      gameState.updateSettings({ masterVolume: val / 100 });
    });
    sMusic?.addEventListener('input', () => {
      const val = Number(sMusic.value);
      document.getElementById('val-music')!.textContent = String(val);
      gameState.updateSettings({ musicVolume: val / 100 });
    });
    sSFX?.addEventListener('input', () => {
      const val = Number(sSFX.value);
      document.getElementById('val-sfx')!.textContent = String(val);
      gameState.updateSettings({ sfxVolume: val / 100 });
    });
    sSens?.addEventListener('input', () => {
      const val = Number(sSens.value) / 10;
      document.getElementById('val-sens')!.textContent = val.toFixed(1);
      gameState.updateSettings({ mouseSensitivity: val });
    });
  }
}
