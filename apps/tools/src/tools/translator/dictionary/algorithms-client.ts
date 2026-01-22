/**
 * Algorithms D1 Client
 *
 * 런타임에 Algorithms D1 API를 호출하여 번역 알고리즘 데이터를 가져옵니다.
 * - stems: 어간 패턴 (동사/형용사/명사)
 * - domains: 도메인별 어휘
 * - polysemy: 다의어 처리
 */

interface StemsResponse {
  verb: Record<string, string>;
  adj: Record<string, string>;
  noun: Record<string, string>;
  count: { verb: number; adj: number; noun: number };
}

interface DomainsResponse {
  domains: Record<string, { koToEn: Record<string, string>; enToKo: Record<string, string> }>;
  count: number;
  totalEntries: number;
}

interface PolysemyResponse {
  words: Record<string, { meanings: string[]; examples?: string[] }>;
  count: number;
}

interface AllAlgorithmsResponse {
  stems: StemsResponse;
  domains: DomainsResponse;
  polysemy: PolysemyResponse;
}

// 캐시
let stemsCache: StemsResponse | null = null;
let domainsCache: DomainsResponse | null = null;
let polysemyCache: PolysemyResponse | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

const API_BASE = '/api/algorithms';

/**
 * Algorithms D1에서 모든 데이터 로드
 */
export async function loadAllAlgorithms(): Promise<AllAlgorithmsResponse> {
  const response = await fetch(`${API_BASE}?type=all`);
  if (!response.ok) {
    throw new Error(`Failed to load algorithms: ${response.status}`);
  }

  const data: AllAlgorithmsResponse = await response.json();
  stemsCache = data.stems;
  domainsCache = data.domains;
  polysemyCache = data.polysemy;
  return data;
}

/**
 * 알고리즘 데이터 프리로드 (앱 초기화 시 호출)
 */
export async function preloadAlgorithmsData(): Promise<void> {
  if (loadPromise) return loadPromise;
  if (stemsCache && domainsCache && polysemyCache) return;

  isLoading = true;
  loadPromise = loadAllAlgorithms()
    .then(() => {
      isLoading = false;
      console.log('[Algorithms D1] Data loaded:', {
        stems: stemsCache?.count,
        domains: domainsCache?.count,
        polysemy: polysemyCache?.count,
      });
    })
    .catch((error) => {
      isLoading = false;
      loadPromise = null;
      console.error('[Algorithms D1] Failed to load:', error);
      throw error;
    });

  return loadPromise;
}

/**
 * 어간 조회 (동사)
 */
export function lookupVerbStem(stem: string): string | null {
  return stemsCache?.verb[stem] ?? null;
}

/**
 * 어간 조회 (형용사)
 */
export function lookupAdjStem(stem: string): string | null {
  return stemsCache?.adj[stem] ?? null;
}

/**
 * 어간 조회 (명사)
 */
export function lookupNounStem(stem: string): string | null {
  return stemsCache?.noun[stem] ?? null;
}

/**
 * 도메인별 단어 조회 (한→영)
 */
export function lookupDomainKoToEn(domain: string, word: string): string | null {
  return domainsCache?.domains[domain]?.koToEn[word] ?? null;
}

/**
 * 도메인별 단어 조회 (영→한)
 */
export function lookupDomainEnToKo(domain: string, word: string): string | null {
  return domainsCache?.domains[domain]?.enToKo[word.toLowerCase()] ?? null;
}

/**
 * 모든 도메인에서 단어 검색 (한→영)
 */
export function searchAllDomainsKoToEn(word: string): { domain: string; en: string } | null {
  if (!domainsCache) return null;

  for (const [domain, dict] of Object.entries(domainsCache.domains)) {
    if (dict.koToEn[word]) {
      return { domain, en: dict.koToEn[word] };
    }
  }
  return null;
}

/**
 * 모든 도메인에서 단어 검색 (영→한)
 */
export function searchAllDomainsEnToKo(word: string): { domain: string; ko: string } | null {
  if (!domainsCache) return null;

  const lowerWord = word.toLowerCase();
  for (const [domain, dict] of Object.entries(domainsCache.domains)) {
    if (dict.enToKo[lowerWord]) {
      return { domain, ko: dict.enToKo[lowerWord] };
    }
  }
  return null;
}

/**
 * 다의어 조회
 */
export function lookupPolysemy(word: string): { meanings: string[]; examples?: string[] } | null {
  return polysemyCache?.words[word] ?? null;
}

/**
 * 캐시 상태 확인
 */
export function isAlgorithmsCached(): boolean {
  return stemsCache !== null && domainsCache !== null && polysemyCache !== null;
}

/**
 * 로딩 상태 확인
 */
export function isAlgorithmsLoading(): boolean {
  return isLoading;
}

/**
 * 캐시된 데이터 반환
 */
export function getStems(): StemsResponse | null {
  return stemsCache;
}

export function getDomains(): DomainsResponse | null {
  return domainsCache;
}

export function getPolysemy(): PolysemyResponse | null {
  return polysemyCache;
}

/**
 * 캐시 초기화
 */
export function clearAlgorithmsCache(): void {
  stemsCache = null;
  domainsCache = null;
  polysemyCache = null;
  loadPromise = null;
  isLoading = false;
}
