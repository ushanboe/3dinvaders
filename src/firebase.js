// Firebase configuration for Space Invaders 3D
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, onValue, remove, push } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDIbdB39rwtixtNUp7f2HVyrb1VyAaGgKI",
  authDomain: "tictactoe-3d.firebaseapp.com",
  databaseURL: "https://tictactoe-3d-default-rtdb.firebaseio.com",
  projectId: "tictactoe-3d",
  storageBucket: "tictactoe-3d.firebasestorage.app",
  messagingSenderId: "136071772216",
  appId: "1:136071772216:web:f8237215222ef3a9728ecd",
  measurementId: "G-E4H75FRWVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Generate a 6-character game code
export const generateGameCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new online game room
export const createOnlineGame = async (playerName, totalRounds) => {
  console.log('[DEBUG Firebase] createOnlineGame called:', { playerName, totalRounds });
  const gameCode = generateGameCode();
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  
  const gameData = {
    status: 'waiting',
    totalRounds: totalRounds,
    currentRound: 1,
    player1: {
      name: playerName || 'Player 1',
      joined: true,
      ready: false,
      playing: false,
      finished: false,
      totalScore: 0,
      roundScores: [],
      currentLevel: 1,
      lives: 3,
      lastUpdate: Date.now()
    },
    player2: {
      name: '',
      joined: false,
      ready: false,
      playing: false,
      finished: false,
      totalScore: 0,
      roundScores: [],
      currentLevel: 1,
      lives: 3,
      lastUpdate: Date.now()
    },
    currentTurn: 1,
    winner: null,
    createdAt: Date.now()
  };
  
  await set(gameRef, gameData);
  console.log('[DEBUG Firebase] Game created:', { gameCode, gameData });
  return { gameCode, gameRef: `spaceinvaders/${gameCode}` };
};

// Join an existing game
export const joinOnlineGame = async (gameCode, playerName) => {
  console.log('[DEBUG Firebase] joinOnlineGame called:', { gameCode, playerName });
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  const snapshot = await get(gameRef);
  
  if (!snapshot.exists()) {
    console.log('[DEBUG Firebase] Game not found:', gameCode);
    throw new Error('Game not found');
  }
  
  const gameData = snapshot.val();
  console.log('[DEBUG Firebase] Found game:', gameData);
  
  if (gameData.player2.joined) {
    throw new Error('Game is full');
  }
  
  if (gameData.status !== 'waiting') {
    throw new Error('Game already started');
  }
  
  await update(gameRef, {
    'player2/name': playerName || 'Player 2',
    'player2/joined': true,
    'status': 'playing'
  });
  
  console.log('[DEBUG Firebase] Joined game successfully');
  return {
    gameCode,
    gameRef: `spaceinvaders/${gameCode}`,
    player1Name: gameData.player1.name,
    totalRounds: gameData.totalRounds
  };
};

// Subscribe to game updates
export const subscribeToGame = (gameCode, callback) => {
  console.log('[DEBUG Firebase] subscribeToGame called:', gameCode);
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  return onValue(gameRef, (snapshot) => {
    console.log('[DEBUG Firebase] onValue triggered, exists:', snapshot.exists());
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('[DEBUG Firebase] Game data received:', { currentTurn: data.currentTurn, status: data.status });
      callback(data);
    }
  });
};

// Update player state during gameplay
export const updatePlayerState = async (gameCode, playerNum, updates) => {
  console.log('[DEBUG Firebase] updatePlayerState called:', { gameCode, playerNum, updates });
  const playerKey = playerNum === 1 ? 'player1' : 'player2';
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  
  const updateData = {};
  for (const [key, value] of Object.entries(updates)) {
    updateData[`${playerKey}/${key}`] = value;
  }
  updateData[`${playerKey}/lastUpdate`] = Date.now();
  
  await update(gameRef, updateData);
  console.log('[DEBUG Firebase] updatePlayerState completed');
};

// Update game state (for turn changes, round changes, etc.)
export const updateGameState = async (gameCode, updates) => {
  console.log('[DEBUG Firebase] updateGameState called:', { gameCode, updates });
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  await update(gameRef, updates);
  console.log('[DEBUG Firebase] updateGameState completed');
};

// Mark player as finished their turn
export const finishPlayerTurn = async (gameCode, playerNum, score, roundScores) => {
  console.log('[DEBUG Firebase] finishPlayerTurn called:', { gameCode, playerNum, score, roundScores });
  const playerKey = playerNum === 1 ? 'player1' : 'player2';
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  
  await update(gameRef, {
    [`${playerKey}/finished`]: true,
    [`${playerKey}/playing`]: false,
    [`${playerKey}/totalScore`]: score,
    [`${playerKey}/roundScores`]: roundScores
  });
  console.log('[DEBUG Firebase] finishPlayerTurn completed');
};

// Get current game state
export const getGameState = async (gameCode) => {
  console.log('[DEBUG Firebase] getGameState called:', gameCode);
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  const snapshot = await get(gameRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.val();
};

// Delete a game (cleanup)
export const deleteGame = async (gameCode) => {
  console.log('[DEBUG Firebase] deleteGame called:', gameCode);
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  await remove(gameRef);
};

export { database, ref, onValue, update, get };
