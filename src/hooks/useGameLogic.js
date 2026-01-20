import { create } from 'zustand';
import { soundManager } from '../utils/sounds';

// Game constants
export const GAME_CONFIG = {
  ENEMY_ROWS: 5,
  ENEMY_COLS: 12,
  ENEMY_SPACING_X: 1.2,
  ENEMY_SPACING_Z: 1.0,
  ENEMY_START_Z: -15,
  ENEMY_ADVANCE_SPEED: 0.3,
  ENEMY_SHOOT_INTERVAL: 2000,
  PLAYER_SPEED: 0.15,
  PLAYER_BOUNDS: 7,
  PLAYER_Z: 5,
  PROJECTILE_SPEED: 0.4,
  ENEMY_PROJECTILE_SPEED: 0.2,
  INITIAL_LIVES: 3,
  POINTS_PER_ENEMY: 10,
  ENEMY_REACH_Z: 4,
};

// Row colors for enemies
export const ROW_COLORS = [
  '#ff0066', // Row 0 - Pink
  '#ff6600', // Row 1 - Orange  
  '#ffff00', // Row 2 - Yellow
  '#00ff66', // Row 3 - Green
  '#00ffff', // Row 4 - Cyan
];

// Generate initial enemy positions
const createEnemies = () => {
  const enemies = [];
  for (let row = 0; row < GAME_CONFIG.ENEMY_ROWS; row++) {
    for (let col = 0; col < GAME_CONFIG.ENEMY_COLS; col++) {
      const x = (col - GAME_CONFIG.ENEMY_COLS / 2 + 0.5) * GAME_CONFIG.ENEMY_SPACING_X;
      const z = GAME_CONFIG.ENEMY_START_Z - row * GAME_CONFIG.ENEMY_SPACING_Z;
      enemies.push({
        id: `enemy-${row}-${col}`,
        position: [x, 0.5, z],
        row,
        col,
        alive: true,
      });
    }
  }
  return enemies;
};

