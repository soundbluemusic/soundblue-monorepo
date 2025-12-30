#!/usr/bin/env tsx
/**
 * Prebuild script - runs before the main build
 *
 * Tasks:
 * 1. Validate data/*.json files
 * 2. Transform and copy to public/data/
 * 3. Generate search indices
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, 'data');
const APPS = ['tools', 'sound-blue', 'dialogue'];

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

function validateJsonFile(filePath: string): ValidationResult {
  const result: ValidationResult = {
    file: filePath,
    valid: true,
    errors: [],
  };

  try {
    const content = readFileSync(filePath, 'utf-8');
    JSON.parse(content);
  } catch (error) {
    result.valid = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}

function copyDataToApps(): void {
  if (!existsSync(DATA_DIR)) {
    console.log('📁 No data/ directory found, skipping data copy');
    return;
  }

  const dictionariesDir = join(DATA_DIR, 'dictionaries');
  const samplesDir = join(DATA_DIR, 'samples');

  for (const app of APPS) {
    const appPublicData = join(ROOT, 'apps', app, 'public', 'data');

    // Create directories if needed
    if (!existsSync(appPublicData)) {
      mkdirSync(appPublicData, { recursive: true });
    }

    // Copy dictionaries
    if (existsSync(dictionariesDir)) {
      const dictTarget = join(appPublicData, 'dictionaries');
      if (!existsSync(dictTarget)) {
        mkdirSync(dictTarget, { recursive: true });
      }

      const files = readdirSync(dictionariesDir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        const src = join(dictionariesDir, file);
        const dest = join(dictTarget, file);
        const content = readFileSync(src, 'utf-8');
        writeFileSync(dest, content);
      }
      console.log(`  📦 Copied ${files.length} dictionary files to ${app}`);
    }

    // Copy samples (only for tools app)
    if (app === 'tools' && existsSync(samplesDir)) {
      const samplesTarget = join(appPublicData, 'samples');
      if (!existsSync(samplesTarget)) {
        mkdirSync(samplesTarget, { recursive: true });
      }

      const files = readdirSync(samplesDir);
      for (const file of files) {
        const src = join(samplesDir, file);
        const dest = join(samplesTarget, file);
        const content = readFileSync(src);
        writeFileSync(dest, content);
      }
      console.log(`  🎵 Copied ${files.length} sample files to ${app}`);
    }
  }
}

function validateAllData(): boolean {
  console.log('🔍 Validating data files...');

  if (!existsSync(DATA_DIR)) {
    console.log('  No data/ directory found');
    return true;
  }

  const dictionariesDir = join(DATA_DIR, 'dictionaries');
  if (!existsSync(dictionariesDir)) {
    console.log('  No dictionaries/ directory found');
    return true;
  }

  const files = readdirSync(dictionariesDir).filter((f) => f.endsWith('.json'));
  let allValid = true;

  for (const file of files) {
    const filePath = join(dictionariesDir, file);
    const result = validateJsonFile(filePath);

    if (result.valid) {
      console.log(`  ✅ ${basename(file)}`);
    } else {
      console.log(`  ❌ ${basename(file)}: ${result.errors.join(', ')}`);
      allValid = false;
    }
  }

  return allValid;
}

async function main() {
  console.log('🚀 Running prebuild...\n');

  // Step 1: Validate
  const valid = validateAllData();
  if (!valid) {
    console.error('\n❌ Validation failed. Fix errors before building.');
    process.exit(1);
  }

  console.log('');

  // Step 2: Copy data to apps
  console.log('📂 Copying data to apps...');
  copyDataToApps();

  console.log('\n✅ Prebuild complete!');
}

main().catch((error) => {
  console.error('Prebuild failed:', error);
  process.exit(1);
});
