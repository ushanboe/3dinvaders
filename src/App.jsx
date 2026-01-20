import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const particles = useRef([]);
  const groupRef = useRef();
  const [opacity, setOpacity] = useState(1);
  const startTime = useRef(Date.now());
  
  // Create particles on mount
  useMemo(() => {
    particles.current = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 0.1 + Math.random() * 0.15;
      particles.current.push({
        x: 0,
        y: 0,
        z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + Math.random() * 0.1,
        vz: (Math.random() - 0.5) * 0.1,
        size: 0.2 + Math.random() * 0.3
      });
    }
  }, []);
  
  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    if (elapsed > 0.5) {
      onComplete();
      return;
    }
    
    setOpacity(1 - elapsed * 2);
    
    particles.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.vy -= 0.01; // gravity
    });
  });
  
  return (
    <group ref={groupRef} position={position}>
      {particles.current.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

// Enemy sprite using PNG texture
function EnemySprite({ position, row }) {
  // Map row to texture file: row 4 (top) = one.png, row 0 (bottom) = five.png
  const textureFiles = [
    '/3dinvaders/five.png',   // row 0 (bottom)
    '/3dinvaders/four.png',   // row 1
    '/3dinvaders/three.png',  // row 2
    '/3dinvaders/two.png',    // row 3
    '/3dinvaders/one.png'     // row 4 (top)
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
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Player
function Player({ position, isHit }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          color={isHit ? "#ff0000" : "#00ff00"} 
          emissive={isHit ? "#ff0000" : "#00ff00"} 
          emissiveIntensity={isHit ? 0.8 : 0.3} 
        />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
        <meshStandardMaterial 
          color={isHit ? "#ff0000" : "#00ff00"} 
          emissive={isHit ? "#ff0000" : "#00ff00"} 
          emissiveIntensity={isHit ? 1 : 0.5} 
        />
      </mesh>
    </group>
  );
}

// Bullet
function Bullet({ position, isEnemy }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.15, 0.5, 0.15]} />
      <meshStandardMaterial 
        color={isEnemy ? "#ff0000" : "#00ffff"} 
        emissive={isEnemy ? "#ff0000" : "#00ffff"} 
        emissiveIntensity={1} 
      />
    </mesh>
  );
}

// Barrier/Shield
function Barrier({ barrier }) {
  const blocks = [];
  const blockSize = 0.6;
  
  barrier.blocks.forEach((block, idx) => {
    if (block.health > 0) {
      const color = block.health === 3 ? '#00ff00' : block.health === 2 ? '#ffff00' : '#ff6600';
      blocks.push(
        <mesh key={idx} position={[barrier.x + block.x, barrier.y + block.y, 0]}>
          <boxGeometry args={[blockSize, blockSize, blockSize]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
  });
  
  return <>{blocks}</>;
}

// Enemies container with sprites
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
          x: (col - 3) * 0.6,
          y: (3 - row) * 0.6,
          health: 3
        });
      }
    }
  }
  return blocks;
}

