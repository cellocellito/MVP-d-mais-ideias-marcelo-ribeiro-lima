import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Toda chamada para /api é repassada pelo Vite para o backend.
    // Para o navegador, a tela e a API estão no mesmo endereço (localhost:5173),
    // então não existe chamada entre origens diferentes e o backend não precisa
    // liberar CORS para ninguém.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
