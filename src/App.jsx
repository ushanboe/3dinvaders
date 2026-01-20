import React, { useEffect } from 'react';
import { Game } from './components/Game';
import { UI } from './components/UI';
import { soundManager } from './utils/sounds';
import './styles/index.css';

function App() {
  useEffect(() => {
    // Initialize sound on first user interaction
    const initSound = () => {
      soundManager.init();
      document.removeEventListener('click', initSound);
      document.removeEventListener('touchstart', initSound);
      document.removeEventListener('keydown', initSound);
    };

    document.addEventListener('click', initSound);
    document.addEventListener('touchstart', initSound);
    document.addEventListener('keydown', initSound);

    // Prevent default touch behaviors
    const preventDefaults = (e) => {
      if (e.target.tagName !== 'BUTTON') {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventDefaults, { passive: false });

    // Handle visibility change (pause when tab is hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Could auto-pause here if desired
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('click', initSound);
      document.removeEventListener('touchstart', initSound);
      document.removeEventListener('keydown', initSound);
      document.removeEventListener('touchmove', preventDefaults);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Game />
      <UI />
    </div>
  );
}

export default App;
