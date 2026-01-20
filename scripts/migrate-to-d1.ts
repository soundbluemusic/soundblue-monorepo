/**
 * D1 Migration Script
 * Migrates data from JSON files to D1 databases
 *
 * Usage: npx tsx scripts/migrate-to-d1.ts
 */

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_MONOREPO = '/Volumes/X10 Pro/monorepo-project/public-monorepo';
const SOUNDBLUE_MONOREPO = '/Volumes/X10 Pro/monorepo-project/soundblue-monorepo';

// Escape single quotes for SQL
function escapeSQL(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Execute D1 command
function executeD1(db: string, sql: string): void {
  const cmd = `pnpm wrangler d1 execute ${db} --remote --command "${sql.replace(/"/g, '\\"')}"`;
  execSync(cmd, { cwd: SOUNDBLUE_MONOREPO, stdio: 'pipe' });
}

// Batch insert for large datasets
function batchInsert(
  db: string,
  table: string,
  columns: string[],
  rows: string[][],
  batchSize = 50,
): void {
  console.log(`  Inserting ${rows.length} rows into ${table}...`);

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values = batch
      .map((row) => `(${row.map((v) => `'${escapeSQL(v)}'`).join(', ')})`)
      .join(', ');
    const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES ${values}`;
    executeD1(db, sql);
    process.stdout.write(`\r  Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }
  console.log(' Done!');
}

// ============================================================================
// KNOWLEDGE DB MIGRATIONS
// ============================================================================

async function migrateLibraries(): Promise<void> {
  console.log('\n[1/4] Migrating libraries...');
  const data = JSON.parse(
    readFileSync(join(PUBLIC_MONOREPO, 'data/permissive/libraries.json'), 'utf-8'),
  );

  const columns = [
    'id',
    'name',
    'category',
    'subcategory',
    'license',
    'github_url',
    'npm_url',
    'website_url',
    'description_ko',
    'description_en',
    'stars',
    'version',
    'tags',
  ];

  const rows = data.map((lib: Record<string, unknown>, idx: number) => [
    `lib-${idx + 1}`,
    String(lib.name || ''),
    String(lib.category || ''),
    '',
    String(lib.license || ''),
    String(lib.github || ''),
    String(lib.npm || ''),
    String(lib.website || ''),
    String(lib.descriptionKo || ''),
    String(lib.description || ''),
    String(lib.stars || ''),
    '',
    JSON.stringify(lib.tags || []),
  ]);

  batchInsert('knowledge', 'libraries', columns, rows);
  console.log(`  Migrated ${rows.length} libraries`);
}

async function migrateWebApis(): Promise<void> {
  console.log('\n[2/4] Migrating web APIs...');
  const data = JSON.parse(
    readFileSync(join(PUBLIC_MONOREPO, 'data/permissive/web-apis.json'), 'utf-8'),
  );

  const columns = [
    'id',
    'name',
    'category',
    'subcategory',
    'support',
    'mdn_url',
    'spec_url',
    'description_ko',
    'description_en',
    'browser_support',
    'tags',
  ];

  const rows = data.map((api: Record<string, unknown>, idx: number) => [
    `api-${idx + 1}`,
    String(api.name || ''),
    String(api.category || ''),
    '',
    String(api.support || ''),
    String(api.mdnUrl || ''),
    '',
    String(api.descriptionKo || ''),
    String(api.description || ''),
    '',
    '',
  ]);

  batchInsert('knowledge', 'web_apis', columns, rows);
  console.log(`  Migrated ${rows.length} web APIs`);
}

