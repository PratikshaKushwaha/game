import { useEffect, useRef } from 'react';

/**
 * React hook tracking active keyboard inputs.
 */
export function useKeyboard() {
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    interact: false,
    glitchVision: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target?.tagName)) return;
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.current.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.right = true;
      if (code === 'Space') keys.current.jump = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') keys.current.sprint = true;
      if (code === 'KeyE') keys.current.interact = true;
      if (code === 'KeyQ') keys.current.glitchVision = true;
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') keys.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keys.current.right = false;
      if (code === 'Space') keys.current.jump = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') keys.current.sprint = false;
      if (code === 'KeyE') keys.current.interact = false;
      if (code === 'KeyQ') keys.current.glitchVision = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}
