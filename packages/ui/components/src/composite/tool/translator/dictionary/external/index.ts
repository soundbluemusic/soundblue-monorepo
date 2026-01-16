// ========================================
// External Dictionary - 외부 사전 (D1 API 런타임 로드)
// Source: Cloudflare D1 via /api/dictionary
// ========================================
// D1 API에서 런타임으로 어휘 데이터를 가져옵니다.
// 빌드 시 정적 파일 대신 런타임 API 호출 방식 사용
// ========================================

// 캐시
let _koToEnWords: Record<string, string> | null = null;
let _enToKoWords: Record<string, string> | null = null;
let _koToEnSentences: Record<string, string> | null = null;
let _enToKoSentences: Record<string, string> | null = null;
let _isLoading = false;
let _loadPromise: Promise<void> | null = null;

// API 엔드포인트 (tools 앱 기준)
const API_BASE = '/api/dictionary';

// 통계 (로드 후 업데이트됨)
export const EXTERNAL_WORDS_STATS = {
  koToEnCount: 0,
  enToKoCount: 0,
  generatedAt: 'runtime',
} as const;

export const EXTERNAL_SENTENCES_STATS = {
  koToEnCount: 0,
  enToKoCount: 0,
  generatedAt: 'runtime',
} as const;

// ========================================
// 단어 사전 API
// ========================================

/**
 * D1에서 단어 사전 로드
 */
export async function loadExternalWords(): Promise<void> {
  if (_loadPromise) return _loadPromise;
  if (_koToEnWords && _enToKoWords) return;

  _isLoading = true;
  _loadPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}?type=words`);
      if (!response.ok) {
        throw new Error(`Failed to load words: ${response.status}`);
      }
      const data = await response.json();
      _koToEnWords = data.koToEn || {};
      _enToKoWords = data.enToKo || {};
      console.log('[D1] Words loaded:', data.count);
    } catch (error) {
      console.error('[D1] Failed to load words:', error);
      // 실패 시 빈 사전 사용
      _koToEnWords = {};
      _enToKoWords = {};
    } finally {
      _isLoading = false;
    }
  })();

  return _loadPromise;
}

/**
 * 외부 단어 사전 캐시 상태 확인
 */
export function isExternalWordsCached(): boolean {
  return _koToEnWords !== null && _enToKoWords !== null;
}

/**
 * 한→영 단어 사전 반환
 */
export function getExternalKoToEnWords(): Record<string, string> {
  return _koToEnWords || {};
}

/**
 * 영→한 단어 사전 반환
 */
export function getExternalEnToKoWords(): Record<string, string> {
  return _enToKoWords || {};
}

/**
 * 한→영 단어 조회
 */
export function lookupExternalKoToEn(word: string): string | null {
  return _koToEnWords?.[word] ?? null;
}

/**
 * 영→한 단어 조회
 */
export function lookupExternalEnToKo(word: string): string | null {
  return _enToKoWords?.[word.toLowerCase()] ?? null;
}

// 정적 파일 호환용 (빈 객체 - D1 로드 전까지)
export const externalKoToEnWords: Record<string, string> = new Proxy(
  {},
  {
    get(_, prop: string) {
      return _koToEnWords?.[prop] ?? undefined;
    },
    has(_, prop: string) {
      return prop in (_koToEnWords || {});
    },
    ownKeys() {
      return Object.keys(_koToEnWords || {});
    },
    getOwnPropertyDescriptor(_, prop: string) {
      const value = _koToEnWords?.[prop];
      if (value !== undefined) {
        return { enumerable: true, configurable: true, value };
      }
      return undefined;
    },
  },
);

export const externalEnToKoWords: Record<string, string> = new Proxy(
  {},
  {
    get(_, prop: string) {
      return _enToKoWords?.[prop] ?? undefined;
    },
    has(_, prop: string) {
      return prop in (_enToKoWords || {});
    },
    ownKeys() {
      return Object.keys(_enToKoWords || {});
    },
    getOwnPropertyDescriptor(_, prop: string) {
      const value = _enToKoWords?.[prop];
      if (value !== undefined) {
        return { enumerable: true, configurable: true, value };
      }
      return undefined;
    },
  },
);

// ========================================
// 문장 사전 API
// ========================================

/**
 * D1에서 문장 사전 로드
 */
async function loadSentencesFromD1(): Promise<void> {
  if (_koToEnSentences && _enToKoSentences) return;

  try {
    const response = await fetch(`${API_BASE}?type=sentences`);
    if (!response.ok) {
      throw new Error(`Failed to load sentences: ${response.status}`);
    }
    const data = await response.json();
    _koToEnSentences = data.koToEn || {};
    _enToKoSentences = data.enToKo || {};
    console.log('[D1] Sentences loaded:', data.count);
  } catch (error) {
    console.error('[D1] Failed to load sentences:', error);
    _koToEnSentences = {};
    _enToKoSentences = {};
  }
}

/**
 * 한→영 문장 사전 로드
 */
export async function loadKoToEnSentences(): Promise<Record<string, string>> {
  if (!_koToEnSentences) {
    await loadSentencesFromD1();
  }
  return _koToEnSentences || {};
}

/**
 * 영→한 문장 사전 로드
 */
export async function loadEnToKoSentences(): Promise<Record<string, string>> {
  if (!_enToKoSentences) {
    await loadSentencesFromD1();
  }
  return _enToKoSentences || {};
}

/**
 * 한→영 문장 조회 (동기, 캐시된 경우만)
 */
export function lookupKoToEnSentence(sentence: string): string | null {
  return _koToEnSentences?.[sentence] ?? null;
}

/**
 * 영→한 문장 조회 (동기, 캐시된 경우만)
 */
export function lookupEnToKoSentence(sentence: string): string | null {
  return _enToKoSentences?.[sentence.toLowerCase()] ?? null;
}

/**
 * 문장 사전 프리로드
 */
export async function preloadSentences(): Promise<void> {
  await loadSentencesFromD1();
}

/**
 * 문장 사전 캐시 상태 확인
 */
export function isSentencesCached(): boolean {
  return _koToEnSentences !== null && _enToKoSentences !== null;
}
