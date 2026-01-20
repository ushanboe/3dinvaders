import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Sound effects
const useSound = () => {
  const audioContext = useRef(null);
  
  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext.current;
  };

  const playSound = useCallback((type) => {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    switch(type) {
      case 'shoot':
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
      case 'explosion':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'playerHit':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
        break;
      case 'gameOver':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
      case 'victory':
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.2);
        });
        break;
      case 'levelUp':
        [440, 550, 660, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.15);
        });
        break;
      case 'mystery':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
        oscillator.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'mysteryHit':
        [1000, 1200, 1400, 1600].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.1);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.1);
        });
        break;
      case 'dive':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'step':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(80 + Math.random() * 40, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.06);
        break;
      case 'barrier':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
    }
  }, []);

  return playSound;
};

// Explosion particle effect
function Explosion({ position, onComplete, color = '#ff6600' }) {
  const groupRef = useRef();
  const [particles] = useState(() => {
    const p = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 0.1 + Math.random() * 0.15;
      p.push({
        x: 0, y: 0, z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + Math.random() * 0.1,
        vz: (Math.random() - 0.5) * 0.1,
        size: 0.2 + Math.random() * 0.3
      });
    }
    return p;
  });
  const [opacity, setOpacity] = useState(1);
  const startTime = useRef(Date.now());
  
  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    if (elapsed > 0.5) {
      onComplete();
      return;
    }
    
    setOpacity(1 - elapsed * 2);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.vy -= 0.01;
    });
  });
  
  return (
    <group ref={groupRef} position={position}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={opacity}
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// Enemy sprite using PNG texture
function EnemySprite({ position, row }) {
  const textureFiles = [
    '/3dinvaders/five.png',
    '/3dinvaders/four.png',
    '/3dinvaders/three.png',
    '/3dinvaders/two.png',
    '/3dinvaders/one.png'
  ];
  
  const texture = useLoader(THREE.TextureLoader, textureFiles[row] || textureFiles[0]);
  
  return (
    <sprite position={position} scale={[2.2, 2.2, 1]}>
      <spriteMaterial map={texture} transparent />
    </sprite>
  );
}

// Mystery invader sprite
function MysterySprite({ position }) {
  const texture = useLoader(THREE.TextureLoader, '/3dinvaders/mystery.png');
  
  return (
    <sprite position={position} scale={[3, 3, 1]}>
      <spriteMaterial map={texture} transparent />
    </sprite>
  );
}

// Fallback cube enemy
function CubeEnemy({ position, color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.8, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.9}
        roughness={0.1}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// Shiny Bubbly 3D Player Gun
function Player({ position, isHit }) {
  const groupRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.05);
    }
  });
  
  const baseColor = isHit ? "#ff2222" : "#00ffaa";
  const accentColor = isHit ? "#ff6666" : "#66ffcc";
  const glowColor = isHit ? "#ff0000" : "#00ff88";
  
  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial 
          color={baseColor}
          metalness={0.95}
          roughness={0.05}
          emissive={glowColor}
          emissiveIntensity={isHit ? 0.8 : 0.4}
        />
      </mesh>
      
      <mesh position={[-0.8, -0.1, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial 
          color={accentColor}
          metalness={0.9}
          roughness={0.1}
          emissive={glowColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0.8, -0.1, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial 
          color={accentColor}
          metalness={0.9}
          roughness={0.1}
          emissive={glowColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
        <meshStandardMaterial 
          color={baseColor}
          metalness={0.95}
          roughness={0.05}
          emissive={glowColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial 
          color={"#ffffff"}
          metalness={0.95}
          roughness={0.05}
          emissive={glowColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      <mesh ref={glowRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.08, 8, 32]} />
        <meshStandardMaterial 
          color={glowColor}
          metalness={0.8}
          roughness={0.2}
          emissive={glowColor}
          emissiveIntensity={1}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      <mesh position={[-0.4, 0.4, 0.3]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial 
          color={"#ffffff"}
          metalness={0.95}
          roughness={0.05}
          emissive={accentColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0.4, 0.4, 0.3]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial 
          color={"#ffffff"}
          metalness={0.95}
          roughness={0.05}
          emissive={accentColor}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// Shiny Bubbly Bullet
function Bullet({ position, isEnemy }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 5;
    }
  });
  
  const color = isEnemy ? "#ff3366" : "#00ffff";
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.95}
          roughness={0.05}
          emissive={color}
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh position={[0, isEnemy ? 0.3 : -0.3, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// Shiny Bubbly Barrier/Shield
function Barrier({ barrier }) {
  const blocks = [];
  const bubbleSize = 0.45;
  
  const getColors = (health) => {
    if (health === 3) return { main: '#00ff88', glow: '#00ffaa', emissive: 0.4 };
    if (health === 2) return { main: '#ffdd00', glow: '#ffff44', emissive: 0.5 };
    return { main: '#ff6600', glow: '#ff8844', emissive: 0.6 };
  };
  
  barrier.blocks.forEach((block, idx) => {
    if (block.health > 0) {
      const colors = getColors(block.health);
      blocks.push(
        <mesh key={idx} position={[barrier.x + block.x, barrier.y + block.y, 0]}>
          <sphereGeometry args={[bubbleSize, 20, 20]} />
          <meshStandardMaterial 
            color={colors.main}
            metalness={0.92}
            roughness={0.08}
            emissive={colors.glow}
            emissiveIntensity={colors.emissive}
          />
        </mesh>
      );
    }
  });
  
  return <>{blocks}</>;
}

// Enemies container
function Enemies({ enemies }) {
  const rowColors = ['#ff0066', '#ff6600', '#ffff00', '#00ff66', '#0066ff'];
  
  return (
    <>
      {enemies.map(enemy => (
        <Suspense key={enemy.id} fallback={
          <CubeEnemy position={[enemy.x, enemy.y, enemy.z]} color={rowColors[enemy.row]} />
        }>
          <EnemySprite position={[enemy.x, enemy.y, enemy.z]} row={enemy.row} />
        </Suspense>
      ))}
    </>
  );
}

// Mystery Invader component
function MysteryInvader({ mystery }) {
  if (!mystery) return null;
  
  return (
    <Suspense fallback={
      <mesh position={[mystery.x, mystery.y, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.5} />
      </mesh>
    }>
      <MysterySprite position={[mystery.x, mystery.y, 0]} />
    </Suspense>
  );
}

// Create initial barrier blocks
function createBarrierBlocks() {
  const blocks = [];
  const pattern = [
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,0,0,0,1,1],
  ];
  
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col] === 1) {
        blocks.push({
          x: (col - 3) * 0.7,
          y: (3 - row) * 0.7,
          health: 3
        });
      }
    }
  }
  return blocks;
}

// Create initial enemies for a level
function createEnemies(level) {
  const enemies = [];
  const rows = 5;
  const cols = 11;
  const spacingX = 2.5;
  const spacingY = 2.5;
  const ENEMY_START_Y = 6;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      enemies.push({
        id: `${row}-${col}`,
        x: (col - cols / 2 + 0.5) * spacingX,
        y: ENEMY_START_Y + row * spacingY,
        z: 0,
        row: row,
        originalX: (col - cols / 2 + 0.5) * spacingX,
        originalY: ENEMY_START_Y + row * spacingY,
        isDiving: false,
        divePhase: 0,
        diveProgress: 0
      });
    }
  }
  return enemies;
}

