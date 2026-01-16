#!/usr/bin/env tsx
/**
 * Context D1 동기화 스크립트
 *
 * Cloudflare D1 REST API를 통해 Context 앱의 데이터를 가져와
 * 번역기 사전으로 통합합니다.
 *
 * 필요한 환경변수:
 * - CLOUDFLARE_ACCOUNT_ID
 * - CLOUDFLARE_API_TOKEN
 * - D1_DATABASE_ID
 *
 * Usage: pnpm sync:context-d1
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 환경변수 확인
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.D1_DATABASE_ID;

if (!ACCOUNT_ID || !API_TOKEN || !DATABASE_ID) {
  console.error('❌ Missing required environment variables:');
  if (!ACCOUNT_ID) console.error('   - CLOUDFLARE_ACCOUNT_ID');
  if (!API_TOKEN) console.error('   - CLOUDFLARE_API_TOKEN');
  if (!DATABASE_ID) console.error('   - D1_DATABASE_ID');
  process.exit(1);
}

// D1 REST API URL
const D1_API_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

// 출력 디렉토리
const OUTPUT_DIR = join(__dirname, '../apps/tools/app/tools/translator/dictionary/external');
const PUBLIC_DATA_DIR = join(__dirname, '../apps/tools/public/data/sentences');

// 타입 정의
interface D1Response<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result: Array<{
    results: T[];
    success: boolean;
    meta: {
      served_by: string;
      duration: number;
      changes: number;
      last_row_id: number;
      changed_db: boolean;
      size_after: number;
      rows_read: number;
      rows_written: number;
    };
  }>;
}

interface EntryRow {
  id: string;
  korean: string;
  romanization: string | null;
  part_of_speech: string | null;
  category_id: string;
  difficulty: string | null;
  frequency: string | null;
  tags: string | null;
  translations: string; // JSON string
  created_at: number;
}

interface ConversationRow {
  id: string;
  category_id: string | null;
  title_ko: string;
  title_en: string;
  dialogue: string; // JSON string
  created_at: number;
}

interface TranslationData {
  ko?: {
    word?: string;
    explanation?: string;
    examples?: Record<string, string>;
    variations?: string[];
    dialogue?: {
      context?: string;
      dialogue?: Array<{ speaker: string; text: string }>;
    };
  };
  en?: {
    word?: string;
    explanation?: string;
    examples?: Record<string, string>;
    variations?: string[];
    dialogue?: {
      context?: string;
      dialogue?: Array<{ speaker: string; text: string }>;
    };
  };
}

interface DialogueLine {
  speaker: string;
  korean: string;
  romanization?: string;
  translation: string;
}

async function queryD1<T>(sql: string): Promise<T[]> {
  const response = await fetch(D1_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    throw new Error(`D1 API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as D1Response<T>;

  if (!data.success) {
    throw new Error(`D1 query failed: ${data.errors.map((e) => e.message).join(', ')}`);
  }

  return data.result[0]?.results ?? [];
}

async function syncFromD1(): Promise<void> {
  console.log('🔄 Syncing from Cloudflare D1...\n');

  // 1. entries 테이블에서 데이터 가져오기
  console.log('📚 Fetching entries from D1...');
  const entries = await queryD1<EntryRow>('SELECT * FROM entries');
  console.log(`   ✅ Loaded ${entries.length} entries\n`);

  // 2. conversations 테이블에서 데이터 가져오기
  console.log('💬 Fetching conversations from D1...');
  const conversations = await queryD1<ConversationRow>('SELECT * FROM conversations');
  console.log(`   ✅ Loaded ${conversations.length} conversations\n`);

  // 3. 단어 사전 생성 (ko→en, en→ko)
  const koToEn: Record<string, string> = {};
  const enToKo: Record<string, string> = {};

  for (const entry of entries) {
    const ko = entry.korean;
    let translations: TranslationData = {};

    try {
      translations = JSON.parse(entry.translations) as TranslationData;
    } catch {
      continue;
    }

    const enWord = translations.en?.word;
    if (!ko || !enWord) continue;

    // 영어 번역이 "A / B" 형식이면 첫 번째만 사용
    const en = enWord.split(' / ')[0].trim();

    if (!koToEn[ko]) {
      koToEn[ko] = en;
    }

    const enLower = en.toLowerCase();
    if (!enToKo[enLower]) {
      enToKo[enLower] = ko;
    }
  }

  console.log(
    `🔤 Word pairs: ${Object.keys(koToEn).length} ko→en, ${Object.keys(enToKo).length} en→ko\n`,
  );

  // 4. 문장 사전 생성
  const koSentences: Record<string, string> = {};
  const enSentences: Record<string, string> = {};

  // 4-1. entries에서 예문 추출
  console.log('📝 Extracting sentences from entries...');
  let exampleCount = 0;
  let variationCount = 0;
  let entryDialogueCount = 0;

  for (const entry of entries) {
    let translations: TranslationData = {};
    try {
      translations = JSON.parse(entry.translations) as TranslationData;
    } catch {
      continue;
    }

    const koTranslation = translations.ko;
    const enTranslation = translations.en;

    // examples 추출
    if (koTranslation?.examples && enTranslation?.examples) {
      const levels = ['beginner', 'intermediate', 'advanced', 'master'];
      for (const level of levels) {
        const koEx = koTranslation.examples[level]?.trim();
        const enEx = enTranslation.examples[level]?.trim();
        if (koEx && enEx) {
          if (!koSentences[koEx]) {
            koSentences[koEx] = enEx;
            exampleCount++;
          }
          const enLower = enEx.toLowerCase();
          if (!enSentences[enLower]) {
            enSentences[enLower] = koEx;
          }
        }
      }
    }

    // variations 추출
    if (koTranslation?.variations && enTranslation?.variations) {
      const koVars = koTranslation.variations;
      const enVars = enTranslation.variations;
      const minLen = Math.min(koVars.length, enVars.length);
      for (let i = 0; i < minLen; i++) {
        const koVar = koVars[i]?.trim();
        const enVar = enVars[i]?.trim();
        if (koVar && enVar) {
          if (!koSentences[koVar]) {
            koSentences[koVar] = enVar;
            variationCount++;
          }
          const enLower = enVar.toLowerCase();
          if (!enSentences[enLower]) {
            enSentences[enLower] = koVar;
          }
        }
      }
    }

    // dialogue 추출 (엔트리 내부)
    if (koTranslation?.dialogue?.dialogue && enTranslation?.dialogue?.dialogue) {
      const koDialogue = koTranslation.dialogue.dialogue;
      const enDialogue = enTranslation.dialogue.dialogue;
      const minLen = Math.min(koDialogue.length, enDialogue.length);
      for (let i = 0; i < minLen; i++) {
        const koText = koDialogue[i]?.text?.trim();
        const enText = enDialogue[i]?.text?.trim();
        if (koText && enText) {
          if (!koSentences[koText]) {
            koSentences[koText] = enText;
            entryDialogueCount++;
          }
          const enLower = enText.toLowerCase();
          if (!enSentences[enLower]) {
            enSentences[enLower] = koText;
          }
        }
      }
    }
  }

  console.log(`   ✅ ${exampleCount} from examples`);
  console.log(`   ✅ ${variationCount} from variations`);
  console.log(`   ✅ ${entryDialogueCount} from entry dialogues`);

  // 4-2. conversations에서 대화 추출
  console.log('📝 Extracting sentences from conversations...');
  let convDialogueCount = 0;

  for (const conv of conversations) {
    let dialogue: DialogueLine[] = [];
    try {
      dialogue = JSON.parse(conv.dialogue) as DialogueLine[];
    } catch {
      continue;
    }

    for (const line of dialogue) {
      const ko = line.korean?.trim();
      const en = line.translation?.trim();
      if (!ko || !en) continue;

      if (!koSentences[ko]) {
        koSentences[ko] = en;
        convDialogueCount++;
      }
      const enLower = en.toLowerCase();
      if (!enSentences[enLower]) {
        enSentences[enLower] = ko;
      }
    }
  }

  console.log(`   ✅ ${convDialogueCount} from conversations\n`);

  // 5. 출력 디렉토리 생성
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!existsSync(PUBLIC_DATA_DIR)) {
    mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  }

  // 6. 파일 생성
  const timestamp = new Date().toISOString();
  const header = `// ========================================
// External Dictionary - 외부 사전 (D1에서 자동 생성)
// Source: Cloudflare D1 (Context App)
// Generated: ${timestamp}
// ========================================
// ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요!
// ⚠️ This file is auto-generated. Do not edit directly!
// Run: pnpm sync:context-d1
// ========================================

`;

  // 단어 사전 파일
  const wordsContent = `${header}/**
 * 외부 단어 사전 (ko→en)
 */
