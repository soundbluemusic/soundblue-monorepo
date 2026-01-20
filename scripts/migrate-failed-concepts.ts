/**
 * D1 Migration Script - Failed Math Concepts Retry
 * Uses parameterized queries via JSON to handle special characters
 */

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_MONOREPO = '/Volumes/X10 Pro/monorepo-project/public-monorepo';
const SOUNDBLUE_MONOREPO = '/Volumes/X10 Pro/monorepo-project/soundblue-monorepo';

// Failed concepts from previous run
const FAILED_IDS = [
  'confidence-interval',
  'regression-analysis',
  'bayesian-inference',
  'maximum-likelihood',
  'time-series',
  'chi-square-test',
  'nabla-operator',
  'covariant-contravariant',
];

// SQL-safe string escaping (only single quotes for SQL)
function sqlEscape(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Execute D1 via file
function executeD1WithFile(db: string, sql: string): void {
  const tempFile = '/tmp/d1-migration-temp.sql';
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

async function migrateFailedConcepts(): Promise<void> {
  console.log('Retrying failed math concepts...\n');

  const conceptsDir = join(PUBLIC_MONOREPO, 'data/roots/concepts');
  const files = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'));

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(conceptsDir, file), 'utf-8'));

    for (const concept of data) {
      if (!FAILED_IDS.includes(concept.id)) continue;

      console.log(`Retrying: ${concept.id}`);

      // Prepare safe values
      const id = sqlEscape(concept.id);
      const fieldId = sqlEscape(concept.field);
      const subfieldId = sqlEscape(concept.subfield || '');
      const nameKo = sqlEscape(concept.name?.ko || '');
      const nameEn = sqlEscape(concept.name?.en || '');
      const defKo = sqlEscape(concept.content?.ko?.definition || '');
      const defEn = sqlEscape(concept.content?.en?.definition || '');
      const difficulty = String(concept.difficulty || '');
      const tags = sqlEscape(JSON.stringify(concept.tags || []));
      const related = sqlEscape(JSON.stringify(concept.relations?.related || []));
      const formula = sqlEscape(JSON.stringify(concept.content?.ko?.formulas || []));
      const examples = sqlEscape(JSON.stringify(concept.content?.ko?.examples || []));

      const sql = `INSERT OR REPLACE INTO math_concepts (id, field_id, subfield_id, name_ko, name_en, definition_ko, definition_en, difficulty, tags, related, formula, examples)
VALUES ('${id}', '${fieldId}', '${subfieldId}', '${nameKo}', '${nameEn}', '${defKo}', '${defEn}', '${difficulty}', '${tags}', '${related}', '${formula}', '${examples}');`;

      try {
        executeD1WithFile('knowledge', sql);
        console.log(`  ✓ Success: ${concept.id}`);
        successCount++;
      } catch (_error) {
        console.error(`  ✗ Failed: ${concept.id}`);
        failCount++;
      }
    }
  }

  console.log(`\nResults: ${successCount} success, ${failCount} failed`);
}

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('D1 Migration - Retry Failed Concepts');
  console.log('='.repeat(60));

  try {
    await migrateFailedConcepts();
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  }
}

main();
