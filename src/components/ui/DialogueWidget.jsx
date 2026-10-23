import React, { useState, useEffect } from 'react';
import { gameState } from '../../game/GameState';

export function DialogueWidget({ text, speaker = 'Developer (Transceiver)', onFinish }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, 28);

    return () => clearInterval(timer);
  }, [text]);

  const handleAdvance = () => {
    if (displayedText.length < text.length) {
      setDisplayedText(text);
    } else {
      gameState.setDialogueActive(false);
      onFinish?.();
    }
  };

  return (
    <div className="overlay-dialogue active" onClick={handleAdvance}>
      <div className="dialogue-box">
        <div className="dialogue-header">
          <div className="radio-indicator">
            <span className="radio-dot"></span>
            <span>{speaker}</span>
          </div>
          <span className="dialogue-skip-hint">Click anywhere to continue ▶</span>
        </div>
        <div className="dialogue-body">
          <p>{displayedText}</p>
        </div>
      </div>
    </div>
  );
}
