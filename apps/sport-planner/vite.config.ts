import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: '/sport-planner/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Sport Planner',
        short_name: 'SportPlanner',
        description: 'Planifica sesiones deportivas y de entrenamiento personal.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/sport-planner/',
        start_url: '/sport-planner/',
        lang: 'es',
        icons: [
          {
            src: '/sport-planner/pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/sport-planner/pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/sport-planner/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        cleanupOutdatedCaches: true
      }
    })
  ],
  build: {
    outDir: '../../sport-planner',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
