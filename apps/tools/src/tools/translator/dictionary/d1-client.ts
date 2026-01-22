/**
 * D1 Dictionary Client
 *
 * 런타임에 D1 API를 호출하여 어휘 데이터를 가져옵니다.
 * Pages Functions의 /api/dictionary 엔드포인트 사용
 */

interface DictionaryResponse {
  koToEn: Record<string, string>;
  enToKo: Record<string, string>;
  count: { koToEn: number; enToKo: number };
}

interface AllDictionaryResponse {
  words: DictionaryResponse;
  sentences: DictionaryResponse;
}

// 캐시
let wordsCache: DictionaryResponse | null = null;
let sentencesCache: DictionaryResponse | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

const API_BASE = '/api/dictionary';

/**
 * D1에서 단어 사전 로드
 */
export async function loadWordsFromD1(): Promise<DictionaryResponse> {
  if (wordsCache) return wordsCache;

  const response = await fetch(`${API_BASE}?type=words`);
  if (!response.ok) {
    throw new Error(`Failed to load words: ${response.status}`);
  }

  wordsCache = await response.json();
  return wordsCache!;
}

/**
 * D1에서 문장 사전 로드
 */
export async function loadSentencesFromD1(): Promise<DictionaryResponse> {
  if (sentencesCache) return sentencesCache;

  const response = await fetch(`${API_BASE}?type=sentences`);
  if (!response.ok) {
    throw new Error(`Failed to load sentences: ${response.status}`);
  }

  sentencesCache = await response.json();
  return sentencesCache!;
}

/**
 * D1에서 모든 사전 로드 (단어 + 문장)
 */
export async function loadAllFromD1(): Promise<AllDictionaryResponse> {
  const response = await fetch(`${API_BASE}?type=all`);
  if (!response.ok) {
    throw new Error(`Failed to load all: ${response.status}`);
  }

  const data: AllDictionaryResponse = await response.json();
  wordsCache = data.words;
  sentencesCache = data.sentences;
  return data;
}

/**
 * 사전 프리로드 (앱 초기화 시 호출)
 */
export async function preloadD1Dictionary(): Promise<void> {
  if (loadPromise) return loadPromise;
  if (wordsCache && sentencesCache) return;

  isLoading = true;
  loadPromise = loadAllFromD1()
    .then(() => {
      isLoading = false;
      console.log('[D1] Dictionary loaded:', {
        words: wordsCache?.count,
        sentences: sentencesCache?.count,
      });
    })
    .catch((error) => {
      isLoading = false;
      loadPromise = null;
      console.error('[D1] Failed to load dictionary:', error);
      throw error;
    });

  return loadPromise;
}

/**
 * 한→영 단어 조회 (동기, 캐시된 경우만)
 */
export function lookupD1KoToEnWord(word: string): string | null {
  return wordsCache?.koToEn[word] ?? null;
}

/**
 * 영→한 단어 조회 (동기, 캐시된 경우만)
 */
export function lookupD1EnToKoWord(word: string): string | null {
  return wordsCache?.enToKo[word.toLowerCase()] ?? null;
}

/**
 * 한→영 문장 조회 (동기, 캐시된 경우만)
 */
export function lookupD1KoToEnSentence(sentence: string): string | null {
  return sentencesCache?.koToEn[sentence] ?? null;
}

/**
 * 영→한 문장 조회 (동기, 캐시된 경우만)
 */
export function lookupD1EnToKoSentence(sentence: string): string | null {
  return sentencesCache?.enToKo[sentence.toLowerCase()] ?? null;
}

/**
 * 캐시 상태 확인
 */
export function isD1DictionaryCached(): boolean {
  return wordsCache !== null && sentencesCache !== null;
}

/**
 * 로딩 상태 확인
 */
export function isD1DictionaryLoading(): boolean {
  return isLoading;
}

/**
 * 캐시된 단어 사전 반환
 */
export function getD1Words(): DictionaryResponse | null {
  return wordsCache;
}

/**
 * 캐시된 문장 사전 반환
 */
export function getD1Sentences(): DictionaryResponse | null {
  return sentencesCache;
}

/**
 * 캐시 초기화 (필요시)
 */
export function clearD1Cache(): void {
  wordsCache = null;
  sentencesCache = null;
  loadPromise = null;
  isLoading = false;
}
