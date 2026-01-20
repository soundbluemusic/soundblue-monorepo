/**
 * D1 Reorganization Script
 *
 * 문제점:
 * - algorithms D1에 순수 어휘 데이터가 잘못 저장됨
 * - 번역기 사전 데이터는 context D1에 저장해야 함
 *
 * 해결:
 * 1. algorithms D1의 순수 어휘 테이블 삭제
 * 2. context D1에 어휘 테이블 생성
 * 3. public-monorepo의 데이터를 context D1에 마이그레이션 (Single Source of Truth)
 *
 * D1 구조:
 * - knowledge: 학문/참고자료 (수학, 라이브러리, API) ✅ 완료
 * - context: 순수 어휘 (단어, 문장, 관용어)
 * - algorithms: 번역 알고리즘용 (어간 패턴, 다의어 규칙, 도메인 매핑)
 * - private: 비공개 데이터
 */

import { execSync } from 'node:child_process';
import { unlinkSync, writeFileSync } from 'node:fs';

const SOUNDBLUE_MONOREPO = '/Volumes/X10 Pro/monorepo-project/soundblue-monorepo';

// Execute D1 via file
function executeD1WithFile(db: string, sql: string, showOutput = false): void {
  const tempFile = '/tmp/d1-reorg-temp.sql';
  writeFileSync(tempFile, sql, 'utf-8');

  const cmd = `pnpm wrangler d1 execute ${db} --remote --file="${tempFile}"`;
  try {
    if (showOutput) {
      execSync(cmd, { cwd: SOUNDBLUE_MONOREPO, stdio: 'inherit' });
    } else {
      execSync(cmd, { cwd: SOUNDBLUE_MONOREPO, stdio: 'pipe' });
    }
  } finally {
    try {
      unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

async function cleanupAlgorithmsD1(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Step 1: Cleaning up algorithms D1');
  console.log('='.repeat(60));
  console.log('\nRemoving incorrectly placed vocabulary tables...\n');

  const dropTables = `
-- 순수 어휘 테이블 삭제 (context D1으로 이동 예정)
DROP TABLE IF EXISTS dict_ko_to_en;
DROP TABLE IF EXISTS dict_en_to_ko;
DROP TABLE IF EXISTS dict_idioms;
DROP TABLE IF EXISTS dict_colors;
DROP TABLE IF EXISTS dict_countries;
DROP TABLE IF EXISTS dict_expressions;

-- algorithms D1에 유지할 테이블 (로직용)
-- dict_stems: 어간 패턴 분석용 (유지)
-- dict_domains: 도메인별 문맥 선택용 (유지)
-- dict_polysemy: 다의어 처리용 (유지)
`;

  executeD1WithFile('algorithms', dropTables, true);
  console.log('\n✓ Removed vocabulary tables from algorithms D1\n');
}

async function verifyAlgorithmsD1(): Promise<void> {
  console.log('Verifying algorithms D1 structure...');

  const checkSql = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf%' AND name != 'sqlite_sequence';`;
  const tempFile = '/tmp/d1-verify-temp.sql';
  writeFileSync(tempFile, checkSql, 'utf-8');

  const cmd = `pnpm wrangler d1 execute algorithms --remote --file="${tempFile}" --json`;
  const result = execSync(cmd, { cwd: SOUNDBLUE_MONOREPO, encoding: 'utf-8' });

  try {
    unlinkSync(tempFile);
  } catch {}

  const data = JSON.parse(result);
  const tables = data[0]?.results?.map((r: { name: string }) => r.name) || [];

  console.log('\nRemaining tables in algorithms D1:');
  for (const t of tables) {
    console.log(`  - ${t}`);
  }

  // Verify counts
  if (tables.includes('dict_stems')) {
    const countCmd = `pnpm wrangler d1 execute algorithms --remote --command "SELECT COUNT(*) as c FROM dict_stems" --json`;
    const countResult = execSync(countCmd, { cwd: SOUNDBLUE_MONOREPO, encoding: 'utf-8' });
    const countData = JSON.parse(countResult);
    console.log(`\n  dict_stems: ${countData[0]?.results?.[0]?.c || 0} records`);
  }

  if (tables.includes('dict_domains')) {
    const countCmd = `pnpm wrangler d1 execute algorithms --remote --command "SELECT COUNT(*) as c FROM dict_domains" --json`;
    const countResult = execSync(countCmd, { cwd: SOUNDBLUE_MONOREPO, encoding: 'utf-8' });
    const countData = JSON.parse(countResult);
    console.log(`  dict_domains: ${countData[0]?.results?.[0]?.c || 0} records`);
  }

  if (tables.includes('dict_polysemy')) {
    const countCmd = `pnpm wrangler d1 execute algorithms --remote --command "SELECT COUNT(*) as c FROM dict_polysemy" --json`;
    const countResult = execSync(countCmd, { cwd: SOUNDBLUE_MONOREPO, encoding: 'utf-8' });
    const countData = JSON.parse(countResult);
    console.log(`  dict_polysemy: ${countData[0]?.results?.[0]?.c || 0} records`);
  }

  console.log('\n✓ algorithms D1 verification complete\n');
}

async function main(): Promise<void> {
  console.log('\n');
  console.log(`╔${'═'.repeat(58)}╗`);
  console.log(`║${' D1 Reorganization - Step 1: Cleanup'.padEnd(58)}║`);
  console.log(`╚${'═'.repeat(58)}╝`);
  console.log('\n');

  try {
    await cleanupAlgorithmsD1();
    await verifyAlgorithmsD1();

    console.log('='.repeat(60));
    console.log('Step 1 Complete!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Run migrate-to-context-d1.ts to create context D1 and migrate vocabulary');
    console.log('2. Verify all D1 databases have correct data');
  } catch (error) {
    console.error('\nReorganization failed:', error);
    process.exit(1);
  }
}

main();
