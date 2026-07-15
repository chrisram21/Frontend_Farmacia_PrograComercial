import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // Redirige /api al backend en desarrollo para evitar CORS.
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