// Main game component
function Game({ gameState, gameActions }) {
  const { playerX, score, lives, gameOver, paused, highScore } = gameState;
  const { setPlayerX, setScore, setLives, setGameOver, setHighScore } = gameActions;
  
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [barriers, setBarriers] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [playerHit, setPlayerHit] = useState(false);
  
  // Wave movement state
  const [moveDirection, setMoveDirection] = useState(1);
  const [currentMovingRow, setCurrentMovingRow] = useState(4);
  const moveTickRef = useRef(0);
  
  const playSound = useSound();
  const lastShotTime = useRef(0);
  const playerXRef = useRef(playerX);
  
  // Screen boundaries
  const LEFT_BOUNDARY = -14;
  const RIGHT_BOUNDARY = 14;
  const PLAYER_LIMIT = 13;
  const DROP_AMOUNT = 0.5;
  const MOVE_SPEED = 0.4;
  
  // Y positions - enemies start HIGHER now
  const PLAYER_Y = -8;
  const BARRIER_Y = -5;
  const ENEMY_START_Y = 4;  // Moved UP from 0 to 4
  
  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  // Initialize enemies - 5 rows x 11 cols
  useEffect(() => {
    const initialEnemies = [];
    const rows = 5;
    const cols = 11;
    const spacingX = 2.5;
    const spacingY = 2.0;
    
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
    
    // Initialize 4 barriers
    const barrierPositions = [-10, -3.5, 3.5, 10];
    const initialBarriers = barrierPositions.map((x, idx) => ({
      id: idx,
      x: x,
      y: BARRIER_Y,
      blocks: createBarrierBlocks()
    }));
    setBarriers(initialBarriers);
  }, []);

  // Add explosion helper
  const addExplosion = useCallback((x, y, z, color = '#ff6600') => {
    const id = Date.now() + Math.random();
    setExplosions(prev => [...prev, { id, x, y, z, color }]);
  }, []);
  
  const removeExplosion = useCallback((id) => {
    setExplosions(prev => prev.filter(e => e.id !== id));
  }, []);

  // Shoot function
  const shoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTime.current < 350) return;
    lastShotTime.current = now;
    
    setBullets(prev => [...prev, {
      id: Date.now(),
      x: playerXRef.current,
      y: PLAYER_Y + 1,
      z: 0
    }]);
    playSound('shoot');
  }, [playSound]);

  useEffect(() => {
    window.gameShoot = shoot;
    return () => { window.gameShoot = null; };
  }, [shoot]);

  // Game loop
  useEffect(() => {
    if (gameOver || paused) return;

    const gameLoop = setInterval(() => {
      // Speed based on remaining enemies
      const baseInterval = 3;
      const speedBoost = Math.max(0, Math.floor((55 - enemies.length) / 10));
      const moveInterval = Math.max(1, baseInterval - speedBoost);
      
      moveTickRef.current++;
      
      // ROW-BY-ROW WAVE MOVEMENT
      if (moveTickRef.current >= moveInterval) {
        moveTickRef.current = 0;
        
        setEnemies(prev => {
          if (prev.length === 0) return prev;
          
          const activeRows = [...new Set(prev.map(e => e.row))].sort((a, b) => b - a);
          if (activeRows.length === 0) return prev;
          
          let rowToMove = currentMovingRow;
          if (!activeRows.includes(rowToMove)) {
            rowToMove = activeRows.find(r => r <= currentMovingRow) || activeRows[0];
          }
          
          const rowEnemies = prev.filter(e => e.row === rowToMove);
          const otherEnemies = prev.filter(e => e.row !== rowToMove);
          
          if (rowEnemies.length === 0) {
            const nextRow = activeRows.find(r => r < rowToMove);
            setCurrentMovingRow(nextRow !== undefined ? nextRow : activeRows[0]);
            return prev;
          }
          
          const rightMost = Math.max(...rowEnemies.map(e => e.x));
          const leftMost = Math.min(...rowEnemies.map(e => e.x));
          
          let shouldReverse = false;
          let shouldDrop = false;
          
          if (moveDirection === 1 && rightMost + MOVE_SPEED >= RIGHT_BOUNDARY) {
            shouldReverse = true;
            shouldDrop = true;
          } else if (moveDirection === -1 && leftMost - MOVE_SPEED <= LEFT_BOUNDARY) {
            shouldReverse = true;
            shouldDrop = true;
          }
          
          const movedRowEnemies = rowEnemies.map(e => ({
            ...e,
            x: shouldDrop ? e.x : e.x + (MOVE_SPEED * moveDirection),
            y: shouldDrop ? e.y - DROP_AMOUNT : e.y
          }));
          
          playSound('step');
          
          const nextRowIdx = activeRows.indexOf(rowToMove);
          const nextRow = activeRows[nextRowIdx + 1];
          if (nextRow !== undefined) {
            setCurrentMovingRow(nextRow);
          } else {
            setCurrentMovingRow(activeRows[0]);
            if (shouldReverse) {
              setMoveDirection(d => -d);
            }
          }
          
          const newEnemies = [...otherEnemies, ...movedRowEnemies];
          
          if (newEnemies.some(e => e.y <= BARRIER_Y + 2)) {
            setGameOver(true);
            playSound('gameOver');
          }
          
          return newEnemies;
        });
      }

      // Move player bullets UP
      setBullets(prev => 
        prev
          .map(b => ({ ...b, y: b.y + 0.5 }))
          .filter(b => b.y < 20)
      );

      // Move enemy bullets DOWN
      setEnemyBullets(prev =>
        prev
          .map(b => ({ ...b, y: b.y - 0.3 }))
          .filter(b => b.y > PLAYER_Y - 2)
      );

      // Enemy shooting
      if (Math.random() < 0.015) {
        setEnemies(prev => {
          if (prev.length === 0) return prev;
          const columns = {};
          prev.forEach(e => {
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
          return prev;
        });
      }

      // Collision: player bullets vs enemies
      setEnemies(prevEnemies => {
        let remainingEnemies = [...prevEnemies];
        
        setBullets(prevBullets => {
          return prevBullets.filter(bullet => {
            let hitEnemy = null;
            let closestY = Infinity;
            
            for (const enemy of remainingEnemies) {
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
              remainingEnemies = remainingEnemies.filter(e => e.id !== hitEnemy.id);
              // ADD EXPLOSION!
              addExplosion(hitEnemy.x, hitEnemy.y, hitEnemy.z, '#ff6600');
              setScore(s => {
                const newScore = s + 10;
                if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem('highScore', newScore.toString());
                }
                return newScore;
              });
              playSound('explosion');
              return false;
            }
            return true;
          });
        });
        
        return remainingEnemies;
      });

      // Collision: player bullets vs barriers
      setBullets(prevBullets => {
        let remaining = [...prevBullets];
        
        setBarriers(prevBarriers => {
          return prevBarriers.map(barrier => {
            const newBlocks = barrier.blocks.map(block => {
              if (block.health <= 0) return block;
              
              const blockX = barrier.x + block.x;
              const blockY = barrier.y + block.y;
              
              const hitBullet = remaining.find(b => 
                Math.abs(b.x - blockX) < 0.4 &&
                Math.abs(b.y - blockY) < 0.4
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

      // Collision: enemy bullets vs barriers
      setEnemyBullets(prevBullets => {
        let remaining = [...prevBullets];
        
        setBarriers(prevBarriers => {
          return prevBarriers.map(barrier => {
            const newBlocks = barrier.blocks.map(block => {
              if (block.health <= 0) return block;
              
              const blockX = barrier.x + block.x;
              const blockY = barrier.y + block.y;
              
              const hitBullet = remaining.find(b => 
                Math.abs(b.x - blockX) < 0.4 &&
                Math.abs(b.y - blockY) < 0.4
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

      // Collision: enemy bullets vs player
      setEnemyBullets(prev => {
        const currentPlayerX = playerXRef.current;
        const hit = prev.find(b => 
          Math.abs(b.x - currentPlayerX) < 1 &&
          b.y < PLAYER_Y + 1 && b.y > PLAYER_Y - 0.5
        );
        
        if (hit) {
          // ADD PLAYER HIT EXPLOSION!
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
  }, [gameOver, paused, playSound, highScore, moveDirection, currentMovingRow, enemies.length, setGameOver, setScore, setLives, setHighScore, addExplosion]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      
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
  }, [gameOver, setPlayerX, shoot]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 15, 10]} intensity={1} />
      <directionalLight position={[0, 10, 10]} intensity={0.8} />
      
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
      
      {/* Explosions */}
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
  const [paused, setPaused] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('highScore') || '0');
  });

  const restart = () => window.location.reload();

  const gameState = { playerX, score, lives, gameOver, paused, highScore };
  const gameActions = { setPlayerX, setScore, setLives, setGameOver, setHighScore };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', touchAction: 'none' }}>
      {/* HUD */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '18px',
        zIndex: 100,
        textShadow: '0 0 10px #0f0'
      }}>
        <div>SCORE: {score}</div>
        <div>HIGH: {highScore}</div>
        <div>LIVES: {'❤️'.repeat(lives)}</div>
      </div>

      {/* Pause button */}
      <button
        onClick={() => setPaused(p => !p)}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(0,255,0,0.2)',
          border: '2px solid #0f0',
          color: '#0f0',
          padding: '10px 15px',
          fontFamily: 'monospace',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 100
        }}
      >
        {paused ? '▶️' : '⏸️'}
      </button>

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
          background: 'rgba(0,0,0,0.8)',
          zIndex: 200
        }}>
          <h1 style={{ color: '#f00', fontFamily: 'monospace', fontSize: '48px' }}>GAME OVER</h1>
          <p style={{ color: '#0f0', fontFamily: 'monospace', fontSize: '24px' }}>Score: {score}</p>
          <button
            onClick={restart}
            style={{
              marginTop: '20px',
              padding: '15px 30px',
              fontSize: '20px',
              fontFamily: 'monospace',
              background: '#0f0',
              border: 'none',
              color: '#000',
              cursor: 'pointer'
            }}
          >RESTART</button>
        </div>
      )}

      {/* Touch controls */}
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
              background: 'rgba(0,255,0,0.2)',
              border: '2px solid #0f0',
              color: '#0f0',
              borderRadius: '10px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >◀</button>
          <button
            onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.min(x + 0.6, 13)); }}
            onMouseDown={() => setPlayerX(x => Math.min(x + 0.6, 13))}
            style={{
              width: '70px',
              height: '70px',
              fontSize: '30px',
              background: 'rgba(0,255,0,0.2)',
              border: '2px solid #0f0',
              color: '#0f0',
              borderRadius: '10px',
              cursor: 'pointer',
              userSelect: 'none'
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
            background: 'rgba(255,0,0,0.3)',
            border: '2px solid #f00',
            color: '#f00',
            borderRadius: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >🔥</button>
      </div>

      <Canvas camera={{ position: [0, 2, 30], fov: 50 }}>
        <Suspense fallback={null}>
          <Game gameState={gameState} gameActions={gameActions} />
        </Suspense>
      </Canvas>
    </div>
  );
}
