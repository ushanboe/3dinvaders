import React from 'react';

const TurnTransition = ({
  transitionData,
  player1Stats,
  player2Stats,
  player1Name,
  player2Name,
  onContinue,
  onPlayAgain,
  onMainMenu
}) => {
  if (!transitionData) return null;

  // Extract data from transitionData - matching the structure from GamePage
  const {
    playerNumber,      // Current player (1 or 2)
    nextPlayerNumber,  // Next player (1 or 2)
    playerName,        // Current player's name
    nextPlayerName,    // Next player's name
    result,            // Contains score, level, lives, gameOver, victory, shotsFired, shotsHit, accuracy
    isFinalResult,     // True if both players have finished
    switchingPlayer    // True if switching to next player
  } = transitionData;

  // Extract result data
  const { score, level, lives, gameOver, victory, shotsFired, shotsHit, accuracy } = result || {};

  // Game finished - show final results
  if (isFinalResult) {
    const p1Score = player1Stats.score;
    const p2Score = player2Stats.score;

    let winner = 0; // 0 = tie
    if (p1Score > p2Score) winner = 1;
    else if (p2Score > p1Score) winner = 2;

    const winnerName = winner === 1 ? player1Name : winner === 2 ? player2Name : null;
    const isTie = winner === 0;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 20, 0.98)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: "'Press Start 2P', monospace"
      }}>
        {/* Victory Banner */}
        <div style={{
          fontSize: '48px',
          color: '#FFD700',
          textShadow: '0 0 20px #FFD700, 0 0 40px #FFA500',
          marginBottom: '20px',
          animation: 'pulse 1s infinite'
        }}>
          🏆 BATTLE COMPLETE 🏆
        </div>

        {/* Winner Announcement */}
        <div style={{
          fontSize: '32px',
          color: isTie ? '#0ff' : '#0f0',
          textShadow: '0 0 15px currentColor',
          marginBottom: '30px'
        }}>
          {isTie ? "IT'S A TIE!" : `${winnerName} WINS!`}
        </div>

        {/* Final Scores */}
        <div style={{
          display: 'flex',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Player 1 Card */}
          <div style={{
            background: winner === 1 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: winner === 1 ? '3px solid #0f0' : '2px solid #666',
            borderRadius: '15px',
            padding: '20px 30px',
            textAlign: 'center',
            minWidth: '200px'
          }}>
            <div style={{ color: '#0ff', fontSize: '18px', marginBottom: '10px' }}>
              {player1Name}
            </div>
            <div style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>
              {p1Score} pts
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>
              Level {player1Stats.currentLevel} | {player1Stats.accuracy}% acc
            </div>
            {winner === 1 && (
              <div style={{ color: '#FFD700', fontSize: '24px', marginTop: '10px' }}>👑</div>
            )}
          </div>

          {/* VS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: '#f0f',
            fontSize: '24px'
          }}>
            VS
          </div>

          {/* Player 2 Card */}
          <div style={{
            background: winner === 2 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: winner === 2 ? '3px solid #0f0' : '2px solid #666',
            borderRadius: '15px',
            padding: '20px 30px',
            textAlign: 'center',
            minWidth: '200px'
          }}>
            <div style={{ color: '#0ff', fontSize: '18px', marginBottom: '10px' }}>
              {player2Name}
            </div>
            <div style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>
              {p2Score} pts
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>
              Level {player2Stats.currentLevel} | {player2Stats.accuracy}% acc
            </div>
            {winner === 2 && (
              <div style={{ color: '#FFD700', fontSize: '24px', marginTop: '10px' }}>👑</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={onPlayAgain}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              fontFamily: "'Press Start 2P', monospace",
              background: 'linear-gradient(to bottom, #00ff00, #00aa00)',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              borderRadius: '10px',
              boxShadow: '0 0 15px #0f0'
            }}
          >
            🔄 REMATCH
          </button>
          <button
            onClick={onMainMenu}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              fontFamily: "'Press Start 2P', monospace",
              background: 'linear-gradient(to bottom, #666, #444)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '10px'
            }}
          >
            🏠 MAIN MENU
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.02); }
          }
        `}</style>
      </div>
    );
  }

  // Turn transition - show current player's results and prepare for next player
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 20, 0.98)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: "'Press Start 2P', monospace"
    }}>
      {/* Turn Complete Header */}
      <div style={{
        fontSize: '28px',
        color: gameOver ? '#f00' : victory ? '#FFD700' : '#0ff',
        textShadow: '0 0 15px currentColor',
        marginBottom: '20px'
      }}>
        {gameOver ? '💀 GAME OVER 💀' : victory ? '🎉 VICTORY! 🎉' : '✅ LEVEL COMPLETE!'}
      </div>

      {/* Current Player Results */}
      <div style={{
        background: 'rgba(0, 255, 255, 0.1)',
        border: '2px solid #0ff',
        borderRadius: '15px',
        padding: '25px 40px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <div style={{ color: '#ff0', fontSize: '20px', marginBottom: '15px' }}>
          {playerName}'s Turn Complete
        </div>

        <div style={{ color: '#fff', fontSize: '16px', lineHeight: '2' }}>
          <div>Level: <span style={{ color: '#0ff' }}>{level}</span></div>
          <div>Score: <span style={{ color: '#0f0' }}>{score}</span></div>
          <div>Accuracy: <span style={{ color: '#f0f' }}>{accuracy}%</span></div>
          {!gameOver && !victory && (
            <div>Lives Remaining: <span style={{ color: '#ff0' }}>{'💎'.repeat(Math.max(0, lives || 0))}</span></div>
          )}
        </div>
      </div>

      {/* Score Comparison */}
      <div style={{
        display: 'flex',
        gap: '30px',
        marginBottom: '30px',
        fontSize: '14px'
      }}>
        <div style={{
          padding: '10px 20px',
          background: playerNumber === 1 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          border: playerNumber === 1 ? '2px solid #0f0' : '1px solid #666'
        }}>
          <div style={{ color: '#0ff' }}>{player1Name}</div>
          <div style={{ color: '#fff' }}>{player1Stats.score} pts</div>
        </div>
        <div style={{
          padding: '10px 20px',
          background: playerNumber === 2 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          border: playerNumber === 2 ? '2px solid #0f0' : '1px solid #666'
        }}>
          <div style={{ color: '#0ff' }}>{player2Name}</div>
          <div style={{ color: '#fff' }}>{player2Stats.score} pts</div>
        </div>
      </div>

      {/* Next Player Prompt */}
      <div style={{
        fontSize: '24px',
        color: '#ff0',
        textShadow: '0 0 10px #ff0',
        marginBottom: '20px',
        animation: 'pulse 1.5s infinite'
      }}>
        📱 Pass device to {nextPlayerName}!
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        style={{
          padding: '20px 50px',
          fontSize: '20px',
          fontFamily: "'Press Start 2P', monospace",
          background: 'linear-gradient(to bottom, #00ffff, #0088ff)',
          border: 'none',
          color: '#000',
          cursor: 'pointer',
          borderRadius: '15px',
          boxShadow: '0 0 20px #0ff',
          animation: 'pulse 1.5s infinite'
        }}
      >
        ▶ {nextPlayerName}'s TURN
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default TurnTransition;
