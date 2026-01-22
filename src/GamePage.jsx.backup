import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TurnTransition from './components/TurnTransition';
import { useGame } from './context/GameContext';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { 
  subscribeToGame, 
  updatePlayerState, 
  updateGameState, 
  finishPlayerTurn,
  getGameState 
} from './firebase';

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

// Enemy sprite using PNG texture with fallback
function EnemySprite({ position, row }) {
  const [texture, setTexture] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // Detect if we're on localhost (dev) or production
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const BASE = (isLocalhost || window.location.hostname.includes('spaceinvaders.earth') || window.location.hostname.includes('vercel.app')) ? '/' : '/3dinvaders/';
  const textureFiles = [
    `${BASE}five.png`,
    `${BASE}four.png`,
    `${BASE}three.png`,
    `${BASE}two.png`,
    `${BASE}one.png`
  ];

  const texturePath = textureFiles[row] || textureFiles[0];

  useEffect(() => {
    console.log('EnemySprite: isLocalhost=', isLocalhost, 'BASE=', BASE, 'Loading:', texturePath);
    const loader = new THREE.TextureLoader();
    loader.load(
      texturePath,
      (loadedTexture) => {
        console.log('EnemySprite: Texture loaded OK:', texturePath);
        setTexture(loadedTexture);
      },
      undefined,
      (err) => {
        console.error('EnemySprite: FAILED to load:', texturePath, err);
        setLoadFailed(true);
      }
    );
  }, [texturePath]);

  // Fallback to colored sphere if texture fails or still loading
  if (loadFailed) {
    const colors = ['#ff0000', '#ff6600', '#ffff00', '#00ff00', '#00ffff'];
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color={colors[row] || colors[0]}
          metalness={0.9}
          roughness={0.1}
          emissive={colors[row] || colors[0]}
          emissiveIntensity={0.3}
        />
      </mesh>
    );
  }

  if (!texture) {
    // Still loading - show placeholder
    return (
      <mesh position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#333333" wireframe />
      </mesh>
    );
  }

  return (
    <sprite position={position} scale={[2.2, 2.2, 1]}>
      <spriteMaterial map={texture} transparent />
    </sprite>
  );
}

// Mystery invader sprite with fallback
function MysterySprite({ position }) {
  const [texture, setTexture] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // Detect if we're on localhost (dev) or production
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const BASE = (isLocalhost || window.location.hostname.includes('spaceinvaders.earth') || window.location.hostname.includes('vercel.app')) ? '/' : '/3dinvaders/';
  const texturePath = `${BASE}mystery.png`;

  useEffect(() => {
    console.log('MysterySprite: Loading texture from:', texturePath);
    const loader = new THREE.TextureLoader();
    loader.load(
      texturePath,
      (loadedTexture) => {
        console.log('MysterySprite: Texture loaded OK');
        setTexture(loadedTexture);
      },
      undefined,
      (err) => {
        console.error('MysterySprite: FAILED to load:', texturePath, err);
        setLoadFailed(true);
      }
    );
  }, [texturePath]);

  if (loadFailed || !texture) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial
          color="#ff00ff"
          metalness={0.9}
          roughness={0.1}
          emissive="#ff00ff"
          emissiveIntensity={0.5}
        />
      </mesh>
    );
  }

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
        diveProgress: 0,
        isLeader: false
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

// Animated Starfield Background - using drei's Stars component
function Starfield() {
  return (
    <Stars 
      radius={50} 
      depth={50} 
      count={500} 
      factor={4} 
      saturation={0} 
      fade 
      speed={1}
    />
  );
}

