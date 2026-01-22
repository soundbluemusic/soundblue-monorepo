import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/soundblue-monorepo/',
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
  build: {
    target: 'esnext',
  },
});
