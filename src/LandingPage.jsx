import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const starfieldRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Generate starfield
    const starfield = starfieldRef.current;
    if (starfield && starfield.children.length === 0) {
      for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 3 + 1 + 'px';
        star.style.width = size;
        star.style.height = size;
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        starfield.appendChild(star);
      }
    }
  }, []);

  const playLaunchSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const handleLaunch = () => {
    playLaunchSound();
    setTimeout(() => navigate('/game'), 200);
  };

  return (
    <div className="landing-page">
      {/* CRT Overlay */}
      <div className="crt-overlay crt-flicker"></div>

      {/* Starfield */}
      <div className="starfield" ref={starfieldRef}></div>

      {/* Floating Alien Ships */}
      <div className="alien-ship" style={{ top: '15%', animationDelay: '0s' }}>👾</div>
      <div className="alien-ship" style={{ top: '35%', animationDelay: '-7s' }}>👾</div>
      <div className="alien-ship" style={{ top: '55%', animationDelay: '-14s' }}>👾</div>

      {/* Main Container */}
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1 className="logo">SPACEINVADERS.EARTH</h1>
          <p className="tagline">⚠ INCOMING TRANSMISSION ⚠</p>
        </header>

        {/* Story Section */}
        <section className="story-section">
          <div className="terminal">
            <div className="terminal-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="terminal-title">EARTH_DEFENSE_COMMAND.exe</span>
            </div>
            <div className="terminal-content">
              <p><span className="date">[2087.12.24 - 03:47:22 UTC]</span></p>
              <p><span className="command">&gt; PRIORITY: OMEGA</span></p>
              <p><span className="command">&gt; CLASSIFICATION: EYES ONLY</span></p>
              <br />
              <p><span className="alert">⚠ ALERT: MASSIVE ALIEN FLEET DETECTED ⚠</span></p>
              <br />
              <p>They came without warning.</p>
              <br />
              <p>On Christmas Eve, 2087, humanity's deep space sensors detected an armada of <span className="highlight">10,000 hostile vessels</span> emerging from a wormhole near Jupiter.</p>
              <br />
              <p>Within hours, our orbital defense platforms were <span className="alert">DESTROYED</span>.</p>
              <br />
              <p>The invaders now descend upon Earth in waves, their formation unmistakable - the ancient pattern our ancestors once called <span className="highlight">"SPACE INVADERS"</span>.</p>
              <br />
              <p>Our last hope: the elite <span className="highlight">TOP GUN ASTRONAUT CORPS</span> - humanity's finest pilots, armed with experimental plasma cannons.</p>
              <br />
              <p><span className="command">&gt; MISSION STATUS:</span> <span className="alert">THE LAST STAND</span></p>
              <p><span className="command">&gt; OBJECTIVE:</span> DEFEND EARTH AT ALL COSTS</p>
              <p><span className="command">&gt; PILOT STATUS:</span> <span className="highlight">AWAITING YOUR COMMAND</span></p>
              <br />
              <p><span className="command">&gt; _</span><span className="cursor"></span></p>
            </div>
          </div>

          <div className="transmission">
            <p className="transmission-text">/// END TRANSMISSION /// SIGNAL DEGRADING ///</p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <h2 className="cta-title">HUMANITY NEEDS YOU, PILOT</h2>
          <button onClick={handleLaunch} className="play-button">🎮 LAUNCH MISSION</button>
          <p className="play-subtitle">Free to play • No download required • Mobile ready</p>
        </section>

        {/* Features */}
        <section className="features-section">
          <h2 className="features-title">// MISSION BRIEFING //</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">3D COMBAT</h3>
              <p className="feature-desc">Experience the classic invasion in stunning 3D with modern graphics and smooth 60fps gameplay</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">PLAY ANYWHERE</h3>
              <p className="feature-desc">Desktop, tablet, or phone - defend Earth from any device with touch or keyboard controls</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">LEADERBOARDS</h3>
              <p className="feature-desc">Compete for the highest score and prove you're Earth's greatest defender</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">10 LEVELS</h3>
              <p className="feature-desc">Progressive difficulty with mystery invaders, dive attacks, and the legendary Top Gun bonus</p>
            </div>
          </div>
        </section>

        {/* Premium Section */}
        <section className="premium-section">
          <span className="premium-badge">★ PREMIUM ★</span>
          <h2 className="premium-title">ELITE PILOT PROGRAM</h2>
          <p className="premium-desc">Unlock exclusive ships, power-ups, multiplayer battles, and custom invasion scenarios. Join the elite defenders of Earth.</p>
          <div className="coming-soon">COMING SOON</div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p className="footer-text">© <span className="footer-year">2087</span> EARTH DEFENSE COMMAND • SPACEINVADERS.EARTH</p>
        </footer>
      </div>
    </div>
  );
}
