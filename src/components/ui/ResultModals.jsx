import React from 'react';
import { useGameState } from '../../hooks/useGameState';

export function LevelCompleteModal({ onNextLevel, onMainMenu }) {
  const state = useGameState();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="overlay active" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 130 }}>
      <div className="result-panel">
        <h2 className="result-title">LEVEL {state.currentLevel} CLEARED!</h2>
        <div className="stars-display">★★★</div>

        <div className="result-stats">
          <div className="stat-row">
            <span>Level Time:</span>
            <strong>{formatTime(state.time)}</strong>
          </div>
          <div className="stat-row">
            <span>Lives Left:</span>
            <strong>{state.lives} / {state.maxLives}</strong>
          </div>
          <div className="stat-row highlight-row">
            <span>Total Score:</span>
            <strong>{state.score}</strong>
          </div>
        </div>

        <div className="result-actions">
          <button className="menu-btn primary-btn" onClick={onNextLevel}>
            NEXT LEVEL ▶
          </button>
          <button className="menu-btn" onClick={onMainMenu}>
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameOverModal({ onRestart, onMainMenu }) {
  return (
    <div className="overlay active" style={{ background: 'rgba(0,0,0,0.9)', zIndex: 150 }}>
      <div className="result-panel" style={{ borderColor: '#ef4444' }}>
        <h2 className="result-title" style={{ color: '#ef4444' }}>GAME OVER</h2>
        <p style={{ color: '#94a3b8' }}>All lives lost in the GlitchVerse.</p>
        <div className="result-actions" style={{ marginTop: '1.5rem' }}>
          <button className="menu-btn primary-btn" onClick={onRestart}>
            TRY AGAIN
          </button>
          <button className="menu-btn" onClick={onMainMenu}>
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

export function VictoryModal({ onPlayAgain }) {
  const state = useGameState();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div id="game-won" className="overlay active" style={{ zIndex: 160 }}>
      <div className="victory-panel">
        <h1 className="victory-title glitch-text" data-text="DEVELOPER FREED">
          DEVELOPER FREED
        </h1>
        <p className="victory-quote">"The simulation loop is broken. We found the way out."</p>

        <div className="victory-stats">
          <div>
            <span>TOTAL SCORE:</span> <strong>{state.score}</strong>
          </div>
          <div>
            <span>TOTAL TIME:</span> <strong>{formatTime(state.time)}</strong>
          </div>
        </div>

        <button className="menu-btn primary-btn" onClick={onPlayAgain}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
