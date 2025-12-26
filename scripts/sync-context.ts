#!/usr/bin/env tsx
/**
 * Context 데이터 동기화 스크립트
 *
 * public-monorepo/apps/context/app/data/entries/*.json →
 * soundblue-monorepo/packages/shared-react/src/data/context/*.json
 *
 * Usage: pnpm sync:context
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 경로 설정
const SOURCE_DIR = join(__dirname, '../../public-monorepo/apps/context/app/data/entries');
const TARGET_DIR = join(__dirname, '../packages/shared-react/src/data/context');

function sync() {
  console.log('🔄 Syncing Context data...\n');

  // 소스 디렉토리 확인
  if (!existsSync(SOURCE_DIR)) {
    console.error('❌ Source directory not found:', SOURCE_DIR);
    console.error('   Make sure public-monorepo is at the same level as soundblue-monorepo');
    process.exit(1);
  }

  // 타겟 디렉토리 생성
  if (!existsSync(TARGET_DIR)) {
    mkdirSync(TARGET_DIR, { recursive: true });
  }

  // JSON 파일만 복사
  const files = readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.json'));

  let copied = 0;
  let totalEntries = 0;

  for (const file of files) {
    const sourcePath = join(SOURCE_DIR, file);
    const targetPath = join(TARGET_DIR, file);

    copyFileSync(sourcePath, targetPath);
    copied++;

    // 엔트리 수 계산
    try {
      const data = JSON.parse(require('node:fs').readFileSync(sourcePath, 'utf-8'));
      if (Array.isArray(data)) {
        totalEntries += data.length;
      }
    } catch {
      // ignore
    }

    console.log(`  ✓ ${file}`);
  }

  console.log(`\n✅ Synced ${copied} files (${totalEntries} entries)`);
  console.log(`   From: ${SOURCE_DIR}`);
  console.log(`   To:   ${TARGET_DIR}`);
}

sync();
