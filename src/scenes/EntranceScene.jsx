import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Door } from '../objects/Door';
import { Manuscript } from '../objects/Manuscript';
import { PlayerController } from '../player/PlayerController';
import { gameState } from '../game/GameState';

export function EntranceScene({ onSetInteractionPrompt, onReadManuscript, onEnterLevel1 }) {
  const isUnlocked = gameState.hubScriptRead;

  const interactables = useMemo(() => [
    {
      id: 'manuscript',
      position: new THREE.Vector3(0.8, 0, 0.3),
      prompt: 'Read Ancient Script [E]',
      action: onReadManuscript,
    },
    {
      id: 'door',
      position: new THREE.Vector3(-0.8, 0, 0),
      prompt: isUnlocked ? 'Enter Abandoned Building [E]' : 'Door Locked (Read Manuscript First)',
      action: () => {
        if (isUnlocked) {
          onEnterLevel1();
        } else {
          onReadManuscript();
        }
      },
    },
  ], [isUnlocked, onReadManuscript, onEnterLevel1]);

  const handleInteract = () => {
    // Determine closest interactable within 2.8m
    const playerPos = new THREE.Vector3(gameState.playerX || 0, 0, gameState.playerZ || 4);
    for (const item of interactables) {
      if (item.id === 'manuscript') {
        item.action();
        return;
      }
      if (item.id === 'door' && isUnlocked) {
        item.action();
        return;
      }
    }
    // Fallback: if near manuscript or door
    if (!isUnlocked) {
      onReadManuscript();
    } else {
      onEnterLevel1();
    }
  };

  return (
    <>
      <color attach="background" args={['#0a0c14']} />
      <fogExp2 attach="fog" args={['#0a0c14', 0.065]} />

      {/* Atmospheric Lighting */}
      <ambientLight color="#222a40" intensity={1.4} />
      <directionalLight
        position={[4, 16, 6]}
        color="#7588b5"
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Ground Platform */}
      <mesh position={[0, -0.75, 0]} receiveShadow>
        <cylinderGeometry args={[25, 28, 1.5, 32]} />
        <meshStandardMaterial color="#121520" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Interactive Teleport Door */}
      <Door position={[-0.8, 0, 0]} locked={!isUnlocked} />

      {/* Interactive Ancient Script */}
      <Manuscript position={[0.8, 0, 0.3]} />

      {/* First-Person Controller */}
      <PlayerController
        spawnPosition={[-0.78, 0, 4.5]}
        interactables={interactables}
        onSetInteractionPrompt={onSetInteractionPrompt}
        onInteract={handleInteract}
      />
    </>
  );
}
