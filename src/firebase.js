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
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0,O,1,I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new online game room
export const createOnlineGame = async (playerName, totalRounds) => {
  const gameCode = generateGameCode();
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  
  const gameData = {
    status: 'waiting', // waiting, playing, finished
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
    currentTurn: 1, // Which player's turn (1 or 2)
    winner: null,
    createdAt: Date.now()
  };
  
  await set(gameRef, gameData);
  return { gameCode, gameRef: `spaceinvaders/${gameCode}` };
};

// Join an existing game
export const joinOnlineGame = async (gameCode, playerName) => {
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  const snapshot = await get(gameRef);
  
  if (!snapshot.exists()) {
    throw new Error('Game not found');
  }
  
  const gameData = snapshot.val();
  
  if (gameData.player2.joined) {
    throw new Error('Game is full');
  }
  
  if (gameData.status !== 'waiting') {
    throw new Error('Game already started');
  }
  
  // Join as player 2
  await update(gameRef, {
    'player2/name': playerName || 'Player 2',
    'player2/joined': true,
    'status': 'playing'
  });
  
  return { 
    gameCode, 
    gameRef: `spaceinvaders/${gameCode}`,
    player1Name: gameData.player1.name,
    totalRounds: gameData.totalRounds
  };
};

// Subscribe to game updates
export const subscribeToGame = (gameCode, callback) => {
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  return onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};

// Update player state during gameplay
export const updatePlayerState = async (gameCode, playerNum, updates) => {
  const playerKey = playerNum === 1 ? 'player1' : 'player2';
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  
  const updateData = {};
  for (const [key, value] of Object.entries(updates)) {
    updateData[`${playerKey}/${key}`] = value;
  }
  updateData[`${playerKey}/lastUpdate`] = Date.now();
  
  await update(gameRef, updateData);
};

// Update game state (for turn changes, round changes, etc.)
export const updateGameState = async (gameCode, updates) => {
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  await update(gameRef, updates);
};

// Mark player as finished their turn
export const finishPlayerTurn = async (gameCode, playerNum, score, roundScores) => {
  const playerKey = playerNum === 1 ? 'player1' : 'player2';
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  
  await update(gameRef, {
    [`${playerKey}/finished`]: true,
    [`${playerKey}/playing`]: false,
    [`${playerKey}/totalScore`]: score,
    [`${playerKey}/roundScores`]: roundScores
  });
};

// Get current game state
export const getGameState = async (gameCode) => {
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  const snapshot = await get(gameRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.val();
};

// Delete a game (cleanup)
export const deleteGame = async (gameCode) => {
  const gameRef = ref(database, `spaceinvaders/${gameCode}`);
  await remove(gameRef);
};

export { database, ref, onValue, update, get };
