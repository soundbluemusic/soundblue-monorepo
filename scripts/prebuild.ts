#!/usr/bin/env tsx
/**
 * Prebuild script - runs before the main build
 *
 * Tasks:
 * 1. Validate data/*.json files against schemas
 * 2. Transform and copy to public/data/
 * 3. Generate search indices
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = join(ROOT, 'data');
const DICTIONARIES_DIR = join(DATA_DIR, 'dictionaries');
const SCHEMAS_DIR = join(DICTIONARIES_DIR, 'schemas');
const APPS = ['tools', 'sound-blue', 'dialogue'];

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

interface JsonSchema {
  type: string;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  enum?: string[];
}

/**
 * Simple JSON Schema validator (supports draft-07 subset)
 */
function validateAgainstSchema(data: unknown, schema: JsonSchema, path = ''): string[] {
  const errors: string[] = [];

  // Type check
  if (schema.type === 'object') {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push(
        `${path || 'root'}: expected object, got ${Array.isArray(data) ? 'array' : typeof data}`,
      );
      return errors;
    }

    // Required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`${path || 'root'}: missing required field "${field}"`);
        }
      }
    }

    // Properties
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in data) {
          const propErrors = validateAgainstSchema(
            (data as Record<string, unknown>)[key],
            propSchema,
            path ? `${path}.${key}` : key,
          );
          errors.push(...propErrors);
        }
      }
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(data)) {
      errors.push(`${path || 'root'}: expected array, got ${typeof data}`);
      return errors;
    }

    // Items schema
    if (schema.items) {
      for (let i = 0; i < Math.min(data.length, 5); i++) {
        const itemErrors = validateAgainstSchema(data[i], schema.items, `${path}[${i}]`);
        errors.push(...itemErrors);
      }
      // Check a sample if array is large
      if (data.length > 5) {
        const sampleIndices = [
          Math.floor(data.length / 4),
          Math.floor(data.length / 2),
          Math.floor((data.length * 3) / 4),
        ];
        for (const i of sampleIndices) {
          const itemErrors = validateAgainstSchema(data[i], schema.items, `${path}[${i}]`);
          errors.push(...itemErrors);
        }
      }
    }
  } else if (schema.type === 'string') {
    if (typeof data !== 'string') {
      errors.push(`${path || 'root'}: expected string, got ${typeof data}`);
    }
  } else if (schema.type === 'integer' || schema.type === 'number') {
    if (typeof data !== 'number') {
      errors.push(`${path || 'root'}: expected number, got ${typeof data}`);
    }
  }

  // Enum check
  if (schema.enum && !schema.enum.includes(data as string)) {
    errors.push(`${path || 'root'}: value must be one of [${schema.enum.join(', ')}]`);
  }

  return errors;
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

/**
 * Validate JSON file against its schema
 */
function validateWithSchema(filePath: string, schemaPath: string): ValidationResult {
  const result: ValidationResult = {
    file: filePath,
    valid: true,
    errors: [],
  };

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (existsSync(schemaPath)) {
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaContent) as JsonSchema;
      const schemaErrors = validateAgainstSchema(data, schema);

      if (schemaErrors.length > 0) {
        result.valid = false;
        result.errors = schemaErrors.slice(0, 5); // Limit to 5 errors
        if (schemaErrors.length > 5) {
          result.errors.push(`... and ${schemaErrors.length - 5} more errors`);
        }
      }
    }
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

/**
 * Schema mapping for dictionary files
 */
