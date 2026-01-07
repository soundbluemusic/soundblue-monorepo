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
// JSON 데이터 출력 디렉토리 (public에서 서빙)
const PUBLIC_DATA_DIR = join(__dirname, '../apps/tools/public/data/sentences');

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

interface EntryDialogueLine {
  speaker: string;
  text: string;
  translation?: string;
}

interface EntryDialogue {
  context?: string;
  dialogue: EntryDialogueLine[];
}

interface EntryTranslation {
  word: string;
  explanation?: string;
  examples?: Record<string, string>; // { level: sentence }
  variations?: Record<string, string[]>; // { type: sentences[] }
  dialogue?: EntryDialogue;
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

  // 4. 문장 사전 생성 (대화 + 예문)
  const koSentences: Record<string, string> = {};
  const enSentences: Record<string, string> = {};

  // 4-1. entries에서 모든 문장 추출 (examples, variations, dialogue)
  console.log('📚 Extracting sentences from entries...');
  let exampleCount = 0;
  let variationCount = 0;
  let entryDialogueCount = 0;

  for (const entry of allEntries) {
    const koTranslation = entry.translations?.ko;
    const enTranslation = entry.translations?.en;

    // examples: { level: sentence } - ko/en 각각의 예문
    // ko.examples의 문장은 한국어, en.examples의 문장은 영어
    if (koTranslation?.examples && enTranslation?.examples) {
      const levels = ['beginner', 'intermediate', 'advanced', 'master'];
      for (const level of levels) {
        const ko = koTranslation.examples[level]?.trim();
        const en = enTranslation.examples[level]?.trim();
        if (ko && en) {
          if (!koSentences[ko]) {
            koSentences[ko] = en;
            exampleCount++;
          }
          const enLower = en.toLowerCase();
          if (!enSentences[enLower]) {
            enSentences[enLower] = ko;
          }
        }
      }
    }

    // variations: { type: sentences[] } - ko/en 각각의 변형
    if (koTranslation?.variations && enTranslation?.variations) {
      const types = ['formal', 'casual', 'short'];
      for (const type of types) {
        const koVariations = koTranslation.variations[type] || [];
        const enVariations = enTranslation.variations[type] || [];
        // 인덱스별로 매칭 (같은 위치의 문장이 번역 쌍)
        const minLen = Math.min(koVariations.length, enVariations.length);
        for (let i = 0; i < minLen; i++) {
          const ko = koVariations[i]?.trim();
          const en = enVariations[i]?.trim();
          if (ko && en) {
            if (!koSentences[ko]) {
              koSentences[ko] = en;
              variationCount++;
            }
            const enLower = en.toLowerCase();
            if (!enSentences[enLower]) {
              enSentences[enLower] = ko;
            }
          }
        }
      }
    }

    // dialogue: 엔트리 내부 대화 (ko.dialogue와 en.dialogue)
    if (koTranslation?.dialogue?.dialogue && enTranslation?.dialogue?.dialogue) {
      const koDialogue = koTranslation.dialogue.dialogue;
      const enDialogue = enTranslation.dialogue.dialogue;
      const minLen = Math.min(koDialogue.length, enDialogue.length);
      for (let i = 0; i < minLen; i++) {
        const ko = koDialogue[i]?.text?.trim();
        const en = enDialogue[i]?.text?.trim();
        if (ko && en) {
          if (!koSentences[ko]) {
            koSentences[ko] = en;
            entryDialogueCount++;
          }
          const enLower = en.toLowerCase();
          if (!enSentences[enLower]) {
            enSentences[enLower] = ko;
          }
        }
      }
    }
  }
  console.log(`   ✅ Extracted ${exampleCount} from examples`);
  console.log(`   ✅ Extracted ${variationCount} from variations`);
  console.log(`   ✅ Extracted ${entryDialogueCount} from entry dialogues`);

  // 4-2. 대화에서 문장 추출
  console.log('📚 Fetching conversations...');
  const conversations = await fetchJson<Conversation[]>(`${BASE_URL}/${meta.files.conversations}`);
  let dialogueCount = 0;

  for (const conv of conversations) {
    for (const line of conv.dialogue) {
      const ko = line.ko?.trim();
      const en = line.en?.trim();
      if (!ko || !en) continue;

      if (!koSentences[ko]) {
        koSentences[ko] = en;
        dialogueCount++;
      }
      const enLower = en.toLowerCase();
      if (!enSentences[enLower]) {
        enSentences[enLower] = ko;
      }
    }
  }
  console.log(`   ✅ Extracted ${dialogueCount} sentence pairs from conversations`);
  console.log(
    `\n✅ Total sentence pairs: ${Object.keys(koSentences).length} ko→en, ${Object.keys(enSentences).length} en→ko\n`,
  );

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

