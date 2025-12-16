/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'pnpm',
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: {
    fileName: 'stryker-report/mutation-report.html',
  },
  // Focus on core logic files for mutation testing
  mutate: [
    'src/lib/**/*.ts',
    'src/utils/**/*.ts',
    'src/hooks/**/*.ts',
    'src/constants/brand.ts',
    // Exclude test files and type-only files
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  // Ignore CSS and visual-only changes
  ignorePatterns: ['node_modules', 'dist', '.vinxi', '.output', 'stryker-report'],
  // Timeout settings for longer running tests
  timeoutMS: 60000,
  timeoutFactor: 2,
  // Concurrency
  concurrency: 2,
  // Coverage analysis
  coverageAnalysis: 'perTest',
  // Thresholds (optional - can be adjusted)
  thresholds: {
    high: 80,
    low: 60,
    break: null, // Don't fail build on low mutation score yet
  },
  // Disable warnings for unknown options
  warnings: {
    unknownOptions: false,
  },
};

export default config;
