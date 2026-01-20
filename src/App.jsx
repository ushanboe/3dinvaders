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

// Main game component
function Game({ gameState, gameActions }) {
  const { playerX, score, lives, gameOver, gameWon, paused, highScore, gameStarted } = gameState;
  const { setPlayerX, setScore, setLives, setGameOver, setGameWon, setHighScore } = gameActions;
  
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [barriers, setBarriers] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [playerHit, setPlayerHit] = useState(false);
  
  const [moveDirection, setMoveDirection] = useState(1);
  const [currentMovingRow, setCurrentMovingRow] = useState(4);
  const [pendingDrop, setPendingDrop] = useState(false);
  const moveTickRef = useRef(0);
  const initialEnemyCount = useRef(55);
  const victoryChecked = useRef(false);
  
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
  const ENEMY_START_Y = 6;
  
  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);
  
  useEffect(() => {
    enemiesRef.current = enemies;
    
    if (enemies.length === 0 && initialEnemyCount.current > 0 && !victoryChecked.current && !gameOver && !gameWon && gameStarted) {
      victoryChecked.current = true;
      setGameWon(true);
      playSound('victory');
    }
  }, [enemies, gameOver, gameWon, gameStarted, setGameWon, playSound]);
  
  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  useEffect(() => {
    const initialEnemies = [];
    const rows = 5;
    const cols = 11;
    const spacingX = 2.5;
    const spacingY = 2.5;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        initialEnemies.push({
          id: `${row}-${col}`,
          x: (col - cols / 2 + 0.5) * spacingX,
          y: ENEMY_START_Y + row * spacingY,
          z: 0,
          row: row
        });
      }
    }
    setEnemies(initialEnemies);
    initialEnemyCount.current = initialEnemies.length;
    victoryChecked.current = false;
    
    const barrierPositions = [-10, -3.5, 3.5, 10];
    const initialBarriers = barrierPositions.map((x, idx) => ({
      id: idx,
      x: x,
      y: BARRIER_Y,
      blocks: createBarrierBlocks()
    }));
    setBarriers(initialBarriers);
  }, []);

  const addExplosion = useCallback((x, y, z, color = '#ff6600') => {
    const id = Date.now() + Math.random();
    setExplosions(prev => [...prev, { id, x, y, z, color }]);
  }, []);
  
  const removeExplosion = useCallback((id) => {
    setExplosions(prev => prev.filter(e => e.id !== id));
  }, []);

  const shoot = useCallback(() => {
    if (!gameStarted) return;
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
  }, [playSound, gameStarted]);

  useEffect(() => {
    window.gameShoot = shoot;
    return () => { window.gameShoot = null; };
  }, [shoot]);

  useEffect(() => {
    if (gameOver || gameWon || paused || !gameStarted) return;

    const gameLoop = setInterval(() => {
      const currentEnemies = enemiesRef.current;
      
      if (currentEnemies.length === 0) return;
      
      const enemiesDestroyed = initialEnemyCount.current - currentEnemies.length;
      const speedBoost = Math.floor(enemiesDestroyed / 20);
      const moveInterval = Math.max(3, 8 - speedBoost);
      
      moveTickRef.current++;
      
      if (moveTickRef.current >= moveInterval) {
        moveTickRef.current = 0;
        
        setEnemies(prev => {
          if (prev.length === 0) return prev;
          
          const activeRows = [...new Set(prev.map(e => e.row))].sort((a, b) => b - a);
          if (activeRows.length === 0) return prev;
          
          let rowToMove = currentMovingRow;
          if (!activeRows.includes(rowToMove)) {
            rowToMove = activeRows.find(r => r <= currentMovingRow);
            if (rowToMove === undefined) rowToMove = activeRows[0];
          }
          
          const rowEnemies = prev.filter(e => e.row === rowToMove);
          const otherEnemies = prev.filter(e => e.row !== rowToMove);
          
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
            y: shouldDrop ? e.y - DROP_AMOUNT : e.y
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
          
          const newEnemies = [...otherEnemies, ...movedRowEnemies];
          
          if (newEnemies.some(e => e.y <= BARRIER_Y)) {
            setGameOver(true);
            playSound('gameOver');
          }
          
          return newEnemies;
        });
      }

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

      if (Math.random() < 0.012) {
        const currentEnemiesForShoot = enemiesRef.current;
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

      const currentBullets = bulletsRef.current;
      const currentEnemiesForCollision = enemiesRef.current;
      
      const hitEnemyIds = new Set();
      const hitBulletIds = new Set();
      const explosionsToAdd = [];
      
      for (const bullet of currentBullets) {
        if (hitBulletIds.has(bullet.id)) continue;
        
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
      }

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
  }, [gameOver, gameWon, paused, gameStarted, playSound, highScore, moveDirection, currentMovingRow, pendingDrop, setGameOver, setScore, setLives, setHighScore, addExplosion]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || gameWon || !gameStarted) return;
      
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
  }, [gameOver, gameWon, gameStarted, setPlayerX, shoot]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 15, 15]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, 5, 10]} intensity={0.8} color="#00ffff" />
      <pointLight position={[10, 5, 10]} intensity={0.8} color="#ff00ff" />
      <directionalLight position={[0, 10, 10]} intensity={0.6} />
      
      <Player position={[playerX, PLAYER_Y, 0]} isHit={playerHit} />
      <Enemies enemies={enemies} />
      
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
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('highScore') || '0');
  });

  const restart = () => window.location.reload();
  
  const startGame = () => {
    setGameStarted(true);
  };

  const gameState = { playerX, score, lives, gameOver, gameWon, paused, highScore, gameStarted };
  const gameActions = { setPlayerX, setScore, setLives, setGameOver, setGameWon, setHighScore };

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
          }}>3D EDITION</p>
          
          <div style={{ color: '#aaa', fontFamily: 'monospace', fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
            <p>🎮 PC: Arrow keys / WASD to move, SPACE to shoot</p>
            <p>📱 Mobile: Use on-screen buttons</p>
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
      
      {/* HUD - only show when game started */}
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
          <div>SCORE: {score}</div>
          <div>HIGH: {highScore}</div>
          <div>LIVES: {'💎'.repeat(lives)}</div>
        </div>
      )}

      {/* Pause button - only show when game started */}
      {gameStarted && !gameOver && !gameWon && (
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
            EARTH IS SAVED!
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

      {/* Touch controls - only show when game started and playing */}
      {gameStarted && !gameOver && !gameWon && (
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
