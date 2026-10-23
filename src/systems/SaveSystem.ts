// ============================================================
// SaveSystem.ts — LocalStorage Persistence for Settings & Progress
// ============================================================

import type { GameSettings, LevelProgress } from '../game/GameTypes';

const SETTINGS_KEY = 'the_way_out_settings';
const PROGRESS_KEY = 'the_way_out_progress';

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.9,
  mouseSensitivity: 1.0,
};

const DEFAULT_PROGRESS: LevelProgress = {
  unlockedLevels: 1,
  levelBestTimes: {},
  levelStars: {},
  totalScore: 0,
};

export class SaveSystem {
  static loadSettings(): GameSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // Fallback on error
    }
    return { ...DEFAULT_SETTINGS };
  }

  static saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore quota errors
    }
  }

  static loadProgress(): LevelProgress {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      if (data) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(data) };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_PROGRESS };
  }

  static saveProgress(progress: LevelProgress): void {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // Ignore
    }
  }

  static unlockLevel(level: number): void {
    const prog = this.loadProgress();
    if (level > prog.unlockedLevels && level <= 4) {
      prog.unlockedLevels = level;
      this.saveProgress(prog);
    }
  }

  static recordLevelCompletion(level: number, time: number, score: number, stars: number): void {
    const prog = this.loadProgress();
    if (!prog.levelBestTimes[level] || time < prog.levelBestTimes[level]) {
      prog.levelBestTimes[level] = Math.round(time);
    }
    if (!prog.levelStars[level] || stars > prog.levelStars[level]) {
      prog.levelStars[level] = stars;
    }
    prog.totalScore = Math.max(prog.totalScore, score);
    if (level < 4 && prog.unlockedLevels < level + 1) {
      prog.unlockedLevels = level + 1;
    }
    this.saveProgress(prog);
  }

  static resetProgress(): void {
    try {
      localStorage.removeItem(PROGRESS_KEY);
    } catch {
      // Ignore
    }
  }
}

export const saveSystem = SaveSystem;
