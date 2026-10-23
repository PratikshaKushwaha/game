import React from 'react';

export function PauseMenu({ onResume, onOpenSettings, onRestart, onQuit }) {
  return (
    <div id="pause-menu" className="overlay active">
      <div className="pause-panel">
        <h2 className="pause-title">PAUSED</h2>
        <div className="pause-nav">
          <button className="menu-btn primary-btn" onClick={onResume}>
            RESUME
          </button>
          <button className="menu-btn" onClick={onOpenSettings}>
            SETTINGS
          </button>
          <button className="menu-btn" onClick={onRestart}>
            RESTART LEVEL
          </button>
          <button className="menu-btn" onClick={onQuit}>
            QUIT TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
