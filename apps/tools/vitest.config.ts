import path from 'node:path';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    deps: {
      inline: ['lucide-solid'],
      optimizer: {
        web: {
          include: ['solid-js', 'lucide-solid'],
        },
      },
    },
  },
  resolve: {
    conditions: ['development', 'browser'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~/components': path.resolve(__dirname, './src/components'),
      '~/engine': path.resolve(__dirname, './src/engine'),
      '~/stores': path.resolve(__dirname, './src/stores'),
      '~/hooks': path.resolve(__dirname, './src/hooks'),
      '~/lib': path.resolve(__dirname, './src/lib'),
      '~/types': path.resolve(__dirname, './src/types'),
      '~/tools': path.resolve(__dirname, './src/tools'),
      '~/i18n': path.resolve(__dirname, './src/i18n'),
    },
  },
});
