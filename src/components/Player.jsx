import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, GAME_CONFIG } from '../hooks/useGameLogic';

export function Player() {
  const meshRef = useRef();
  const { playerX, playerInvincible, gameState, movePlayer, playerShoot, togglePause } = useGameStore();
  const flashTime = useRef(0);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          if (gameState === 'paused') togglePause();
        }
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          movePlayer(-1);
          break;
        case 'ArrowRight':
        case 'KeyD':
          movePlayer(1);
          break;
        case 'Space':
          e.preventDefault();
          playerShoot();
          break;
        case 'Escape':
        case 'KeyP':
          togglePause();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      // Could be used for continuous movement if needed
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, movePlayer, playerShoot, togglePause]);

  // Continuous keyboard movement
  useEffect(() => {
    if (gameState !== 'playing') return;

    const keys = { left: false, right: false };
    
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    };
    
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      if (keys.left) movePlayer(-1);
      if (keys.right) movePlayer(1);
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [gameState, movePlayer]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Smooth position update
    meshRef.current.position.x += (playerX - meshRef.current.position.x) * 0.2;
    
    // Invincibility flash effect
    if (playerInvincible) {
      flashTime.current += delta * 10;
      meshRef.current.visible = Math.sin(flashTime.current) > 0;
    } else {
      meshRef.current.visible = true;
      flashTime.current = 0;
    }
  });

  if (gameState === 'menu') return null;

  return (
    <group ref={meshRef} position={[playerX, 0, GAME_CONFIG.PLAYER_Z]}>
      {/* Main cannon body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.4, 0.8]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.3}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      
      {/* Cannon barrel */}
      <mesh position={[0, 0.5, -0.3]}>
        <boxGeometry args={[0.3, 0.3, 0.6]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>
      
      {/* Side wings */}
      <mesh position={[-0.5, 0.2, 0.2]}>
        <boxGeometry args={[0.3, 0.2, 0.4]} />
        <meshStandardMaterial
          color="#00aa00"
          emissive="#00aa00"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.5, 0.2, 0.2]}>
        <boxGeometry args={[0.3, 0.2, 0.4]} />
        <meshStandardMaterial
          color="#00aa00"
          emissive="#00aa00"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Glow effect underneath */}
      <pointLight
        position={[0, 0.1, 0]}
        color="#00ff00"
        intensity={0.5}
        distance={3}
      />
    </group>
  );
}
