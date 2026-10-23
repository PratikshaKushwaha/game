import React from 'react';

export function HowToPlayModal({ onClose }) {
  return (
    <div className="overlay active" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 140 }}>
      <div className="modal-panel wide-modal">
        <h2 className="modal-title">HOW TO PLAY</h2>
        <table className="controls-table">
          <tbody>
            <tr>
              <td><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></td>
              <td>Move player forward / left / back / right</td>
            </tr>
            <tr>
              <td><kbd>Mouse</kbd></td>
              <td>Look around (Click canvas to lock cursor)</td>
            </tr>
            <tr>
              <td><kbd>Shift</kbd> (Hold)</td>
              <td>Sprint</td>
            </tr>
            <tr>
              <td><kbd>Space</kbd></td>
              <td>Jump (Level 2 Platformer)</td>
            </tr>
            <tr>
              <td><kbd>E</kbd></td>
              <td>Interact with Doors, Ancient Script, Clues, Keypads</td>
            </tr>
            <tr>
              <td><kbd>Q</kbd> (Hold)</td>
              <td>Glitch Vision (Level 1: reveal hidden codes & golden digits)</td>
            </tr>
            <tr>
              <td><kbd>Esc</kbd></td>
              <td>Pause Menu / Release Cursor</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
          <p><strong>Goal:</strong> Read the Ancient Script at the Entrance, solve the 7 rooms of the Abandoned Building, and clear the Level 2 2D Platformer to free the trapped developer!</p>
        </div>

        <button className="menu-btn primary-btn" onClick={onClose}>
          GOT IT
        </button>
      </div>
    </div>
  );
}
