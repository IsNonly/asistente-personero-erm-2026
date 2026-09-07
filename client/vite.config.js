import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api -> servidor Express (puerto 4000 por defecto).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
