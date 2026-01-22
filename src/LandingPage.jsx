import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// Typewriter component for terminal effect
const Typewriter = ({ text, speed = 30, delay = 0, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started || completed) return;

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setCompleted(true);
      if (onComplete) onComplete();
    }
  }, [displayedText, text, speed, started, completed, onComplete]);

  return (
    <span>
      {displayedText}
      {started && !completed && <span className="cursor">▋</span>}
    </span>
  );
};

// Terminal message component
const TerminalMessage = ({ lines, startDelay = 0 }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  const handleLineComplete = () => {
    if (currentLine < lines.length - 1) {
      setTimeout(() => setCurrentLine(prev => prev + 1), 200);
    }
  };

  if (!started) return null;

  return (
    <div className="terminal-messages">
      {lines.slice(0, currentLine + 1).map((line, index) => (
        <div key={index} className={`terminal-line ${line.type || ''}`}>
          {line.prefix && <span className="line-prefix">{line.prefix}</span>}
          {index < currentLine ? (
            <span>{line.text}</span>
          ) : (
            <Typewriter
              text={line.text}
              speed={line.speed || 25}
              onComplete={handleLineComplete}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Mode Selection Modal
const ModeSelectionModal = ({ onSelectMode, onClose, highScore }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [totalRounds, setTotalRounds] = useState(3);
  
  const handleStartGame = () => {
    if (selectedMode === 'solo') {
      onSelectMode('solo', null, null);
    } else if (selectedMode === 'local') {
      onSelectMode('local', player1Name || 'Player 1', player2Name || 'Player 2', totalRounds);
    }
  };
  
  return (
    <div style={{
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
      zIndex: 400,
      padding: '20px'
    }}>
      {/* Back Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'transparent',
          border: '2px solid #0ff',
          color: '#0ff',
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
        color: '#0ff',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '32px',
        textShadow: '0 0 20px #0ff',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        SELECT MISSION TYPE
      </h2>
      
      {/* Mode Selection */}
      {!selectedMode && (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Solo Mode */}
          <button
            onClick={() => setSelectedMode('solo')}
            style={{
              background: 'linear-gradient(135deg, #001133 0%, #002266 100%)',
              border: '3px solid #0ff',
              borderRadius: '20px',
              padding: '30px',
              cursor: 'pointer',
              width: '280px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px #0ff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚀</div>
            <div style={{
              color: '#0ff',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '20px',
              marginBottom: '10px'
            }}>SOLO MISSION</div>
            <div style={{
              color: '#aaa',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              lineHeight: '1.6'
            }}>
              Classic single player<br/>10 levels of action
            </div>
          </button>
          
          {/* Local 2P Mode */}
          <button
            onClick={() => setSelectedMode('local')}
            style={{
              background: 'linear-gradient(135deg, #112200 0%, #224400 100%)',
              border: '3px solid #0f0',
              borderRadius: '20px',
              padding: '30px',
              cursor: 'pointer',
              width: '280px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px #0f0';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
            <div style={{
              color: '#0f0',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '20px',
              marginBottom: '10px'
            }}>LOCAL BATTLE</div>
            <div style={{
              color: '#aaa',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              lineHeight: '1.6'
            }}>
              2 players, 1 device<br/>Take turns, highest score wins!
            </div>
          </button>
          
          {/* Remote 2P Mode (Coming Soon) */}
          <button
            disabled
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
              border: '3px solid #666',
              borderRadius: '20px',
              padding: '30px',
              cursor: 'not-allowed',
              width: '280px',
              opacity: 0.6
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🌐</div>
            <div style={{
              color: '#666',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '20px',
              marginBottom: '10px'
            }}>REMOTE BATTLE</div>
            <div style={{
              color: '#ff0',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              lineHeight: '1.6'
            }}>
              🔒 PREMIUM<br/>COMING SOON!
            </div>
          </button>
        </div>
      )}
      
      {/* Solo Mode Confirmation */}
      {selectedMode === 'solo' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#0ff',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '24px',
            marginBottom: '30px'
          }}>
            🚀 SOLO MISSION
          </div>
          
          {highScore > 0 && (
            <div style={{
              color: '#f0f',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '16px',
              marginBottom: '20px'
            }}>
              🏆 High Score: {highScore}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => setSelectedMode(null)}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                fontFamily: "'Press Start 2P', monospace",
                background: 'transparent',
                border: '2px solid #666',
                color: '#666',
                cursor: 'pointer',
                borderRadius: '10px'
              }}
            >
              ← BACK
            </button>
            <button
              onClick={handleStartGame}
              style={{
                padding: '15px 40px',
                fontSize: '20px',
                fontFamily: "'Press Start 2P', monospace",
                background: 'linear-gradient(to bottom, #00ffff, #0088ff)',
                border: 'none',
                color: '#000',
                cursor: 'pointer',
                borderRadius: '10px',
                boxShadow: '0 0 30px #0ff',
                animation: 'pulse 1.5s infinite'
              }}
            >
              ▶ LAUNCH
            </button>
          </div>
        </div>
      )}
      
      {/* Local 2P Mode - Name Entry */}
      {selectedMode === 'local' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#0f0',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '24px',
            marginBottom: '30px'
          }}>
            👥 LOCAL BATTLE
          </div>
          
          <div style={{
            color: '#aaa',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            marginBottom: '20px'
          }}>
            Enter player names (optional)
          </div>
          
          <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div>
              <label style={{
                display: 'block',
                color: '#0ff',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '14px',
                marginBottom: '10px'
              }}>
                PLAYER 1
              </label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value.toUpperCase().slice(0, 10))}
                placeholder="PLAYER 1"
                maxLength={10}
                style={{
                  padding: '12px 15px',
                  fontSize: '16px',
                  fontFamily: "'Press Start 2P', monospace",
                  background: '#001',
                  border: '2px solid #0ff',
                  color: '#0ff',
                  textAlign: 'center',
                  width: '180px',
                  borderRadius: '8px'
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                color: '#0f0',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '14px',
                marginBottom: '10px'
              }}>
                PLAYER 2
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value.toUpperCase().slice(0, 10))}
                placeholder="PLAYER 2"
                maxLength={10}
                style={{
                  padding: '12px 15px',
                  fontSize: '16px',
                  fontFamily: "'Press Start 2P', monospace",
                  background: '#001',
                  border: '2px solid #0f0',
                  color: '#0f0',
                  textAlign: 'center',
                  width: '180px',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
          
          {/* Rounds Selector */}
          <div style={{
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <label style={{
              display: 'block',
              color: '#f0f',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '14px',
              marginBottom: '15px'
            }}>
              🎯 NUMBER OF ROUNDS
            </label>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap'
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
                    boxShadow: totalRounds === num ? '0 0 15px #f0f' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            color: '#ff0',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '11px',
            marginBottom: '25px',
            lineHeight: '1.8'
          }}>
            📋 RULES:<br/>
            • Each round = 1 level (Round 1 = Level 1, etc.)<br/>
            • Player 1 plays until game over, then Player 2<br/>
            • After both finish, advance to next round<br/>
            • Highest TOTAL score wins!
          </div>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => setSelectedMode(null)}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                fontFamily: "'Press Start 2P', monospace",
                background: 'transparent',
                border: '2px solid #666',
                color: '#666',
                cursor: 'pointer',
                borderRadius: '10px'
              }}
            >
              ← BACK
            </button>
            <button
              onClick={handleStartGame}
              style={{
                padding: '15px 40px',
                fontSize: '20px',
                fontFamily: "'Press Start 2P', monospace",
                background: 'linear-gradient(to bottom, #00ff00, #00aa00)',
                border: 'none',
                color: '#000',
                cursor: 'pointer',
                borderRadius: '10px',
                boxShadow: '0 0 30px #0f0',
                animation: 'pulse 1.5s infinite'
              }}
            >
              ▶ START BATTLE
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [highScore] = useState(() => parseInt(localStorage.getItem('highScore') || '0'));

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);
  
  const handleSelectMode = (mode, p1Name, p2Name, rounds = 3) => {
    // Navigate to game with mode parameters
    if (mode === 'solo') {
      navigate('/game?mode=solo');
    } else if (mode === 'local') {
      navigate(`/game?mode=local&p1=${encodeURIComponent(p1Name)}&p2=${encodeURIComponent(p2Name)}&rounds=${rounds}`);
    }
  };

  const terminalLines = [
    { prefix: '[INCOMING TRANSMISSION]', text: '', type: 'header', speed: 0 },
    { prefix: '>', text: ' PRIORITY: ALPHA-1', type: 'priority', speed: 20 },
    { prefix: '>', text: ' DATE: 2087.06.15', type: 'date', speed: 20 },
    { prefix: '>', text: ' STATUS: CRITICAL', type: 'critical', speed: 20 },
    { text: '', type: 'spacer' },
    { text: 'Earth Defense Command to all units...', speed: 30 },
    { text: '', type: 'spacer' },
    { text: 'The invasion has begun. Alien forces have breached', speed: 25 },
    { text: 'our orbital defenses. Major cities are falling.', speed: 25 },
    { text: '', type: 'spacer' },
    { text: "You are humanity's last hope.", type: "highlight", speed: 40 },
    { text: '', type: 'spacer' },
    { text: 'As an elite TOP GUN astronaut, you have been', speed: 25 },
    { text: 'selected for Operation: LAST STAND.', speed: 25 },
    { text: '', type: 'spacer' },
    { text: 'Your mission: Defend Earth at all costs.', type: 'mission', speed: 35 },
    { text: 'Destroy the invaders before they reach the surface.', speed: 25 },
    { text: '', type: 'spacer' },
    { text: 'The fate of 10 billion souls rests in your hands.', type: 'highlight', speed: 30 },
    { text: '', type: 'spacer' },
    { text: '[END TRANSMISSION]', type: 'header', speed: 20 },
  ];

  return (
    <div className="landing-page">
      {/* Mode Selection Modal */}
      {showModeSelection && (
        <ModeSelectionModal
          onSelectMode={handleSelectMode}
          onClose={() => setShowModeSelection(false)}
          highScore={highScore}
        />
      )}
      
      {/* Animated Starfield Background */}
      <div className="starfield">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Floating Alien Ships */}
      <div className="floating-aliens">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="floating-alien"
            style={{
              left: `${10 + i * 20}%`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            👾
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className={`content-wrapper ${showContent ? 'visible' : ''}`}>
        {/* Hero Section */}
        <header className="hero-section">
          <div className="glitch-container">
            <h1 className="main-title glitch" data-text="SPACEINVADERS">
              SPACEINVADERS
            </h1>
            <h2 className="sub-title">.EARTH</h2>
          </div>
          <p className="tagline">THE LAST STAND • EARTH 2087</p>
        </header>

        {/* Terminal Narrative Section */}
        <section className="narrative-section">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-buttons">
                <span className="btn-red"></span>
                <span className="btn-yellow"></span>
                <span className="btn-green"></span>
              </div>
              <span className="terminal-title">EARTH_DEFENSE_CMD.exe</span>
            </div>
            <div className="terminal-body">
              <div className="scanline"></div>
              {showContent && <TerminalMessage lines={terminalLines} startDelay={1000} />}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <button
            className="play-button"
            onClick={() => setShowModeSelection(true)}
          >
            <span className="button-text">🚀 LAUNCH MISSION</span>
            <span className="button-subtext">BEGIN YOUR DEFENSE</span>
          </button>

          <div className="controls-hint">
            <p>⌨️ ARROW KEYS or TOUCH to move</p>
            <p>SPACE or TAP to fire</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h3 className="section-title">// MISSION BRIEFING</h3>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🎮</span>
              <h4>10 INTENSE LEVELS</h4>
              <p>Progressive difficulty as the invasion intensifies</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">👾</span>
              <h4>MYSTERY INVADERS</h4>
              <p>High-value targets worth 1000 points</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">👥</span>
              <h4>2 PLAYER BATTLE</h4>
              <p>Challenge a friend on the same device!</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h4>LEADERBOARD</h4>
              <p>Compete for the highest score</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p>© 2087 EARTH DEFENSE COMMAND</p>
          <p className="footer-sub">A RETRO 3D EXPERIENCE</p>
        </footer>
      </div>

      {/* CRT Effect Overlay */}
      <div className="crt-overlay"></div>
    </div>
  );
};

export default LandingPage;
// Build: 1769043121
