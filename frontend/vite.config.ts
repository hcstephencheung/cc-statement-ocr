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
    allowedHosts: ['cc-statement-ocr-frontend-572034226949.europe-west1.run.app', 'budget-helper.scheung.dev'],
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    proxy: {
      '/api': {
        target: 'http://backend:9000', // Backend server
        changeOrigin: true,
        rewrite: (path) => path, // Ensures /api is not stripped
      },
    }
  },
});
