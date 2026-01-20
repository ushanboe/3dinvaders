# Space Invaders 3D - PWA Game

A 3D Space Invaders-style game built with React and Three.js (React Three Fiber) as a Progressive Web App.

## Features

- **First-person 3D perspective** looking up at enemies advancing toward you
- **60 enemies** (5 rows × 12 columns) with different colors per row
- **Retro arcade sounds** generated with Web Audio API
- **PWA support** - installable on mobile devices
- **Responsive design** - works on PC and mobile
- **Touch controls** for mobile devices
- **Score tracking** with high score persistence

## Controls

### Desktop
- **← → or A/D** - Move left/right
- **SPACE** - Fire
- **P or ESC** - Pause

### Mobile
- **◀ ▶ buttons** - Move left/right
- **● button** - Fire

## Installation & Running

### Development Mode
```bash
cd /root/invader-game
npm install
npm run dev
```
Then open http://localhost:3000 in your browser.

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure

```
/root/invader-game/
├── index.html              # Main HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration with PWA plugin
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── icon-192.png        # PWA icon (192x192)
│   └── icon-512.png        # PWA icon (512x512)
└── src/
    ├── index.jsx           # React entry point
    ├── App.jsx             # Main App component
    ├── components/
    │   ├── Game.jsx        # Main 3D game scene
    │   ├── Enemy.jsx       # Enemy cube components
    │   ├── Player.jsx      # Player cannon component
    │   ├── Projectile.jsx  # Projectile components
    │   ├── Road.jsx        # Ground/road with grid
    │   └── UI.jsx          # HUD, menus, mobile controls
    ├── hooks/
    │   └── useGameLogic.js # Game state management (Zustand)
    ├── utils/
    │   └── sounds.js       # Web Audio API sound effects
    └── styles/
        └── index.css       # UI styles
```

## Game Mechanics

- **Enemies** advance toward the player over time
- **Player** has 3 lives
- **Score** increases based on enemy row (higher rows = more points)
- **Game Over** when all lives lost or enemies reach the player
- **Victory** when all 60 enemies are destroyed

## Technologies Used

- React 18
- React Three Fiber (Three.js)
- Zustand (state management)
- Vite (build tool)
- vite-plugin-pwa (PWA support)
- Web Audio API (sound effects)

## Customization

The enemies are currently placeholder cubes with different colors per row:
- Row 0: Pink (#ff0066)
- Row 1: Orange (#ff6600)
- Row 2: Yellow (#ffff00)
- Row 3: Green (#00ff66)
- Row 4: Cyan (#00ffff)

To replace with custom 3D models, modify the `Enemy.jsx` component.

## License

MIT
