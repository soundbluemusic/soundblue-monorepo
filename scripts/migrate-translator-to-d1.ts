/**
 * D1 Migration Script - Translator Dictionary Data
 * Migrates all dictionary data to algorithms D1
 */

import { execSync } from 'node:child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SOUNDBLUE_MONOREPO = '/Volumes/X10 Pro/monorepo-project/soundblue-monorepo';
const DICTIONARIES_DIR = join(SOUNDBLUE_MONOREPO, 'data/dictionaries');

// SQL-safe string escaping
function sqlEscape(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Execute D1 via file
function executeD1WithFile(db: string, sql: string): void {
  const tempFile = '/tmp/d1-translator-temp.sql';
  writeFileSync(tempFile, sql, 'utf-8');

  const cmd = `pnpm wrangler d1 execute ${db} --remote --file="${tempFile}"`;
  try {
    execSync(cmd, { cwd: SOUNDBLUE_MONOREPO, stdio: 'pipe' });
  } finally {
    try {
      unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// Execute D1 command directly (for schema)
function executeD1(db: string, sql: string): void {
  const tempFile = '/tmp/d1-schema-temp.sql';
  writeFileSync(tempFile, sql, 'utf-8');

  const cmd = `pnpm wrangler d1 execute ${db} --remote --file="${tempFile}"`;
  try {
    execSync(cmd, { cwd: SOUNDBLUE_MONOREPO, stdio: 'inherit' });
  } finally {
    try {
      unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// Create tables
async function createTables(): Promise<void> {
  console.log('Creating translator tables in algorithms D1...\n');

  const schema = `
-- Ko to En words
DROP TABLE IF EXISTS dict_ko_to_en;
CREATE TABLE dict_ko_to_en (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ko TEXT NOT NULL UNIQUE,
  en TEXT NOT NULL
);
CREATE INDEX idx_ko_to_en_ko ON dict_ko_to_en(ko);

-- En to Ko words
DROP TABLE IF EXISTS dict_en_to_ko;
CREATE TABLE dict_en_to_ko (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT NOT NULL UNIQUE,
  ko TEXT NOT NULL
);
CREATE INDEX idx_en_to_ko_en ON dict_en_to_ko(en);

-- Stems (verb, adjective, noun)
DROP TABLE IF EXISTS dict_stems;
CREATE TABLE dict_stems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stem TEXT NOT NULL UNIQUE,
  en TEXT NOT NULL,
  type TEXT NOT NULL
);
CREATE INDEX idx_stems_stem ON dict_stems(stem);
CREATE INDEX idx_stems_type ON dict_stems(type);

-- Idioms
DROP TABLE IF EXISTS dict_idioms;
CREATE TABLE dict_idioms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ko TEXT NOT NULL UNIQUE,
  en TEXT NOT NULL,
  category TEXT
);
CREATE INDEX idx_idioms_ko ON dict_idioms(ko);

-- Domain vocabulary
DROP TABLE IF EXISTS dict_domains;
CREATE TABLE dict_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ko TEXT NOT NULL,
  en TEXT NOT NULL,
  domain TEXT NOT NULL,
  direction TEXT NOT NULL
);
CREATE INDEX idx_domains_ko ON dict_domains(ko);
CREATE INDEX idx_domains_en ON dict_domains(en);
CREATE INDEX idx_domains_domain ON dict_domains(domain);

-- Colors
DROP TABLE IF EXISTS dict_colors;
CREATE TABLE dict_colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ko TEXT NOT NULL UNIQUE,
  en TEXT NOT NULL
);
CREATE INDEX idx_colors_ko ON dict_colors(ko);

-- Countries
DROP TABLE IF EXISTS dict_countries;
CREATE TABLE dict_countries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ko TEXT NOT NULL UNIQUE,
  en TEXT NOT NULL
);
CREATE INDEX idx_countries_ko ON dict_countries(ko);

-- Expressions (compound words, phrasal verbs, onomatopoeia, cultural)
DROP TABLE IF EXISTS dict_expressions;
CREATE TABLE dict_expressions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ko TEXT NOT NULL,
  en TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT
);
CREATE INDEX idx_expressions_ko ON dict_expressions(ko);
CREATE INDEX idx_expressions_type ON dict_expressions(type);

-- Polysemy (multiple meanings)
DROP TABLE IF EXISTS dict_polysemy;
CREATE TABLE dict_polysemy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  meanings TEXT NOT NULL,
  examples TEXT
);
CREATE INDEX idx_polysemy_word ON dict_polysemy(word);
`;

  executeD1('algorithms', schema);
  console.log('Tables created successfully!\n');
}

// Migrate ko-to-en words
async function migrateKoToEn(): Promise<void> {
  console.log('Migrating ko-to-en words...');
  const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, 'words/ko-to-en.json'), 'utf-8'));

  let count = 0;
  const batchSize = 100;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch
      .map(
        (item: { ko: string; en: string }) => `('${sqlEscape(item.ko)}', '${sqlEscape(item.en)}')`,
      )
      .join(',\n');

    const sql = `INSERT OR REPLACE INTO dict_ko_to_en (ko, en) VALUES ${values};`;

    try {
      executeD1WithFile('algorithms', sql);
      count += batch.length;
    } catch (_error) {
      console.error(`  Failed batch at index ${i}`);
    }
  }

  console.log(`  Migrated ${count} ko-to-en words\n`);
}

// Migrate en-to-ko words
async function migrateEnToKo(): Promise<void> {
  console.log('Migrating en-to-ko words...');
  const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, 'words/en-to-ko.json'), 'utf-8'));

  let count = 0;
  const batchSize = 100;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch
      .map(
        (item: { en: string; ko: string }) => `('${sqlEscape(item.en)}', '${sqlEscape(item.ko)}')`,
      )
      .join(',\n');

    const sql = `INSERT OR REPLACE INTO dict_en_to_ko (en, ko) VALUES ${values};`;

    try {
      executeD1WithFile('algorithms', sql);
      count += batch.length;
    } catch (_error) {
      console.error(`  Failed batch at index ${i}`);
    }
  }

  console.log(`  Migrated ${count} en-to-ko words\n`);
}

