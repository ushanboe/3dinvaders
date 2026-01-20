import React, { useEffect, useState } from 'react';
import { useGameStore, GAME_CONFIG } from '../hooks/useGameLogic';

export function UI() {
  const {
    gameState,
    score,
    lives,
    highScore,
    playerInvincible,
    initGame,
    resetToMenu,
    togglePause,
    movePlayer,
    playerShoot,
  } = useGameStore();

  const [isMobile, setIsMobile] = useState(false);
  const [touchInterval, setTouchInterval] = useState(null);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch controls handlers
  const handleTouchStart = (direction) => {
    movePlayer(direction);
    const interval = setInterval(() => movePlayer(direction), 50);
    setTouchInterval(interval);
  };

  const handleTouchEnd = () => {
    if (touchInterval) {
      clearInterval(touchInterval);
      setTouchInterval(null);
    }
  };

  // Render lives
  const renderLives = () => {
    const lifeElements = [];
    for (let i = 0; i < GAME_CONFIG.INITIAL_LIVES; i++) {
      lifeElements.push(
        <div
          key={i}
          className={`life ${i >= lives ? 'lost' : ''}`}
        />
      );
    }
    return lifeElements;
  };

  return (
    <div className="game-ui">
      {/* HUD - visible during gameplay */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <div className="hud">
            <div className="hud-left">
              <div>SCORE: {score.toString().padStart(6, '0')}</div>
              <div className="lives">{renderLives()}</div>
            </div>
            <div className="hud-right">
              <div>HIGH: {highScore.toString().padStart(6, '0')}</div>
            </div>
          </div>
          
          <button className="pause-btn" onClick={togglePause}>
            {gameState === 'paused' ? '▶' : '❚❚'}
          </button>
          
          {playerInvincible && <div className="invincible-flash" />}
        </>
      )}

      {/* Mobile Controls */}
      {isMobile && gameState === 'playing' && (
        <div className="mobile-controls">
          <div className="control-left">
            <button
              className="control-btn"
              onTouchStart={() => handleTouchStart(-1)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleTouchStart(-1)}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              ◀
            </button>
            <button
              className="control-btn"
              onTouchStart={() => handleTouchStart(1)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleTouchStart(1)}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              ▶
            </button>
          </div>
          <div className="control-right">
            <button
              className="control-btn fire"
              onTouchStart={playerShoot}
              onClick={playerShoot}
            >
              ●
            </button>
          </div>
        </div>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="menu-screen">
          <h1 className="title">SPACE<br/>INVADERS</h1>
          <p className="subtitle">3D EDITION</p>
          <button className="menu-button" onClick={initGame}>
            START GAME
          </button>
          <div className="instructions">
            {isMobile ? (
              <>
                <p>◀ ▶ - Move left/right</p>
                <p>● - Fire</p>
              </>
            ) : (
              <>
                <p>← → or A/D - Move</p>
                <p>SPACE - Fire</p>
                <p>P or ESC - Pause</p>
              </>
            )}
          </div>
          {highScore > 0 && (
            <p className="high-score">HIGH SCORE: {highScore}</p>
          )}
        </div>
      )}

      {/* Pause Screen */}
      {gameState === 'paused' && (
        <div className="pause-screen">
          <h1 className="title">PAUSED</h1>
          <button className="menu-button" onClick={togglePause}>
            RESUME
          </button>
          <button className="menu-button" onClick={resetToMenu}>
            QUIT TO MENU
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="gameover-screen">
          <h1 className="title" style={{ color: '#f00', textShadow: '0 0 20px #f00' }}>
            GAME OVER
          </h1>
          <p className="final-score">SCORE: {score}</p>
          {score >= highScore && score > 0 && (
            <p className="high-score">★ NEW HIGH SCORE! ★</p>
          )}
          <button className="menu-button" onClick={initGame}>
            PLAY AGAIN
          </button>
          <button className="menu-button" onClick={resetToMenu}>
            MENU
          </button>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === 'victory' && (
        <div className="victory-screen">
          <h1 className="title" style={{ color: '#0ff', textShadow: '0 0 20px #0ff' }}>
            VICTORY!
          </h1>
          <p className="subtitle">ALL ENEMIES DESTROYED</p>
          <p className="final-score">SCORE: {score}</p>
          {score >= highScore && (
            <p className="high-score">★ NEW HIGH SCORE! ★</p>
          )}
          <button className="menu-button" onClick={initGame}>
            PLAY AGAIN
          </button>
          <button className="menu-button" onClick={resetToMenu}>
            MENU
          </button>
        </div>
      )}
    </div>
  );
}