// Get speed multiplier for level
function getLevelSpeed(level) {
  const speeds = [1.0, 1.1, 1.2, 1.35, 1.5, 1.7, 1.9, 2.1, 2.3, 2.5];
  return speeds[Math.min(level - 1, 9)];
}

// Main game component
function Game({ gameState, gameActions }) {
  const { playerX, score, lives, gameOver, gameWon, paused, highScore, gameStarted, level, showLevelUp } = gameState;
  const { setPlayerX, setScore, setLives, setGameOver, setGameWon, setHighScore, setLevel, setShowLevelUp } = gameActions;
  
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [barriers, setBarriers] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [playerHit, setPlayerHit] = useState(false);
  
  // Mystery invader state
  const [mystery, setMystery] = useState(null);
  const [mysterySpawned, setMysterySpawned] = useState(false);
  const [showMysteryIndicator, setShowMysteryIndicator] = useState(false);
  
  // Dive attack state
  const [divingEnemies, setDivingEnemies] = useState([]);
  const lastDiveTime = useRef(0);
  
  const [moveDirection, setMoveDirection] = useState(1);
  const [currentMovingRow, setCurrentMovingRow] = useState(4);
  const [pendingDrop, setPendingDrop] = useState(false);
  const moveTickRef = useRef(0);
  const initialEnemyCount = useRef(55);
  const levelCompleteChecked = useRef(false);
  const gameTimeRef = useRef(0);
  const mysterySpawnTime = useRef(0);
  
  const enemiesRef = useRef([]);
  const bulletsRef = useRef([]);
  
  const playSound = useSound();
  const lastShotTime = useRef(0);
  const playerXRef = useRef(playerX);
  
  const LEFT_BOUNDARY = -14;
  const RIGHT_BOUNDARY = 14;
  const PLAYER_LIMIT = 13;
  const DROP_AMOUNT = 0.6;
  const MOVE_SPEED = 0.6;
  
  const PLAYER_Y = -8;
  const BARRIER_Y = -5;
  
  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);
  
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);
  
  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  // Initialize level
  const initializeLevel = useCallback((lvl) => {
    const newEnemies = createEnemies(lvl);
    setEnemies(newEnemies);
    initialEnemyCount.current = newEnemies.length;
    levelCompleteChecked.current = false;
    setMysterySpawned(false);
    setMystery(null);
    setShowMysteryIndicator(false);
    setDivingEnemies([]);
    lastDiveTime.current = 0;
    gameTimeRef.current = 0;
    
    // Random time for mystery to spawn (between 10-40 seconds into level)
    mysterySpawnTime.current = 10000 + Math.random() * 30000;
    
    setMoveDirection(1);
    setCurrentMovingRow(4);
    setPendingDrop(false);
    moveTickRef.current = 0;
    
    setBullets([]);
    setEnemyBullets([]);
    
    const barrierPositions = [-10, -3.5, 3.5, 10];
    const initialBarriers = barrierPositions.map((x, idx) => ({
      id: idx,
      x: x,
      y: BARRIER_Y,
      blocks: createBarrierBlocks()
    }));
    setBarriers(initialBarriers);
  }, []);

  // Initial setup
  useEffect(() => {
    initializeLevel(level);
  }, []);

  // Check for level complete
  useEffect(() => {
    const aliveEnemies = enemies.filter(e => !e.isDiving || divingEnemies.includes(e.id));
    const totalAlive = aliveEnemies.length;
    
    if (totalAlive === 0 && initialEnemyCount.current > 0 && !levelCompleteChecked.current && !gameOver && !gameWon && gameStarted && !showLevelUp) {
      levelCompleteChecked.current = true;
      
      if (level >= 10) {
        // Game complete!
        setGameWon(true);
        playSound('victory');
      } else {
        // Next level
        setShowLevelUp(true);
        playSound('levelUp');
        
        setTimeout(() => {
          setLevel(l => l + 1);
          setShowLevelUp(false);
          initializeLevel(level + 1);
        }, 2500);
      }
    }
  }, [enemies, divingEnemies, gameOver, gameWon, gameStarted, level, showLevelUp, setGameWon, setLevel, setShowLevelUp, playSound, initializeLevel]);

  const addExplosion = useCallback((x, y, z, color = '#ff6600') => {
    const id = Date.now() + Math.random();
    setExplosions(prev => [...prev, { id, x, y, z, color }]);
  }, []);
  
  const removeExplosion = useCallback((id) => {
    setExplosions(prev => prev.filter(e => e.id !== id));
  }, []);

  const shoot = useCallback(() => {
    if (!gameStarted || showLevelUp) return;
    const now = Date.now();
    if (now - lastShotTime.current < 350) return;
    lastShotTime.current = now;
    
    setBullets(prev => [...prev, {
      id: Date.now(),
      x: playerXRef.current,
      y: PLAYER_Y + 1.5,
      z: 0
    }]);
    playSound('shoot');
  }, [playSound, gameStarted, showLevelUp]);

  useEffect(() => {
    window.gameShoot = shoot;
    return () => { window.gameShoot = null; };
  }, [shoot]);

  // Main game loop
  useEffect(() => {
    if (gameOver || gameWon || paused || !gameStarted || showLevelUp) return;

    const gameLoop = setInterval(() => {
      const currentEnemies = enemiesRef.current;
      const levelSpeed = getLevelSpeed(level);
      
      gameTimeRef.current += 50;
      
      // Mystery invader spawning (once per level)
      if (!mysterySpawned && !mystery && gameTimeRef.current >= mysterySpawnTime.current) {
        const startX = Math.random() > 0.5 ? -18 : 18;
        const targetX = -startX;
        const pathType = Math.floor(Math.random() * 3); // 0: straight, 1: wavy, 2: dive
        
        setMystery({
          x: startX,
          y: 12,
          startX,
          targetX,
          pathType,
          progress: 0,
          lastShot: 0
        });
        setMysterySpawned(true);
        setShowMysteryIndicator(true);
        playSound('mystery');
        
        setTimeout(() => setShowMysteryIndicator(false), 3000);
      }
      
      // Update mystery invader
      if (mystery) {
        setMystery(prev => {
          if (!prev) return null;
          
          let newX = prev.x;
          let newY = prev.y;
          const speed = 0.15;
          
          // Move towards target
          const direction = prev.targetX > prev.startX ? 1 : -1;
          newX += speed * direction;
          
          // Path variations
          if (prev.pathType === 1) {
            // Wavy path
            newY = 12 + Math.sin(prev.progress * 0.1) * 3;
          } else if (prev.pathType === 2) {
            // Dive path
            const midPoint = (prev.startX + prev.targetX) / 2;
            const distFromMid = Math.abs(newX - midPoint);
            const maxDist = Math.abs(prev.targetX - prev.startX) / 2;
            newY = 12 - (1 - distFromMid / maxDist) * 6;
          }
          
          // Mystery shooting
          if (prev.progress - prev.lastShot > 30 && Math.random() < 0.03) {
            setEnemyBullets(eb => [...eb, {
              id: Date.now() + Math.random(),
              x: newX,
              y: newY - 1,
              z: 0,
              isMystery: true
            }]);
            prev.lastShot = prev.progress;
          }
          
          // Check if off screen
          if ((direction > 0 && newX > 20) || (direction < 0 && newX < -20)) {
            return null;
          }
          
          return {
            ...prev,
            x: newX,
            y: newY,
            progress: prev.progress + 1
          };
        });
      }
      
      // Dive attack trigger (random, every 8-15 seconds)
      const now = Date.now();
      if (now - lastDiveTime.current > 8000 + Math.random() * 7000) {
        const nonDivingEnemies = currentEnemies.filter(e => !e.isDiving);
        const row0Enemies = nonDivingEnemies.filter(e => e.row === 4); // Top row
        const row1Enemies = nonDivingEnemies.filter(e => e.row === 3); // Second row
        
        if (row0Enemies.length >= 1 && row1Enemies.length >= 2) {
          // Select 1 from row 0, 2 from row 1
          const leader = row0Enemies[Math.floor(Math.random() * row0Enemies.length)];
          const shuffled = [...row1Enemies].sort(() => Math.random() - 0.5);
          const wingmen = shuffled.slice(0, 2);
          
          const diveIds = [leader.id, ...wingmen.map(w => w.id)];
          setDivingEnemies(diveIds);
          
          setEnemies(prev => prev.map(e => {
            if (diveIds.includes(e.id)) {
              return {
                ...e,
                isDiving: true,
                divePhase: 0,
                diveProgress: 0,
                diveStartX: e.x,
                diveStartY: e.y,
                originalX: e.x,
                originalY: e.y
              };
            }
            return e;
          }));
          
          lastDiveTime.current = now;
          playSound('dive');
        }
      }
      
      // Update diving enemies
      setEnemies(prev => prev.map(e => {
        if (!e.isDiving) return e;
        
        let newX = e.x;
        let newY = e.y;
        let newPhase = e.divePhase;
        let newProgress = e.diveProgress + 0.02 * levelSpeed;
        let stillDiving = true;
        
        const playerTarget = playerXRef.current;
        
        if (e.divePhase === 0) {
          // Diving down towards player
          const targetY = PLAYER_Y + 3;
          const t = Math.min(newProgress, 1);
          const easeT = t * t * (3 - 2 * t); // Smooth step
          
          newX = e.diveStartX + (playerTarget - e.diveStartX) * easeT * 0.7;
          newY = e.diveStartY + (targetY - e.diveStartY) * easeT;
          
          // Shoot during dive
          if (t > 0.3 && t < 0.7 && Math.random() < 0.02) {
            setEnemyBullets(eb => [...eb, {
              id: Date.now() + Math.random(),
              x: newX,
              y: newY - 1,
              z: 0
            }]);
          }
          
          if (newProgress >= 1) {
            newPhase = 1;
            newProgress = 0;
          }
        } else if (e.divePhase === 1) {
          // Returning to original position
          const t = Math.min(newProgress, 1);
          const easeT = t * t * (3 - 2 * t);
          
          newX = e.x + (e.originalX - e.x) * easeT;
          newY = e.y + (e.originalY - e.y) * easeT;
          
          if (newProgress >= 1) {
            stillDiving = false;
            newX = e.originalX;
            newY = e.originalY;
            setDivingEnemies(d => d.filter(id => id !== e.id));
          }
        }
        
        return {
          ...e,
          x: newX,
          y: newY,
          divePhase: newPhase,
          diveProgress: newProgress,
          isDiving: stillDiving
        };
      }));
      
      if (currentEnemies.length === 0) return;
      
      // Regular enemy movement (only non-diving enemies)
      const nonDivingEnemies = currentEnemies.filter(e => !e.isDiving);
      if (nonDivingEnemies.length === 0) return;
      
      const enemiesDestroyed = initialEnemyCount.current - currentEnemies.length;
      const speedBoost = Math.floor(enemiesDestroyed / 20);
      const baseInterval = Math.max(3, 8 - speedBoost);
      const moveInterval = Math.max(2, Math.floor(baseInterval / levelSpeed));
      
      moveTickRef.current++;
      
      if (moveTickRef.current >= moveInterval) {
        moveTickRef.current = 0;
        
        setEnemies(prev => {
          const nonDiving = prev.filter(e => !e.isDiving);
          const diving = prev.filter(e => e.isDiving);
          
          if (nonDiving.length === 0) return prev;
          
          const activeRows = [...new Set(nonDiving.map(e => e.row))].sort((a, b) => b - a);
          if (activeRows.length === 0) return prev;
          
          let rowToMove = currentMovingRow;
          if (!activeRows.includes(rowToMove)) {
            rowToMove = activeRows.find(r => r <= currentMovingRow);
            if (rowToMove === undefined) rowToMove = activeRows[0];
          }
          
          const rowEnemies = nonDiving.filter(e => e.row === rowToMove);
          const otherEnemies = nonDiving.filter(e => e.row !== rowToMove);
          
          if (rowEnemies.length === 0) {
            const nextRowIdx = activeRows.indexOf(rowToMove) + 1;
            if (nextRowIdx < activeRows.length) {
              setCurrentMovingRow(activeRows[nextRowIdx]);
            } else {
              setCurrentMovingRow(activeRows[0]);
            }
            return prev;
          }
          
          const rightMost = Math.max(...rowEnemies.map(e => e.x));
          const leftMost = Math.min(...rowEnemies.map(e => e.x));
          
          let shouldDrop = pendingDrop;
          let triggerDrop = false;
          
          if (moveDirection === 1 && rightMost + MOVE_SPEED >= RIGHT_BOUNDARY) {
            triggerDrop = true;
          } else if (moveDirection === -1 && leftMost - MOVE_SPEED <= LEFT_BOUNDARY) {
            triggerDrop = true;
          }
          
          const movedRowEnemies = rowEnemies.map(e => ({
            ...e,
            x: shouldDrop ? e.x : e.x + (MOVE_SPEED * moveDirection),
            y: shouldDrop ? e.y - DROP_AMOUNT : e.y,
            originalX: shouldDrop ? e.originalX : e.originalX + (MOVE_SPEED * moveDirection),
            originalY: shouldDrop ? e.originalY - DROP_AMOUNT : e.originalY
          }));
          
          playSound('step');
          
          const currentRowIdx = activeRows.indexOf(rowToMove);
          const nextRowIdx = currentRowIdx + 1;
          
          if (nextRowIdx >= activeRows.length) {
            setCurrentMovingRow(activeRows[0]);
            
            if (triggerDrop) {
              setPendingDrop(true);
            } else if (pendingDrop) {
              setPendingDrop(false);
              setMoveDirection(d => -d);
            }
          } else {
            setCurrentMovingRow(activeRows[nextRowIdx]);
            if (triggerDrop && !pendingDrop) {
              setPendingDrop(true);
            }
          }
          
          const newEnemies = [...otherEnemies, ...movedRowEnemies, ...diving];
          
          if (newEnemies.some(e => e.y <= BARRIER_Y && !e.isDiving)) {
            setGameOver(true);
            playSound('gameOver');
          }
          
          return newEnemies;
        });
      }

      // Update bullets
      setBullets(prev => 
        prev
          .map(b => ({ ...b, y: b.y + 0.5 }))
          .filter(b => b.y < 20)
      );

      setEnemyBullets(prev =>
        prev
          .map(b => ({ ...b, y: b.y - 0.3 }))
          .filter(b => b.y > PLAYER_Y - 2)
      );

      // Enemy shooting
      if (Math.random() < 0.012 * levelSpeed) {
        const currentEnemiesForShoot = enemiesRef.current.filter(e => !e.isDiving);
        if (currentEnemiesForShoot.length > 0) {
          const columns = {};
          currentEnemiesForShoot.forEach(e => {
            const col = Math.round(e.x * 10);
            if (!columns[col] || e.y < columns[col].y) {
              columns[col] = e;
            }
          });
          const bottomEnemies = Object.values(columns);
          const shooter = bottomEnemies[Math.floor(Math.random() * bottomEnemies.length)];
          setEnemyBullets(eb => [...eb, {
            id: Date.now() + Math.random(),
            x: shooter.x,
            y: shooter.y - 1,
            z: 0
          }]);
        }
      }

      // Collision detection - player bullets vs enemies
      const currentBullets = bulletsRef.current;
      const currentEnemiesForCollision = enemiesRef.current;
      
      const hitEnemyIds = new Set();
      const hitBulletIds = new Set();
      const explosionsToAdd = [];
      
      for (const bullet of currentBullets) {
        if (hitBulletIds.has(bullet.id)) continue;
        
        // Check mystery hit
        if (mystery) {
          const dx = Math.abs(bullet.x - mystery.x);
          const dy = Math.abs(bullet.y - mystery.y);
          if (dx < 1.5 && dy < 1.5) {
            hitBulletIds.add(bullet.id);
            addExplosion(mystery.x, mystery.y, 0, '#ff00ff');
            playSound('mysteryHit');
            setMystery(null);
            setScore(s => {
              const newScore = s + 1000;
              if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('highScore', newScore.toString());
              }
              return newScore;
            });
            continue;
          }
        }
        
        let hitEnemy = null;
        let closestY = Infinity;
        
        for (const enemy of currentEnemiesForCollision) {
          if (hitEnemyIds.has(enemy.id)) continue;
          
          const dx = Math.abs(bullet.x - enemy.x);
          const dy = Math.abs(bullet.y - enemy.y);
          
          if (dx < 1.2 && dy < 1.2) {
            if (enemy.y < closestY) {
              closestY = enemy.y;
              hitEnemy = enemy;
            }
          }
        }
        
        if (hitEnemy) {
          hitEnemyIds.add(hitEnemy.id);
          hitBulletIds.add(bullet.id);
          explosionsToAdd.push({ x: hitEnemy.x, y: hitEnemy.y, z: hitEnemy.z });
        }
      }
      
      if (hitEnemyIds.size > 0) {
        setEnemies(prev => prev.filter(e => !hitEnemyIds.has(e.id)));
        setBullets(prev => prev.filter(b => !hitBulletIds.has(b.id)));
        setDivingEnemies(prev => prev.filter(id => !hitEnemyIds.has(id)));
        
        explosionsToAdd.forEach(exp => {
          addExplosion(exp.x, exp.y, exp.z, '#ff6600');
          playSound('explosion');
        });
        
        setScore(s => {
          const newScore = s + (hitEnemyIds.size * 10);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('highScore', newScore.toString());
          }
          return newScore;
        });
      } else if (hitBulletIds.size > 0) {
        setBullets(prev => prev.filter(b => !hitBulletIds.has(b.id)));
      }

      // Bullet vs barrier collision
      setBullets(prevBullets => {
        let remaining = [...prevBullets];
        
        setBarriers(prevBarriers => {
          return prevBarriers.map(barrier => {
            const newBlocks = barrier.blocks.map(block => {
              if (block.health <= 0) return block;
              
              const blockX = barrier.x + block.x;
              const blockY = barrier.y + block.y;
              
              const hitBullet = remaining.find(b => 
                Math.abs(b.x - blockX) < 0.5 &&
                Math.abs(b.y - blockY) < 0.5
              );
              
              if (hitBullet) {
                remaining = remaining.filter(b => b.id !== hitBullet.id);
                playSound('barrier');
                return { ...block, health: block.health - 1 };
              }
              return block;
            });
            return { ...barrier, blocks: newBlocks };
          });
        });
        
        return remaining;
      });

      // Enemy bullet vs barrier collision
      setEnemyBullets(prevBullets => {
        let remaining = [...prevBullets];
        
        setBarriers(prevBarriers => {
          return prevBarriers.map(barrier => {
            const newBlocks = barrier.blocks.map(block => {
              if (block.health <= 0) return block;
              
              const blockX = barrier.x + block.x;
              const blockY = barrier.y + block.y;
              
              const hitBullet = remaining.find(b => 
                Math.abs(b.x - blockX) < 0.5 &&
                Math.abs(b.y - blockY) < 0.5
              );
              
              if (hitBullet) {
                remaining = remaining.filter(b => b.id !== hitBullet.id);
                playSound('barrier');
                return { ...block, health: block.health - 1 };
              }
              return block;
            });
            return { ...barrier, blocks: newBlocks };
          });
        });
        
        return remaining;
      });

      // Enemy bullet vs player collision
      setEnemyBullets(prev => {
        const currentPlayerX = playerXRef.current;
        const hit = prev.find(b => 
          Math.abs(b.x - currentPlayerX) < 1 &&
          b.y < PLAYER_Y + 1.5 && b.y > PLAYER_Y - 0.5
        );
        
        if (hit) {
          addExplosion(currentPlayerX, PLAYER_Y, 0, '#ff0000');
          setPlayerHit(true);
          setTimeout(() => setPlayerHit(false), 300);
          
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameOver(true);
              playSound('gameOver');
            } else {
              playSound('playerHit');
            }
            return newLives;
          });
          return prev.filter(b => b.id !== hit.id);
        }
        return prev;
      });

    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameOver, gameWon, paused, gameStarted, showLevelUp, playSound, highScore, moveDirection, currentMovingRow, pendingDrop, level, mystery, mysterySpawned, setGameOver, setScore, setLives, setHighScore, addExplosion]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || gameWon || !gameStarted || showLevelUp) return;
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
          setPlayerX(x => Math.max(x - 0.6, -PLAYER_LIMIT));
          break;
        case 'ArrowRight':
        case 'd':
          setPlayerX(x => Math.min(x + 0.6, PLAYER_LIMIT));
          break;
        case ' ':
          e.preventDefault();
          shoot();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, gameWon, gameStarted, showLevelUp, setPlayerX, shoot]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 15, 15]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, 5, 10]} intensity={0.8} color="#00ffff" />
      <pointLight position={[10, 5, 10]} intensity={0.8} color="#ff00ff" />
      <directionalLight position={[0, 10, 10]} intensity={0.6} />
      
      <Player position={[playerX, PLAYER_Y, 0]} isHit={playerHit} />
      <Enemies enemies={enemies} />
      <MysteryInvader mystery={mystery} />
      
      {barriers.map(barrier => (
        <Barrier key={barrier.id} barrier={barrier} />
      ))}
      
      {bullets.map(bullet => (
        <Bullet key={bullet.id} position={[bullet.x, bullet.y, bullet.z]} isEnemy={false} />
      ))}
      
      {enemyBullets.map(bullet => (
        <Bullet key={bullet.id} position={[bullet.x, bullet.y, bullet.z]} isEnemy={true} />
      ))}
      
      {explosions.map(exp => (
        <Explosion 
          key={exp.id} 
          position={[exp.x, exp.y, exp.z]} 
          color={exp.color}
          onComplete={() => removeExplosion(exp.id)} 
        />
      ))}
    </>
  );
}

