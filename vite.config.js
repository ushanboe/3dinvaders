import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'sounds/*'],
      manifest: {
        name: 'Space Invaders 3D',
        short_name: 'Invaders3D',
        description: '3D Space Invaders game built with React and Three.js',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'fullscreen',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wav,mp3}']
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});
