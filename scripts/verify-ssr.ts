#!/usr/bin/env tsx
/**
 * @fileoverview SSR 빌드 검증 스크립트
 *
 * 각 앱의 빌드 결과물이 SSR 모드로 올바르게 생성되었는지 확인합니다.
 * - dist/server/ 디렉토리 존재 확인
 * - wrangler.json 설정 파일 확인
 * - 서버 엔트리 파일 확인
 *
 * 실행: pnpm verify:ssr
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const apps = ['sound-blue', 'tools', 'dialogue'];

interface VerificationResult {
  app: string;
  passed: boolean;
  errors: string[];
}

function verifyApp(appName: string): VerificationResult {
  const errors: string[] = [];
  const appDir = join(ROOT, 'apps', appName);
  const distDir = join(appDir, 'dist');

  // 1. dist 디렉토리 확인
  if (!existsSync(distDir)) {
    errors.push(`dist/ 디렉토리가 없습니다`);
    return { app: appName, passed: false, errors };
  }

  // 2. dist/server 디렉토리 확인 (SSR 빌드의 핵심)
  const serverDir = join(distDir, 'server');
  if (!existsSync(serverDir)) {
    errors.push(`dist/server/ 디렉토리가 없습니다 - SPA 모드로 빌드되었을 수 있음`);
  }

  // 3. wrangler.json 확인 (Cloudflare Workers 배포용)
  const wranglerJson = join(serverDir, 'wrangler.json');
  if (existsSync(wranglerJson)) {
    try {
      const config = JSON.parse(readFileSync(wranglerJson, 'utf-8'));
      if (!config.main) {
        errors.push(`wrangler.json에 main 엔트리가 없습니다`);
      }
    } catch {
      errors.push(`wrangler.json 파싱 실패`);
    }
  } else {
    errors.push(`dist/server/wrangler.json이 없습니다`);
  }

  // 4. client 디렉토리 확인 (정적 자산)
  const clientDir = join(distDir, 'client');
  if (!existsSync(clientDir)) {
    errors.push(`dist/client/ 디렉토리가 없습니다`);
  }

  return {
    app: appName,
    passed: errors.length === 0,
    errors,
  };
}

function main() {
  console.log('🔍 SSR 빌드 검증 시작...\n');

  const results: VerificationResult[] = apps.map(verifyApp);

  let allPassed = true;

  for (const result of results) {
    if (result.passed) {
      console.log(`✅ ${result.app}: SSR 빌드 검증 통과`);
    } else {
      console.log(`❌ ${result.app}: SSR 빌드 검증 실패`);
      for (const error of result.errors) {
        console.log(`   - ${error}`);
      }
      allPassed = false;
    }
  }

  console.log('');

  if (allPassed) {
    console.log('🎉 모든 앱이 SSR 모드로 올바르게 빌드되었습니다!');
    process.exit(0);
  } else {
    console.log('⚠️  일부 앱의 SSR 빌드 검증에 실패했습니다.');
    console.log('   SPA 모드로 빌드되었거나 빌드가 완료되지 않았을 수 있습니다.');
    process.exit(1);
  }
}

main();
