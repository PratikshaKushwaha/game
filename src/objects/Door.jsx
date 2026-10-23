import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function Door({ position = [0, 0, 0], locked = true, onInteract }) {
  const pivotRef = useRef();
  const currentAngle = useRef(0);
  const targetAngle = locked ? 0 : Math.PI / 2;

  // Attempt to load WorldGen 3D model with graceful fallback
  let gltfModel = null;
  try {
    const gltf = useGLTF('/assets/WorldGen/pack/separated_objects/glb/object_0000/model_shaded.glb');
    if (gltf && gltf.scene) {
      gltfModel = gltf.scene.clone();
    }
  } catch (e) {
    // Fallback to procedural mesh
  }

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.1);
    currentAngle.current = THREE.MathUtils.lerp(
      currentAngle.current,
      targetAngle,
      clampedDt * 3.5
    );
    if (pivotRef.current) {
      pivotRef.current.rotation.y = currentAngle.current;
    }
  });

  return (
    <group position={position}>
      {/* Outer Door Frame */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.2, 2.3, 0.12]} />
        <meshStandardMaterial color="#202430" roughness={0.9} />
      </mesh>

      {/* Door Hinge Pivot */}
      <group ref={pivotRef} position={[-0.5, 0, 0]}>
        <mesh position={[0.5, 1.1, 0]}>
          <boxGeometry args={[1.0, 2.2, 0.08]} />
          <meshStandardMaterial
            color={locked ? '#8b1a1a' : '#223355'}
            emissive={locked ? '#3a0000' : '#002233'}
            emissiveIntensity={0.6}
            roughness={0.7}
          />
        </mesh>

        {/* Small golden handle */}
        <mesh position={[0.9, 1.05, 0.06]}>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Teleport light aura */}
      <pointLight
        position={[0, 1.2, -0.2]}
        color={locked ? '#ef4444' : '#00e5ff'}
        intensity={locked ? 1.0 : 2.5}
        distance={6}
      />
    </group>
  );
}
