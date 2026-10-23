import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function Manuscript({ position = [1.2, 0, 0] }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = 1.35 + Math.sin(t * 1.5) * 0.08;
      meshRef.current.rotation.y = Math.sin(t * 0.6) * 0.25;
    }
  });

  return (
    <group position={position}>
      {/* Pedestal Stand */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.9, 16]} />
        <meshStandardMaterial color="#1a202c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.92, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.5, 0.38, 0.06]} />
        <meshStandardMaterial color="#2d3748" roughness={0.7} />
      </mesh>

      {/* Floating Glowing Manuscript Parchment */}
      <mesh ref={meshRef} position={[0, 1.35, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.42, 0.02, 0.3]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fbbf24"
          emissiveIntensity={0.6}
          roughness={0.9}
        />
      </mesh>

      {/* Warm Golden Uplight */}
      <pointLight position={[0, 1.1, 0]} color="#fbbf24" intensity={1.5} distance={3.5} />
    </group>
  );
}
