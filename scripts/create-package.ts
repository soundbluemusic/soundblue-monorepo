#!/usr/bin/env tsx
/**
 * Create a new package in the monorepo
 * Usage: pnpm create-package <layer>/<name>
 * Example: pnpm create-package core/audio-engine
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LAYERS = ['core', 'platform', 'ui', 'seo', 'pwa', 'i18n', 'config'] as const;
type Layer = (typeof LAYERS)[number];

interface PackageConfig {
  name: string;
  layer: Layer;
  description: string;
  hasDualImpl: boolean;
}

function createPackageJson(config: PackageConfig): string {
  const { name, description, hasDualImpl } = config;
  const fullName = `@soundblue/${name}`;

  const baseExports = hasDualImpl
    ? {
        '.': {
          types: './src/types.ts',
          browser: './src/index.browser.ts',
          default: './src/index.noop.ts',
        },
      }
    : {
        '.': {
          types: './src/index.ts',
          import: './src/index.ts',
        },
      };

  return JSON.stringify(
    {
      name: fullName,
      version: '1.0.0',
      private: true,
      type: 'module',
      description,
      exports: baseExports,
      main: hasDualImpl ? './src/index.browser.ts' : './src/index.ts',
      types: hasDualImpl ? './src/types.ts' : './src/index.ts',
      files: ['src'],
      scripts: {
        typecheck: 'tsc --noEmit',
        test: 'vitest run',
        'test:watch': 'vitest',
      },
      devDependencies: {
        typescript: '^5.9.3',
        vitest: '^4.0.15',
      },
    },
    null,
    2,
  );
}

function createTsConfig(): string {
  return JSON.stringify(
    {
      extends: '@soundblue/config/tsconfig/base',
      compilerOptions: {
        outDir: './dist',
        rootDir: './src',
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '__tests__'],
    },
    null,
    2,
  );
}

function createVitestConfig(): string {
  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
`;
}

function createIndexFile(hasDualImpl: boolean): string {
  if (hasDualImpl) {
    return `// This file is for browser environment
// See index.noop.ts for build-time/SSR environment

export * from './types';

// TODO: Implement browser-specific exports
`;
  }
  return `// Package entry point
export {};

// TODO: Add exports
`;
}

function createNoopFile(): string {
  return `// This file is for build-time/SSR environment
// Provides empty implementations to prevent browser API errors during SSG build

export * from './types';

// TODO: Implement noop versions of browser APIs
`;
}

function createTypesFile(): string {
  return `// Shared types for both browser and noop implementations

// TODO: Add shared interfaces and types
`;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: pnpm create-package <layer>/<name>');
    console.error('Example: pnpm create-package core/audio-engine');
    console.error(`Available layers: ${LAYERS.join(', ')}`);
    process.exit(1);
  }

  const [path] = args;
  const parts = path?.split('/');

  if (!parts || parts.length !== 2) {
    console.error('Invalid path format. Use: <layer>/<name>');
    process.exit(1);
  }

  const [layer, name] = parts as [string, string];

  if (!LAYERS.includes(layer as Layer)) {
    console.error(`Invalid layer: ${layer}`);
    console.error(`Available layers: ${LAYERS.join(', ')}`);
    process.exit(1);
  }

  // Platform packages use dual implementation
  const hasDualImpl = layer === 'platform';
  const packagePath = join(process.cwd(), 'packages', layer, name);

  if (existsSync(packagePath)) {
    console.error(`Package already exists: ${packagePath}`);
    process.exit(1);
  }

  // Create directories
  mkdirSync(join(packagePath, 'src'), { recursive: true });
  mkdirSync(join(packagePath, '__tests__'), { recursive: true });

  // Create files
  const config: PackageConfig = {
    name,
    layer: layer as Layer,
    description: `SoundBlue ${name} package`,
    hasDualImpl,
  };

  writeFileSync(join(packagePath, 'package.json'), createPackageJson(config));
  writeFileSync(join(packagePath, 'tsconfig.json'), createTsConfig());
  writeFileSync(join(packagePath, 'vitest.config.ts'), createVitestConfig());

  if (hasDualImpl) {
    writeFileSync(join(packagePath, 'src', 'types.ts'), createTypesFile());
    writeFileSync(join(packagePath, 'src', 'index.browser.ts'), createIndexFile(true));
    writeFileSync(join(packagePath, 'src', 'index.noop.ts'), createNoopFile());
  } else {
    writeFileSync(join(packagePath, 'src', 'index.ts'), createIndexFile(false));
  }

  console.log(`✅ Created package: @soundblue/${name}`);
  console.log(`   Location: ${packagePath}`);
  console.log(`   Dual implementation: ${hasDualImpl ? 'Yes' : 'No'}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run: pnpm install');
  console.log('  2. Implement the package logic');
  console.log('  3. Add exports to src/index.ts');
}

main();
