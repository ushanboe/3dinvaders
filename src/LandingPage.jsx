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

const LandingPage = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);

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
            onClick={() => navigate('/game')}
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
              <span className="feature-icon">✈️</span>
              <h4>TOP GUN BONUS</h4>
              <p>Destroy dive formations for bonus points</p>
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
