#!/usr/bin/env tsx
/**
 * @fileoverview 문서 버전 동기화 스크립트
 *
 * package.json의 버전 정보를 CLAUDE.md에 자동 반영합니다.
 * prebuild 시 자동 실행되어 문서와 실제 버전의 불일치를 방지합니다.
 *
 * 실행: pnpm sync:doc-versions
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface PackageJson {
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

function readJson(path: string): PackageJson {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function cleanVersion(version: string): string {
  // ^1.2.3 -> 1.2.3, ~1.2.3 -> 1.2.3
  return version.replace(/^[\^~]/, '');
}

function main() {
  console.log('📄 Syncing document versions...\n');

  // 1. 버전 정보 수집
  const rootPkg = readJson(join(ROOT, 'package.json'));
  const soundBluePkg = readJson(join(ROOT, 'apps/sound-blue/package.json'));
  const toolsPkg = readJson(join(ROOT, 'apps/tools/package.json'));
  const dialoguePkg = readJson(join(ROOT, 'apps/dialogue/package.json'));

  const versions = {
    // 앱 버전
    'sound-blue': soundBluePkg.version,
    tools: toolsPkg.version,
    dialogue: dialoguePkg.version,

    // 주요 의존성 (root package.json devDependencies에서)
    react: cleanVersion(rootPkg.devDependencies?.react || rootPkg.dependencies?.react || ''),
    tailwindcss: cleanVersion(
      rootPkg.devDependencies?.tailwindcss || rootPkg.dependencies?.tailwindcss || '',
    ),
    biome: cleanVersion(rootPkg.devDependencies?.['@biomejs/biome'] || ''),
    playwright: cleanVersion(rootPkg.devDependencies?.['@playwright/test'] || ''),

    // pnpm 버전 (packageManager 필드에서)
    pnpm: rootPkg.packageManager?.replace('pnpm@', '') || '',

    // 앱별 의존성
    'tanstack-start': cleanVersion(toolsPkg.dependencies?.['@tanstack/react-start'] || ''),
  };

  console.log('Collected versions:');
  for (const [key, value] of Object.entries(versions)) {
    console.log(`  ${key}: ${value}`);
  }

  // 2. CLAUDE.md 업데이트
  const claudeMdPath = join(ROOT, 'CLAUDE.md');
  let claudeMd = readFileSync(claudeMdPath, 'utf-8');
  let updated = false;

  // 앱 버전 업데이트 패턴: - **Version**: X.X.X
  const appVersionPatterns = [
    { name: 'Sound Blue', key: 'sound-blue' },
    { name: 'Tools', key: 'tools' },
    { name: 'Dialogue', key: 'dialogue' },
  ];

  for (const { name, key } of appVersionPatterns) {
    const pattern = new RegExp(`(### ${name}[\\s\\S]*?- \\*\\*Version\\*\\*: )([^\\n]+)`, 'm');
    const match = claudeMd.match(pattern);
    if (match && match[2] !== versions[key]) {
      claudeMd = claudeMd.replace(pattern, `$1${versions[key]}`);
      console.log(`\n✅ Updated ${name} version: ${match[2]} -> ${versions[key]}`);
      updated = true;
    }
  }

  // Tech Stack 테이블 업데이트 패턴: | React | X.X.X |
  const techPatterns = [
    { pattern: /(\| React \| )[\d.]+/, version: versions.react },
    { pattern: /(\| TanStack Start \| )[\d.]+/, version: versions['tanstack-start'] },
    { pattern: /(\| Tailwind CSS \| )[\d.]+/, version: versions.tailwindcss },
    { pattern: /(\| pnpm \| )[\d.]+/, version: versions.pnpm },
    { pattern: /(\| Biome \| )[\d.]+/, version: versions.biome },
    { pattern: /(\| Playwright \| )[\d.]+/, version: versions.playwright },
  ];

  for (const { pattern, version } of techPatterns) {
    if (version) {
      const match = claudeMd.match(pattern);
      if (match) {
        const oldVersion = match[0].split('| ').pop()?.trim();
        if (oldVersion !== version) {
          claudeMd = claudeMd.replace(pattern, `$1${version}`);
          console.log(`✅ Updated tech version: ${oldVersion} -> ${version}`);
          updated = true;
        }
      }
    }
  }

  if (updated) {
    writeFileSync(claudeMdPath, claudeMd);
    console.log('\n📝 CLAUDE.md updated successfully!');
  } else {
    console.log('\n✅ All versions are already in sync.');
  }
}

main();
