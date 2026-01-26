// ========================================
// External Dictionary - 외부 사전 (SSR 서버 함수 또는 런타임 로드)
// Source: Cloudflare D1 via TanStack Start server functions
// ========================================
// 앱에서 loader를 통해 D1 데이터를 주입받거나,
// 클라이언트에서 직접 로드합니다.
// ========================================

// 캐시
let _koToEnWords: Record<string, string> | null = null;
let _enToKoWords: Record<string, string> | null = null;
let _koToEnSentences: Record<string, string> | null = null;
let _enToKoSentences: Record<string, string> | null = null;
let _isLoading = false;
let _loadPromise: Promise<void> | null = null;

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
// D1 데이터 직접 주입 (SSR loader에서 호출)
// ========================================

export interface DictionaryData {
  words?: {
    koToEn: Record<string, string>;
    enToKo: Record<string, string>;
    count?: { koToEn: number; enToKo: number };
  };
  sentences?: {
    koToEn: Record<string, string>;
    enToKo: Record<string, string>;
    count?: { koToEn: number; enToKo: number };
  };
}

/**
 * D1 데이터를 캐시에 직접 주입 (SSR loader에서 호출)
 * 이 함수를 통해 서버에서 로드한 데이터를 클라이언트 캐시에 설정
 */
export function injectDictionaryData(data: DictionaryData | null): void {
  if (!data) return;

  if (data.words) {
    _koToEnWords = data.words.koToEn || {};
    _enToKoWords = data.words.enToKo || {};
    console.log('[D1] Words injected:', data.words.count);
  }

  if (data.sentences) {
    _koToEnSentences = data.sentences.koToEn || {};
    _enToKoSentences = data.sentences.enToKo || {};
    console.log('[D1] Sentences injected:', data.sentences.count);
  }
}

// ========================================
// 단어 사전 로드
// ========================================

/**
 * 외부 단어 사전 로드
 * 이미 주입된 데이터가 있으면 그것을 사용
 */
export async function loadExternalWords(): Promise<void> {
  // 이미 캐시에 데이터가 있으면 스킵 (SSR에서 주입된 경우)
  if (_koToEnWords && _enToKoWords) return;
  if (_loadPromise) return _loadPromise;

  // 캐시에 데이터가 없으면 빈 사전으로 초기화
  // (SSR loader에서 주입하지 않은 경우)
  _isLoading = true;
  _loadPromise = Promise.resolve().then(() => {
    if (!_koToEnWords) _koToEnWords = {};
    if (!_enToKoWords) _enToKoWords = {};
    _isLoading = false;
    console.log('[D1] Using bundled dictionary (D1 data not injected)');
  });

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
// 문장 사전 로드
// ========================================

/**
 * 문장 사전 초기화
 * 이미 주입된 데이터가 있으면 그것을 사용
 */
function ensureSentencesInitialized(): void {
  // 캐시에 데이터가 없으면 빈 사전으로 초기화
  if (!_koToEnSentences) _koToEnSentences = {};
  if (!_enToKoSentences) _enToKoSentences = {};
}

/**
 * 한→영 문장 사전 로드
 */
export async function loadKoToEnSentences(): Promise<Record<string, string>> {
  ensureSentencesInitialized();
  return _koToEnSentences || {};
}

/**
 * 영→한 문장 사전 로드
 */
export async function loadEnToKoSentences(): Promise<Record<string, string>> {
  ensureSentencesInitialized();
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
  ensureSentencesInitialized();
}

/**
 * 문장 사전 캐시 상태 확인
 */
export function isSentencesCached(): boolean {
  return _koToEnSentences !== null && _enToKoSentences !== null;
}
