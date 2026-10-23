import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { gameState } from '../game/GameState';
import { LifeSystem } from '../platformer/LifeSystem';

const GRAVITY = -26;
const JUMP_IMPULSE = 11.5;
const MOVE_SPEED = 7.5;

export function PlatformerScene({ onComplete, onGameOver }) {
  const cameraRef = useRef();
  const playerMeshRef = useRef();

  // Local platformer physics state
  const playerPos = useRef(new THREE.Vector3(0, 1.5, 0));
  const playerVel = useRef(new THREE.Vector2(0, 0));
  const isGrounded = useRef(false);
  const activeCheckpoint = useRef(new THREE.Vector3(0, 1.5, 0));

  const lifeSystem = useRef(new LifeSystem(3, 1.5));
  const [coinsCollected, setCoinsCollected] = useState(new Set());
  const [defeatedEnemies, setDefeatedEnemies] = useState(new Set());
  const [checkpointReached, setCheckpointReached] = useState(false);

  // Keyboard state
  const keys = useRef({ left: false, right: false, jump: false });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target?.tagName)) return;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = true;
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        keys.current.jump = true;
      }
    };

    const onKeyUp = (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.right = false;
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        keys.current.jump = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Platform definitions [x, y, width, height]
  const staticPlatforms = useMemo(() => [
    { x: 3, y: -0.5, w: 10, h: 1 },       // Starting ground
    { x: 11, y: 1.5, w: 3.5, h: 0.6 },     // Floating step 1
    { x: 16, y: 2.8, w: 3.5, h: 0.6 },     // Floating step 2 (Checkpoint)
    { x: 23, y: 1.8, w: 4.0, h: 0.6 },     // Floating step 3
    { x: 32, y: -0.5, w: 12, h: 1 },      // Exit platform
  ], []);

  // Collectible coins
  const coins = useMemo(() => [
    { id: 1, x: 5, y: 1.2 },
    { id: 2, x: 11, y: 2.8 },
    { id: 3, x: 16, y: 4.0 },
    { id: 4, x: 23, y: 3.2 },
    { id: 5, x: 28, y: 3.8 },
  ], []);

  // Patrol enemies [id, x, y, minX, maxX, speed]
  const enemies = useRef([
    { id: 1, x: 4.5, y: 0.4, minX: 1.5, maxX: 6.5, speed: 2.0, dir: 1 },
    { id: 2, x: 30.5, y: 0.4, minX: 28.0, maxX: 34.0, speed: 2.5, dir: 1 },
  ]);

  const respawnAtCheckpoint = () => {
    playerPos.current.copy(activeCheckpoint.current);
    playerVel.current.set(0, 0);
  };

  useFrame(({ clock }, dt) => {
    if (gameState.isPaused) return;
    const clampedDt = Math.min(dt, 0.05);
    const time = clock.getElapsedTime();

    lifeSystem.current.update(clampedDt);

    // 1. Horizontal Player Movement
    let moveDir = 0;
    if (keys.current.right) moveDir += 1;
    if (keys.current.left) moveDir -= 1;
    playerVel.current.x = moveDir * MOVE_SPEED;

    // 2. Jump
    if (keys.current.jump && isGrounded.current) {
      playerVel.current.y = JUMP_IMPULSE;
      isGrounded.current = false;
    }

    // 3. Gravity
    playerVel.current.y += GRAVITY * clampedDt;

    // Moving platform offset: oscillating X position
    const movingPlatX = 20.0 + Math.sin(time * 1.5) * 2.0;
    const movingPlatY = 2.4;

    // Apply movement
    const prevY = playerPos.current.y;
    playerPos.current.x += playerVel.current.x * clampedDt;
    playerPos.current.y += playerVel.current.y * clampedDt;

    // 4. Platform Collision Detection (AABB)
    isGrounded.current = false;
    const pRadius = 0.4;
    const pHeight = 0.8;

    const allPlatforms = [
      ...staticPlatforms,
      { x: movingPlatX, y: movingPlatY, w: 3.2, h: 0.5 },
    ];

    for (const plat of allPlatforms) {
      const halfW = plat.w / 2;
      const halfH = plat.h / 2;

      // Check horizontal overlap
      if (
        playerPos.current.x + pRadius > plat.x - halfW &&
        playerPos.current.x - pRadius < plat.x + halfW
      ) {
        // Landing on top from above
        if (
          prevY >= plat.y + halfH &&
          playerPos.current.y <= plat.y + halfH + 0.05 &&
          playerVel.current.y <= 0
        ) {
          playerPos.current.y = plat.y + halfH + 0.01;
          playerVel.current.y = 0;
          isGrounded.current = true;
        }
      }
    }

    // 5. Pit Fall Check
    if (playerPos.current.y < -3.5) {
      const damaged = lifeSystem.current.takeDamage();
      if (damaged) {
        gameState.loseLife();
      }
      if (lifeSystem.current.isGameOver) {
        onGameOver?.();
      } else {
        respawnAtCheckpoint();
      }
    }

    // 6. Enemies logic & stomp detection
    for (const enemy of enemies.current) {
      if (defeatedEnemies.has(enemy.id)) continue;

      // Patrol movement
      enemy.x += enemy.speed * enemy.dir * clampedDt;
      if (enemy.x > enemy.maxX) enemy.dir = -1;
      if (enemy.x < enemy.minX) enemy.dir = 1;

      // Collision check with player
      const dx = Math.abs(playerPos.current.x - enemy.x);
      const dy = playerPos.current.y - enemy.y;

      if (dx < 0.7 && Math.abs(dy) < 0.8) {
        // Stomp defeat: player falls from above
        if (playerVel.current.y < 0 && dy > 0.3) {
          setDefeatedEnemies((prev) => new Set(prev).add(enemy.id));
          playerVel.current.y = 8.5; // Stomp bounce
          gameState.addScore(100);
        } else if (!lifeSystem.current.isInvulnerable()) {
          const damaged = lifeSystem.current.takeDamage();
          if (damaged) {
            gameState.loseLife();
            // Knockback
            playerVel.current.x = (playerPos.current.x < enemy.x ? -1 : 1) * 6;
            playerVel.current.y = 6;
          }
          if (lifeSystem.current.isGameOver) {
            onGameOver?.();
          }
        }
      }
    }

    // 7. Checkpoint Trigger
    if (!checkpointReached && playerPos.current.x > 15.5 && playerPos.current.x < 17.5) {
      setCheckpointReached(true);
      activeCheckpoint.current.set(16, 3.6, 0);
      gameState.addScore(200);
    }

    // 8. Coin Collection
    for (const coin of coins) {
      if (coinsCollected.has(coin.id)) continue;
      const dist = Math.hypot(playerPos.current.x - coin.x, playerPos.current.y - coin.y);
      if (dist < 0.8) {
        setCoinsCollected((prev) => new Set(prev).add(coin.id));
        gameState.addScore(50);
      }
    }

    // 9. Exit Door Trigger (Level 2 Completion)
    if (playerPos.current.x > 35.5) {
      onComplete?.();
    }

    // Sync Player Mesh Position
    if (playerMeshRef.current) {
      playerMeshRef.current.position.set(playerPos.current.x, playerPos.current.y, 0);
      // Flash effect if invulnerable
      playerMeshRef.current.visible =
        !lifeSystem.current.isInvulnerable() || Math.floor(time * 12) % 2 === 0;
    }

    // Smooth Orthographic Camera Follow (tracks X and gentle Y)
    if (cameraRef.current) {
      const targetCamX = playerPos.current.x + 2.5;
      const targetCamY = Math.max(3.5, playerPos.current.y + 1.5);
      cameraRef.current.position.x = THREE.MathUtils.lerp(
        cameraRef.current.position.x,
        targetCamX,
        clampedDt * 5.0
      );
      cameraRef.current.position.y = THREE.MathUtils.lerp(
        cameraRef.current.position.y,
        targetCamY,
        clampedDt * 3.0
      );
    }
  });

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[4, 4, 18]}
        zoom={46}
        near={0.1}
        far={100}
      />
      <color attach="background" args={['#080c18']} />

      {/* Atmospheric Lighting */}
      <ambientLight color="#1e293b" intensity={1.5} />
      <directionalLight position={[10, 20, 10]} color="#38bdf8" intensity={1.2} />

      {/* Parallax Cyber Background Grid */}
      <mesh position={[20, 4, -12]}>
        <planeGeometry args={[120, 40]} />
        <meshBasicMaterial color="#0c1222" />
      </mesh>

      {/* Static Platforms */}
      {staticPlatforms.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0]} receiveShadow>
          <boxGeometry args={[p.w, p.h, 2.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      ))}

      {/* Moving Platform */}
      <MovingPlatformMesh />

      {/* Checkpoint Flag */}
      <group position={[16, 3.2, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0.2, 1.0, 0]}>
          <boxGeometry args={[0.4, 0.25, 0.04]} />
          <meshStandardMaterial
            color={checkpointReached ? '#10b981' : '#ef4444'}
            emissive={checkpointReached ? '#10b981' : '#ef4444'}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Collectible Coins */}
      {coins.map((c) => (
        !coinsCollected.has(c.id) && (
          <mesh key={c.id} position={[c.x, c.y, 0]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
          </mesh>
        )
      ))}

      {/* Enemies / Zombies */}
      {enemies.current.map((e) => (
        !defeatedEnemies.has(e.id) && (
          <mesh key={e.id} position={[e.x, e.y + 0.35, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color="#ef4444" emissive="#991b1b" emissiveIntensity={0.5} />
          </mesh>
        )
      ))}

      {/* Exit Door */}
      <group position={[36, 0.7, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 2.4, 0.2]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.9} />
        </mesh>
        <pointLight position={[0, 0, 1]} color="#00e5ff" intensity={2.5} distance={6} />
      </group>

      {/* Player Character Cube/Sprite */}
      <mesh ref={playerMeshRef} position={[0, 1.5, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.7]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.4} />
      </mesh>
    </>
  );
}

function MovingPlatformMesh() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.x = 20.0 + Math.sin(clock.getElapsedTime() * 1.5) * 2.0;
    }
  });

  return (
    <mesh ref={meshRef} position={[20, 2.4, 0]}>
      <boxGeometry args={[3.2, 0.5, 2.0]} />
      <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.3} />
    </mesh>
  );
}
