// ========================================
// WSD - Context App 데이터 동기화
// context.soundbluemusic.com 데이터를 WSD 사전에 통합
// 빌드 시점에 실행
// ========================================

import type { Polysemy, Sense } from './polysemy-dict';

/**
 * Context App의 MeaningEntry 타입 (외부 데이터 구조)
 */
export interface ContextMeaningEntry {
  /** 한국어 단어 */
  word: string;
  /** 의미들 */
  meanings: {
    /** 의미 ID */
    id: string;
    /** 영어 번역 */
    english: string;
    /** 도메인/카테고리 */
    domain?: string;
    /** 예문들 */
    examples?: string[];
    /** 동의어 */
    synonyms?: string[];
    /** 빈도 (0-1) */
    frequency?: number;
  }[];
}

/**
 * Context App 데이터 소스 설정
 */
export interface ContextDataSource {
  /** 데이터 URL (GitHub raw 또는 API) */
  baseUrl: string;
  /** 단어 목록 엔드포인트 */
  indexEndpoint: string;
  /** 개별 단어 엔드포인트 패턴 ({word} 치환) */
  entryEndpoint: string;
}

/**
 * 기본 데이터 소스 (soundbluemusic/public-monorepo)
 */
export const DEFAULT_CONTEXT_SOURCE: ContextDataSource = {
  baseUrl: 'https://raw.githubusercontent.com/soundbluemusic/public-monorepo/main',
  indexEndpoint: '/apps/context/src/data/index.json',
  entryEndpoint: '/apps/context/src/data/entries/{word}.json',
};

/**
 * Context 데이터를 WSD Sense로 변환
 */
function convertToSense(
  meaning: ContextMeaningEntry['meanings'][0],
  examples: string[] = [],
): Sense {
  // 예문에서 트리거 단어 추출
  const triggers: string[] = [];

  for (const example of examples) {
    // 예문에서 명사/동사/형용사 추출 (간단 버전)
    const words = example.split(/\s+/).filter((w) => w.length >= 2);
    for (const word of words) {
      // 조사/어미 제거 후 어간 추출
      const stem = extractStemSimple(word);
      if (stem.length >= 2 && !triggers.includes(stem)) {
        triggers.push(stem);
      }
    }
  }

  // 동의어도 트리거로 추가
  if (meaning.synonyms) {
    for (const syn of meaning.synonyms) {
      if (!triggers.includes(syn)) {
        triggers.push(syn);
      }
    }
  }

  return {
    id: meaning.id,
    en: meaning.english,
    domain: meaning.domain || 'general',
    triggers: triggers.slice(0, 15), // 최대 15개
    weight: meaning.frequency || 0.5,
  };
}

/**
 * 간단한 어간 추출
 */
function extractStemSimple(word: string): string {
  const particles = [
    '을',
    '를',
    '이',
    '가',
    '은',
    '는',
    '에',
    '에서',
    '로',
    '으로',
    '와',
    '과',
    '도',
    '만',
    '의',
  ];
  const endings = ['다', '했', '었', '았', '니다', '어요', '아요', '고', '며', '서', '면'];

  let result = word;

  // 조사 제거
  for (const p of particles) {
    if (result.endsWith(p) && result.length > p.length + 1) {
      result = result.slice(0, -p.length);
      break;
    }
  }

  // 어미 제거
  for (const e of endings) {
    if (result.endsWith(e) && result.length > e.length + 1) {
      result = result.slice(0, -e.length);
      break;
    }
  }

  return result;
}

/**
 * Context 데이터를 Polysemy로 변환
 */
export function convertToPolysemy(entry: ContextMeaningEntry): Polysemy {
  const senses: Sense[] = entry.meanings.map((m) => {
    const examples = m.examples || [];
    return convertToSense(m, examples);
  });

  return {
    word: entry.word,
    senses,
  };
}

/**
 * 기존 Polysemy와 새 데이터 병합
 */
