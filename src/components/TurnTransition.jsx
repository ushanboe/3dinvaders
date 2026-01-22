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

  const {
    currentPlayer,
    currentPlayerName,
    nextPlayer,
    nextPlayerName,
    roundScore,
    currentRound,
    totalRounds,
    player1TotalScore,
    player2TotalScore,
    player1RoundScores,
    player2RoundScores,
    nextRound,
    isFinalResult
  } = transitionData;

  // Game finished - show final results
  if (isFinalResult) {
    const p1Total = player1TotalScore || 0;
    const p2Total = player2TotalScore || 0;
    const p1Rounds = player1RoundScores || [];
    const p2Rounds = player2RoundScores || [];

    let winner = 0; // 0 = tie
    if (p1Total > p2Total) winner = 1;
    else if (p2Total > p1Total) winner = 2;

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
          fontSize: '36px',
          color: '#FFD700',
          textShadow: '0 0 20px #FFD700, 0 0 40px #FFA500',
          marginBottom: '20px',
          animation: 'pulse 1s infinite'
        }}>
          🏆 BATTLE COMPLETE 🏆
        </div>

        {/* Winner Announcement */}
        <div style={{
          fontSize: '28px',
          color: isTie ? '#0ff' : '#0f0',
          textShadow: '0 0 15px currentColor',
          marginBottom: '10px'
        }}>
          {isTie ? "IT'S A TIE!" : `${winnerName} WINS!`}
        </div>

        <div style={{ color: '#888', fontSize: '12px', marginBottom: '20px' }}>
          After {totalRounds} rounds
        </div>

        {/* Final Scores */}
        <div style={{
          display: 'flex',
          gap: '40px',
          marginBottom: '20px'
        }}>
          {/* Player 1 Card */}
          <div style={{
            background: winner === 1 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: winner === 1 ? '3px solid #0f0' : '2px solid #666',
            borderRadius: '15px',
            padding: '20px 30px',
            textAlign: 'center',
            minWidth: '180px'
          }}>
            <div style={{ color: '#0ff', fontSize: '16px', marginBottom: '10px' }}>
              {player1Name}
            </div>
            <div style={{ color: '#fff', fontSize: '24px', marginBottom: '10px' }}>
              {p1Total} pts
            </div>
            <div style={{ color: '#888', fontSize: '10px' }}>
              {p1Rounds.map((s, i) => `R${i+1}: ${s}`).join(' | ')}
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
            minWidth: '180px'
          }}>
            <div style={{ color: '#0ff', fontSize: '16px', marginBottom: '10px' }}>
              {player2Name}
            </div>
            <div style={{ color: '#fff', fontSize: '24px', marginBottom: '10px' }}>
              {p2Total} pts
            </div>
            <div style={{ color: '#888', fontSize: '10px' }}>
              {p2Rounds.map((s, i) => `R${i+1}: ${s}`).join(' | ')}
            </div>
            {winner === 2 && (
              <div style={{ color: '#FFD700', fontSize: '24px', marginTop: '10px' }}>👑</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <button
            onClick={onPlayAgain}
            style={{
              padding: '15px 30px',
              fontSize: '14px',
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
              fontSize: '14px',
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

  // Turn transition - show current player's round results and prepare for next
  const isAdvancingRound = nextRound && nextRound > currentRound;

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
      {/* Round Info */}
      <div style={{
        fontSize: '18px',
        color: '#888',
        marginBottom: '10px'
      }}>
        Round {currentRound} of {totalRounds}
      </div>

      {/* Turn Complete Header */}
      <div style={{
        fontSize: '28px',
        color: '#0ff',
        textShadow: '0 0 15px currentColor',
        marginBottom: '20px'
      }}>
        💀 {currentPlayerName}'s Turn Over!
      </div>

      {/* Current Player Results */}
      <div style={{
        background: 'rgba(0, 255, 255, 0.1)',
        border: '2px solid #0ff',
        borderRadius: '15px',
        padding: '20px 40px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ color: '#ff0', fontSize: '18px', marginBottom: '10px' }}>
          Round {currentRound} Score
        </div>
        <div style={{ color: '#0f0', fontSize: '32px' }}>
          +{roundScore} pts
        </div>
      </div>

      {/* Running Totals */}
      <div style={{
        display: 'flex',
        gap: '30px',
        marginBottom: '30px',
        fontSize: '14px'
      }}>
        <div style={{
          padding: '15px 25px',
          background: currentPlayer === 1 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          border: currentPlayer === 1 ? '2px solid #0f0' : '1px solid #666',
          textAlign: 'center'
        }}>
          <div style={{ color: '#0ff', marginBottom: '5px' }}>{player1Name}</div>
          <div style={{ color: '#fff', fontSize: '20px' }}>{player1TotalScore} pts</div>
          <div style={{ color: '#888', fontSize: '10px' }}>Total</div>
        </div>
        <div style={{
          padding: '15px 25px',
          background: currentPlayer === 2 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          border: currentPlayer === 2 ? '2px solid #0f0' : '1px solid #666',
          textAlign: 'center'
        }}>
          <div style={{ color: '#0ff', marginBottom: '5px' }}>{player2Name}</div>
          <div style={{ color: '#fff', fontSize: '20px' }}>{player2TotalScore} pts</div>
          <div style={{ color: '#888', fontSize: '10px' }}>Total</div>
        </div>
      </div>

      {/* Next Action */}
      {isAdvancingRound ? (
        <div style={{
          fontSize: '20px',
          color: '#f0f',
          textShadow: '0 0 10px #f0f',
          marginBottom: '15px'
        }}>
          ⬆️ Advancing to Round {nextRound}!
        </div>
      ) : null}

      <div style={{
        fontSize: '20px',
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
          fontSize: '18px',
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
        ▶ {nextPlayerName} - Round {nextRound || currentRound}
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
