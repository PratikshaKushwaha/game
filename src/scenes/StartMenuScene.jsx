import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function StartMenuScene() {
  const cameraGroupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.12;
    if (cameraGroupRef.current) {
      cameraGroupRef.current.rotation.y = Math.sin(t) * 0.15;
    }
  });

  return (
    <>
      <color attach="background" args={['#a0d8ef']} />
      <fog attach="fog" args={['#a0d8ef', 18, 65]} />

      {/* Warm Daylight Lighting */}
      <ambientLight color="#ffffff" intensity={0.8} />
      <directionalLight
        position={[14, 22, 10]}
        color="#fffbeb"
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Orbiting Camera Rig */}
      <group ref={cameraGroupRef}>
        {/* Soft Green Ground & Garden */}
        <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#4f8f3c" roughness={0.85} />
        </mesh>

        {/* Stone Path */}
        <mesh position={[0, -0.05, 5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 10]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>

        {/* 3D House */}
        <group position={[0, 0, 0]}>
          {/* Main House Body */}
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.5, 3.6, 5.0]} />
            <meshStandardMaterial color="#faebd7" roughness={0.65} />
          </mesh>

          {/* Roof */}
          <mesh position={[0, 4.3, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[4.4, 2.0, 4]} />
            <meshStandardMaterial color="#993322" roughness={0.6} />
          </mesh>

          {/* Front Door */}
          <mesh position={[0, 1.1, 2.52]}>
            <boxGeometry args={[1.1, 2.1, 0.08]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.5} />
          </mesh>

          {/* Warm lit windows */}
          <mesh position={[-1.6, 1.8, 2.52]}>
            <planeGeometry args={[1.0, 1.0]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[1.6, 1.8, 2.52]}>
            <planeGeometry args={[1.0, 1.0]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.6} />
          </mesh>

          {/* Chimney */}
          <mesh position={[1.6, 4.6, -1.0]} castShadow>
            <boxGeometry args={[0.7, 1.8, 0.7]} />
            <meshStandardMaterial color="#733020" roughness={0.9} />
          </mesh>
        </group>

        {/* Surrounding Trees */}
        {[-7, 7].map((x, i) => (
          <group key={i} position={[x, 0, i === 0 ? -4 : 2]}>
            <mesh position={[0, 1.2, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.35, 2.4, 8]} />
              <meshStandardMaterial color="#5a3d28" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3.2, 0]} castShadow>
              <coneGeometry args={[1.8, 3.2, 8]} />
              <meshStandardMaterial color="#2e6b27" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}
