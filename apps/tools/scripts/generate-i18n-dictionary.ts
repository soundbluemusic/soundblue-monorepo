#!/usr/bin/env npx tsx

/**
 * i18n → Translator Dictionary Generator
 * i18n 번역 파일에서 번역기 사전을 자동 생성
 *
 * 추출 전략:
 * 1. 짧은 값 (1-3 단어) → 단어/구 사전
 * 2. 문장 값 (4+ 단어 또는 문장부호 포함) → 문장 사전
 * 3. 문장에서 단어 토큰화 → 단어 사전에 추가
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MESSAGES_DIR = 'project.inlang/messages';
const OUTPUT_DIR = 'app/tools/translator/dictionary';

// ========================================
// Type Definitions
// ========================================

/**
 * Recursive JSON value type for i18n message files.
 * Represents valid JSON values that can appear in translation files.
 */
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

/** JSON object type (key-value pairs) */
interface JsonObject {
  [key: string]: JsonValue;
}

/** JSON array type */
type JsonArray = JsonValue[];

/**
 * i18n message file structure.
 * Translation files contain nested string values with dot-notation keys.
 */
type I18nMessages = JsonObject;

/** Translation pair extracted from i18n files */
interface TranslationPair {
  ko: string;
  en: string;
  key: string;
}

/**
 * JSON 객체를 평탄화하여 key-value 쌍 추출
 * @param obj - Nested i18n message object
 * @param prefix - Current key prefix for nested keys
 * @returns Flattened object with dot-notation keys
 */
function flattenObject(obj: JsonObject, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (isJsonObject(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    }
    // Ignore arrays, numbers, booleans, and null (not valid for i18n strings)
  }

  return result;
}

/**
 * Type guard to check if a value is a JSON object
 */
function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * i18n 파일에서 번역 쌍 추출
 * @returns Array of Korean-English translation pairs
 */
function extractTranslationPairs(): TranslationPair[] {
  const koPath = join(MESSAGES_DIR, 'ko.json');
  const enPath = join(MESSAGES_DIR, 'en.json');

  const koJson: I18nMessages = JSON.parse(readFileSync(koPath, 'utf-8'));
  const enJson: I18nMessages = JSON.parse(readFileSync(enPath, 'utf-8'));

  const koFlat = flattenObject(koJson);
  const enFlat = flattenObject(enJson);

  const pairs: TranslationPair[] = [];

  for (const [key, koValue] of Object.entries(koFlat)) {
    const enValue = enFlat[key];
    if (enValue && koValue !== enValue) {
      pairs.push({ ko: koValue, en: enValue, key });
    }
  }

  return pairs;
}

/**
 * 텍스트가 문장인지 판별
 * - 문장부호 포함 (., !, ?)
 * - 4단어 이상
 * - 50자 초과
 */
function isSentence(text: string): boolean {
  // 문장부호 포함
  if (/[.!?。！？]/.test(text)) return true;

  // 플레이스홀더 포함 (문장일 가능성 높음)
  if (/\{[^}]+\}/.test(text)) return true;

  // 4단어 이상 (한글 기준 공백으로 분리)
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 4) return true;

  // 50자 초과
  if (text.length > 50) return true;

  return false;
}

/**
 * 문장에서 단어 토큰 추출 (한글)
 */
function extractKoreanTokens(text: string): string[] {
  // 한글 단어만 추출 (조사 포함된 형태)
  const tokens = text.match(/[가-힣]+/g) || [];

  // 1글자 제외, 중복 제거
  return [...new Set(tokens.filter((t) => t.length >= 2))];
}

/**
 * 문장에서 단어 토큰 추출 (영어)
 */
function extractEnglishTokens(text: string): string[] {
  // 영어 단어만 추출
  const tokens = text.match(/[a-zA-Z]+/g) || [];

  // 2글자 이하 제외, 중복 제거, 소문자 변환
  return [...new Set(tokens.filter((t) => t.length > 2).map((t) => t.toLowerCase()))];
}

/**
 * 단어 사전 파일 생성
 */
