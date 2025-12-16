import { resolve } from 'node:path';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    // Use jsdom for DOM environment
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./src/test/setup.ts'],

    // Test file patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Don't fail when no test files found
    passWithNoTests: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/types/**',
        'src/**/*.d.ts',
      ],
    },

    // Global test settings
    globals: true,

    // CSS handling
    css: true,

    // SolidJS specific
    deps: {
      optimizer: {
        web: {
          include: ['solid-js'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
    conditions: ['development', 'browser'],
  },
});