// Migrate stems
async function migrateStems(): Promise<void> {
  console.log('Migrating stems...');
  const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, 'words/stems.json'), 'utf-8'));

  let count = 0;
  const batchSize = 100;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch
      .map(
        (item: { stem: string; en: string; type: string }) =>
          `('${sqlEscape(item.stem)}', '${sqlEscape(item.en)}', '${sqlEscape(item.type)}')`,
      )
      .join(',\n');

    const sql = `INSERT OR REPLACE INTO dict_stems (stem, en, type) VALUES ${values};`;

    try {
      executeD1WithFile('algorithms', sql);
      count += batch.length;
    } catch (_error) {
      console.error(`  Failed batch at index ${i}`);
    }
  }

  console.log(`  Migrated ${count} stems\n`);
}

// Migrate idioms
async function migrateIdioms(): Promise<void> {
  console.log('Migrating idioms...');
  const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, 'idioms/idioms.json'), 'utf-8'));

  let count = 0;
  const batchSize = 50;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch
      .map(
        (item: { ko: string; en: string; category?: string }) =>
          `('${sqlEscape(item.ko)}', '${sqlEscape(item.en)}', '${sqlEscape(item.category || '')}')`,
      )
      .join(',\n');

    const sql = `INSERT OR REPLACE INTO dict_idioms (ko, en, category) VALUES ${values};`;

    try {
      executeD1WithFile('algorithms', sql);
      count += batch.length;
    } catch (_error) {
      console.error(`  Failed batch at index ${i}`);
    }
  }

  console.log(`  Migrated ${count} idioms\n`);
}

// Migrate domains
async function migrateDomains(): Promise<void> {
  console.log('Migrating domain vocabulary...');
  const data = JSON.parse(
    readFileSync(join(DICTIONARIES_DIR, 'domains/all-domains.json'), 'utf-8'),
  );

  let count = 0;
  const batchSize = 100;

  // Ko to En
  if (data.koToEn) {
    for (let i = 0; i < data.koToEn.length; i += batchSize) {
      const batch = data.koToEn.slice(i, i + batchSize);
      const values = batch
        .map(
          (item: { ko: string; en: string; domain: string }) =>
            `('${sqlEscape(item.ko)}', '${sqlEscape(item.en)}', '${sqlEscape(item.domain)}', 'ko-en')`,
        )
        .join(',\n');

      const sql = `INSERT INTO dict_domains (ko, en, domain, direction) VALUES ${values};`;

      try {
        executeD1WithFile('algorithms', sql);
        count += batch.length;
      } catch (_error) {
        console.error(`  Failed ko-en batch at index ${i}`);
      }
    }
  }

  // En to Ko
  if (data.enToKo) {
    for (let i = 0; i < data.enToKo.length; i += batchSize) {
      const batch = data.enToKo.slice(i, i + batchSize);
      const values = batch
        .map(
          (item: { en: string; ko: string; domain: string }) =>
            `('${sqlEscape(item.ko)}', '${sqlEscape(item.en)}', '${sqlEscape(item.domain)}', 'en-ko')`,
        )
        .join(',\n');

      const sql = `INSERT INTO dict_domains (ko, en, domain, direction) VALUES ${values};`;

      try {
        executeD1WithFile('algorithms', sql);
        count += batch.length;
      } catch (_error) {
        console.error(`  Failed en-ko batch at index ${i}`);
      }
    }
  }

  console.log(`  Migrated ${count} domain words\n`);
}

