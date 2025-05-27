import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:9000', // Backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove '/api' prefix
      },
    },
    allowedHosts: ['cc-statement-ocr-frontend.onrender.com'],
  },
});
