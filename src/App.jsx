import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';

// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

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
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'hit':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
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
        oscillator.frequency.setValueAtTime(100 + Math.random() * 50, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
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

// Fallback cube enemy
function CubeEnemy({ position, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Animated enemy model
function EnemyModel({ position, id }) {
  const group = useRef();
  const mixer = useRef();
  const [error, setError] = useState(false);
  
  const { scene, animations } = useGLTF('/3dinvaders/enemy.glb');
  
  const clone = useMemo(() => {
    try {
      return SkeletonUtils.clone(scene);
    } catch (err) {
      setError(true);
      return null;
    }
  }, [scene, id]);
  
  useEffect(() => {
    if (!clone || !animations || animations.length === 0) return;
    try {
      mixer.current = new THREE.AnimationMixer(clone);
      const action = mixer.current.clipAction(animations[0]);
      action.play();
    } catch (err) {
      console.error('Animation error:', err);
    }
    return () => {
      if (mixer.current) mixer.current.stopAllAction();
    };
  }, [clone, animations]);
  
  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
  });
  
  if (error || !clone) {
    return <CubeEnemy position={position} color="#ff00ff" />;
  }
  
  return (
    <group ref={group} position={position}>
      <primitive object={clone} scale={1.2} rotation={[0, Math.PI, 0]} />
    </group>
  );
}

// Player - positioned lower
function Player({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// Bullet
function Bullet({ position, isEnemy }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.15, 0.6, 0.15]} />
      <meshStandardMaterial 
        color={isEnemy ? "#ff0000" : "#00ffff"} 
        emissive={isEnemy ? "#ff0000" : "#00ffff"} 
        emissiveIntensity={1} 
      />
    </mesh>
  );
}