async function migrateMathFields(): Promise<void> {
  console.log('\n[3/4] Migrating math fields...');

  // Read fields from TypeScript file and parse manually
  const fields = [
    { id: 'foundations', name_ko: '기초 수학', name_en: 'Foundations', icon: '∴', order: 1 },
    { id: 'algebra', name_ko: '대수학', name_en: 'Algebra', icon: 'x', order: 2 },
    { id: 'geometry', name_ko: '기하학', name_en: 'Geometry', icon: '△', order: 3 },
    { id: 'trigonometry', name_ko: '삼각법', name_en: 'Trigonometry', icon: 'θ', order: 4 },
    { id: 'analysis', name_ko: '해석학', name_en: 'Analysis', icon: '∫', order: 5 },
    { id: 'linear-algebra', name_ko: '선형대수', name_en: 'Linear Algebra', icon: '⊗', order: 6 },
    {
      id: 'probability',
      name_ko: '확률/통계',
      name_en: 'Probability & Statistics',
      icon: '⁝',
      order: 7,
    },
    { id: 'discrete', name_ko: '이산수학', name_en: 'Discrete Math', icon: '⊂', order: 8 },
    { id: 'number-theory', name_ko: '수론', name_en: 'Number Theory', icon: 'ℕ', order: 9 },
    { id: 'topology', name_ko: '위상수학', name_en: 'Topology', icon: '○', order: 10 },
    { id: 'logic', name_ko: '수리논리', name_en: 'Mathematical Logic', icon: '⊢', order: 11 },
    { id: 'dynamics', name_ko: '동역학/카오스', name_en: 'Dynamics & Chaos', icon: '∞', order: 12 },
    { id: 'optimization', name_ko: '최적화', name_en: 'Optimization', icon: '↗', order: 13 },
    { id: 'numerical', name_ko: '수치해석', name_en: 'Numerical Analysis', icon: '≈', order: 14 },
    { id: 'applied', name_ko: '응용수학', name_en: 'Applied Math', icon: '⊕', order: 15 },
    { id: 'constants', name_ko: '수학 상수', name_en: 'Constants', icon: 'π', order: 16 },
    { id: 'symbols', name_ko: '수학 기호', name_en: 'Symbols', icon: '∑', order: 17 },
    { id: 'theorems', name_ko: '유명 정리', name_en: 'Famous Theorems', icon: '∎', order: 18 },
  ];

  const columns = [
    'id',
    'name_ko',
    'name_en',
    'description_ko',
    'description_en',
    'icon',
    'order_idx',
  ];

  const rows = fields.map((f) => [f.id, f.name_ko, f.name_en, '', '', f.icon, String(f.order)]);

  batchInsert('knowledge', 'math_fields', columns, rows);
  console.log(`  Migrated ${rows.length} math fields`);
}

async function migrateMathConcepts(): Promise<void> {
  console.log('\n[4/4] Migrating math concepts...');

  const conceptsDir = join(PUBLIC_MONOREPO, 'data/roots/concepts');
  const files = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'));

  const columns = [
    'id',
    'field_id',
    'subfield_id',
    'name_ko',
    'name_en',
    'definition_ko',
    'definition_en',
    'difficulty',
    'tags',
    'related',
    'formula',
    'examples',
  ];

  const allRows: string[][] = [];

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(conceptsDir, file), 'utf-8'));

    for (const concept of data) {
      const row = [
        String(concept.id || ''),
        String(concept.field || ''),
        String(concept.subfield || ''),
        String(concept.name?.ko || ''),
        String(concept.name?.en || ''),
        String(concept.content?.ko?.definition || ''),
        String(concept.content?.en?.definition || ''),
        String(concept.difficulty || ''),
        JSON.stringify(concept.tags || []),
        JSON.stringify(concept.relations?.related || []),
        JSON.stringify(concept.content?.ko?.formulas || []),
        JSON.stringify(concept.content?.ko?.examples || []),
      ];
      allRows.push(row);
    }
  }

  batchInsert('knowledge', 'math_concepts', columns, allRows);
  console.log(`  Migrated ${allRows.length} math concepts from ${files.length} files`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('D1 Migration - Knowledge Database');
  console.log('='.repeat(60));

  try {
    await migrateLibraries();
    await migrateWebApis();
    await migrateMathFields();
    await migrateMathConcepts();

    console.log(`\n${'='.repeat(60)}`);
    console.log('Migration completed successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  }
}

main();
