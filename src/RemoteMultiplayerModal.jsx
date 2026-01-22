import React, { useState, useEffect } from 'react';
import { 
  createOnlineGame, 
  joinOnlineGame, 
  subscribeToGame,
  updatePlayerState 
} from './firebase';

const RemoteMultiplayerModal = ({ onStartGame, onClose }) => {
  const [step, setStep] = useState('choice'); // choice, create, join, waiting
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [totalRounds, setTotalRounds] = useState(3);
  const [error, setError] = useState('');
  const [gameData, setGameData] = useState(null);
  const [playerNum, setPlayerNum] = useState(null);
  const [unsubscribe, setUnsubscribe] = useState(null);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  // Watch for player 2 joining (when creating game)
  useEffect(() => {
    if (gameData && step === 'waiting' && playerNum === 1) {
      if (gameData.player2?.joined && gameData.status === 'playing') {
        // Player 2 joined! Start the game
        onStartGame({
          mode: 'remote',
          gameCode,
          playerNum: 1,
          playerName: playerName || 'Player 1',
          opponentName: gameData.player2.name,
          totalRounds
        });
      }
    }
  }, [gameData, step, playerNum]);

  const handleCreateGame = async () => {
    setError('');
    try {
      const result = await createOnlineGame(playerName || 'Player 1', totalRounds);
      setGameCode(result.gameCode);
      setPlayerNum(1);
      setStep('waiting');
      
      // Subscribe to game updates
      const unsub = subscribeToGame(result.gameCode, (data) => {
        setGameData(data);
      });
      setUnsubscribe(() => unsub);
    } catch (err) {
      setError(err.message || 'Failed to create game');
    }
  };

  const handleJoinGame = async () => {
    setError('');
    const code = joinCode.toUpperCase().trim();
    
    if (code.length !== 6) {
      setError('Please enter a valid 6-character game code');
      return;
    }

    // Validate player name is not the game code
    const trimmedName = (playerName || '').trim();
    if (trimmedName.toUpperCase() === code) {
      setError('Player name cannot be the same as the game code');
      return;
    }

    // Validate player name is not empty or too short
    if (trimmedName.length < 2) {
      setError('Please enter a player name (at least 2 characters)');
      return;
    }
    
    try {
      const result = await joinOnlineGame(code, playerName || 'Player 2');
      setGameCode(code);
      setPlayerNum(2);
      
      // Start game immediately for player 2
      onStartGame({
        mode: 'remote',
        gameCode: code,
        playerNum: 2,
        playerName: playerName || 'Player 2',
        opponentName: result.player1Name,
        totalRounds: result.totalRounds
      });
    } catch (err) {
      setError(err.message || 'Failed to join game');
    }
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
  };

  const shareGame = async (method) => {
    const shareUrl = `${window.location.origin}?join=${gameCode}`;
    const shareText = `Join my Space Invaders battle! Code: ${gameCode}`;
    
    if (method === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'Space Invaders Battle',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else if (method === 'sms') {
      window.open(`sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
    }
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,20,0.98)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500,
    padding: '20px'
  };

  const buttonStyle = {
    padding: '15px 30px',
    fontSize: '16px',
    fontFamily: "'Press Start 2P', monospace",
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'all 0.3s'
  };

  return (
    <div style={modalStyle}>
      {/* Back Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'transparent',
          border: '2px solid #f0f',
          color: '#f0f',
          padding: '10px 20px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '14px',
          cursor: 'pointer',
          borderRadius: '8px'
        }}
      >
        ← BACK
      </button>

      <h2 style={{
        color: '#f0f',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '28px',
        textShadow: '0 0 20px #f0f',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        🌐 REMOTE BATTLE
      </h2>

      {error && (
        <div style={{
          color: '#f00',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '12px',
          marginBottom: '20px',
          padding: '10px 20px',
          border: '2px solid #f00',
          borderRadius: '8px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Step: Choice */}
      {step === 'choice' && (
        <div style={{ textAlign: 'center' }}>
          {/* Player Name Input */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              color: '#f0f',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              YOUR NAME
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="ENTER NAME"
              maxLength={10}
              style={{
                padding: '12px 15px',
                fontSize: '16px',
                fontFamily: "'Press Start 2P', monospace",
                background: '#001',
                border: '2px solid #f0f',
                color: '#f0f',
                textAlign: 'center',
                width: '200px',
                borderRadius: '8px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setStep('create')}
              style={{
                ...buttonStyle,
                background: 'linear-gradient(135deg, #330033 0%, #660066 100%)',
                border: '3px solid #f0f',
                color: '#f0f',
                width: '250px'
              }}
            >
              🎮 CREATE GAME
              <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.7 }}>
                Host a new battle
              </div>
            </button>

            <button
              onClick={() => setStep('join')}
              style={{
                ...buttonStyle,
                background: 'linear-gradient(135deg, #003333 0%, #006666 100%)',
                border: '3px solid #0ff',
                color: '#0ff',
                width: '250px'
              }}
            >
              🔗 JOIN GAME
              <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.7 }}>
                Enter a game code
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step: Create Game */}
      {step === 'create' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#aaa',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            marginBottom: '20px'
          }}>
            Select number of rounds
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '30px'
          }}>
            {[1, 3, 5, 10].map(num => (
              <button
                key={num}
                onClick={() => setTotalRounds(num)}
                style={{
                  padding: '12px 20px',
                  fontSize: '16px',
                  fontFamily: "'Press Start 2P', monospace",
                  background: totalRounds === num ? 'linear-gradient(to bottom, #f0f, #808)' : 'transparent',
                  border: totalRounds === num ? '3px solid #f0f' : '2px solid #666',
                  color: totalRounds === num ? '#fff' : '#888',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  boxShadow: totalRounds === num ? '0 0 15px #f0f' : 'none'
                }}
              >
                {num}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => setStep('choice')}
              style={{
                ...buttonStyle,
                background: 'transparent',
                border: '2px solid #666',
                color: '#666'
              }}
            >
              ← BACK
            </button>
            <button
              onClick={handleCreateGame}
              style={{
                ...buttonStyle,
                background: 'linear-gradient(to bottom, #f0f, #a0a)',
                border: 'none',
                color: '#000',
                boxShadow: '0 0 30px #f0f'
              }}
            >
              ▶ CREATE
            </button>
          </div>
        </div>
      )}

      {/* Step: Join Game */}
      {step === 'join' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#aaa',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            marginBottom: '20px'
          }}>
            Enter the 6-character game code
          </div>

          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="XXXXXX"
            maxLength={6}
            style={{
              padding: '15px 20px',
              fontSize: '24px',
              fontFamily: "'Press Start 2P', monospace",
              background: '#001',
              border: '3px solid #0ff',
              color: '#0ff',
              textAlign: 'center',
              width: '200px',
              borderRadius: '8px',
              letterSpacing: '5px',
              marginBottom: '30px'
            }}
          />

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => setStep('choice')}
              style={{
                ...buttonStyle,
                background: 'transparent',
                border: '2px solid #666',
                color: '#666'
              }}
            >
              ← BACK
            </button>
            <button
              onClick={handleJoinGame}
              style={{
                ...buttonStyle,
                background: 'linear-gradient(to bottom, #0ff, #088)',
                border: 'none',
                color: '#000',
                boxShadow: '0 0 30px #0ff'
              }}
            >
              ▶ JOIN
            </button>
          </div>
        </div>
      )}

      {/* Step: Waiting for opponent */}
      {step === 'waiting' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#f0f',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '16px',
            marginBottom: '20px'
          }}>
            ⏳ WAITING FOR OPPONENT
          </div>

          <div style={{
            color: '#0ff',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            marginBottom: '20px'
          }}>
            Playing as: {playerName || 'Player 1'}
          </div>

          <div style={{
            background: '#111',
            border: '3px solid #f0f',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <div style={{
              color: '#aaa',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '12px',
              marginBottom: '15px'
            }}>
              Share this code:
            </div>
            <div style={{
              color: '#f0f',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '36px',
              letterSpacing: '8px',
              textShadow: '0 0 20px #f0f',
              marginBottom: '20px'
            }}>
              {gameCode}
            </div>
            <button
              onClick={copyGameCode}
              style={{
                padding: '10px 20px',
                fontSize: '12px',
                fontFamily: "'Press Start 2P', monospace",
                background: 'transparent',
                border: '2px solid #f0f',
                color: '#f0f',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
            >
              📋 COPY CODE
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {navigator.share && (
              <button
                onClick={() => shareGame('native')}
                style={{
                  padding: '10px 15px',
                  fontSize: '12px',
                  fontFamily: "'Press Start 2P', monospace",
                  background: '#333',
                  border: '2px solid #666',
                  color: '#fff',
                  cursor: 'pointer',
                  borderRadius: '8px'
                }}
              >
                📤 Share
              </button>
            )}
            <button
              onClick={() => shareGame('sms')}
              style={{
                padding: '10px 15px',
                fontSize: '12px',
                fontFamily: "'Press Start 2P', monospace",
                background: '#333',
                border: '2px solid #666',
                color: '#fff',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
            >
              💬 SMS
            </button>
            <button
              onClick={() => shareGame('whatsapp')}
              style={{
                padding: '10px 15px',
                fontSize: '12px',
                fontFamily: "'Press Start 2P', monospace",
                background: '#25D366',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
            >
              WhatsApp
            </button>
          </div>

          <div style={{
            marginTop: '30px',
            color: '#666',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px'
          }}>
            <div className="loading-dots">Waiting</div>
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: '30px',
              padding: '10px 20px',
              fontSize: '12px',
              fontFamily: "'Press Start 2P', monospace",
              background: 'transparent',
              border: '2px solid #f00',
              color: '#f00',
              cursor: 'pointer',
              borderRadius: '8px'
            }}
          >
            ✕ CANCEL
          </button>
        </div>
      )}

      <style>{`
        .loading-dots::after {
          content: '';
          animation: dots 1.5s infinite;
        }
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  );
};

export default RemoteMultiplayerModal;
