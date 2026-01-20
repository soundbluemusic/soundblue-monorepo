/**
 * D1 Migration Script - Colors and Countries
 * These files have nested koToEn/enToKo structure
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
  const tempFile = '/tmp/d1-colors-temp.sql';
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

// Migrate colors
async function migrateColors(): Promise<void> {
  console.log('Migrating colors...');
  const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, 'words/colors.json'), 'utf-8'));

  let count = 0;
  const batchSize = 100;

  // Process koToEn
  if (data.koToEn && Array.isArray(data.koToEn)) {
    for (let i = 0; i < data.koToEn.length; i += batchSize) {
      const batch = data.koToEn.slice(i, i + batchSize);
      const values = batch
        .map(
          (item: { ko: string; en: string }) =>
            `('${sqlEscape(item.ko)}', '${sqlEscape(item.en)}')`,
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
  }

  console.log(`  Migrated ${count} colors\n`);
}

// Migrate countries
async function migrateCountries(): Promise<void> {
  console.log('Migrating countries...');
  const data = JSON.parse(readFileSync(join(DICTIONARIES_DIR, 'words/countries.json'), 'utf-8'));

  let count = 0;
  const batchSize = 100;

  // Process koToEn
  if (data.koToEn && Array.isArray(data.koToEn)) {
    for (let i = 0; i < data.koToEn.length; i += batchSize) {
      const batch = data.koToEn.slice(i, i + batchSize);
      const values = batch
        .map(
          (item: { ko: string; en: string }) =>
            `('${sqlEscape(item.ko)}', '${sqlEscape(item.en)}')`,
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
  }

  console.log(`  Migrated ${count} countries\n`);
}

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('D1 Migration - Colors and Countries');
  console.log(`${'='.repeat(60)}\n`);

  try {
    await migrateColors();
    await migrateCountries();

    console.log('='.repeat(60));
    console.log('Migration completed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  }
}

main();