function Game({ gameState, gameActions, gameMode, handleMultiplayerTurnEnd, currentPlayerTurn }) {
  const { playerX, score, lives, gameOver, gameWon, paused, highScore, gameStarted, level, showLevelUp, showMysteryIndicator, currentDiveIds, shotsFired, shotsHit } = gameState;
  const { setPlayerX, setScore, setLives, setGameOver, setGameWon, setHighScore, setLevel, setShowLevelUp, setShowMysteryIndicator, setShotsFired, setShotsHit, setDiveKillCount, setCurrentDiveIds, setShowTopGunBonus } = gameActions;
  
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [barriers, setBarriers] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [playerHit, setPlayerHit] = useState(false);
  
  // Mystery invader state
  const [mystery, setMystery] = useState(null);
  const [mysterySpawned, setMysterySpawned] = useState(false);
  // showMysteryIndicator moved to App component
  
  // Dive attack state
  const [divingEnemies, setDivingEnemies] = useState([]);
  const [diveDirection, setDiveDirection] = useState(1); // 1 = start left go right, -1 = start right go left
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
  const PLAYER_LIMIT = 15;
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
            setShotsHit(prev => prev + 1);
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

  // Initial setup - reinitialize when level or player turn changes
  useEffect(() => {
    initializeLevel(level);
  }, [level, currentPlayerTurn]);

  // Check for level complete
  useEffect(() => {
    const aliveEnemies = enemies.filter(e => !e.isDiving || divingEnemies.includes(e.id));
    const totalAlive = enemies.length;
    
    if (totalAlive === 0 && initialEnemyCount.current > 0 && !levelCompleteChecked.current && !gameOver && !gameWon && gameStarted && !showLevelUp) {
      levelCompleteChecked.current = true;
      
      if (level >= 10) {
        // Game complete!
        setGameWon(true);
        playSound('victory');
        // Multiplayer: trigger turn end on victory
        if (gameMode === 'local' || gameMode === 'remote') {
          setTimeout(() => {
            handleMultiplayerTurnEnd({
              levelCompleted: true,
              score: score,
              level: level,
              lives: lives,
              gameOver: false,
              victory: true,
              shotsFired: shotsFired,
              shotsHit: shotsHit,
              reason: 'victory'
            });
          }, 1500);
        }
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
    setShotsFired(prev => prev + 1);
  }, [playSound, gameStarted, showLevelUp, setShotsFired]);

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
      
      // Dive attack trigger (random, every 10-18 seconds)
      const now = Date.now();
      if (divingEnemies.length === 0 && now - lastDiveTime.current > 10000 + Math.random() * 8000) {
        const nonDivingEnemies = currentEnemies.filter(e => !e.isDiving);
        const row0Enemies = nonDivingEnemies.filter(e => e.row === 4); // Top row (row 4 is highest)
        const row1Enemies = nonDivingEnemies.filter(e => e.row === 3); // Second row
        
        if (row0Enemies.length >= 1 && row1Enemies.length >= 2) {
          // Select 1 from row 0 (leader), 2 from row 1 (wingmen)
          const leader = row0Enemies[Math.floor(Math.random() * row0Enemies.length)];
          const shuffled = [...row1Enemies].sort(() => Math.random() - 0.5);
          const wingmen = shuffled.slice(0, 2);
          
          const diveIds = [leader.id, ...wingmen.map(w => w.id)];
          
          // Randomly choose direction: start from left or right
          const newDiveDirection = Math.random() > 0.5 ? 1 : -1;
          setDiveDirection(newDiveDirection);
          setDivingEnemies(diveIds);
          setCurrentDiveIds(diveIds);
          setDiveKillCount(0);
          
          // Set up dive parameters for each enemy
          // Phase 0: Move to staging position (top corner)
          // Phase 1: Swoop diagonally across screen
          // Phase 2: Return to original position
          const stagingX = newDiveDirection === 1 ? -16 : 16; // Start from opposite side
          const stagingY = 18; // High up
          
          setEnemies(prev => prev.map(e => {
            if (diveIds.includes(e.id)) {
              const isLeader = e.id === leader.id;
              // Formation offsets: leader in front, wingmen behind
              const formationOffsetX = isLeader ? 0 : (e.id === wingmen[0].id ? -1.5 : 1.5);
              const formationOffsetY = isLeader ? 0 : -2; // Wingmen behind leader
              
              return {
                ...e,
                isDiving: true,
                isLeader: isLeader,
                divePhase: 0,
                diveProgress: 0,
                diveStartX: e.x,
                diveStartY: e.y,
                originalX: e.x,
                originalY: e.y,
                stagingX: stagingX + formationOffsetX,
                stagingY: stagingY + formationOffsetY,
                formationOffsetX,
                formationOffsetY,
                diveDirection: newDiveDirection,
                returnStartX: e.x,  // Initialize to prevent undefined
                returnStartY: e.y   // Initialize to prevent undefined
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
        let newProgress = e.diveProgress + 0.012; // Slower for more time to shoot
        let stillDiving = true;
        
        if (e.divePhase === 0) {
          // Phase 0: Move to staging position (top corner)
          const t = Math.min(newProgress, 1);
          const easeT = t * t * (3 - 2 * t); // Smooth step
          
          newX = e.diveStartX + (e.stagingX - e.diveStartX) * easeT;
          newY = e.diveStartY + (e.stagingY - e.diveStartY) * easeT;
          
          if (newProgress >= 1) {
            newPhase = 1;
            newProgress = 0;
          }
        } else if (e.divePhase === 1) {
          // Phase 1: Swoop diagonally across screen
          const t = Math.min(newProgress, 1);
          const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // Ease in-out
          
          // Diagonal swoop from staging to opposite bottom corner
          const endX = -e.stagingX; // Opposite side
          const endY = 3; // Stop above barriers (barriers are at y=0)
          
          // Add arc to the path
          const arcHeight = 4;
          const arc = Math.sin(t * Math.PI) * arcHeight;
          
          newX = e.stagingX + (endX - e.stagingX) * easeT;
          newY = e.stagingY + (endY - e.stagingY) * easeT + arc;
          
          // Shoot during swoop (middle portion)
          if (t > 0.2 && t < 0.8 && Math.random() < 0.015) {
            setEnemyBullets(eb => [...eb, {
              id: Date.now() + Math.random(),
              x: newX,
              y: newY - 1,
              z: 0
            }]);
          }
          
          if (newProgress >= 1) {
            newPhase = 2;
            newProgress = 0;
            // Store current position for return journey
            e.returnStartX = newX;
            e.returnStartY = newY;
          }
        } else if (e.divePhase === 2) {
          // Phase 2: Return to original position
          const t = Math.min(newProgress, 1);
          const easeT = t * t * (3 - 2 * t);
          
          const startX = e.returnStartX || newX;
          const startY = e.returnStartY || newY;
          
          newX = startX + (e.originalX - startX) * easeT;
          newY = startY + (e.originalY - startY) * easeT;
          
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
          isDiving: stillDiving,
          returnStartX: e.divePhase === 1 && newPhase === 2 ? newX : e.returnStartX,
          returnStartY: e.divePhase === 1 && newPhase === 2 ? newY : e.returnStartY
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
            // Multiplayer: trigger turn end on game over
            if (gameMode === 'local' || gameMode === 'remote') {
              setTimeout(() => {
                handleMultiplayerTurnEnd({
                  levelCompleted: false,
                  score: score,
                  level: level,
                  lives: 0,
                  gameOver: true,
                  victory: false,
                  shotsFired: shotsFired,
                  shotsHit: shotsHit,
                  reason: 'barrier'
                });
              }, 1500);
            }
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
            setShotsHit(prev => prev + 1);
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
        setShotsHit(prev => prev + hitEnemyIds.size);
        
        // Check for diving enemy kills and TOP GUN bonus
        const currentDiveIdsNow = currentDiveIds;
        const diveKillsThisFrame = [...hitEnemyIds].filter(id => currentDiveIdsNow.includes(id)).length;
        if (diveKillsThisFrame > 0) {
          setDiveKillCount(prev => {
            const newCount = prev + diveKillsThisFrame;
            if (newCount >= 3) {
              // All 3 diving enemies killed - award TOP GUN bonus!
              setScore(s => {
                const bonusScore = s + 500;
                if (bonusScore > highScore) {
                  setHighScore(bonusScore);
                  localStorage.setItem("highScore", bonusScore.toString());
                }
                return bonusScore;
              });
              setShowTopGunBonus(true);
              playSound("victory");
              setTimeout(() => setShowTopGunBonus(false), 2000);
              setCurrentDiveIds([]);
            }
            return newCount;
          });
        }
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
              // Multiplayer: trigger turn end on game over
              if (gameMode === 'local' || gameMode === 'remote') {
                setTimeout(() => {
                  handleMultiplayerTurnEnd({
                    levelCompleted: false,
                    score: score,
                    level: level,
                    lives: 0,
                    gameOver: true,
                    victory: false,
                    shotsFired: shotsFired,
                    shotsHit: shotsHit,
                    reason: 'lives'
                  });
                }, 1500);
              }
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
  }, [gameOver, gameWon, paused, gameStarted, showLevelUp, playSound, highScore, moveDirection, currentMovingRow, pendingDrop, level, mystery, mysterySpawned, divingEnemies, setGameOver, setScore, setLives, setHighScore, addExplosion]);

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
export default function GamePage() {
  console.log('App component loaded!');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get game mode and player names from URL
  const gameMode = searchParams.get('mode') || 'solo';
  const player1Name = decodeURIComponent(searchParams.get('p1') || 'Player 1');
  const player2Name = decodeURIComponent(searchParams.get('p2') || 'Player 2');
  const urlRounds = parseInt(searchParams.get('rounds')) || 3;
  
  // Remote multiplayer params
  const gameCode = searchParams.get('code') || '';
  const playerNum = parseInt(searchParams.get('pnum')) || 1;

  // Multiplayer state
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(urlRounds);  // Configurable number of rounds from URL
  const [player1Stats, setPlayer1Stats] = useState({
    totalScore: 0,
    roundScores: [],  // Array of scores for each round
    currentRoundFinished: false,
    accuracy: 0,
    shotsFired: 0,
    shotsHit: 0
  });
  const [player2Stats, setPlayer2Stats] = useState({
    totalScore: 0,
    roundScores: [],  // Array of scores for each round
    currentRoundFinished: false,
    accuracy: 0,
    shotsFired: 0,
    shotsHit: 0
  });
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  
  // Remote multiplayer state
  const [remoteGameData, setRemoteGameData] = useState(null);
  const [opponentStatus, setOpponentStatus] = useState('waiting');
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [transitionData, setTransitionData] = useState(null);
  const [multiplayerGameFinished, setMultiplayerGameFinished] = useState(false);

  const [playerX, setPlayerX] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showMysteryIndicator, setShowMysteryIndicator] = useState(false);
  const [showTopGunBonus, setShowTopGunBonus] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('highScore') || '0');
  });
  const [shotsFired, setShotsFired] = useState(0);
  const [shotsHit, setShotsHit] = useState(0);
  const [topScores, setTopScores] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('topScores') || '[]');
    } catch { return []; }
  });
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [diveKillCount, setDiveKillCount] = useState(0);
  const [currentDiveIds, setCurrentDiveIds] = useState([]);

  // Remote multiplayer waiting overlay component
  const RemoteWaitingOverlay = () => {
    if (gameMode !== 'remote' || !waitingForOpponent) return null;

    const opponent = playerNum === 1 ? player2Name : player1Name;
    const opponentData = remoteGameData ?
      (playerNum === 1 ? remoteGameData.player2 : remoteGameData.player1) : null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,20,0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500
      }}>
        <h2 style={{
          color: '#f0f',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '24px',
          textShadow: '0 0 20px #f0f',
          marginBottom: '30px'
        }}>⏳ WAITING FOR OPPONENT</h2>

        <p style={{
          color: '#0ff',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '16px',
          marginBottom: '20px'
        }}>{opponent || 'Opponent'} is playing...</p>

        {opponentData && (
          <div style={{
            color: '#aaa',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <p>Their Score: {opponentData.totalScore || 0}</p>
          </div>
        )}

        <p style={{
          color: '#888',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '12px',
          marginTop: '30px'
        }}>Room Code: {gameCode}</p>
      </div>
    );
  };

  // Firebase subscription for remote multiplayer
  useEffect(() => {
    if (gameMode !== 'remote' || !gameCode) return;

    console.log('Setting up Firebase subscription for game:', gameCode);

    const unsubscribe = subscribeToGame(gameCode, (gameData) => {
      console.log('Firebase game data update:', gameData);
      setRemoteGameData(gameData);

      if (!gameData) return;

      // Check if opponent has joined
      const opponent = playerNum === 1 ? gameData.player2 : gameData.player1;
      if (opponent && opponent.name) {
        setOpponentStatus('joined');
      }

      // Determine if it's my turn
      const currentTurn = gameData.currentTurn || 1;
      const myTurn = currentTurn === playerNum;
      setIsMyTurn(myTurn);

      // If opponent finished their turn, update their stats and show transition
      if (!myTurn && gameData.currentTurn !== playerNum) {
        setWaitingForOpponent(false);
      } else if (myTurn && waitingForOpponent) {
        // It's now my turn after waiting
        setWaitingForOpponent(false);

        // Update opponent stats from Firebase
        const opponentStats = playerNum === 1 ? gameData.player2 : gameData.player1;
        if (opponentStats) {
          if (playerNum === 1) {
            setPlayer2Stats(prev => ({
              ...prev,
              totalScore: opponentStats.totalScore || 0,
              roundScores: opponentStats.roundScores || []
            }));
          } else {
            setPlayer1Stats(prev => ({
              ...prev,
              totalScore: opponentStats.totalScore || 0,
              roundScores: opponentStats.roundScores || []
            }));
          }
        }
      }

      // Check if game is finished
      if (gameData.status === 'finished') {
        setMultiplayerGameFinished(true);
      }
    });

    return () => unsubscribe();
  }, [gameMode, gameCode, playerNum]);

  // For remote mode: only start game if it's my turn
  useEffect(() => {
    if (gameMode !== 'remote') return;

    // Player 1 starts first, Player 2 waits
    if (playerNum === 2 && !remoteGameData?.currentTurn) {
      setWaitingForOpponent(true);
    } else if (playerNum === 1) {
      setIsMyTurn(true);
    }
  }, [gameMode, playerNum, remoteGameData]);


  const restart = () => {
    if (gameMode === 'local') {
      navigate('/');
    } else {
      window.location.reload();
    }
  };

  // Multiplayer: Handle turn end (level complete or game over)
  const handleMultiplayerTurnEnd = useCallback((result) => {
    if (gameMode !== 'local' && gameMode !== 'remote') return;
    
    // Handle remote mode
    if (gameMode === 'remote') {
      const { score, level, reason } = result;
      
      console.log('Remote turn end:', { score, level, reason, playerNum });
      
      // Update my score in Firebase
      const myStats = playerNum === 1 ? player1Stats : player2Stats;
      const newRoundScores = [...myStats.roundScores, score];
      const newTotalScore = myStats.totalScore + score;
      
      // Update Firebase with my final score
      finishPlayerTurn(gameCode, playerNum, newTotalScore, newRoundScores);
      
      // Switch turn to opponent
      updateGameState(gameCode, {
        currentTurn: playerNum === 1 ? 2 : 1
      });
      
      // Update local stats
      if (playerNum === 1) {
        setPlayer1Stats(prev => ({
          ...prev,
          totalScore: newTotalScore,
          roundScores: newRoundScores
        }));
      } else {
        setPlayer2Stats(prev => ({
          ...prev,
          totalScore: newTotalScore,
          roundScores: newRoundScores
        }));
      }
      
      // Show waiting overlay and reset game state
      setWaitingForOpponent(true);
      setIsMyTurn(false);
      setGameOver(false);
      setGameWon(false);
      setGameStarted(false);
      
      return;
    }

    const accuracy = result.shotsFired > 0 ? Math.round((result.shotsHit / result.shotsFired) * 100) : 0;
    const roundScore = result.score;

    // Update current player's stats
    if (currentPlayerTurn === 1) {
      setPlayer1Stats(prev => ({
        ...prev,
        totalScore: prev.totalScore + roundScore,
        roundScores: [...prev.roundScores, roundScore],
        currentRoundFinished: true,
        accuracy: accuracy,
        shotsFired: prev.shotsFired + result.shotsFired,
        shotsHit: prev.shotsHit + result.shotsHit
      }));
    } else {
      setPlayer2Stats(prev => ({
        ...prev,
        totalScore: prev.totalScore + roundScore,
        roundScores: [...prev.roundScores, roundScore],
        currentRoundFinished: true,
        accuracy: accuracy,
        shotsFired: prev.shotsFired + result.shotsFired,
        shotsHit: prev.shotsHit + result.shotsHit
      }));
    }

    // Determine next action
    const otherPlayerFinishedThisRound = currentPlayerTurn === 1 
      ? player2Stats.roundScores.length >= currentRound 
      : player1Stats.roundScores.length >= currentRound;

    let transData;

    if (currentPlayerTurn === 1) {
      // Player 1 just finished, switch to Player 2 for same round
      transData = {
        currentPlayer: 1,
        currentPlayerName: player1Name,
        nextPlayer: 2,
        nextPlayerName: player2Name,
        roundScore: roundScore,
        currentRound: currentRound,
        totalRounds: totalRounds,
        player1TotalScore: (player1Stats.totalScore || 0) + roundScore,
        player2TotalScore: player2Stats.totalScore || 0,
        isFinalResult: false
      };
    } else {
      // Player 2 just finished this round
      const p1Total = player1Stats.totalScore || 0;
      const p2Total = (player2Stats.totalScore || 0) + roundScore;

      if (currentRound >= totalRounds) {
        // All rounds complete - show final results
        transData = {
          currentPlayer: 2,
          currentPlayerName: player2Name,
          nextPlayer: null,
          nextPlayerName: null,
          roundScore: roundScore,
          currentRound: currentRound,
          totalRounds: totalRounds,
          player1TotalScore: p1Total,
          player2TotalScore: p2Total,
          player1RoundScores: player1Stats.roundScores,
          player2RoundScores: [...player2Stats.roundScores, roundScore],
          player1Name: player1Name,
          player2Name: player2Name,
          isFinalResult: true
        };
      } else {
        // Move to next round, Player 1 starts
        transData = {
          currentPlayer: 2,
          currentPlayerName: player2Name,
          nextPlayer: 1,
          nextPlayerName: player1Name,
          roundScore: roundScore,
          currentRound: currentRound,
          totalRounds: totalRounds,
          player1TotalScore: p1Total,
          player2TotalScore: p2Total,
          nextRound: currentRound + 1,
          isFinalResult: false
        };
      }
    }

    setTransitionData(transData);
    setShowTurnTransition(true);
  }, [gameMode, currentPlayerTurn, currentRound, totalRounds, player1Stats, player2Stats, player1Name, player2Name, playerNum, gameCode]);

  const confirmTurnTransition = useCallback(() => {
    if (transitionData?.isFinalResult) {
      setShowTurnTransition(false);
      setMultiplayerGameFinished(true);
      return;
    }

    const nextPlayer = transitionData?.nextPlayer || (currentPlayerTurn === 1 ? 2 : 1);
    const nextRound = transitionData?.nextRound || currentRound;

    setCurrentPlayerTurn(nextPlayer);

    // If advancing to next round, update round counter and reset both players' round status
    if (nextRound > currentRound) {
      setCurrentRound(nextRound);
      setPlayer1Stats(prev => ({ ...prev, currentRoundFinished: false }));
      setPlayer2Stats(prev => ({ ...prev, currentRoundFinished: false }));
    }

    // Start fresh for the next player's turn at the current round's level
    setScore(0);
    setLives(3);
    setLevel(nextRound);  // Level matches the round number
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);
    setShotsFired(0);
    setShotsHit(0);
    setShowTurnTransition(false);
    setTransitionData(null);
  }, [transitionData, currentPlayerTurn, currentRound]);

  const handleRematch = useCallback(() => {
    setCurrentPlayerTurn(1);
    setCurrentRound(1);
    setPlayer1Stats({ totalScore: 0, roundScores: [], currentRoundFinished: false, accuracy: 0, shotsFired: 0, shotsHit: 0 });
    setPlayer2Stats({ totalScore: 0, roundScores: [], currentRoundFinished: false, accuracy: 0, shotsFired: 0, shotsHit: 0 });
    setMultiplayerGameFinished(false);
    setShowTurnTransition(false);
    setTransitionData(null);
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    setShotsFired(0);
    setShotsHit(0);
  }, []);
  
  const startGame = () => {
    console.log('START GAME CLICKED!');
    setGameStarted(true);
  };

  const gameState = { playerX, score, lives, gameOver, gameWon, paused, highScore, gameStarted, level, showLevelUp, showMysteryIndicator, shotsFired, shotsHit, diveKillCount, currentDiveIds, showTopGunBonus };
  const gameActions = { setPlayerX, setScore, setLives, setGameOver, setGameWon, setHighScore, setLevel, setShowLevelUp, setShowMysteryIndicator, setShotsFired, setShotsHit, setDiveKillCount, setCurrentDiveIds, setShowTopGunBonus };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(to bottom, #000011, #000033)', touchAction: 'none' }}>
      
            {/* Multiplayer Turn Transition */}
      {(gameMode === 'local' || gameMode === 'remote') && showTurnTransition && (
        <TurnTransition
          transitionData={transitionData}
          player1Stats={player1Stats}
          player2Stats={player2Stats}
          player1Name={player1Name}
          player2Name={player2Name}
          onContinue={confirmTurnTransition}
          onPlayAgain={handleRematch}
          onMainMenu={() => navigate('/')}
        />
      )}

      {/* Remote Multiplayer Waiting Overlay */}
      {gameMode === 'remote' && waitingForOpponent && <RemoteWaitingOverlay />}

      {/* Start Screen */}
      {!gameStarted && !(gameMode === 'remote' && waitingForOpponent) && (
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
            fontFamily: "'Press Start 2P', monospace", 
            fontSize: '42px',
            textShadow: '0 0 20px #0ff, 0 0 40px #0ff',
            textAlign: 'center',
            marginBottom: '10px'
          }}>SpaceInvaders.Earth</h1>
          <p style={{ 
            color: '#ff0', 
            fontFamily: "'Press Start 2P', monospace", 
            fontSize: '18px',
            textAlign: 'center',
            marginBottom: '30px'
          }}>3D EDITION - 10 LEVELS</p>
          
          <div style={{ color: '#aaa', fontFamily: "'Press Start 2P', monospace", fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
            <p>🎮 PC: Arrow keys / WASD to move, SPACE to shoot</p>
            <p>📱 Mobile: Use on-screen buttons</p>
            <p style={{ color: '#f0f', marginTop: '10px' }}>👾 Watch for the MYSTERY INVADER - 1000 PTS!</p>
            <p style={{ color: '#ff6600', marginTop: '5px' }}>🔺 Beware of DIVE ATTACKS!</p>
          </div>
          
          {highScore > 0 && (
            <p style={{ color: '#f0f', fontFamily: "'Press Start 2P', monospace", fontSize: '16px', marginBottom: '20px' }}>
              🏆 High Score: {highScore}
            </p>
          )}
          
          {/* Remote mode: Show different UI based on turn */}
          {gameMode === 'remote' && !isMyTurn ? (
            <div style={{
              textAlign: 'center',
              color: '#f0f',
              fontFamily: "'Press Start 2P', monospace"
            }}>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>⏳ WAITING FOR OPPONENT</p>
              <p style={{ fontSize: '14px', color: '#aaa' }}>Room Code: {gameCode}</p>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>Your opponent is playing...</p>
            </div>
          ) : (
            <button
              onClick={startGame}
              style={{
                padding: '20px 50px',
                fontSize: '24px',
                fontFamily: "'Press Start 2P', monospace",
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
          )}
        </div>
      )}
      
      {/* HUD */}
      {gameStarted && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: '#0ff',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '18px',
          zIndex: 100,
          textShadow: '0 0 10px #0ff, 0 0 20px #0ff'
        }}>
          {/* Multiplayer Mode Header */}
          {(gameMode === 'local' || gameMode === 'remote') && (
            <div style={{ 
              marginBottom: '10px', 
              padding: '5px 10px', 
              background: 'rgba(255,255,0,0.2)', 
              borderRadius: '5px',
              border: '1px solid #ff0'
            }}>
              <div style={{ color: '#ff0', fontSize: '14px' }}>🎮 {gameMode === 'remote' ? 'REMOTE BATTLE' : 'LOCAL BATTLE'}</div>
              <div style={{ color: '#0f0', fontSize: '12px' }}>
                {currentPlayerTurn === 1 ? player1Name : player2Name}'s Turn
              </div>
            </div>
          )}

          <div>LEVEL: {level}</div>
          <div>SCORE: {score}</div>
          {gameMode !== 'local' && gameMode !== 'remote' && <div>HIGH: {highScore}</div>}
          <div>LIVES: {'💎'.repeat(Math.max(0, lives))}</div>
          <div>ACCURACY: {shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0}%</div>

          {/* Multiplayer Score Comparison */}
          {(gameMode === 'local' || gameMode === 'remote') && (
            <div style={{ 
              marginTop: '15px', 
              padding: '8px', 
              background: 'rgba(0,0,0,0.5)', 
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              <div style={{ color: currentPlayerTurn === 1 ? '#0f0' : '#888' }}>
                {player1Name}: {player1Stats.totalScore} pts (L{player1Stats.currentLevel})
              </div>
              <div style={{ color: currentPlayerTurn === 2 ? '#0f0' : '#888' }}>
                {player2Name}: {player2Stats.totalScore} pts (L{player2Stats.currentLevel})
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mystery Indicator */}
      {gameStarted && showMysteryIndicator && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff00ff',
          fontFamily: "'Press Start 2P', monospace",
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
            fontFamily: "'Press Start 2P', monospace",
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
          fontFamily: "'Press Start 2P', monospace",
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
            fontFamily: "'Press Start 2P', monospace", 
            fontSize: '48px',
            textShadow: '0 0 20px #0ff, 0 0 40px #0ff',
            animation: 'pulse 0.5s infinite'
          }}>🎉 LEVEL {level} COMPLETE! 🎉</h1>
          <p style={{ color: '#ff0', fontFamily: "'Press Start 2P', monospace", fontSize: '28px', marginTop: '20px' }}>
            GET READY FOR LEVEL {level + 1}!
          </p>
          <p style={{ color: '#f0f', fontFamily: "'Press Start 2P', monospace", fontSize: '20px', marginTop: '10px' }}>
            Speed: {Math.round(getLevelSpeed(level + 1) * 100)}%
          </p>
        </div>
      )}

            {/* TOP GUN BONUS popup */}
      {showTopGunBonus && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 250,
          textAlign: "center",
          animation: "pulse 0.3s infinite"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #ff0 0%, #f80 50%, #f00 100%)",
            padding: "20px 40px",
            borderRadius: "15px",
            border: "4px solid #fff",
            boxShadow: "0 0 30px #ff0, 0 0 60px #f80, 0 0 90px #f00"
          }}>
            <div style={{
              fontSize: "42px",
              fontFamily: "'Press Start 2P', monospace",
              fontWeight: "bold",
              color: "#000",
              textShadow: "2px 2px 0 #fff"
            }}>
              🎯 TOP GUN BONUS! 🎯
            </div>
            <div style={{
              fontSize: "32px",
              fontFamily: "'Press Start 2P', monospace",
              fontWeight: "bold",
              color: "#000",
              marginTop: "10px"
            }}>
              +500 POINTS!
            </div>
          </div>
        </div>
      )}

      {/* Victory overlay */}
      {gameWon && gameMode !== 'local' && gameMode !== 'remote' && (
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
            fontFamily: "'Press Start 2P', monospace", 
            fontSize: '48px',
            textShadow: '0 0 20px #0ff, 0 0 40px #0ff, 0 0 60px #00ffff',
            animation: 'pulse 1s infinite'
          }}>🎉 VICTORY! 🎉</h1>
          <p style={{ color: '#ff0', fontFamily: "'Press Start 2P', monospace", fontSize: '28px', marginTop: '10px', textShadow: '0 0 10px #ff0' }}>
            ALL 10 LEVELS COMPLETE!
          </p>
          <p style={{ color: '#0ff', fontFamily: "'Press Start 2P', monospace", fontSize: '24px', marginTop: '20px' }}>
            Final Score: {score}
          </p>
          {score >= highScore && score > 0 && (
            <p style={{ color: '#f0f', fontFamily: "'Press Start 2P', monospace", fontSize: '20px', marginTop: '10px', textShadow: '0 0 15px #f0f' }}>
              🏆 NEW HIGH SCORE! 🏆
            </p>
          )}
          <button
            onClick={restart}
            style={{
              marginTop: '30px',
              padding: '15px 30px',
              fontSize: '20px',
              fontFamily: "'Press Start 2P', monospace",
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
      {gameOver && gameMode !== 'local' && gameMode !== 'remote' && (
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
          background: 'rgba(20,0,0,0.95)',
          zIndex: 200,
          overflow: 'auto',
          padding: '20px'
        }}>
          <h1 style={{ color: '#f00', fontFamily: "'Press Start 2P', monospace", fontSize: '48px', textShadow: '0 0 20px #f00', margin: '10px 0' }}>GAME OVER</h1>

          <div style={{ color: '#0ff', fontFamily: "'Press Start 2P', monospace", fontSize: '20px', textAlign: 'center', margin: '10px 0' }}>
            <div>Level: {level} | Score: {score}</div>
            <div>Accuracy: {shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0}% ({shotsHit}/{shotsFired})</div>
          </div>

          {score > 0 && !showNameEntry && !topScores.some(s => s.score === score && s.isNew) && (
            <button
              onClick={() => setShowNameEntry(true)}
              style={{
                margin: '10px 0',
                padding: '10px 20px',
                fontSize: '16px',
                fontFamily: "'Press Start 2P', monospace",
                background: 'linear-gradient(to bottom, #44ff44, #00cc00)',
                border: 'none',
                color: '#000',
                cursor: 'pointer',
                borderRadius: '10px',
                boxShadow: '0 0 10px #0f0'
              }}
            >ENTER NAME FOR LEADERBOARD</button>
          )}

          {showNameEntry && (
            <div style={{ margin: '10px 0', textAlign: 'center' }}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.toUpperCase().slice(0, 10))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && playerName.trim()) {
                    const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;
                    const newEntry = { name: playerName.trim(), score, level, accuracy, date: new Date().toLocaleDateString(), isNew: true };
                    const newScores = [...topScores.map(s => ({...s, isNew: false})), newEntry]
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 10);
                    setTopScores(newScores);
                    localStorage.setItem("topScores", JSON.stringify(newScores));
                    setShowNameEntry(false);
                  }
                }}
                placeholder="YOUR NAME"
                maxLength={10}
                style={{
                  padding: '10px',
                  fontSize: '18px',
                  fontFamily: "'Press Start 2P', monospace",
                  background: '#001',
                  border: '2px solid #0ff',
                  color: '#0ff',
                  textAlign: 'center',
                  width: '150px'
                }}
              />
              <button
                onClick={() => {
                  if (playerName.trim()) {
                    const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;
                    const newEntry = { name: playerName.trim(), score, level, accuracy, date: new Date().toLocaleDateString(), isNew: true };
                    const newScores = [...topScores.map(s => ({...s, isNew: false})), newEntry]
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 10);
                    setTopScores(newScores);
                    localStorage.setItem('topScores', JSON.stringify(newScores));
                    setShowNameEntry(false);
                  }
                }}
                style={{
                  marginLeft: '10px',
                  padding: '10px 15px',
                  fontSize: '16px',
                  fontFamily: "'Press Start 2P', monospace",
                  background: 'linear-gradient(to bottom, #44ff44, #00cc00)',
                  border: 'none',
                  color: '#000',
                  cursor: 'pointer',
                  borderRadius: '8px'
                }}
              >SAVE</button>
            </div>
          )}

          {topScores.length > 0 && (
            <div style={{ margin: '15px 0', textAlign: 'center' }}>
              <h2 style={{ color: '#ff0', fontFamily: "'Press Start 2P', monospace", fontSize: '24px', textShadow: '0 0 10px #ff0', margin: '10px 0' }}>🏆 TOP SCORES 🏆</h2>
              <table style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#ff0' }}>
                    <th style={{ padding: '5px 10px' }}>#</th>
                    <th style={{ padding: '5px 10px' }}>NAME</th>
                    <th style={{ padding: '5px 10px' }}>SCORE</th>
                    <th style={{ padding: '5px 10px' }}>LVL</th>
                    <th style={{ padding: '5px 10px' }}>ACC</th>
                  </tr>
                </thead>
                <tbody>
                  {topScores.map((entry, i) => (
                    <tr key={i} style={{ color: entry.isNew ? '#0f0' : '#0ff', background: entry.isNew ? 'rgba(0,255,0,0.1)' : 'transparent' }}>
                      <td style={{ padding: '3px 10px' }}>{i + 1}</td>
                      <td style={{ padding: '3px 10px' }}>{entry.name}</td>
                      <td style={{ padding: '3px 10px' }}>{entry.score}</td>
                      <td style={{ padding: '3px 10px' }}>{entry.level}</td>
                      <td style={{ padding: '3px 10px' }}>{entry.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={restart}
            style={{
              marginTop: '15px',
              padding: '15px 30px',
              fontSize: '20px',
              fontFamily: "'Press Start 2P', monospace",
              background: 'linear-gradient(to bottom, #ff4444, #cc0000)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '15px',
              boxShadow: '0 0 15px #f00'
            }}
          >PLAY AGAIN</button>
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
              onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.max(x - 0.6, -15)); }}
              onMouseDown={() => setPlayerX(x => Math.max(x - 0.6, -15))}
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
              onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.min(x + 0.6, 15)); }}
              onMouseDown={() => setPlayerX(x => Math.min(x + 0.6, 15))}
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
        {/* Animated starfield background */}
        <Starfield />
        <Suspense fallback={null}>
          <Game gameState={gameState} gameActions={gameActions} gameMode={gameMode} handleMultiplayerTurnEnd={handleMultiplayerTurnEnd} currentPlayerTurn={currentPlayerTurn} />
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
