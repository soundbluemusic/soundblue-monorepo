#!/usr/bin/env tsx
/**
 * Context 사전 동기화 스크립트 (GitHub Raw URL)
 *
 * public-monorepo의 context 데이터를 GitHub raw URL에서 가져와
 * 번역기 사전으로 통합합니다.
 *
 * - meta.json에서 동적으로 파일 목록을 가져옴 (하드코딩 없음)
 * - 기존 사전은 유지하고, 외부 사전은 별도 파일로 생성
 * - 문장 사전 레이어 추가 (대화 예문)
 *
 * Usage: pnpm sync:context-dict
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// GitHub raw URL 베이스
const BASE_URL =
  'https://raw.githubusercontent.com/soundbluemusic/public-monorepo/main/data/context';

// 출력 디렉토리
const OUTPUT_DIR = join(__dirname, '../apps/tools/app/tools/translator/dictionary/external');

// 타입 정의
interface Meta {
  version: string;
  files: {
    categories: string;
    conversations: string;
    entries: string[];
  };
  counts: {
    categories: number;
    conversations: number;
    entryFiles: number;
  };
}

interface EntryTranslation {
  word: string;
  explanation?: string;
  examples?: Record<string, string>;
  variations?: Record<string, string[]>;
}

interface Entry {
  id: string;
  korean: string;
  romanization?: string;
  partOfSpeech?: string;
  categoryId?: string;
  difficulty?: string;
  frequency?: string;
  tags?: string[];
  translations: {
    ko: EntryTranslation;
    en: EntryTranslation;
  };
}

interface DialogueLine {
  speaker: string;
  ko: string;
  en: string;
  romanization?: string;
}

interface Conversation {
  id: string;
  categoryId?: string;
  title?: { ko: string; en: string };
  dialogue: DialogueLine[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function syncDictionary(): Promise<void> {
  console.log('🔄 Syncing Context Dictionary from GitHub...\n');
  console.log(`   Source: ${BASE_URL}\n`);

  // 1. meta.json에서 파일 목록 가져오기
  const meta = await fetchJson<Meta>(`${BASE_URL}/meta.json`);
  console.log(
    `📋 Found ${meta.counts.entryFiles} entry files, ${meta.counts.conversations} conversations\n`,
  );

  // 2. 모든 엔트리 파일 가져오기
  const allEntries: Entry[] = [];
  for (const file of meta.files.entries) {
    const url = `${BASE_URL}/${file}`;
    console.log(`   Fetching ${file}...`);
    try {
      const entries = await fetchJson<Entry[]>(url);
      allEntries.push(...entries);
    } catch (_e) {
      console.error(`   ⚠️  Failed: ${file}`);
    }
  }
  console.log(`\n✅ Loaded ${allEntries.length} entries\n`);

  // 3. 단어 사전 생성 (ko→en, en→ko)
  const koToEn: Record<string, string> = {};
  const enToKo: Record<string, string> = {};

  for (const entry of allEntries) {
    const ko = entry.korean;
    const enTranslation = entry.translations?.en?.word;
    if (!ko || !enTranslation) continue;

    // 영어 번역이 "A / B" 형식이면 첫 번째만 사용
    const en = enTranslation.split(' / ')[0].trim();

    // 중복 방지 (첫 번째 것만 유지)
    if (!koToEn[ko]) {
      koToEn[ko] = en;
    }

    const enLower = en.toLowerCase();
    if (!enToKo[enLower]) {
      enToKo[enLower] = ko;
    }
  }

  // 4. 대화에서 문장 사전 생성
  console.log('📚 Fetching conversations...');
  const conversations = await fetchJson<Conversation[]>(`${BASE_URL}/${meta.files.conversations}`);

  const koSentences: Record<string, string> = {};
  const enSentences: Record<string, string> = {};

  for (const conv of conversations) {
    for (const line of conv.dialogue) {
      const ko = line.ko?.trim();
      const en = line.en?.trim();
      if (!ko || !en) continue;

      // 문장 정규화 (끝 문장부호 통일)
      if (!koSentences[ko]) {
        koSentences[ko] = en;
      }
      if (!enSentences[en.toLowerCase()]) {
        enSentences[en.toLowerCase()] = ko;
      }
    }
  }

  console.log(`✅ Loaded ${Object.keys(koSentences).length} sentence pairs from conversations\n`);

  // 5. 출력 디렉토리 생성
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 6. 파일 생성
  const timestamp = new Date().toISOString();
  const header = `// ========================================
// External Dictionary - 외부 사전 (자동 생성)
// Source: public-monorepo/data/context
// Generated: ${timestamp}
// ========================================
// ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요!
// ⚠️ This file is auto-generated. Do not edit directly!
// Run: pnpm sync:context-dict
// ========================================

`;

  // 단어 사전 파일
  const wordsContent = `${header}/**
 * 외부 단어 사전 (ko→en)
 * 기존 사전에 없는 경우에만 사용됨
 */
