// ============================================================
// GameState.ts — Central Observable Game State with Scoring
// ============================================================
import { SaveSystem } from '../systems/SaveSystem';
export class GameState {
    // ─── Phase ──────────────────────────────────────────────
    phase = 'start_menu';
    currentLevel = 1;
    // ─── Level 1 State ──────────────────────────────────────
    currentRoom = 1;
    seed = Date.now();
    puzzles = new Map();
    collectedHighlights = [];
    lives = 3;
    maxLives = 3;
    hubScriptRead = false;
    // ─── Abilities State ────────────────────────────────────
    glitchVisionActive = false;
    glitchVisionEnergy = 1.0; // 0.0 to 1.0
    gravityInverted = false;
    timeFrozen = false;
    timeFreezeTimer = 0.0;
    timeFreezeCooldown = 0.0;
    activeDimension = 'clean';
    // ─── Score & Timer ──────────────────────────────────────
    score = 1000;
    levelTime = 0;
    wrongAttemptsCount = 0;
    restartCount = 0;
    // ─── UI Modal States ────────────────────────────────────
    isPointerLocked = false;
    isCinematicPlaying = false;
    isManuscriptOpen = false;
    isCodeEntryOpen = false;
    isFinalEntryOpen = false;
    isSettingsOpen = false;
    isHowToPlayOpen = false;
    isLevelSelectOpen = false;
    isDialogueActive = false;
    activeCodeRoomId = null;
    // ─── Settings & Persistence ─────────────────────────────
    settings = SaveSystem.loadSettings();
    progress = SaveSystem.loadProgress();
    // ─── Observers ──────────────────────────────────────────
    listeners = new Set();
    subscribe(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }
    notify() {
        this.listeners.forEach(fn => fn(this));
    }
    setPhase(phase) {
        this.phase = phase;
        this.notify();
    }
    updateSettings(partial) {
        this.settings = { ...this.settings, ...partial };
        SaveSystem.saveSettings(this.settings);
        this.notify();
    }
    // ─── Scoring & Time ─────────────────────────────────────
    resetLevelStats() {
        this.score = 1000;
        this.levelTime = 0;
        this.wrongAttemptsCount = 0;
        this.lives = this.maxLives;
        this.glitchVisionActive = false;
        this.glitchVisionEnergy = 1.0;
        this.gravityInverted = false;
        this.timeFrozen = false;
        this.timeFreezeTimer = 0;
        this.timeFreezeCooldown = 0;
        this.activeDimension = 'clean';
        this.notify();
    }
    addScore(points) {
        this.score = Math.max(0, this.score + points);
        this.notify();
    }
    applyPenalty(penalty) {
        this.score = Math.max(0, this.score - penalty);
        this.notify();
    }
    calculateFinalScore() {
        const timeBonus = Math.max(0, Math.floor(500 - this.levelTime * 2));
        const livesBonus = this.lives * 150;
        const total = Math.max(100, this.score + timeBonus + livesBonus);
        let stars = 1;
        if (total >= 1200)
            stars = 3;
        else if (total >= 800)
            stars = 2;
        return { total, timeBonus, livesBonus, stars };
    }
    // ─── Puzzle & Lives ─────────────────────────────────────
    isRoomSolved(id) {
        return this.puzzles.get(id)?.solved ?? false;
    }
    solveRoom(id) {
        const p = this.puzzles.get(id);
        if (p && !p.solved) {
            p.solved = true;
            this.addScore(150);
            if (p.highlightedDigit !== null) {
                const alreadyHave = this.collectedHighlights.some(h => h.roomId === id);
                if (!alreadyHave) {
                    this.collectedHighlights.push({ digit: p.highlightedDigit, roomId: id });
                }
            }
            this.notify();
        }
    }
    loseLife() {
        this.lives = Math.max(0, this.lives - 1);
        this.wrongAttemptsCount += 1;
        this.applyPenalty(50);
        this.notify();
        return this.lives > 0;
    }
    // ─── Reset ──────────────────────────────────────────────
    resetToStartMenu() {
        this.phase = 'start_menu';
        this.currentLevel = 1;
        this.currentRoom = 1;
        this.puzzles.clear();
        this.collectedHighlights = [];
        this.hubScriptRead = false;
        this.resetLevelStats();
        this.isManuscriptOpen = false;
        this.isCodeEntryOpen = false;
        this.isFinalEntryOpen = false;
        this.isDialogueActive = false;
        this.notify();
    }
}
export const gameState = new GameState();
//# sourceMappingURL=GameState.js.map