function generateWordsDictionary(pairs: TranslationPair[]): {
  koToEn: Record<string, string>;
  enToKo: Record<string, string>;
  stats: { words: number; fromSentences: number };
} {
  const koToEn: Record<string, string> = {};
  const enToKo: Record<string, string> = {};
  let fromSentences = 0;

  for (const pair of pairs) {
    if (!isSentence(pair.ko) && !isSentence(pair.en)) {
      // 짧은 값: 직접 추가
      koToEn[pair.ko] = pair.en;
      enToKo[pair.en.toLowerCase()] = pair.ko;
    } else {
      // 문장: 토큰 추출하여 개별 단어 매핑 시도
      const koTokens = extractKoreanTokens(pair.ko);
      const enTokens = extractEnglishTokens(pair.en);

      // 토큰 수가 비슷하면 순서대로 매핑 시도 (휴리스틱)
      if (koTokens.length > 0 && enTokens.length > 0) {
        // 단일 토큰 매핑 (1:1 대응 가능한 경우)
        if (koTokens.length === 1 && enTokens.length === 1) {
          const koToken = koTokens[0];
          const enToken = enTokens[0];
          if (koToken && enToken && !koToEn[koToken]) {
            koToEn[koToken] = enToken;
            enToKo[enToken] = koToken;
            fromSentences++;
          }
        }
      }
    }
  }

  return {
    koToEn,
    enToKo,
    stats: { words: Object.keys(koToEn).length, fromSentences },
  };
}

/**
 * 문장 사전 파일 생성
 */
function generateSentencesDictionary(pairs: TranslationPair[]): {
  koToEn: Record<string, string>;
  stats: { sentences: number };
} {
  const koToEn: Record<string, string> = {};

  for (const pair of pairs) {
    if (isSentence(pair.ko) || isSentence(pair.en)) {
      // 플레이스홀더가 없는 문장만 추가
      if (!/\{[^}]+\}/.test(pair.ko) && !/\{[^}]+\}/.test(pair.en)) {
        // 문장부호 제거하여 정규화
        const normalizedKo = pair.ko.replace(/[.!?。！？]+$/, '').trim();
        const normalizedEn = pair.en.replace(/[.!?。！？]+$/, '').trim();

        if (normalizedKo && normalizedEn) {
          koToEn[normalizedKo] = normalizedEn;
        }
      }
    }
  }

  return { koToEn, stats: { sentences: Object.keys(koToEn).length } };
}

/**
 * TypeScript 파일 생성
 */
function writeWordsFile(koToEn: Record<string, string>, enToKo: Record<string, string>): void {
  const content = `// ========================================
// i18n Words Dictionary - i18n 기반 단어 사전
// ⚠️ 자동 생성 파일 - 직접 수정 금지
// 생성: pnpm generate:i18n-dict
// ========================================

/**
 * i18n 파일에서 추출한 한→영 단어 사전
 * 사이트 UI 용어가 자동으로 번역기에 반영됩니다.
 */
export const i18nKoToEn: Record<string, string> = ${JSON.stringify(koToEn, null, 2)};

/**
 * i18n 파일에서 추출한 영→한 단어 사전
 */
export const i18nEnToKo: Record<string, string> = ${JSON.stringify(enToKo, null, 2)};
`;

  writeFileSync(join(OUTPUT_DIR, 'i18n-words.ts'), content, 'utf-8');
}

/**
 * 문장 사전 파일 생성
 */
function writeSentencesFile(koToEn: Record<string, string>): void {
  const content = `// ========================================
// i18n Sentences Dictionary - i18n 기반 문장 사전
// ⚠️ 자동 생성 파일 - 직접 수정 금지
// 생성: pnpm generate:i18n-dict
// ========================================

/**
 * i18n 파일에서 추출한 한→영 문장 사전
 * 사이트 UI 문장이 자동으로 번역기에 반영됩니다.
 */
export const i18nKoToEnSentences: Record<string, string> = ${JSON.stringify(koToEn, null, 2)};

/**
 * 역방향 사전 (영→한) 자동 생성
 */
export const i18nEnToKoSentences: Record<string, string> = Object.fromEntries(
  Object.entries(i18nKoToEnSentences).map(([ko, en]) => [en.toLowerCase(), ko])
);
`;

  writeFileSync(join(OUTPUT_DIR, 'i18n-sentences.ts'), content, 'utf-8');
}

/**
 * 메인 함수
 */
function main(): void {
  console.log('🔄 Generating i18n dictionary...\n');

  // 1. 번역 쌍 추출
  const pairs = extractTranslationPairs();
  console.log(`  📖 Found ${pairs.length} translation pairs from i18n files`);

  // 2. 단어 사전 생성
  const words = generateWordsDictionary(pairs);
  writeWordsFile(words.koToEn, words.enToKo);
  console.log(`  📝 Generated i18n-words.ts`);
  console.log(`     └─ ${words.stats.words} word pairs`);
  console.log(`     └─ ${words.stats.fromSentences} extracted from sentences`);

  // 3. 문장 사전 생성
  const sentences = generateSentencesDictionary(pairs);
  writeSentencesFile(sentences.koToEn);
  console.log(`  📝 Generated i18n-sentences.ts`);
  console.log(`     └─ ${sentences.stats.sentences} sentence pairs`);

  console.log('\n✅ i18n dictionary generation complete!');
}

main();
