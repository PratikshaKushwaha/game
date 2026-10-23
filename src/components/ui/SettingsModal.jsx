import React, { useState } from 'react';
import { gameState } from '../../game/GameState';
import { saveSystem } from '../../systems/SaveSystem';

export function SettingsModal({ onClose }) {
  const [sens, setSens] = useState(gameState.settings.mouseSensitivity || 1.0);
  const [sfx, setSfx] = useState(gameState.settings.sfxVolume || 0.8);
  const [ambient, setAmbient] = useState(gameState.settings.ambientVolume || 0.4);

  const handleSave = () => {
    gameState.settings.mouseSensitivity = sens;
    gameState.settings.sfxVolume = sfx;
    gameState.settings.ambientVolume = ambient;
    saveSystem.saveSettings(gameState.settings);
    onClose?.();
  };

  return (
    <div className="overlay active" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 140 }}>
      <div className="modal-panel">
        <h2 className="modal-title">SETTINGS</h2>
        <div className="settings-form">
          <div className="setting-item">
            <label>Mouse Sensitivity: {sens.toFixed(1)}x</label>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={sens}
              onChange={(e) => setSens(parseFloat(e.target.value))}
            />
          </div>
          <div className="setting-item">
            <label>SFX Volume: {Math.round(sfx * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfx}
              onChange={(e) => setSfx(parseFloat(e.target.value))}
            />
          </div>
          <div className="setting-item">
            <label>Ambient Audio: {Math.round(ambient * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambient}
              onChange={(e) => setAmbient(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <button className="menu-btn primary-btn" onClick={handleSave}>
          APPLY & CLOSE
        </button>
      </div>
    </div>
  );
}