const SCHEMA_MAP: Record<string, string> = {
  'words/ko-to-en.json': 'words.schema.json',
  'words/en-to-ko.json': 'words.schema.json',
  'words/stems.json': 'stems.schema.json',
  'idioms/idioms.json': 'idioms.schema.json',
  'polysemy/polysemy.json': 'polysemy.schema.json',
  'domains/all-domains.json': 'domains.schema.json',
  // colors.json, countries.json use different structure (object with koToEn array)
};

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir: string, basePath = ''): string[] {
  const files: string[] = [];
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
    if (entry.isDirectory() && entry.name !== 'schemas') {
      files.push(...findJsonFiles(join(dir, entry.name), relativePath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(relativePath);
    }
  }
  return files;
}

/**
 * Validate all dictionary JSON files
 */
function validateAllDictionaries(): boolean {
  console.log('🔍 Validating dictionary files...');

  if (!existsSync(DICTIONARIES_DIR)) {
    console.log('  No dictionaries/ directory found');
    return true;
  }

  const jsonFiles = findJsonFiles(DICTIONARIES_DIR);
  let allValid = true;
  let validCount = 0;
  let totalCount = 0;

  for (const relativePath of jsonFiles) {
    totalCount++;
    const filePath = join(DICTIONARIES_DIR, relativePath);
    const schemaFile = SCHEMA_MAP[relativePath];
    const schemaPath = schemaFile ? join(SCHEMAS_DIR, schemaFile) : '';

    let result: ValidationResult;
    if (schemaPath && existsSync(schemaPath)) {
      result = validateWithSchema(filePath, schemaPath);
    } else {
      result = validateJsonFile(filePath);
    }

    if (result.valid) {
      validCount++;
      console.log(`  ✅ ${relativePath}`);
    } else {
      console.log(`  ❌ ${relativePath}: ${result.errors.join(', ')}`);
      allValid = false;
    }
  }

  console.log(`  📊 ${validCount}/${totalCount} files valid`);
  return allValid;
}

function _validateAllData(): boolean {
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

/**
 * Generate TypeScript files from JSON dictionaries
 * This allows translator to use static imports instead of async fetch
 */
function generateTypescriptFromJson(): void {
  console.log('🔧 Generating TypeScript from JSON dictionaries...');

  const outputDir = join(ROOT, 'apps/tools/app/tools/translator/dictionary/generated');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Load and generate ko-to-en words
  const koToEnPath = join(DICTIONARIES_DIR, 'words/ko-to-en.json');
  if (existsSync(koToEnPath)) {
    const data = JSON.parse(readFileSync(koToEnPath, 'utf-8')) as Array<{ ko: string; en: string }>;
    const koToEn: Record<string, string> = {};
    for (const entry of data) {
      koToEn[entry.ko] = entry.en;
    }
    const ts = `// Auto-generated from data/dictionaries/words/ko-to-en.json
// DO NOT EDIT - run 'pnpm prebuild' to regenerate

export const jsonKoToEnWords: Record<string, string> = ${JSON.stringify(koToEn, null, 2)};
`;
    writeFileSync(join(outputDir, 'ko-to-en.ts'), ts);
    console.log(`  📝 Generated ko-to-en.ts (${Object.keys(koToEn).length} entries)`);
  }

  // Load and generate en-to-ko words
  const enToKoPath = join(DICTIONARIES_DIR, 'words/en-to-ko.json');
  if (existsSync(enToKoPath)) {
    const data = JSON.parse(readFileSync(enToKoPath, 'utf-8')) as Array<{ ko: string; en: string }>;
    const enToKo: Record<string, string> = {};
    for (const entry of data) {
      enToKo[entry.en] = entry.ko;
    }
    const ts = `// Auto-generated from data/dictionaries/words/en-to-ko.json
// DO NOT EDIT - run 'pnpm prebuild' to regenerate

export const jsonEnToKoWords: Record<string, string> = ${JSON.stringify(enToKo, null, 2)};
`;
    writeFileSync(join(outputDir, 'en-to-ko.ts'), ts);
    console.log(`  📝 Generated en-to-ko.ts (${Object.keys(enToKo).length} entries)`);
  }

  // Load and generate stems
  const stemsPath = join(DICTIONARIES_DIR, 'words/stems.json');
  if (existsSync(stemsPath)) {
    const stems = JSON.parse(readFileSync(stemsPath, 'utf-8')) as Array<{
      stem: string;
      en: string;
      type: string;
    }>;
    const verbStems: Record<string, string> = {};
    const adjStems: Record<string, string> = {};
    const nounStems: Record<string, string> = {};

    for (const s of stems) {
      if (s.type === 'verb') verbStems[s.stem] = s.en;
      else if (s.type === 'adjective') adjStems[s.stem] = s.en;
      else if (s.type === 'noun') nounStems[s.stem] = s.en;
    }

    const ts = `// Auto-generated from data/dictionaries/words/stems.json
// DO NOT EDIT - run 'pnpm prebuild' to regenerate

export const jsonVerbStems: Record<string, string> = ${JSON.stringify(verbStems, null, 2)};

export const jsonAdjectiveStems: Record<string, string> = ${JSON.stringify(adjStems, null, 2)};

export const jsonNounStems: Record<string, string> = ${JSON.stringify(nounStems, null, 2)};
`;
    writeFileSync(join(outputDir, 'stems.ts'), ts);
    console.log(`  📝 Generated stems.ts (${stems.length} entries)`);
  }

  // Load and generate idioms
  const idiomsPath = join(DICTIONARIES_DIR, 'idioms/idioms.json');
  if (existsSync(idiomsPath)) {
    const idioms = JSON.parse(readFileSync(idiomsPath, 'utf-8')) as Array<{
      ko: string;
      en: string;
      literal?: string;
      category?: string;
      variants?: string[];
    }>;

    // Generate enToKoIdioms (reverse mapping)
    const enToKoIdioms: Record<string, string> = {};
    for (const idiom of idioms) {
      enToKoIdioms[idiom.en] = idiom.ko;
    }

    const ts = `// Auto-generated from data/dictionaries/idioms/idioms.json
// DO NOT EDIT - run 'pnpm prebuild' to regenerate

export interface JsonIdiomEntry {
  ko: string;
  en: string;
  literal?: string;
  category?: string;
  variants?: string[];
}

export const jsonIdioms: JsonIdiomEntry[] = ${JSON.stringify(idioms, null, 2)};

// Reverse mapping (en → ko)
export const jsonEnToKoIdioms: Record<string, string> = ${JSON.stringify(enToKoIdioms, null, 2)};
`;
    writeFileSync(join(outputDir, 'idioms.ts'), ts);
    console.log(`  📝 Generated idioms.ts (${idioms.length} entries)`);
  }

  // Generate index file
  const indexTs = `// Auto-generated index for JSON dictionary exports
// DO NOT EDIT - run 'pnpm prebuild' to regenerate

export * from './ko-to-en';
export * from './en-to-ko';
export * from './stems';
export * from './idioms';
`;
  writeFileSync(join(outputDir, 'index.ts'), indexTs);
  console.log('  📝 Generated index.ts');
}

async function main() {
  console.log('🚀 Running prebuild...\n');

  // Step 1: Validate dictionary JSON files with schemas
  const dictValid = validateAllDictionaries();
  if (!dictValid) {
    console.error('\n❌ Dictionary validation failed. Fix errors before building.');
    process.exit(1);
  }

  console.log('');

  // Step 2: Generate TypeScript from JSON for translator
  generateTypescriptFromJson();

  console.log('');

  // Step 3: Copy data to apps
  console.log('📂 Copying data to apps...');
  copyDataToApps();

  // Step 4: Run official metrics evaluation (optional - requires Python + sacrebleu + nltk)
  console.log('\n📊 Running official metrics evaluation...');
  try {
    execSync('python3 scripts/evaluate-official-metrics.py', {
      cwd: ROOT,
      stdio: 'inherit',
    });
  } catch {
    console.log('  ⚠️ Skipped metrics evaluation (Python dependencies not available)');
  }

  console.log('\n✅ Prebuild complete!');
}

main().catch((error) => {
  console.error('Prebuild failed:', error);
  process.exit(1);
});
