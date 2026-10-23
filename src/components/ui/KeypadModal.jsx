import React, { useState } from 'react';
import { gameState } from '../../game/GameState';

export function KeypadModal({ room, puzzleSystem, onSuccess, onClose }) {
  const [digits, setDigits] = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const handlePress = (num) => {
    if (digits.length < 3) {
      setDigits((prev) => prev + num);
      setFeedback({ text: '', type: '' });
    }
  };

  const handleClear = () => {
    setDigits('');
    setFeedback({ text: '', type: '' });
  };

  const handleSubmit = () => {
    if (digits.length < 3) {
      setFeedback({ text: 'ENTER 3 DIGITS', type: 'error' });
      return;
    }

    const ok = puzzleSystem.attemptRoomCode(room.id, digits);
    if (ok) {
      setFeedback({ text: 'ACCESS GRANTED — DOOR OPENED', type: 'success' });
      setTimeout(() => {
        gameState.setCodeEntryOpen(false);
        onSuccess?.();
      }, 700);
    } else {
      setFeedback({ text: 'ACCESS DENIED — INCORRECT CODE', type: 'error' });
      setDigits('');
    }
  };

  return (
    <div id="code-overlay" className="overlay active">
      <div className="code-panel">
        <h3 className="code-panel-title">TERMINAL LOCK — ROOM {room?.id}</h3>
        <div className="code-display">
          <div className="code-digit">{digits[0] || '-'}</div>
          <div className="code-digit">{digits[1] || '-'}</div>
          <div className="code-digit">{digits[2] || '-'}</div>
        </div>

        {feedback.text && (
          <div className={`code-feedback ${feedback.type}`}>{feedback.text}</div>
        )}

        <div className="code-numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} className="numpad-btn" onClick={() => handlePress(String(n))}>
              {n}
            </button>
          ))}
          <button className="numpad-btn numpad-clear" onClick={handleClear}>
            C
          </button>
          <button className="numpad-btn" onClick={() => handlePress('0')}>
            0
          </button>
          <button className="numpad-btn numpad-submit" onClick={handleSubmit}>
            ↵
          </button>
        </div>

        <button className="code-cancel-btn" onClick={onClose}>
          CANCEL
        </button>
      </div>
    </div>
  );
}
