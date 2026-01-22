import React, { createContext, useContext, useState, useCallback } from 'react';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // Game mode: 'solo', 'local', 'remote'
  const [gameMode, setGameMode] = useState('solo');
  
  // Player names
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  
  // Current player turn (1 or 2)
  const [currentPlayer, setCurrentPlayer] = useState(1);
  
  // Player stats
  const [player1Stats, setPlayer1Stats] = useState({
    totalScore: 0,
    currentLevel: 1,
    livesRemaining: 3,
    isFinished: false,
    accuracy: 0
  });
  
  const [player2Stats, setPlayer2Stats] = useState({
    totalScore: 0,
    currentLevel: 1,
    livesRemaining: 3,
    isFinished: false,
    accuracy: 0
  });
  
  // Turn transition state
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [transitionData, setTransitionData] = useState(null);
  
  // Game finished state
  const [gameFinished, setGameFinished] = useState(false);
  const [winner, setWinner] = useState(null);
  
  // Initialize a new multiplayer game
  const initMultiplayerGame = useCallback((mode, p1Name, p2Name) => {
    setGameMode(mode);
    setPlayer1Name(p1Name || 'Player 1');
    setPlayer2Name(p2Name || 'Player 2');
    setCurrentPlayer(1);
    setPlayer1Stats({
      totalScore: 0,
      currentLevel: 1,
      livesRemaining: 3,
      isFinished: false,
      accuracy: 0
    });
    setPlayer2Stats({
      totalScore: 0,
      currentLevel: 1,
      livesRemaining: 3,
      isFinished: false,
      accuracy: 0
    });
    setShowTurnTransition(false);
    setTransitionData(null);
    setGameFinished(false);
    setWinner(null);
  }, []);
  
  // Update current player's stats after their turn
  const updatePlayerStats = useCallback((playerNum, stats) => {
    if (playerNum === 1) {
      setPlayer1Stats(prev => ({ ...prev, ...stats }));
    } else {
      setPlayer2Stats(prev => ({ ...prev, ...stats }));
    }
  }, []);
  
  // Handle turn end
  const endTurn = useCallback((turnData) => {
    setTransitionData(turnData);
    setShowTurnTransition(true);
  }, []);
  
  // Switch to next player
  const switchPlayer = useCallback(() => {
    setCurrentPlayer(prev => prev === 1 ? 2 : 1);
    setShowTurnTransition(false);
    setTransitionData(null);
  }, []);
  
  // Check if game is finished
  const checkGameEnd = useCallback(() => {
    if (player1Stats.isFinished && player2Stats.isFinished) {
      setGameFinished(true);
      if (player1Stats.totalScore > player2Stats.totalScore) {
        setWinner(1);
      } else if (player2Stats.totalScore > player1Stats.totalScore) {
        setWinner(2);
      } else {
        setWinner(0); // Tie
      }
      return true;
    }
    return false;
  }, [player1Stats, player2Stats]);
  
  // Reset game
  const resetGame = useCallback(() => {
    setGameMode('solo');
    setCurrentPlayer(1);
    setPlayer1Stats({
      totalScore: 0,
      currentLevel: 1,
      livesRemaining: 3,
      isFinished: false,
      accuracy: 0
    });
    setPlayer2Stats({
      totalScore: 0,
      currentLevel: 1,
      livesRemaining: 3,
      isFinished: false,
      accuracy: 0
    });
    setShowTurnTransition(false);
    setTransitionData(null);
    setGameFinished(false);
    setWinner(null);
  }, []);
  
  const value = {
    // State
    gameMode,
    player1Name,
    player2Name,
    currentPlayer,
    player1Stats,
    player2Stats,
    showTurnTransition,
    transitionData,
    gameFinished,
    winner,
    
    // Actions
    setGameMode,
    setPlayer1Name,
    setPlayer2Name,
    initMultiplayerGame,
    updatePlayerStats,
    endTurn,
    switchPlayer,
    checkGameEnd,
    resetGame
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
