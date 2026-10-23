import { useState, useEffect } from 'react';
import { gameState } from '../game/GameState';

/**
 * React hook to subscribe to the central GameState machine.
 */
export function useGameState() {
  const [state, setState] = useState(() => ({
    phase: gameState.phase,
    score: gameState.score,
    time: gameState.levelTimer,
    lives: gameState.lives,
    maxLives: gameState.maxLives,
    currentLevel: gameState.currentLevel,
    currentRoom: gameState.currentRoom,
    unlockedRooms: [...gameState.unlockedRooms],
    discoveredDigits: { ...gameState.discoveredDigits },
    finalAttemptsRemaining: gameState.finalAttemptsRemaining,
    finalPermutationSolved: gameState.finalPermutationSolved,
    hubScriptRead: gameState.hubScriptRead,
    isManuscriptOpen: gameState.isManuscriptOpen,
    isCodeEntryOpen: gameState.isCodeEntryOpen,
    isFinalEntryOpen: gameState.isFinalEntryOpen,
    isSettingsOpen: gameState.isSettingsOpen,
    isHowToPlayOpen: gameState.isHowToPlayOpen,
    isLevelSelectOpen: gameState.isLevelSelectOpen,
    isPaused: gameState.isPaused,
    isDialogueActive: gameState.isDialogueActive,
    glitchVisionActive: gameState.glitchVisionActive,
    glitchVisionEnergy: gameState.glitchVisionEnergy,
    checkpoint: gameState.checkpoint,
    settings: { ...gameState.settings },
  }));

  useEffect(() => {
    return gameState.subscribe(() => {
      setState({
        phase: gameState.phase,
        score: gameState.score,
        time: gameState.levelTimer,
        lives: gameState.lives,
        maxLives: gameState.maxLives,
        currentLevel: gameState.currentLevel,
        currentRoom: gameState.currentRoom,
        unlockedRooms: [...gameState.unlockedRooms],
        discoveredDigits: { ...gameState.discoveredDigits },
        finalAttemptsRemaining: gameState.finalAttemptsRemaining,
        finalPermutationSolved: gameState.finalPermutationSolved,
        hubScriptRead: gameState.hubScriptRead,
        isManuscriptOpen: gameState.isManuscriptOpen,
        isCodeEntryOpen: gameState.isCodeEntryOpen,
        isFinalEntryOpen: gameState.isFinalEntryOpen,
        isSettingsOpen: gameState.isSettingsOpen,
        isHowToPlayOpen: gameState.isHowToPlayOpen,
        isLevelSelectOpen: gameState.isLevelSelectOpen,
        isPaused: gameState.isPaused,
        isDialogueActive: gameState.isDialogueActive,
        glitchVisionActive: gameState.glitchVisionActive,
        glitchVisionEnergy: gameState.glitchVisionEnergy,
        checkpoint: gameState.checkpoint,
        settings: { ...gameState.settings },
      });
    });
  }, []);

  return state;
}
