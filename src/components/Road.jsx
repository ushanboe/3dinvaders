import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function Road() {
  const gridRef = useRef();

  useFrame((state) => {
    // Subtle animation for the grid lines
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
    }
  });

  return (
    <group>
      {/* Main road/ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -5]}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial
          color="#0a0a20"
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>

      {/* Grid lines for depth perception */}
      <group ref={gridRef}>
        {/* Horizontal lines */}
        {Array.from({ length: 25 }).map((_, i) => (
          <mesh
            key={`h-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.48, -20 + i * 2]}
          >
            <planeGeometry args={[20, 0.05]} />
            <meshStandardMaterial
              color="#1a1a4a"
              emissive="#1a1a4a"
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}

        {/* Vertical lines */}
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh
            key={`v-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-10 + i * 2, -0.48, -5]}
          >
            <planeGeometry args={[0.05, 40]} />
            <meshStandardMaterial
              color="#1a1a4a"
              emissive="#1a1a4a"
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Side barriers - left */}
      <mesh position={[-10, 0.5, -5]}>
        <boxGeometry args={[0.3, 1.5, 40]} />
        <meshStandardMaterial
          color="#ff0066"
          emissive="#ff0066"
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Side barriers - right */}
      <mesh position={[10, 0.5, -5]}>
        <boxGeometry args={[0.3, 1.5, 40]} />
        <meshStandardMaterial
          color="#ff0066"
          emissive="#ff0066"
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Ambient particles/stars in background */}
      {Array.from({ length: 100 }).map((_, i) => (
        <mesh
          key={`star-${i}`}
          position={[
            (Math.random() - 0.5) * 40,
            Math.random() * 15 + 2,
            -20 - Math.random() * 20,
          ]}
        >
          <sphereGeometry args={[0.05 + Math.random() * 0.05, 4, 4]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={Math.random() * 0.5 + 0.5}
          />
        </mesh>
      ))}

      {/* Fog effect at the horizon */}
      <mesh position={[0, 5, -25]}>
        <planeGeometry args={[40, 15]} />
        <meshStandardMaterial
          color="#0a0a30"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}