  // 문장 사전: JSON 파일로 분리 (lazy loading용)
  if (!existsSync(PUBLIC_DATA_DIR)) {
    mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  }

  // JSON 파일로 저장
  writeFileSync(join(PUBLIC_DATA_DIR, 'ko-to-en.json'), JSON.stringify(koSentences));
  writeFileSync(join(PUBLIC_DATA_DIR, 'en-to-ko.json'), JSON.stringify(enSentences));
  console.log(
    `📝 Created public/data/sentences/*.json (${Object.keys(koSentences).length} ko→en, ${Object.keys(enSentences).length} en→ko)`,
  );

  // TypeScript 파일: 통계와 loader 함수만 export
  const sentencesContent = `${header}/**
 * 외부 문장 사전 통계
 * 실제 데이터는 JSON 파일에서 lazy load됨
 */
export const EXTERNAL_SENTENCES_STATS = {
  koToEnCount: ${Object.keys(koSentences).length},
  enToKoCount: ${Object.keys(enSentences).length},
  generatedAt: '${timestamp}',
} as const;

// 문장 사전 캐시
let koToEnCache: Record<string, string> | null = null;
let enToKoCache: Record<string, string> | null = null;

/**
 * 한→영 문장 사전 로드 (lazy loading)
 */
export async function loadKoToEnSentences(): Promise<Record<string, string>> {
  if (koToEnCache) return koToEnCache;
  const response = await fetch('/data/sentences/ko-to-en.json');
  koToEnCache = await response.json();
  return koToEnCache!;
}

/**
 * 영→한 문장 사전 로드 (lazy loading)
 */
export async function loadEnToKoSentences(): Promise<Record<string, string>> {
  if (enToKoCache) return enToKoCache;
  const response = await fetch('/data/sentences/en-to-ko.json');
  enToKoCache = await response.json();
  return enToKoCache!;
}

/**
 * 한→영 문장 조회 (동기, 캐시된 경우만)
 */
export function lookupKoToEnSentence(ko: string): string | null {
  return koToEnCache?.[ko] ?? null;
}

/**
 * 영→한 문장 조회 (동기, 캐시된 경우만)
 */
export function lookupEnToKoSentence(en: string): string | null {
  return enToKoCache?.[en.toLowerCase()] ?? null;
}

/**
 * 문장 사전 사전 로드 (앱 초기화 시 호출)
 */
export async function preloadSentences(): Promise<void> {
  await Promise.all([loadKoToEnSentences(), loadEnToKoSentences()]);
}

/**
 * 캐시 상태 확인
 */
export function isSentencesCached(): boolean {
  return koToEnCache !== null && enToKoCache !== null;
}
`;

  writeFileSync(join(OUTPUT_DIR, 'sentences.ts'), sentencesContent);
  console.log(`📝 Created external/sentences.ts (loader functions)`);

  // index.ts 생성
  const indexContent = `${header}// 외부 사전 통합 export
export {
  externalKoToEnWords,
  externalEnToKoWords,
  EXTERNAL_WORDS_STATS,
} from './words';

export {
  EXTERNAL_SENTENCES_STATS,
  loadKoToEnSentences,
  loadEnToKoSentences,
  lookupKoToEnSentence,
  lookupEnToKoSentence,
  preloadSentences,
  isSentencesCached,
} from './sentences';

import { externalKoToEnWords, externalEnToKoWords } from './words';

// 외부 사전 로딩 상태 (동기식 - 이미 로드됨)
let isLoaded = true;

// Lazy loading을 위한 getter 함수들
export function getExternalKoToEnWords(): Record<string, string> {
  return externalKoToEnWords;
}

export function getExternalEnToKoWords(): Record<string, string> {
  return externalEnToKoWords;
}

// 단어 조회 함수
export function lookupExternalKoToEn(word: string): string | null {
  return externalKoToEnWords[word] ?? null;
}

export function lookupExternalEnToKo(word: string): string | null {
  return externalEnToKoWords[word.toLowerCase()] ?? null;
}

// 외부 사전 로딩 상태 확인
export function isExternalWordsCached(): boolean {
  return isLoaded;
}

// 외부 사전 로딩 (이미 동기적으로 로드되어 있음)
export async function loadExternalWords(): Promise<void> {
  isLoaded = true;
}
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