// Barrier/Shield - destructible
function Barrier({ barrier }) {
  // Create a blocky barrier shape
  const blocks = [];
  const blockSize = 0.8;
  
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

// Enemies container
function Enemies({ enemies }) {
  const rowColors = ['#ff0066', '#ff6600', '#ffff00', '#00ff66', '#0066ff'];
  
  return (
    <>
      {enemies.map(enemy => (
        <ErrorBoundary key={enemy.id} fallback={
          <CubeEnemy position={[enemy.x, enemy.y, enemy.z]} color={rowColors[enemy.row]} />
        }>
          <Suspense fallback={
            <CubeEnemy position={[enemy.x, enemy.y, enemy.z]} color={rowColors[enemy.row]} />
          }>
            <EnemyModel position={[enemy.x, enemy.y, enemy.z]} id={enemy.id} />
          </Suspense>
        </ErrorBoundary>
      ))}
    </>
  );
}

// Create initial barrier blocks
function createBarrierBlocks() {
  const blocks = [];
  // Classic barrier shape - wider at bottom, narrower at top with arch
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
          x: (col - 3) * 0.8,
          y: (3 - row) * 0.8,
          health: 3  // 3 hits to destroy
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
  
  // Movement state
  const [moveDirection, setMoveDirection] = useState(1);
  const moveStepRef = useRef(0);
  
  const playSound = useSound();
  const lastShotTime = useRef(0);
  const playerXRef = useRef(playerX);
  
  // Screen boundaries - much wider
  const LEFT_BOUNDARY = -18;
  const RIGHT_BOUNDARY = 18;
  const PLAYER_LIMIT = 16;
  const DROP_AMOUNT = 0.6;
  const MOVE_SPEED = 0.35;
  
  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  // Initialize enemies - 5 rows x 11 cols
  useEffect(() => {
    const initialEnemies = [];
    const rows = 5;
    const cols = 11;
    const spacingX = 3;
    const spacingY = 2.2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        initialEnemies.push({
          id: `${row}-${col}`,
          x: (col - cols / 2 + 0.5) * spacingX,
          y: 14 + row * spacingY,  // Start higher
          z: 0,
          row: row
        });
      }
    }
    setEnemies(initialEnemies);
    
    // Initialize 4 barriers
    const barrierPositions = [-12, -4, 4, 12];
    const initialBarriers = barrierPositions.map((x, idx) => ({
      id: idx,
      x: x,
      y: 4,  // Between player and enemies
      blocks: createBarrierBlocks()
    }));
    setBarriers(initialBarriers);
  }, []);

  // Shoot function
  const shoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTime.current < 300) return;  // Slower fire rate
    lastShotTime.current = now;
    
    setBullets(prev => [...prev, {
      id: Date.now(),
      x: playerXRef.current,
      y: 1.5,
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
      const baseInterval = 10;
      const speedBoost = Math.max(1, Math.floor((55 - enemies.length) / 6));
      const moveInterval = Math.max(2, baseInterval - speedBoost);
      
      moveStepRef.current++;
      
      // CLASSIC SPACE INVADERS MOVEMENT
      if (moveStepRef.current >= moveInterval) {
        moveStepRef.current = 0;
        
        setEnemies(prev => {
          if (prev.length === 0) return prev;
          
          const rightMost = Math.max(...prev.map(e => e.x));
          const leftMost = Math.min(...prev.map(e => e.x));
          
          let newDirection = moveDirection;
          let shouldDrop = false;
          
          if (moveDirection === 1 && rightMost + MOVE_SPEED >= RIGHT_BOUNDARY) {
            newDirection = -1;
            shouldDrop = true;
          } else if (moveDirection === -1 && leftMost - MOVE_SPEED <= LEFT_BOUNDARY) {
            newDirection = 1;
            shouldDrop = true;
          }
          
          if (newDirection !== moveDirection) {
            setMoveDirection(newDirection);
          }
          
          const newEnemies = prev.map(e => ({
            ...e,
            x: shouldDrop ? e.x : e.x + (MOVE_SPEED * moveDirection),
            y: shouldDrop ? e.y - DROP_AMOUNT : e.y
          }));
          
          playSound('step');
          
          // Game over if enemies reach barrier level
          if (newEnemies.some(e => e.y <= 5)) {
            setGameOver(true);
            playSound('gameOver');
          }
          
          return newEnemies;
        });
      }

      // Move player bullets UP
      setBullets(prev => 
        prev
          .map(b => ({ ...b, y: b.y + 0.4 }))
          .filter(b => b.y < 30)
      );

      // Move enemy bullets DOWN
      setEnemyBullets(prev =>
        prev
          .map(b => ({ ...b, y: b.y - 0.25 }))
          .filter(b => b.y > -1)
      );

      // Enemy shooting
      if (Math.random() < 0.012) {
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

      // FIXED: Collision detection - bullet hits ONE enemy then disappears
      setEnemies(prevEnemies => {
        let remainingEnemies = [...prevEnemies];
        const bulletsToRemove = new Set();
        
        setBullets(prevBullets => {
          return prevBullets.filter(bullet => {
            // Find the CLOSEST enemy that this bullet hits (lowest Y = closest to player)
            let hitEnemy = null;
            let closestY = Infinity;
            
            for (const enemy of remainingEnemies) {
              const dx = Math.abs(bullet.x - enemy.x);
              const dy = Math.abs(bullet.y - enemy.y);
              
              if (dx < 1.5 && dy < 1.2) {
                // Hit! Find the one with lowest Y (closest to bullet origin)
                if (enemy.y < closestY) {
                  closestY = enemy.y;
                  hitEnemy = enemy;
                }
              }
            }
            
            if (hitEnemy) {
              // Remove only this one enemy
              remainingEnemies = remainingEnemies.filter(e => e.id !== hitEnemy.id);
              setScore(s => {
                const newScore = s + 10;
                if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem('highScore', newScore.toString());
                }
                return newScore;
              });
              playSound('explosion');
              return false;  // Remove this bullet
            }
            return true;  // Keep bullet
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

      // Collision: enemy bullets vs player
      setEnemyBullets(prev => {
        const currentPlayerX = playerXRef.current;
        const hit = prev.find(b => 
          Math.abs(b.x - currentPlayerX) < 1 &&
          b.y < 1.2 && b.y > 0
        );
        
        if (hit) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameOver(true);
              playSound('gameOver');
            } else {
              playSound('hit');
            }
            return newLives;
          });
          return prev.filter(b => b.id !== hit.id);
        }
        return prev;
      });

    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameOver, paused, playSound, highScore, moveDirection, enemies.length, setGameOver, setScore, setLives, setHighScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
          setPlayerX(x => Math.max(x - 0.7, -PLAYER_LIMIT));
          break;
        case 'ArrowRight':
        case 'd':
          setPlayerX(x => Math.min(x + 0.7, PLAYER_LIMIT));
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
      <pointLight position={[0, 30, 10]} intensity={1} />
      <directionalLight position={[0, 20, 10]} intensity={0.8} />
      
      <Player position={[playerX, 0.5, 0]} />
      <Enemies enemies={enemies} />
      
      {/* Barriers */}
      {barriers.map(barrier => (
        <Barrier key={barrier.id} barrier={barrier} />
      ))}
      
      {bullets.map(bullet => (
        <Bullet key={bullet.id} position={[bullet.x, bullet.y, bullet.z]} isEnemy={false} />
      ))}
      
      {enemyBullets.map(bullet => (
        <Bullet key={bullet.id} position={[bullet.x, bullet.y, bullet.z]} isEnemy={true} />
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
            onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.max(x - 0.7, -16)); }}
            onMouseDown={() => setPlayerX(x => Math.max(x - 0.7, -16))}
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
            onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.min(x + 0.7, 16)); }}
            onMouseDown={() => setPlayerX(x => Math.min(x + 0.7, 16))}
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

      {/* Orthographic-like camera - straight on view */}
      <Canvas 
        camera={{ position: [0, 12, 35], fov: 45 }}
        orthographic={false}
      >
        <Suspense fallback={null}>
          <Game gameState={gameState} gameActions={gameActions} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/3dinvaders/enemy.glb');
