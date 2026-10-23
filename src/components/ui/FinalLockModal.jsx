import React, { useState } from 'react';
import { gameState } from '../../game/GameState';

export function FinalLockModal({ puzzleSystem, answer, onSuccess, onRestartLevel1, onClose }) {
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
    const result = puzzleSystem.attemptFinalCode(digits, answer);
    if (result === 'invalid_format') {
      setFeedback({ text: 'ENTER 3 DIGITS (NO ATTEMPT USED)', type: 'error' });
      return;
    }

    if (result === 'correct') {
      setFeedback({ text: 'VAULT OVERRIDE GRANTED — LEVEL 1 CLEARED!', type: 'success' });
      setTimeout(() => {
        gameState.setFinalEntryOpen(false);
        onSuccess?.();
      }, 1000);
    } else if (result === 'wrong') {
      setFeedback({
        text: `INCORRECT — ${gameState.finalAttemptsRemaining} ATTEMPTS REMAIN`,
        type: 'error',
      });
      setDigits('');
    } else if (result === 'restart') {
      setFeedback({ text: 'LOCKOUT TRIGGERED — RESETTING LEVEL 1...', type: 'error' });
      setTimeout(() => {
        gameState.setFinalEntryOpen(false);
        onRestartLevel1?.();
      }, 1400);
    }
  };

  return (
    <div id="final-overlay" className="overlay active">
      <div className="code-panel final-panel">
        <h3 className="code-panel-title">ROOM 7 — VAULT OVERRIDE</h3>
        <p className="final-hint">Enter the 3 golden digits discovered in rooms 1–6 in order.</p>

        <div className="code-display">
          <div className="code-digit">{digits[0] || '-'}</div>
          <div className="code-digit">{digits[1] || '-'}</div>
          <div className="code-digit">{digits[2] || '-'}</div>
        </div>

        <div className="attempt-display">
          ATTEMPTS REMAINING: <strong>{gameState.finalAttemptsRemaining} / 4</strong>
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
          BACK
        </button>
      </div>
    </div>
  );
}
