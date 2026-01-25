/// <reference types="@cloudflare/workers-types" />

/**
 * D1 Dictionary Server Functions
 *
 * TanStack Start 서버 함수를 사용하여 D1 데이터베이스에 접근합니다.
 * Cloudflare Workers에서 실행되며, D1 바인딩을 통해 데이터를 조회합니다.
 */

import { createServerFn } from '@tanstack/react-start';

// Cloudflare env 타입 정의
interface CloudflareEnv {
  DB: D1Database;
  ALGORITHMS_DB: D1Database;
  PRIVATE_DB: D1Database;
}

interface DictionaryResponse {
  koToEn: Record<string, string>;
  enToKo: Record<string, string>;
  count: { koToEn: number; enToKo: number };
}

export interface AllDictionaryResponse {
  words: DictionaryResponse;
  sentences: DictionaryResponse;
}

/**
 * D1에서 단어 사전 조회
 */
export const getWords = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    // Cloudflare 환경에서 env 접근
    // @ts-expect-error - Cloudflare 런타임에서 globalThis.env로 바인딩 접근
    const env = globalThis.env as CloudflareEnv | undefined;

    if (!env?.DB) {
      console.warn('[D1] DB binding not available');
      return {
        koToEn: {},
        enToKo: {},
        count: { koToEn: 0, enToKo: 0 },
      } satisfies DictionaryResponse;
    }

    const { results } = await env.DB.prepare(`
      SELECT korean, translations FROM entries ORDER BY korean
    `).all<{ korean: string; translations: string }>();

    const koToEn: Record<string, string> = {};
    const enToKo: Record<string, string> = {};

    for (const row of results || []) {
      const ko = row.korean;
      if (!row.translations) continue;

      try {
        const translations = JSON.parse(row.translations);
        const enWord = translations?.en?.word;
        if (ko && enWord) {
          const en = enWord.split(' / ')[0].trim();
          if (!koToEn[ko]) koToEn[ko] = en;
          if (!enToKo[en.toLowerCase()]) enToKo[en.toLowerCase()] = ko;
        }
      } catch {
        // JSON 파싱 실패 시 무시
      }
    }

    return {
      koToEn,
      enToKo,
      count: { koToEn: Object.keys(koToEn).length, enToKo: Object.keys(enToKo).length },
    } satisfies DictionaryResponse;
  } catch (error) {
    console.error('[D1] Failed to fetch words:', error);
    return {
      koToEn: {},
      enToKo: {},
      count: { koToEn: 0, enToKo: 0 },
    } satisfies DictionaryResponse;
  }
});

/**
 * D1에서 문장 사전 조회
 */
export const getSentences = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    // @ts-expect-error - Cloudflare 런타임에서 globalThis.env로 바인딩 접근
    const env = globalThis.env as CloudflareEnv | undefined;

    if (!env?.DB) {
      console.warn('[D1] DB binding not available');
      return {
        koToEn: {},
        enToKo: {},
        count: { koToEn: 0, enToKo: 0 },
      } satisfies DictionaryResponse;
    }

    const koSentences: Record<string, string> = {};
    const enSentences: Record<string, string> = {};

    // entries에서 문장 추출
    const { results: entries } = await env.DB.prepare(`
      SELECT translations FROM entries
    `).all<{ translations: string }>();

    for (const entry of entries || []) {
      if (!entry.translations) continue;
      try {
        const translations = JSON.parse(entry.translations);
        extractSentencesFromTranslations(translations, koSentences, enSentences);
      } catch {
        // ignore
      }
    }

    // conversations에서 문장 추출
    const { results: conversations } = await env.DB.prepare(`
      SELECT dialogue FROM conversations
    `).all<{ dialogue: string }>();

    for (const conv of conversations || []) {
      if (!conv.dialogue) continue;
      try {
        const dialogue = JSON.parse(conv.dialogue);
        for (const line of dialogue) {
          const ko = line.ko?.trim();
          const en = line.en?.trim();
          if (ko && en) {
            if (!koSentences[ko]) koSentences[ko] = en;
            if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
          }
        }
      } catch {
        // ignore
      }
    }

    return {
      koToEn: koSentences,
      enToKo: enSentences,
      count: { koToEn: Object.keys(koSentences).length, enToKo: Object.keys(enSentences).length },
    } satisfies DictionaryResponse;
  } catch (error) {
    console.error('[D1] Failed to fetch sentences:', error);
    return {
      koToEn: {},
      enToKo: {},
      count: { koToEn: 0, enToKo: 0 },
    } satisfies DictionaryResponse;
  }
});

/**
 * D1에서 모든 사전 조회 (단어 + 문장)
 */
export const getAllDictionary = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AllDictionaryResponse> => {
    const [words, sentences] = await Promise.all([getWords(), getSentences()]);

    return { words, sentences };
  },
);

// Helper function
interface TranslationData {
  examples?: Record<string, string>;
  variations?: Record<string, string[]>;
}

function extractSentencesFromTranslations(
  translations: { ko?: TranslationData; en?: TranslationData },
  koSentences: Record<string, string>,
  enSentences: Record<string, string>,
) {
  const koTrans = translations?.ko;
  const enTrans = translations?.en;

  // examples
  if (koTrans?.examples && enTrans?.examples) {
    for (const level of ['beginner', 'intermediate', 'advanced', 'master']) {
      const ko = koTrans.examples[level]?.trim();
      const en = enTrans.examples[level]?.trim();
      if (ko && en) {
        if (!koSentences[ko]) koSentences[ko] = en;
        if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
      }
    }
  }

  // variations
  if (koTrans?.variations && enTrans?.variations) {
    for (const type of ['formal', 'casual', 'short']) {
      const koVars: string[] = koTrans.variations[type] || [];
      const enVars: string[] = enTrans.variations[type] || [];
      const minLen = Math.min(koVars.length, enVars.length);
      for (let i = 0; i < minLen; i++) {
        const ko = koVars[i]?.trim();
        const en = enVars[i]?.trim();
        if (ko && en) {
          if (!koSentences[ko]) koSentences[ko] = en;
          if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
        }
      }
    }
  }
}
