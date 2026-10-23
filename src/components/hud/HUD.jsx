import React from 'react';
import { useGameState } from '../../hooks/useGameState';

export function HUD({ interactionPrompt }) {
  const state = useGameState();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getRoomName = () => {
    if (state.phase === 'entrance' || state.phase === 'hub') return 'ENTRANCE — Foggy Void';
    if (state.phase === 'level_1') return `LEVEL 1 — Room ${state.currentRoom} / 7`;
    if (state.phase === 'level_2') return 'LEVEL 2 — 2D Platformer';
    return '';
  };

  return (
    <div id="hud">
      <div className="hud-top-bar">
        <div className="hud-stat-box">
          <span className="hud-label">TIME</span>
          <span className="hud-val">{formatTime(state.time)}</span>
        </div>
        <div className="hud-stat-box">
          <span className="hud-label">SCORE</span>
          <span className="hud-val">{state.score}</span>
        </div>
        <div className="hud-stat-box">
          <span className="hud-label">LIVES</span>
          <span className="hud-val" style={{ color: '#ef4444' }}>
            {'♥ '.repeat(state.lives).trim()}
          </span>
        </div>
      </div>

      <div id="room-indicator">{getRoomName()}</div>

      {state.phase !== 'level_2' && (
        <div id="crosshair">
          <div className="crosshair-h"></div>
          <div className="crosshair-v"></div>
        </div>
      )}

      {interactionPrompt && (
        <div id="interaction-prompt">
          <span className="key-hint">E</span>
          <span>{interactionPrompt}</span>
        </div>
      )}

      {state.phase === 'level_1' && (
        <div className="hud-abilities">
          <div className="ability-card">
            <span className="ability-key">HOLD [Q] GLITCH VISION</span>
            <div className="ability-bar-bg">
              <div
                className="ability-bar-fill"
                style={{
                  width: `${state.glitchVisionEnergy}%`,
                  background: state.glitchVisionActive ? '#00e5ff' : '#06b6d4',
                  boxShadow: state.glitchVisionActive ? '0 0 10px #00e5ff' : 'none',
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
