import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';

// Sound effects using Web Audio API
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
    }
  }, []);

  return playSound;
};

// Single animated enemy model - cloned properly
function EnemyModel({ position }) {
  const group = useRef();
  const { scene, animations } = useGLTF('/3dinvaders/enemy.glb');
  const mixer = useRef();
  
  // Clone the scene using SkeletonUtils for proper skinned mesh cloning
  const clone = useMemo(() => {
    return SkeletonUtils.clone(scene);
  }, [scene]);
  
  // Setup animation
  useEffect(() => {
    if (clone && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(clone);
      const action = mixer.current.clipAction(animations[0]);
      action.play();
      
      return () => {
        if (mixer.current) {
          mixer.current.stopAllAction();
          mixer.current.uncacheRoot(clone);
        }
      };
    }
  }, [clone, animations]);
  
  // Update animation
  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });
  
  return (
    <group ref={group} position={position}>
      <primitive object={clone} scale={0.02} rotation={[0, Math.PI, 0]} />
    </group>
  );
}

// Fallback cube enemy
function CubeEnemy({ position, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Player laser cannon
function Player({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1, 0.6, 0.6]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// Laser bullet
function Bullet({ position, isEnemy }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshStandardMaterial 
        color={isEnemy ? "#ff0000" : "#00ffff"} 
        emissive={isEnemy ? "#ff0000" : "#00ffff"} 
        emissiveIntensity={1} 
      />
    </mesh>
  );
}

// Road/ground
function Road() {
  return (
    <mesh rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 5]}>
      <planeGeometry args={[20, 40]} />
      <meshStandardMaterial color="#1a1a2e" />
    </mesh>
  );
}

// Enemies container - renders all enemies
function Enemies({ enemies }) {
  const rowColors = ['#ff0066', '#ff6600', '#ffff00', '#00ff66', '#0066ff'];
  
  return (
    <>
      {enemies.map(enemy => (
        <Suspense key={enemy.id} fallback={
          <CubeEnemy position={[enemy.x, enemy.y, enemy.z]} color={rowColors[enemy.row]} />
        }>
          <EnemyModel position={[enemy.x, enemy.y, enemy.z]} />
        </Suspense>
      ))}
    </>
  );
}

// Main game component
function Game({ playerX, setPlayerX, score, setScore, lives, setLives, gameOver, setGameOver, paused, highScore, setHighScore }) {
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  
  const playSound = useSound();
  const lastShotTime = useRef(0);

  // Initialize enemies
  useEffect(() => {
    const initialEnemies = [];
    const rows = 5;
    const cols = 12;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        initialEnemies.push({
          id: `${row}-${col}`,
          x: (col - cols / 2 + 0.5) * 1.2,
          y: 2 + row * 0.5,
          z: -15 + row * 2,
          row: row
        });
      }
    }
    setEnemies(initialEnemies);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver || paused) return;

    const gameLoop = setInterval(() => {
      // Move enemies forward
      setEnemies(prev => {
        const newEnemies = prev.map(e => ({
          ...e,
          z: e.z + 0.02
        }));
        
        if (newEnemies.some(e => e.z > 5)) {
          setGameOver(true);
          playSound('gameOver');
        }
        
        return newEnemies;
      });

      // Move player bullets
      setBullets(prev => 
        prev
          .map(b => ({ ...b, z: b.z - 0.5, y: b.y + 0.1 }))
          .filter(b => b.z > -20)
      );

      // Move enemy bullets
      setEnemyBullets(prev =>
        prev
          .map(b => ({ ...b, z: b.z + 0.3, y: b.y - 0.05 }))
          .filter(b => b.z < 10)
      );

      // Enemy shooting
      if (Math.random() < 0.02) {
        setEnemies(prev => {
          if (prev.length === 0) return prev;
          const shooter = prev[Math.floor(Math.random() * prev.length)];
          setEnemyBullets(eb => [...eb, {
            id: Date.now(),
            x: shooter.x,
            y: shooter.y,
            z: shooter.z
          }]);
          return prev;
        });
      }

      // Collision detection - player bullets vs enemies
      setBullets(prevBullets => {
        let remainingBullets = [...prevBullets];
        
        setEnemies(prevEnemies => {
          let remainingEnemies = [...prevEnemies];
          
          remainingBullets = remainingBullets.filter(bullet => {
            const hitEnemy = remainingEnemies.find(enemy => 
              Math.abs(bullet.x - enemy.x) < 0.6 &&
              Math.abs(bullet.z - enemy.z) < 1 &&
              Math.abs(bullet.y - enemy.y) < 0.6
            );
            
            if (hitEnemy) {
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
              return false;
            }
            return true;
          });
          
          return remainingEnemies;
        });
        
        return remainingBullets;
      });

      // Collision detection - enemy bullets vs player
      setEnemyBullets(prev => {
        const hit = prev.find(b => 
          Math.abs(b.x - playerX) < 0.8 &&
          b.z > 4 &&
          b.y < 1
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
  }, [gameOver, paused, playerX, playSound, highScore, setGameOver, setScore, setLives, setHighScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
          setPlayerX(x => Math.max(x - 0.5, -6));
          break;
        case 'ArrowRight':
        case 'd':
          setPlayerX(x => Math.min(x + 0.5, 6));
          break;
        case ' ':
          e.preventDefault();
          shoot();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, setPlayerX]);

  const shoot = () => {
    const now = Date.now();
    if (now - lastShotTime.current < 250) return;
    lastShotTime.current = now;
    
    setBullets(prev => [...prev, {
      id: Date.now(),
      x: playerX,
      y: 0.8,
      z: 4
    }]);
    playSound('shoot');
  };

  // Expose shoot function globally for touch controls
  useEffect(() => {
    window.gameShoot = shoot;
  }, [playerX]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 10, 5]} intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      
      <Road />
      
      <Player position={[playerX, 0, 5]} />
      
      {/* Enemies */}
      <Enemies enemies={enemies} />
      
      {/* Player bullets */}
      {bullets.map(bullet => (
        <Bullet key={bullet.id} position={[bullet.x, bullet.y, bullet.z]} isEnemy={false} />
      ))}
      
      {/* Enemy bullets */}
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

  const restart = () => {
    window.location.reload();
  };

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
            onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.max(x - 0.5, -6)); }}
            onMouseDown={() => setPlayerX(x => Math.max(x - 0.5, -6))}
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
            onTouchStart={(e) => { e.preventDefault(); setPlayerX(x => Math.min(x + 0.5, 6)); }}
            onMouseDown={() => setPlayerX(x => Math.min(x + 0.5, 6))}
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

      <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
        <Suspense fallback={null}>
          <Game 
            playerX={playerX}
            setPlayerX={setPlayerX}
            score={score}
            setScore={setScore}
            lives={lives}
            setLives={setLives}
            gameOver={gameOver}
            setGameOver={setGameOver}
            paused={paused}
            highScore={highScore}
            setHighScore={setHighScore}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload('/3dinvaders/enemy.glb');