export const useGameStore = create((set, get) => ({
  // Game state
  gameState: 'menu', // 'menu', 'playing', 'paused', 'gameover', 'victory'
  score: 0,
  lives: GAME_CONFIG.INITIAL_LIVES,
  highScore: parseInt(localStorage.getItem('highScore') || '0'),
  
  // Player state
  playerX: 0,
  playerInvincible: false,
  
  // Enemies
  enemies: [],
  enemyDirection: 1,
  
  // Projectiles
  playerProjectiles: [],
  enemyProjectiles: [],
  
  // Time tracking
  lastEnemyShot: 0,
  lastEnemyAdvance: 0,
  
  // Initialize game
  initGame: () => {
    soundManager.init();
    set({
      gameState: 'playing',
      score: 0,
      lives: GAME_CONFIG.INITIAL_LIVES,
      playerX: 0,
      playerInvincible: false,
      enemies: createEnemies(),
      enemyDirection: 1,
      playerProjectiles: [],
      enemyProjectiles: [],
      lastEnemyShot: Date.now(),
      lastEnemyAdvance: Date.now(),
    });
    soundManager.levelStart();
  },
  
  // Reset to menu
  resetToMenu: () => {
    set({ gameState: 'menu' });
  },
  
  // Player movement
  movePlayer: (direction) => {
    const { gameState, playerX } = get();
    if (gameState !== 'playing') return;
    
    const newX = playerX + direction * GAME_CONFIG.PLAYER_SPEED;
    if (Math.abs(newX) <= GAME_CONFIG.PLAYER_BOUNDS) {
      set({ playerX: newX });
    }
  },
  
  // Player shoot
  playerShoot: () => {
    const { gameState, playerX, playerProjectiles } = get();
    if (gameState !== 'playing') return;
    
    // Limit projectiles on screen
    if (playerProjectiles.length >= 3) return;
    
    soundManager.playerShoot();
    
    const newProjectile = {
      id: `p-proj-${Date.now()}`,
      position: [playerX, 0.5, GAME_CONFIG.PLAYER_Z - 0.5],
      velocity: [0, 0, -GAME_CONFIG.PROJECTILE_SPEED],
    };
    
    set({ playerProjectiles: [...playerProjectiles, newProjectile] });
  },
  
  // Enemy shoot
  enemyShoot: () => {
    const { enemies, enemyProjectiles, lastEnemyShot, gameState } = get();
    if (gameState !== 'playing') return;
    
    const now = Date.now();
    if (now - lastEnemyShot < GAME_CONFIG.ENEMY_SHOOT_INTERVAL) return;
    
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0) return;
    
    // Random enemy shoots
    const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    
    soundManager.enemyShoot();
    
    const newProjectile = {
      id: `e-proj-${Date.now()}`,
      position: [...shooter.position],
      velocity: [0, 0, GAME_CONFIG.ENEMY_PROJECTILE_SPEED],
    };
    
    set({ 
      enemyProjectiles: [...enemyProjectiles, newProjectile],
      lastEnemyShot: now,
    });
  },
  
  // Update projectiles
  updateProjectiles: () => {
    const { playerProjectiles, enemyProjectiles } = get();
    
    // Update player projectiles
    const updatedPlayerProj = playerProjectiles
      .map(p => ({
        ...p,
        position: [
          p.position[0] + p.velocity[0],
          p.position[1] + p.velocity[1],
          p.position[2] + p.velocity[2],
        ],
      }))
      .filter(p => p.position[2] > -20);
    
    // Update enemy projectiles
    const updatedEnemyProj = enemyProjectiles
      .map(p => ({
        ...p,
        position: [
          p.position[0] + p.velocity[0],
          p.position[1] + p.velocity[1],
          p.position[2] + p.velocity[2],
        ],
      }))
      .filter(p => p.position[2] < 10);
    
    set({
      playerProjectiles: updatedPlayerProj,
      enemyProjectiles: updatedEnemyProj,
    });
  },
  
  // Advance enemies
  advanceEnemies: () => {
    const { enemies, gameState } = get();
    if (gameState !== 'playing') return;
    
    const updatedEnemies = enemies.map(e => {
      if (!e.alive) return e;
      return {
        ...e,
        position: [
          e.position[0],
          e.position[1],
          e.position[2] + GAME_CONFIG.ENEMY_ADVANCE_SPEED * 0.02,
        ],
      };
    });
    
    // Check if enemies reached player
    const reachedPlayer = updatedEnemies.some(
      e => e.alive && e.position[2] >= GAME_CONFIG.ENEMY_REACH_Z
    );
    
    if (reachedPlayer) {
      get().triggerGameOver();
      return;
    }
    
    set({ enemies: updatedEnemies });
  },
  
  // Check collisions
  checkCollisions: () => {
    const { 
      enemies, playerProjectiles, enemyProjectiles, 
      playerX, playerInvincible, score, lives 
    } = get();
    
    let newScore = score;
    let updatedEnemies = [...enemies];
    let updatedPlayerProj = [...playerProjectiles];
    let updatedEnemyProj = [...enemyProjectiles];
    let playerHit = false;
    
    // Check player projectiles hitting enemies
    updatedPlayerProj = updatedPlayerProj.filter(proj => {
      let hit = false;
      updatedEnemies = updatedEnemies.map(enemy => {
        if (!enemy.alive || hit) return enemy;
        
        const dx = Math.abs(proj.position[0] - enemy.position[0]);
        const dz = Math.abs(proj.position[2] - enemy.position[2]);
        
        if (dx < 0.6 && dz < 0.6) {
          hit = true;
          newScore += GAME_CONFIG.POINTS_PER_ENEMY * (GAME_CONFIG.ENEMY_ROWS - enemy.row);
          soundManager.enemyExplosion();
          return { ...enemy, alive: false };
        }
        return enemy;
      });
      return !hit;
    });
    
    // Check enemy projectiles hitting player
    if (!playerInvincible) {
      updatedEnemyProj = updatedEnemyProj.filter(proj => {
        const dx = Math.abs(proj.position[0] - playerX);
        const dz = Math.abs(proj.position[2] - GAME_CONFIG.PLAYER_Z);
        
        if (dx < 0.8 && dz < 0.8) {
          playerHit = true;
          return false;
        }
        return true;
      });
    }
    
    set({
      enemies: updatedEnemies,
      playerProjectiles: updatedPlayerProj,
      enemyProjectiles: updatedEnemyProj,
      score: newScore,
    });
    
    // Handle player hit
    if (playerHit) {
      get().handlePlayerHit();
    }
    
    // Check victory
    const allDead = updatedEnemies.every(e => !e.alive);
    if (allDead) {
      get().triggerVictory();
    }
  },
  
  // Handle player hit
  handlePlayerHit: () => {
    const { lives } = get();
    soundManager.playerHit();
    
    if (lives <= 1) {
      get().triggerGameOver();
    } else {
      set({ 
        lives: lives - 1,
        playerInvincible: true,
        enemyProjectiles: [],
      });
      
      // Remove invincibility after 2 seconds
      setTimeout(() => {
        set({ playerInvincible: false });
      }, 2000);
    }
  },
  
  // Game over
  triggerGameOver: () => {
    const { score, highScore } = get();
    soundManager.gameOver();
    
    if (score > highScore) {
      localStorage.setItem('highScore', score.toString());
      set({ highScore: score });
    }
    
    set({ gameState: 'gameover' });
  },
  
  // Victory
  triggerVictory: () => {
    const { score, highScore } = get();
    soundManager.victory();
    
    if (score > highScore) {
      localStorage.setItem('highScore', score.toString());
      set({ highScore: score });
    }
    
    set({ gameState: 'victory' });
  },
  
  // Pause/Resume
  togglePause: () => {
    const { gameState } = get();
    if (gameState === 'playing') {
      set({ gameState: 'paused' });
    } else if (gameState === 'paused') {
      set({ gameState: 'playing' });
    }
  },
}));
