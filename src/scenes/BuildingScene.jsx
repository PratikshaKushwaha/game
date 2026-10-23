import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerController } from '../player/PlayerController';
import { Door } from '../objects/Door';
import { gameState } from '../game/GameState';

const ROOM_SIZE = 10;
const WALL_HEIGHT = 4.0;

export function BuildingScene({
  rooms,
  puzzleSystem,
  onOpenKeypad,
  onOpenFinalLock,
  onSetInteractionPrompt,
  onComplete,
}) {
  const currentRoomId = gameState.currentRoom;
  const currentRoomConfig = rooms.find((r) => r.id === currentRoomId) || rooms[0];

  // Glitch Vision Energy & Emission logic
  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.1);
    if (gameState.glitchVisionActive) {
      gameState.glitchVisionEnergy = Math.max(0, gameState.glitchVisionEnergy - clampedDt * 25);
      if (gameState.glitchVisionEnergy <= 0) {
        gameState.glitchVisionActive = false;
      }
      gameState.notify();
    } else if (gameState.glitchVisionEnergy < 100) {
      gameState.glitchVisionEnergy = Math.min(100, gameState.glitchVisionEnergy + clampedDt * 18);
      gameState.notify();
    }
  });

  const isCurrentRoomSolved = gameState.isRoomSolved(currentRoomId);
  const isFinalRoom = currentRoomId === 7;

  // Keypad & Clue positions for the active room
  const interactables = useMemo(() => {
    const items = [
      {
        id: 'clue',
        position: new THREE.Vector3(2.5, 1.2, -2.5),
        prompt: `Inspect Note [E] (Room ${currentRoomId} Clue)`,
        action: () => {
          if (currentRoomConfig?.highlightedDigit) {
            gameState.discoveredDigits[currentRoomId] = currentRoomConfig.highlightedDigit;
            gameState.notify();
          }
        },
      },
      {
        id: 'door_lock',
        position: new THREE.Vector3(0, 1.2, -4.8),
        prompt: isFinalRoom
          ? 'Access Room 7 Vault Lock [E]'
          : isCurrentRoomSolved
          ? 'Door Unlocked — Step Through [E]'
          : `Enter Keypad Code [E]`,
        action: () => {
          if (isFinalRoom) {
            onOpenFinalLock();
          } else if (isCurrentRoomSolved) {
            // Advance to next room
            gameState.currentRoom = Math.min(7, currentRoomId + 1);
            gameState.notify();
          } else {
            onOpenKeypad(currentRoomConfig);
          }
        },
      },
    ];
    return items;
  }, [currentRoomId, currentRoomConfig, isCurrentRoomSolved, isFinalRoom, onOpenKeypad, onOpenFinalLock]);

  const handleInteract = () => {
    // Priority: door lock or clue
    if (isFinalRoom) {
      onOpenFinalLock();
    } else if (isCurrentRoomSolved) {
      gameState.currentRoom = Math.min(7, currentRoomId + 1);
      gameState.notify();
    } else {
      // Default to keypad or clue
      onOpenKeypad(currentRoomConfig);
    }
  };

  const hasSpecialGoldDigit = !!currentRoomConfig?.highlightedDigit;
  const showGlitchEffect = gameState.glitchVisionActive;

  return (
    <>
      <color attach="background" args={['#0d0d12']} />
      <fog attach="fog" args={['#0d0d12', 6, 28]} />

      {/* Dim room lighting */}
      <ambientLight color="#181c28" intensity={0.9} />
      <pointLight
        position={[0, 3.4, 0]}
        color={showGlitchEffect ? '#00e5ff' : '#ffe8b0'}
        intensity={showGlitchEffect ? 2.5 : 1.2}
        distance={14}
      />

      {/* Room Structure (Floor, Ceiling, Walls) */}
      <group position={[0, 0, 0]}>
        {/* Floor */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
          <meshStandardMaterial
            color="#141824"
            roughness={0.9}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        </mesh>

        {/* Ceiling */}
        <mesh position={[0, WALL_HEIGHT, 0]}>
          <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
          <meshStandardMaterial
            color="#10121a"
            roughness={0.95}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </mesh>

        {/* Back Wall with Door */}
        <mesh position={[0, WALL_HEIGHT / 2, -ROOM_SIZE / 2]}>
          <boxGeometry args={[ROOM_SIZE, WALL_HEIGHT, 0.2]} />
          <meshStandardMaterial color="#1c2030" roughness={0.85} />
        </mesh>

        {/* Front Wall */}
        <mesh position={[0, WALL_HEIGHT / 2, ROOM_SIZE / 2]}>
          <boxGeometry args={[ROOM_SIZE, WALL_HEIGHT, 0.2]} />
          <meshStandardMaterial color="#181c28" roughness={0.85} />
        </mesh>

        {/* Left Wall */}
        <mesh position={[-ROOM_SIZE / 2, WALL_HEIGHT / 2, 0]}>
          <boxGeometry args={[0.2, WALL_HEIGHT, ROOM_SIZE]} />
          <meshStandardMaterial color="#1a1e2c" roughness={0.85} />
        </mesh>

        {/* Right Wall */}
        <mesh position={[ROOM_SIZE / 2, WALL_HEIGHT / 2, 0]}>
          <boxGeometry args={[0.2, WALL_HEIGHT, ROOM_SIZE]} />
          <meshStandardMaterial color="#1a1e2c" roughness={0.85} />
        </mesh>
      </group>

      {/* Environmental Furniture (Desk & Bookshelf) */}
      <group position={[2.5, 0, -2.5]}>
        {/* Desk Base */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.6, 0.9, 0.9]} />
          <meshStandardMaterial color="#38281a" roughness={0.7} />
        </mesh>

        {/* Clue Document on the Desk */}
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.3]} />
          <meshStandardMaterial
            color={hasSpecialGoldDigit && showGlitchEffect ? '#fbbf24' : '#e2e8f0'}
            emissive={
              hasSpecialGoldDigit && showGlitchEffect
                ? '#fbbf24'
                : showGlitchEffect
                ? '#00e5ff'
                : '#000000'
            }
            emissiveIntensity={showGlitchEffect ? 1.8 : 0}
            roughness={0.5}
          />
        </mesh>

        {/* Glowing highlight light when Glitch Vision active */}
        {showGlitchEffect && (
          <pointLight
            position={[0, 1.2, 0]}
            color={hasSpecialGoldDigit ? '#fbbf24' : '#00e5ff'}
            intensity={2.0}
            distance={4}
          />
        )}
      </group>

      {/* Bookshelf against wall */}
      <mesh position={[-3.8, 1.5, -2.0]}>
        <boxGeometry args={[0.6, 3.0, 2.2]} />
        <meshStandardMaterial color="#2d2218" roughness={0.8} />
      </mesh>

      {/* Exit Door to next room */}
      <Door position={[0, 0, -4.8]} locked={!isCurrentRoomSolved && !isFinalRoom} />

      {/* Digital Keypad Lock Terminal */}
      <mesh position={[0.9, 1.25, -4.8]}>
        <boxGeometry args={[0.32, 0.45, 0.08]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive={isCurrentRoomSolved ? '#10b981' : isFinalRoom ? '#fbbf24' : '#00e5ff'}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Player Controller */}
      <PlayerController
        spawnPosition={[0, 0, 3.5]}
        interactables={interactables}
        onSetInteractionPrompt={onSetInteractionPrompt}
        onInteract={handleInteract}
      />
    </>
  );
}
