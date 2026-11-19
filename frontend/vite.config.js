import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // O navegador só fala com o Vite, que repassa /api para o backend: sem CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