export const externalKoToEnWords: Record<string, string> = ${JSON.stringify(koToEn, null, 2)};

/**
 * 외부 단어 사전 (en→ko)
 * 기존 사전에 없는 경우에만 사용됨
 */
export const externalEnToKoWords: Record<string, string> = ${JSON.stringify(enToKo, null, 2)};

// 통계
export const EXTERNAL_WORDS_STATS = {
  koToEnCount: ${Object.keys(koToEn).length},
  enToKoCount: ${Object.keys(enToKo).length},
  generatedAt: '${timestamp}',
} as const;
`;

  writeFileSync(join(OUTPUT_DIR, 'words.ts'), wordsContent);
  console.log(
    `📝 Created external/words.ts (${Object.keys(koToEn).length} ko→en, ${Object.keys(enToKo).length} en→ko)`,
  );

  // 문장 사전 파일
  const sentencesContent = `${header}/**
 * 외부 문장 사전 (ko→en)
 * 대화 예문에서 추출
 * 알고리즘보다 우선 적용됨 (정확한 매칭 시)
 */
export const externalKoToEnSentences: Record<string, string> = ${JSON.stringify(koSentences, null, 2)};

/**
 * 외부 문장 사전 (en→ko)
 * 대화 예문에서 추출
 */
export const externalEnToKoSentences: Record<string, string> = ${JSON.stringify(enSentences, null, 2)};

// 통계
export const EXTERNAL_SENTENCES_STATS = {
  koToEnCount: ${Object.keys(koSentences).length},
  enToKoCount: ${Object.keys(enSentences).length},
  generatedAt: '${timestamp}',
} as const;
`;

  writeFileSync(join(OUTPUT_DIR, 'sentences.ts'), sentencesContent);
  console.log(
    `📝 Created external/sentences.ts (${Object.keys(koSentences).length} ko→en, ${Object.keys(enSentences).length} en→ko)`,
  );

  // index.ts 생성
  const indexContent = `${header}// 외부 사전 통합 export
export {
  externalKoToEnWords,
  externalEnToKoWords,
  EXTERNAL_WORDS_STATS,
} from './words';

export {
  externalKoToEnSentences,
  externalEnToKoSentences,
  EXTERNAL_SENTENCES_STATS,
} from './sentences';
`;

  writeFileSync(join(OUTPUT_DIR, 'index.ts'), indexContent);
  console.log('📝 Created external/index.ts\n');

  // 7. 요약
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    동기화 완료 Summary');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📦 Entry files processed: ${meta.files.entries.length}`);
  console.log(`📚 Total entries: ${allEntries.length}`);
  console.log(
    `🔤 Word pairs: ko→en ${Object.keys(koToEn).length}, en→ko ${Object.keys(enToKo).length}`,
  );
  console.log(
    `💬 Sentence pairs: ko→en ${Object.keys(koSentences).length}, en→ko ${Object.keys(enSentences).length}`,
  );
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n✅ Output: ${OUTPUT_DIR}`);
}

syncDictionary().catch((error) => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
