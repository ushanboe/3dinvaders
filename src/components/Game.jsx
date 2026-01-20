import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGameStore, GAME_CONFIG, ROW_COLORS } from '../hooks/useGameLogic';
import { Enemy } from './Enemy';
import { Player } from './Player';
import { PlayerProjectile, EnemyProjectile } from './Projectile';
import { Road } from './Road';

// Game loop component
function GameLoop() {
  const {
    gameState,
    enemies,
    playerProjectiles,
    enemyProjectiles,
    updateProjectiles,
    advanceEnemies,
    checkCollisions,
    enemyShoot,
  } = useGameStore();

  const lastUpdate = useRef(Date.now());

  useFrame(() => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    const delta = now - lastUpdate.current;

    // Update at ~60fps
    if (delta > 16) {
      updateProjectiles();
      advanceEnemies();
      checkCollisions();
      enemyShoot();
      lastUpdate.current = now;
    }
  });

  return null;
}

// Scene lighting
function Lighting() {
  return (
    <>
      {/* Ambient light for base visibility */}
      <ambientLight intensity={0.3} />
      
      {/* Main directional light from above */}
      <directionalLight
        position={[0, 10, 5]}
        intensity={0.5}
        color="#ffffff"
      />
      
      {/* Colored accent lights */}
      <pointLight
        position={[-10, 5, -10]}
        intensity={0.5}
        color="#ff0066"
        distance={30}
      />
      <pointLight
        position={[10, 5, -10]}
        intensity={0.5}
        color="#00ffff"
        distance={30}
      />
      
      {/* Front light for player area */}
      <pointLight
        position={[0, 3, 8]}
        intensity={0.3}
        color="#00ff00"
        distance={15}
      />
    </>
  );
}

// Camera setup for first-person looking up perspective
function CameraSetup() {
  return null; // Camera is set in Canvas
}

// Main 3D scene
function Scene() {
  const {
    gameState,
    enemies,
    playerProjectiles,
    enemyProjectiles,
  } = useGameStore();

  return (
    <>
      <Lighting />
      <GameLoop />
      
      {/* Road/Ground */}
      <Road />
      
      {/* Player */}
      <Player />
      
      {/* Enemies */}
      {enemies.map((enemy) => (
        <Enemy
          key={enemy.id}
          position={enemy.position}
          row={enemy.row}
          alive={enemy.alive}
        />
      ))}
      
      {/* Player Projectiles */}
      {playerProjectiles.map((proj) => (
        <PlayerProjectile
          key={proj.id}
          position={proj.position}
        />
      ))}
      
      {/* Enemy Projectiles */}
      {enemyProjectiles.map((proj) => (
        <EnemyProjectile
          key={proj.id}
          position={proj.position}
        />
      ))}
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#0a0a20', 15, 35]} />
    </>
  );
}

// Main Game component
export function Game() {
  return (
    <Canvas
      camera={{
        position: [0, 3, 10],
        fov: 75,
        near: 0.1,
        far: 100,
        rotation: [-0.2, 0, 0],
      }}
      style={{ background: '#0a0a20' }}
      gl={{ antialias: true }}
    >
      <Scene />
    </Canvas>
  );
}
