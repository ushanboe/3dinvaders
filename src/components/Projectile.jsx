import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function PlayerProjectile({ position }) {
  const meshRef = useRef();
  const trailRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Pulsing glow effect
    const scale = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.2;
    meshRef.current.scale.set(scale, scale, 1);
  });

  return (
    <group position={position}>
      {/* Main projectile */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.15, 0.15, 0.5]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Trail effect */}
      <mesh position={[0, 0, 0.4]} ref={trailRef}>
        <boxGeometry args={[0.1, 0.1, 0.3]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Point light for glow */}
      <pointLight
        color="#00ffff"
        intensity={0.5}
        distance={2}
      />
    </group>
  );
}

export function EnemyProjectile({ position }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Rotation effect
    meshRef.current.rotation.z += delta * 10;
  });

  return (
    <group position={position}>
      {/* Main projectile */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.2, 0.2, 0.3]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff6600"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Point light for glow */}
      <pointLight
        color="#ff0000"
        intensity={0.3}
        distance={1.5}
      />
    </group>
  );
}
