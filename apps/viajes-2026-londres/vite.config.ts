import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/viajes/2026-londres/',
  plugins: [react()],
  build: {
    outDir: '../../viajes/2026-londres',
    emptyOutDir: true,
  },
});
