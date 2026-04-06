import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel sets VERCEL_ENV=preview|production|development during `vite build` on their builders
const vercelEnv = process.env.VERCEL_ENV ?? '';

export default defineConfig({
  define: {
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(vercelEnv),
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
