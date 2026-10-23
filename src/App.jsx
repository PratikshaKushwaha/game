import React, { useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { gameState } from './game/GameState';
import { useGameState } from './hooks/useGameState';
import { audioSystem } from './systems/AudioSystem';
import { PuzzleSystem } from './systems/PuzzleSystem';
import { generateRoomPuzzles, deriveFinalCombination } from './puzzles/RoomPuzzleGenerator';

// 3D R3F Scenes
import { StartMenuScene } from './scenes/StartMenuScene';
import { OpeningCinematic } from './scenes/OpeningCinematic';
import { EntranceScene } from './scenes/EntranceScene';
import { BuildingScene } from './scenes/BuildingScene';
import { PlatformerScene } from './scenes/PlatformerScene';

// UI Overlays
import { HUD } from './components/hud/HUD';
import { StartMenuUI } from './components/ui/StartMenuUI';
import { DialogueWidget } from './components/ui/DialogueWidget';
import { ManuscriptModal } from './components/ui/ManuscriptModal';
import { KeypadModal } from './components/ui/KeypadModal';
import { FinalLockModal } from './components/ui/FinalLockModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { HowToPlayModal } from './components/ui/HowToPlayModal';
import { PauseMenu } from './components/ui/PauseMenu';
import { LevelCompleteModal, GameOverModal, VictoryModal } from './components/ui/ResultModals';

export default function App() {
  const state = useGameState();
  const [interactionPrompt, setInteractionPrompt] = useState(null);
  const [activeKeypadRoom, setActiveKeypadRoom] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // Initialize Level 1 Puzzles
  const seed = useMemo(() => Date.now(), []);
  const rooms = useMemo(() => generateRoomPuzzles(seed), [seed]);
  const finalAnswer = useMemo(() => deriveFinalCombination(rooms), [rooms]);
  const puzzleSystem = useMemo(() => new PuzzleSystem(rooms, audioSystem), [rooms]);

  // Audio & Escape Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        if (state.phase !== 'start_menu' && state.phase !== 'cinematic') {
          gameState.togglePause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase]);

  // Level timer tick
  useEffect(() => {
    if (state.phase === 'start_menu' || state.phase === 'cinematic' || state.isPaused) return;
    const interval = setInterval(() => {
      gameState.levelTimer += 1;
      gameState.notify();
    }, 1000);
    return () => clearInterval(interval);
  }, [state.phase, state.isPaused]);

  // Transitions
  const handleStartGame = () => {
    audioSystem.unlock();
    gameState.setPhase('cinematic');
  };

  const handleCinematicEnd = () => {
    gameState.setPhase('entrance');
    audioSystem.playAmbience('ambience', 0.25);
  };

  const handleReadManuscript = () => {
    gameState.setManuscriptOpen(true);
  };

  const handleEnterLevel1 = () => {
    gameState.currentLevel = 1;
    gameState.resetLevelStats();
    gameState.setPhase('level_1');
    gameState.currentRoom = 1;
    gameState.notify();
  };

  const handleLevel1Cleared = () => {
    gameState.setPhase('level_complete');
    audioSystem.playOneShot('unlock', 1.0);
  };

  const handleNextLevel = () => {
    if (state.currentLevel === 1) {
      gameState.currentLevel = 2;
      gameState.resetLevelStats();
      gameState.setPhase('level_2');
      gameState.notify();
    } else {
      gameState.setPhase('game_won');
    }
  };

  const handleRestartLevel = () => {
    setIsGameOver(false);
    gameState.isPaused = false;
    if (state.currentLevel === 1) {
      gameState.resetLevel1Run();
      gameState.setPhase('level_1');
    } else {
      gameState.resetLevelStats();
      gameState.setPhase('level_2');
    }
  };

  return (
    <div id="game-container">
      {/* ── React Three Fiber Canvas ─────────────────────────── */}
      {state.phase !== 'cinematic' && (
        <Canvas
          id="game-canvas"
          shadows
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          camera={{ fov: 75, near: 0.05, far: 200, position: [0, 1.65, 4] }}
        >
          {state.phase === 'start_menu' && <StartMenuScene />}

          {(state.phase === 'entrance' || state.phase === 'hub') && (
            <EntranceScene
              onSetInteractionPrompt={setInteractionPrompt}
              onReadManuscript={handleReadManuscript}
              onEnterLevel1={handleEnterLevel1}
            />
          )}

          {state.phase === 'level_1' && (
            <BuildingScene
              rooms={rooms}
              puzzleSystem={puzzleSystem}
              onOpenKeypad={(room) => {
                setActiveKeypadRoom(room);
                gameState.setCodeEntryOpen(true);
              }}
              onOpenFinalLock={() => {
                gameState.setFinalEntryOpen(true);
              }}
              onSetInteractionPrompt={setInteractionPrompt}
              onComplete={handleLevel1Cleared}
            />
          )}

          {state.phase === 'level_2' && (
            <PlatformerScene
              onComplete={() => gameState.setPhase('game_won')}
              onGameOver={() => setIsGameOver(true)}
            />
          )}
        </Canvas>
      )}

      {/* ── DOM & React UI Overlays ───────────────────────────── */}
      {state.phase === 'start_menu' && (
        <StartMenuUI
          onStart={handleStartGame}
          onOpenSettings={() => gameState.setSettingsOpen(true)}
          onOpenHowToPlay={() => gameState.setHowToPlayOpen(true)}
        />
      )}

      {state.phase === 'cinematic' && (
        <OpeningCinematic onComplete={handleCinematicEnd} />
      )}

      {(state.phase === 'entrance' ||
        state.phase === 'hub' ||
        state.phase === 'level_1' ||
        state.phase === 'level_2') && (
        <HUD interactionPrompt={interactionPrompt} />
      )}

      {state.isManuscriptOpen && (
        <ManuscriptModal
          onClose={() => {
            gameState.setDialogueActive(true);
          }}
        />
      )}

      {state.isDialogueActive && (
        <DialogueWidget
          text="Can you hear me? The simulation is disintegrating. Find the 3 golden digits in the building, unlock Room 7, and survive Level 2 to extract me!"
          onFinish={() => gameState.setDialogueActive(false)}
        />
      )}

      {state.isCodeEntryOpen && activeKeypadRoom && (
        <KeypadModal
          room={activeKeypadRoom}
          puzzleSystem={puzzleSystem}
          onSuccess={() => gameState.setCodeEntryOpen(false)}
          onClose={() => gameState.setCodeEntryOpen(false)}
        />
      )}

      {state.isFinalEntryOpen && (
        <FinalLockModal
          puzzleSystem={puzzleSystem}
          answer={finalAnswer}
          onSuccess={() => {
            gameState.setFinalEntryOpen(false);
            handleLevel1Cleared();
          }}
          onRestartLevel1={() => {
            gameState.resetLevel1Run();
            gameState.setPhase('level_1');
          }}
          onClose={() => gameState.setFinalEntryOpen(false)}
        />
      )}

      {state.phase === 'level_complete' && (
        <LevelCompleteModal
          onNextLevel={handleNextLevel}
          onMainMenu={() => gameState.resetToStartMenu()}
        />
      )}

      {state.phase === 'game_won' && (
        <VictoryModal onPlayAgain={() => gameState.resetToStartMenu()} />
      )}

      {isGameOver && (
        <GameOverModal
          onRestart={handleRestartLevel}
          onMainMenu={() => {
            setIsGameOver(false);
            gameState.resetToStartMenu();
          }}
        />
      )}

      {state.isPaused && (
        <PauseMenu
          onResume={() => gameState.togglePause()}
          onOpenSettings={() => gameState.setSettingsOpen(true)}
          onRestart={handleRestartLevel}
          onQuit={() => {
            gameState.isPaused = false;
            gameState.resetToStartMenu();
          }}
        />
      )}

      {state.isSettingsOpen && (
        <SettingsModal onClose={() => gameState.setSettingsOpen(false)} />
      )}

      {state.isHowToPlayOpen && (
        <HowToPlayModal onClose={() => gameState.setHowToPlayOpen(false)} />
      )}
    </div>
  );
}
