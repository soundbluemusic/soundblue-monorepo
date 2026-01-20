/**
 * Find and migrate missing math concepts
 */

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_MONOREPO = '/Volumes/X10 Pro/monorepo-project/public-monorepo';
const SOUNDBLUE_MONOREPO = '/Volumes/X10 Pro/monorepo-project/soundblue-monorepo';

// Get all concept IDs from D1
function getExistingIds(): Set<string> {
  const cmd = `pnpm wrangler d1 execute knowledge --remote --command "SELECT id FROM math_concepts" --json`;
  const result = execSync(cmd, { cwd: SOUNDBLUE_MONOREPO, encoding: 'utf-8' });
  const data = JSON.parse(result);
  const ids = new Set<string>();

  if (data[0]?.results) {
    for (const row of data[0].results) {
      ids.add(row.id);
    }
  }

  return ids;
}

// SQL-safe string escaping
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

async function main(): Promise<void> {
  console.log('Finding missing concepts...\n');

  // Get existing IDs from D1
  const existingIds = getExistingIds();
  console.log(`Found ${existingIds.size} existing concepts in D1\n`);

  // Get all concepts from files
  const conceptsDir = join(PUBLIC_MONOREPO, 'data/roots/concepts');
  const files = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'));

  const missingConcepts: Array<{ id: string; concept: unknown }> = [];

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(conceptsDir, file), 'utf-8'));
    for (const concept of data) {
      if (!existingIds.has(concept.id)) {
        missingConcepts.push({ id: concept.id, concept });
      }
    }
  }

  console.log(`Found ${missingConcepts.length} missing concepts:\n`);
  for (const { id } of missingConcepts) {
    console.log(`  - ${id}`);
  }

  if (missingConcepts.length === 0) {
    console.log('\nAll concepts are already migrated!');
    return;
  }

  console.log('\nMigrating missing concepts...\n');

  let successCount = 0;
  let failCount = 0;

  for (const { id, concept } of missingConcepts) {
    const c = concept as {
      id: string;
      field?: string;
      subfield?: string;
      name?: { ko?: string; en?: string };
      content?: {
        ko?: { definition?: string; formulas?: string[]; examples?: string[] };
        en?: { definition?: string };
      };
      difficulty?: number;
      tags?: string[];
      relations?: { related?: string[] };
    };

    const fieldId = sqlEscape(c.field);
    const subfieldId = sqlEscape(c.subfield || '');
    const nameKo = sqlEscape(c.name?.ko || '');
    const nameEn = sqlEscape(c.name?.en || '');
    const defKo = sqlEscape(c.content?.ko?.definition || '');
    const defEn = sqlEscape(c.content?.en?.definition || '');
    const difficulty = String(c.difficulty || '');
    const tags = sqlEscape(JSON.stringify(c.tags || []));
    const related = sqlEscape(JSON.stringify(c.relations?.related || []));
    const formula = sqlEscape(JSON.stringify(c.content?.ko?.formulas || []));
    const examples = sqlEscape(JSON.stringify(c.content?.ko?.examples || []));

    const sql = `INSERT OR REPLACE INTO math_concepts (id, field_id, subfield_id, name_ko, name_en, definition_ko, definition_en, difficulty, tags, related, formula, examples)
VALUES ('${sqlEscape(id)}', '${fieldId}', '${subfieldId}', '${nameKo}', '${nameEn}', '${defKo}', '${defEn}', '${difficulty}', '${tags}', '${related}', '${formula}', '${examples}');`;

    try {
      executeD1WithFile('knowledge', sql);
      console.log(`  ✓ ${id}`);
      successCount++;
    } catch (_error) {
      console.error(`  ✗ ${id}`);
      failCount++;
    }
  }

  console.log(`\nResults: ${successCount} success, ${failCount} failed`);
}

main();