// Main App
export default function App() {
  const [playerX, setPlayerX] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('highScore') || '0');
  });

  const restart = () => window.location.reload();
  
  const startGame = () => {
    setGameStarted(true);
  };

  const gameState = { playerX, score, lives, gameOver, gameWon, paused, highScore, gameStarted, level, showLevelUp };
  const gameActions = { setPlayerX, setScore, setLives, setGameOver, setGameWon, setHighScore, setLevel, setShowLevelUp };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(to bottom, #000011, #000033)', touchAction: 'none' }}>
      
      {/* Start Screen */}
      {!gameStarted && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,20,0.95)',
          zIndex: 300
        }}>
          <h1 style={{ 
            color: '#0ff', 
            fontFamily: 'monospace', 
            fontSize: '42px',
            textShadow: '0 0 20px #0ff, 0 0 40px #0ff',
            textAlign: 'center',
            marginBottom: '10px'
          }}>👾 SPACE INVADERS 👾</h1>
          <p style={{ 
            color: '#ff0', 
            fontFamily: 'monospace', 
            fontSize: '18px',
            textAlign: 'center',
            marginBottom: '30px'
          }}>3D EDITION - 10 LEVELS</p>
          
          <div style={{ color: '#aaa', fontFamily: 'monospace', fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
            <p>🎮 PC: Arrow keys / WASD to move, SPACE to shoot</p>
            <p>📱 Mobile: Use on-screen buttons</p>
            <p style={{ color: '#f0f', marginTop: '10px' }}>👾 Watch for the MYSTERY INVADER - 1000 PTS!</p>
          </div>
          
          {highScore > 0 && (
            <p style={{ color: '#f0f', fontFamily: 'monospace', fontSize: '16px', marginBottom: '20px' }}>
              🏆 High Score: {highScore}
            </p>
          )}
          
          <button
            onClick={startGame}
            style={{
              padding: '20px 50px',
              fontSize: '24px',
              fontFamily: 'monospace',
              background: 'linear-gradient(to bottom, #00ffff, #0088ff)',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '15px',
              boxShadow: '0 0 30px #0ff',
              animation: 'pulse 1.5s infinite'
            }}
          >▶ START GAME</button>
        </div>
      )}
      
      {/* HUD */}
      {gameStarted && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: '#0ff',
          fontFamily: 'monospace',
          fontSize: '18px',
          zIndex: 100,
          textShadow: '0 0 10px #0ff, 0 0 20px #0ff'
        }}>
          <div>LEVEL: {level}</div>
          <div>SCORE: {score}</div>
          <div>HIGH: {highScore}</div>
          <div>LIVES: {'💎'.repeat(lives)}</div>
        </div>
      )}

      {/* Mystery Indicator */}
      {gameStarted && gameState.showMysteryIndicator && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff00ff',
          fontFamily: 'monospace',
          fontSize: '32px',
          textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
          zIndex: 150,
          animation: 'pulse 0.5s infinite',
          pointerEvents: 'none'
        }}>⚠️ MYSTERY INVADER! 1000 PTS ⚠️</div>
      )}

      {/* Pause button */}
      {gameStarted && !gameOver && !gameWon && !showLevelUp && (
        <button
          onClick={() => setPaused(p => !p)}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0,255,255,0.2)',
            border: '2px solid #0ff',
            color: '#0ff',
            padding: '10px 15px',
            fontFamily: 'monospace',
            fontSize: '16px',
            cursor: 'pointer',
            zIndex: 100,
            borderRadius: '10px',
            boxShadow: '0 0 10px #0ff'
          }}
        >
          {paused ? '▶️' : '⏸️'}
        </button>
      )}
      
      {/* Paused overlay */}
      {paused && gameStarted && !gameOver && !gameWon && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#0ff',
          fontFamily: 'monospace',
          fontSize: '36px',
          textShadow: '0 0 20px #0ff',
          zIndex: 150
        }}>⏸️ PAUSED</div>
      )}

      {/* Level Up overlay */}
      {showLevelUp && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,40,0.9)',
          zIndex: 200
        }}>
          <h1 style={{ 
            color: '#0ff', 
            fontFamily: 'monospace', 
            fontSize: '48px',
            textShadow: '0 0 20px #0ff, 0 0 40px #0ff',
            animation: 'pulse 0.5s infinite'
          }}>🎉 LEVEL {level} COMPLETE! 🎉</h1>
          <p style={{ color: '#ff0', fontFamily: 'monospace', fontSize: '28px', marginTop: '20px' }}>
            GET READY FOR LEVEL {level + 1}!
          </p>
          <p style={{ color: '#f0f', fontFamily: 'monospace', fontSize: '20px', marginTop: '10px' }}>
            Speed: {Math.round(getLevelSpeed(level + 1) * 100)}%
          </p>
        </div>
      )}

      {/* Victory overlay */}
      {gameWon && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,20,0.9)',
          zIndex: 200
        }}>
          <h1 style={{ 
            color: '#0ff', 
            fontFamily: 'monospace', 
            fontSize: '48px',
            textShadow: '0 0 20px #0ff, 0 0 40px #0ff, 0 0 60px #00ffff',
            animation: 'pulse 1s infinite'
          }}>🎉 VICTORY! 🎉</h1>
          <p style={{ color: '#ff0', fontFamily: 'monospace', fontSize: '28px', marginTop: '10px', textShadow: '0 0 10px #ff0' }}>
            ALL 10 LEVELS COMPLETE!
          </p>
          <p style={{ color: '#0ff', fontFamily: 'monospace', fontSize: '24px', marginTop: '20px' }}>
            Final Score: {score}
          </p>
          {score >= highScore && score > 0 && (
            <p style={{ color: '#f0f', fontFamily: 'monospace', fontSize: '20px', marginTop: '10px', textShadow: '0 0 15px #f0f' }}>
              🏆 NEW HIGH SCORE! 🏆
            </p>
          )}
          <button
            onClick={restart}
            style={{
              marginTop: '30px',
              padding: '15px 30px',
              fontSize: '20px',
              fontFamily: 'monospace',
              background: 'linear-gradient(to bottom, #00ffff, #0088ff)',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '15px',
              boxShadow: '0 0 20px #0ff'
            }}
          >PLAY AGAIN</button>
        </div>
      )}

      {/* Game Over overlay */}
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(20,0,0,0.9)',
          zIndex: 200
        }}>
          <h1 style={{ color: '#f00', fontFamily: 'monospace', fontSize: '48px', textShadow: '0 0 20px #f00' }}>GAME OVER</h1>
          <p style={{ color: '#0ff', fontFamily: 'monospace', fontSize: '24px' }}>Level: {level}</p>
          <p style={{ color: '#0ff', fontFamily: 'monospace', fontSize: '24px' }}>Score: {score}</p>
          <button
            onClick={restart}
            style={{
              marginTop: '20px',
              padding: '15px 30px',
              fontSize: '20px',
              fontFamily: 'monospace',
              background: 'linear-gradient(to bottom, #ff4444, #cc0000)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '15px',
              boxShadow: '0 0 15px #f00'
            }}
          >RESTART</button>
        </div>
      )}

      {/* Touch controls */}
      {gameStarted && !gameOver && !gameWon && !showLevelUp && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.max(x - 0.6, -13)); }}
              onMouseDown={() => setPlayerX(x => Math.max(x - 0.6, -13))}
              style={{
                width: '70px',
                height: '70px',
                fontSize: '30px',
                background: 'linear-gradient(to bottom, rgba(0,255,255,0.4), rgba(0,150,255,0.3))',
                border: '2px solid #0ff',
                color: '#0ff',
                borderRadius: '50%',
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: '0 0 15px #0ff'
              }}
            >◀</button>
            <button
              onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.min(x + 0.6, 13)); }}
              onMouseDown={() => setPlayerX(x => Math.min(x + 0.6, 13))}
              style={{
                width: '70px',
                height: '70px',
                fontSize: '30px',
                background: 'linear-gradient(to bottom, rgba(0,255,255,0.4), rgba(0,150,255,0.3))',
                border: '2px solid #0ff',
                color: '#0ff',
                borderRadius: '50%',
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: '0 0 15px #0ff'
              }}
            >▶</button>
          </div>
          <button
            onTouchStart={(e) => { e.preventDefault(); if(window.gameShoot) window.gameShoot(); }}
            onMouseDown={() => { if(window.gameShoot) window.gameShoot(); }}
            style={{
              width: '90px',
              height: '70px',
              fontSize: '24px',
              background: 'linear-gradient(to bottom, rgba(255,100,100,0.5), rgba(255,0,100,0.4))',
              border: '2px solid #f0f',
              color: '#fff',
              borderRadius: '35px',
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: '0 0 15px #f0f'
            }}
          >🔥</button>
        </div>
      )}

      <Canvas camera={{ position: [0, 2, 30], fov: 50 }}>
        <Suspense fallback={null}>
          <Game gameState={gameState} gameActions={gameActions} />
        </Suspense>
      </Canvas>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
