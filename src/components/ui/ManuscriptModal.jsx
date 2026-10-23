import React from 'react';
import { gameState } from '../../game/GameState';

export function ManuscriptModal({ onClose }) {
  return (
    <div id="manuscript-overlay" className="overlay active">
      <div className="manuscript-paper">
        <h2 className="manuscript-title">ARCHIVE LOG — THE ANCIENT SCRIPT</h2>
        <div className="manuscript-body">
          <p>
            "If you are reading this, the reality compiler has collapsed. I am trapped in the inner core
            of my own simulation. The engine is leaking into physical memory."
          </p>
          <p>
            "You are the Chosen One. To reach the core, you must enter the Abandoned Building ahead.
            Each room holds a numeric key hidden in the environment. In three of those rooms, a golden digit
            lies hidden in the glitch."
          </p>
          <p>
            "Collect those three digits in order to break the Room 7 Vault Lock. Beware: you have only four attempts.
            Step through the Teleport Door when ready."
          </p>
        </div>
        <button
          className="manuscript-close-btn"
          onClick={() => {
            gameState.hubScriptRead = true;
            gameState.setManuscriptOpen(false);
            onClose?.();
          }}
        >
          CLOSE & UNLOCK DOOR [E]
        </button>
      </div>
    </div>
  );
}
