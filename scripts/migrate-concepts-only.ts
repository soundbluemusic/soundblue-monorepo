/**
 * D1 Migration Script - Math Concepts Only
 * Handles special characters properly
 */

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_MONOREPO = '/Volumes/X10 Pro/monorepo-project/public-monorepo';
const SOUNDBLUE_MONOREPO = '/Volumes/X10 Pro/monorepo-project/soundblue-monorepo';

// Escape for SQL - handle all special chars
function escapeSQL(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\') // escape backslashes first
    .replace(/'/g, "''") // escape single quotes
    .replace(/"/g, '\\"') // escape double quotes for shell
    .replace(/\n/g, '\\n') // escape newlines
    .replace(/\r/g, '\\r') // escape carriage returns
    .replace(/\t/g, '\\t'); // escape tabs
}

// Execute D1 via file to avoid shell escaping issues
function executeD1WithFile(db: string, sql: string): void {
  const { writeFileSync, unlinkSync } = require('node:fs');
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

async function migrateMathConcepts(): Promise<void> {
  console.log('Migrating math concepts...');

  const conceptsDir = join(PUBLIC_MONOREPO, 'data/roots/concepts');
  const files = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'));

  let totalCount = 0;

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(conceptsDir, file), 'utf-8'));
    console.log(`  Processing ${file} (${data.length} concepts)...`);

    // Process one concept at a time to handle special characters better
    for (const concept of data) {
      const id = escapeSQL(concept.id);
      const fieldId = escapeSQL(concept.field);
      const subfieldId = escapeSQL(concept.subfield);
      const nameKo = escapeSQL(concept.name?.ko);
      const nameEn = escapeSQL(concept.name?.en);
      const defKo = escapeSQL(concept.content?.ko?.definition);
      const defEn = escapeSQL(concept.content?.en?.definition);
      const difficulty = escapeSQL(String(concept.difficulty || ''));
      const tags = escapeSQL(JSON.stringify(concept.tags || []));
      const related = escapeSQL(JSON.stringify(concept.relations?.related || []));
      const formula = escapeSQL(JSON.stringify(concept.content?.ko?.formulas || []));
      const examples = escapeSQL(JSON.stringify(concept.content?.ko?.examples || []));

      const sql = `INSERT OR REPLACE INTO math_concepts (id, field_id, subfield_id, name_ko, name_en, definition_ko, definition_en, difficulty, tags, related, formula, examples)
VALUES ('${id}', '${fieldId}', '${subfieldId}', '${nameKo}', '${nameEn}', '${defKo}', '${defEn}', '${difficulty}', '${tags}', '${related}', '${formula}', '${examples}');`;

      try {
        executeD1WithFile('knowledge', sql);
        totalCount++;
      } catch (_error) {
        console.error(`    Failed: ${concept.id}`);
        // Continue with next concept
      }
    }
  }

  console.log(`\nMigrated ${totalCount} math concepts from ${files.length} files`);
}

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('D1 Migration - Math Concepts');
  console.log('='.repeat(60));

  try {
    await migrateMathConcepts();
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  }
}

main();
