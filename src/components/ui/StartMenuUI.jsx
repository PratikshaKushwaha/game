import React from 'react';
import { gameState } from '../../game/GameState';

export function StartMenuUI({ onStart, onOpenSettings, onOpenHowToPlay }) {
  return (
    <div id="start-menu" className="overlay active">
      <div className="start-menu-panel">
        <div className="title-container">
          <h1 className="game-main-title glitch-text" data-text="THE WAY OUT">THE WAY OUT</h1>
          <p className="game-subtitle">GlitchVerse: The World Is Broken</p>
        </div>

        <nav className="start-menu-nav">
          <button id="btn-start" className="menu-btn primary-btn" onClick={onStart}>
            START GAME
          </button>
          <button
            id="btn-continue"
            className="menu-btn"
            disabled={gameState.currentLevel <= 1}
            onClick={() => gameState.setPhase(`level_${gameState.currentLevel}`)}
          >
            CONTINUE
          </button>
          <button id="btn-settings" className="menu-btn" onClick={onOpenSettings}>
            SETTINGS
          </button>
          <button id="btn-how-to-play" className="menu-btn" onClick={onOpenHowToPlay}>
            HOW TO PLAY
          </button>
        </nav>

        <div className="start-menu-footer">
          <span>React Three Fiber • GlitchVerse Edition</span>
        </div>
      </div>
    </div>
  );
}