export const externalKoToEnWords: Record<string, string> = ${JSON.stringify(koToEn, null, 2)};

/**
 * 외부 단어 사전 (en→ko)
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

  // 문장 사전: JSON 파일로 저장 (lazy loading용)
  writeFileSync(join(PUBLIC_DATA_DIR, 'ko-to-en.json'), JSON.stringify(koSentences));
  writeFileSync(join(PUBLIC_DATA_DIR, 'en-to-ko.json'), JSON.stringify(enSentences));
  console.log(
    `📝 Created public/data/sentences/*.json (${Object.keys(koSentences).length} ko→en, ${Object.keys(enSentences).length} en→ko)`,
  );

  // TypeScript 파일: 통계와 loader 함수
  const sentencesContent = `${header}/**
 * 외부 문장 사전 통계
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
  console.log('📝 Created external/sentences.ts');

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
`;

  writeFileSync(join(OUTPUT_DIR, 'index.ts'), indexContent);
  console.log('📝 Created external/index.ts\n');

  // 7. 요약
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    D1 동기화 완료 Summary');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📚 Entries processed: ${entries.length}`);
  console.log(`💬 Conversations processed: ${conversations.length}`);
  console.log(
    `🔤 Word pairs: ko→en ${Object.keys(koToEn).length}, en→ko ${Object.keys(enToKo).length}`,
  );
  console.log(
    `📝 Sentence pairs: ko→en ${Object.keys(koSentences).length}, en→ko ${Object.keys(enSentences).length}`,
  );
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n✅ Output: ${OUTPUT_DIR}`);
}

syncFromD1().catch((error) => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
