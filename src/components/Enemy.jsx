import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ROW_COLORS } from '../hooks/useGameLogic';

export function Enemy({ position, row, alive }) {
  const meshRef = useRef();
  const time = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (!meshRef.current || !alive) return;
    
    // Subtle hovering animation
    time.current += delta * 2;
    meshRef.current.position.y = position[1] + Math.sin(time.current) * 0.1;
    
    // Slight rotation
    meshRef.current.rotation.y += delta * 0.5;
  });

  if (!alive) return null;

  const color = ROW_COLORS[row] || '#ffffff';

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  );
}

// Explosion effect when enemy is destroyed
export function EnemyExplosion({ position, color, onComplete }) {
  const particles = useRef([]);
  const groupRef = useRef();
  const startTime = useRef(Date.now());

  // Initialize particles
  if (particles.current.length === 0) {
    for (let i = 0; i < 8; i++) {
      particles.current.push({
        velocity: [
          (Math.random() - 0.5) * 0.3,
          Math.random() * 0.2,
          (Math.random() - 0.5) * 0.3,
        ],
        position: [0, 0, 0],
      });
    }
  }

  useFrame(() => {
    if (!groupRef.current) return;
    
    const elapsed = Date.now() - startTime.current;
    if (elapsed > 500) {
      onComplete?.();
      return;
    }

    // Update particle positions
    groupRef.current.children.forEach((child, i) => {
      const p = particles.current[i];
      child.position.x += p.velocity[0];
      child.position.y += p.velocity[1];
      child.position.z += p.velocity[2];
      child.scale.setScalar(1 - elapsed / 500);
      p.velocity[1] -= 0.01; // gravity
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.current.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
