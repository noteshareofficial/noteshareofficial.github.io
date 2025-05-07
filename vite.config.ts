import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { replit } from '@replit/vite-plugin-cartographer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), replit()],
  base: '/noteshare.github.io/', // Replace 'noteshare' with your actual repository name
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './assets'),
    },
  },
  // Any other existing configuration...
});