// Migrate colors
async function migrateColors(): Promise<void> {
  console.log('Migrating colors...');
  const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, 'words/colors.json'), 'utf-8'));

  let count = 0;
  const batchSize = 100;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch
      .map(
        (item: { ko: string; en: string }) => `('${sqlEscape(item.ko)}', '${sqlEscape(item.en)}')`,
      )
      .join(',\n');

    const sql = `INSERT OR REPLACE INTO dict_colors (ko, en) VALUES ${values};`;

    try {
      executeD1WithFile('algorithms', sql);
      count += batch.length;
    } catch (_error) {
      console.error(`  Failed batch at index ${i}`);
    }
  }

  console.log(`  Migrated ${count} colors\n`);
}

// Migrate countries
async function migrateCountries(): Promise<void> {
  console.log('Migrating countries...');
  const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, 'words/countries.json'), 'utf-8'));

  let count = 0;
  const batchSize = 100;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch
      .map(
        (item: { ko: string; en: string }) => `('${sqlEscape(item.ko)}', '${sqlEscape(item.en)}')`,
      )
      .join(',\n');

    const sql = `INSERT OR REPLACE INTO dict_countries (ko, en) VALUES ${values};`;

    try {
      executeD1WithFile('algorithms', sql);
      count += batch.length;
    } catch (_error) {
      console.error(`  Failed batch at index ${i}`);
    }
  }

  console.log(`  Migrated ${count} countries\n`);
}

// Migrate expressions
async function migrateExpressions(): Promise<void> {
  console.log('Migrating expressions...');

  const files = [
    { path: 'expressions/compound-words.json', type: 'compound' },
    { path: 'expressions/phrasal-verbs.json', type: 'phrasal' },
    { path: 'expressions/onomatopoeia.json', type: 'onomatopoeia' },
    { path: 'expressions/cultural.json', type: 'cultural' },
  ];

  let totalCount = 0;

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, file.path), 'utf-8'));
    let count = 0;
    const batchSize = 50;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const values = batch
        .map(
          (item: { ko: string; en: string; category?: string }) =>
            `('${sqlEscape(item.ko)}', '${sqlEscape(item.en)}', '${file.type}', '${sqlEscape(item.category || '')}')`,
        )
        .join(',\n');

      const sql = `INSERT INTO dict_expressions (ko, en, type, category) VALUES ${values};`;

      try {
        executeD1WithFile('algorithms', sql);
        count += batch.length;
      } catch (_error) {
        console.error(`  Failed ${file.type} batch at index ${i}`);
      }
    }

    console.log(`  Migrated ${count} ${file.type} expressions`);
    totalCount += count;
  }

  console.log(`  Total expressions: ${totalCount}\n`);
}

// Migrate polysemy
async function migratePolysemy(): Promise<void> {
  console.log('Migrating polysemy...');
  const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, 'polysemy/polysemy.json'), 'utf-8'));

  let count = 0;

  for (const item of data) {
    const word = sqlEscape(item.word || '');
    const meanings = sqlEscape(JSON.stringify(item.meanings || []));
    const examples = sqlEscape(JSON.stringify(item.examples || []));

    const sql = `INSERT INTO dict_polysemy (word, meanings, examples) VALUES ('${word}', '${meanings}', '${examples}');`;

    try {
      executeD1WithFile('algorithms', sql);
      count++;
    } catch (_error) {
      console.error(`  Failed: ${item.word}`);
    }
  }

  console.log(`  Migrated ${count} polysemy entries\n`);
}

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('D1 Migration - Translator Dictionary');
  console.log(`${'='.repeat(60)}\n`);

  try {
    await createTables();
    await migrateKoToEn();
    await migrateEnToKo();
    await migrateStems();
    await migrateIdioms();
    await migrateDomains();
    await migrateColors();
    await migrateCountries();
    await migrateExpressions();
    await migratePolysemy();

    console.log('='.repeat(60));
    console.log('Migration completed successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  }
}

main();
