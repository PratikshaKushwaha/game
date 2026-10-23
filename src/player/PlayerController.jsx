import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { gameState } from '../game/GameState';

const WALK_SPEED = 4.8;
const SPRINT_SPEED = 8.2;
const EYE_HEIGHT = 1.65;

export function PlayerController({
  spawnPosition = [0, 0, 4],
  collisionSystem,
  interactables = [],
  onSetInteractionPrompt,
  onInteract,
}) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const position = useRef(new THREE.Vector3(...spawnPosition));
  const keys = useRef({ forward: false, backward: false, left: false, right: false, sprint: false });

  useEffect(() => {
    position.current.set(...spawnPosition);
    camera.position.set(spawnPosition[0], spawnPosition[1] + EYE_HEIGHT, spawnPosition[2]);
    camera.lookAt(spawnPosition[0], spawnPosition[1] + EYE_HEIGHT, spawnPosition[2] - 10);
  }, [spawnPosition, camera]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target?.tagName)) return;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.sprint = true;
      if (e.code === 'KeyE') {
        onInteract?.();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.sprint = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteract]);

  useFrame((_, dt) => {
    // If modal/dialogue open or paused, do not move
    if (
      gameState.isPaused ||
      gameState.isManuscriptOpen ||
      gameState.isCodeEntryOpen ||
      gameState.isFinalEntryOpen ||
      gameState.isSettingsOpen ||
      gameState.isHowToPlayOpen ||
      gameState.isDialogueActive
    ) {
      return;
    }

    const clampedDt = Math.min(dt, 0.1);
    const speed = (keys.current.sprint ? SPRINT_SPEED : WALK_SPEED) * clampedDt;

    // Camera forward and right vectors projected onto XZ
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveDelta = new THREE.Vector3();
    if (keys.current.forward) moveDelta.addScaledVector(forward, speed);
    if (keys.current.backward) moveDelta.addScaledVector(forward, -speed);
    if (keys.current.right) moveDelta.addScaledVector(right, speed);
    if (keys.current.left) moveDelta.addScaledVector(right, -speed);

    if (moveDelta.lengthSq() > 0) {
      if (collisionSystem) {
        position.current = collisionSystem.resolve(position.current, moveDelta);
      } else {
        position.current.add(moveDelta);
      }
    }

    camera.position.set(
      position.current.x,
      position.current.y + EYE_HEIGHT,
      position.current.z
    );

    // Distance checks for interactive prompts
    let activePrompt = null;
    let closestDist = 2.6; // max interact distance

    for (const item of interactables) {
      const dist = position.current.distanceTo(item.position);
      if (dist < closestDist) {
        closestDist = dist;
        activePrompt = item.prompt;
      }
    }

    onSetInteractionPrompt?.(activePrompt);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      selector="#game-canvas"
      pointerSpeed={gameState.settings.mouseSensitivity || 1.0}
    />
  );
}
