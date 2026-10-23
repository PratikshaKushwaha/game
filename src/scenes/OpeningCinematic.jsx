import React, { useRef } from 'react';

export function OpeningCinematic({ onComplete }) {
  const videoRef = useRef(null);

  const handleEnded = () => {
    onComplete();
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  };

  return (
    <div id="cinematic-screen" className="overlay active">
      <video
        ref={videoRef}
        id="cinematic-video"
        src="/video/opening.mp4"
        autoPlay
        playsInline
        onEnded={handleEnded}
      />
      <button className="skip-btn" onClick={handleSkip}>
        SKIP [ESC / CLICK] ▶
      </button>
    </div>
  );
}