export function mergePolysemy(existing: Polysemy, newEntry: Polysemy): Polysemy {
  const mergedSenses: Sense[] = [...existing.senses];

  for (const newSense of newEntry.senses) {
    const existingIndex = mergedSenses.findIndex((s) => s.id === newSense.id);

    if (existingIndex >= 0) {
      // 기존 sense에 새 트리거 병합
      const existingSense = mergedSenses[existingIndex];
      if (existingSense) {
        const mergedTriggers = new Set([...existingSense.triggers, ...newSense.triggers]);
        mergedSenses[existingIndex] = {
          ...existingSense,
          triggers: Array.from(mergedTriggers).slice(0, 20),
        };
      }
    } else {
      // 새 sense 추가
      mergedSenses.push(newSense);
    }
  }

  return {
    word: existing.word,
    senses: mergedSenses,
  };
}

/**
 * Context 데이터 fetch (런타임용이 아닌 빌드 시점용)
 * 실제 사용 시 Node.js fetch 또는 빌드 스크립트에서 호출
 */
export async function fetchContextData(
  source: ContextDataSource = DEFAULT_CONTEXT_SOURCE,
): Promise<ContextMeaningEntry[]> {
  // 빌드 시점에만 실행되는 함수
  // 실제 구현은 빌드 스크립트에서 수행

  if (import.meta.env.DEV) console.log('Fetching context data from:', source.baseUrl);

  // 이 함수는 빌드 스크립트에서 구현됨
  // 여기서는 타입 정의만 제공
  return [];
}

/**
 * 동기화 결과 타입
 */
export interface SyncResult {
  /** 추가된 단어 수 */
  added: number;
  /** 업데이트된 단어 수 */
  updated: number;
  /** 총 트리거 수 증가 */
  triggersAdded: number;
  /** 동기화된 단어 목록 */
  words: string[];
}

/**
 * 동기화 실행 (빌드 스크립트용)
 * 실제 사용: npx tsx scripts/sync-context-data.ts
 */
export function syncContextData(
  existingDict: Map<string, Polysemy>,
  contextEntries: ContextMeaningEntry[],
): { updatedDict: Map<string, Polysemy>; result: SyncResult } {
  const updatedDict = new Map(existingDict);
  const result: SyncResult = {
    added: 0,
    updated: 0,
    triggersAdded: 0,
    words: [],
  };

  for (const entry of contextEntries) {
    const newPolysemy = convertToPolysemy(entry);
    const existing = updatedDict.get(entry.word);

    if (existing) {
      // 기존 데이터 병합
      const beforeTriggers = existing.senses.reduce((sum, s) => sum + s.triggers.length, 0);
      const merged = mergePolysemy(existing, newPolysemy);
      const afterTriggers = merged.senses.reduce((sum, s) => sum + s.triggers.length, 0);

      updatedDict.set(entry.word, merged);
      result.updated++;
      result.triggersAdded += afterTriggers - beforeTriggers;
    } else {
      // 새 단어 추가
      updatedDict.set(entry.word, newPolysemy);
      result.added++;
      result.triggersAdded += newPolysemy.senses.reduce((sum, s) => sum + s.triggers.length, 0);
    }

    result.words.push(entry.word);
  }

  return { updatedDict, result };
}

/**
 * Polysemy Map을 TypeScript 코드로 내보내기
 */
export function exportPolysemyDictAsCode(dict: Map<string, Polysemy>): string {
  const entries = Array.from(dict.values());

  let code = `// Auto-generated from context app data sync
// Generated: ${new Date().toISOString()}

import type { Polysemy } from './polysemy-dict';

export const SYNCED_POLYSEMY_ENTRIES: Polysemy[] = [\n`;

  for (const entry of entries) {
    code += `  {\n`;
    code += `    word: '${entry.word}',\n`;
    code += `    senses: [\n`;

    for (const sense of entry.senses) {
      code += `      {\n`;
      code += `        id: '${sense.id}',\n`;
      code += `        en: '${sense.en}',\n`;
      code += `        domain: '${sense.domain}',\n`;
      code += `        triggers: [${sense.triggers.map((t) => `'${t}'`).join(', ')}],\n`;
      code += `        weight: ${sense.weight},\n`;
      code += `      },\n`;
    }

    code += `    ],\n`;
    code += `  },\n`;
  }

  code += `];\n`;

  return code;
}
