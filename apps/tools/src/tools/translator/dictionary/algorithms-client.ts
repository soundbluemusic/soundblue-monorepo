/**
 * Algorithms D1 Client
 *
 * TanStack Start 서버 함수를 통해 Algorithms D1 데이터베이스에서 번역 알고리즘 데이터를 가져옵니다.
 */

import {
  type AllAlgorithmsResponse,
  type DomainsResponse,
  getAllAlgorithms,
  type PolysemyResponse,
  type StemsResponse,
} from '~/server/algorithms';

// 캐시
let stemsCache: StemsResponse | null = null;
let domainsCache: DomainsResponse | null = null;
let polysemyCache: PolysemyResponse | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Algorithms D1에서 모든 데이터 로드 (서버 함수 호출)
 */
export async function loadAllAlgorithms(): Promise<AllAlgorithmsResponse> {
  const data = await getAllAlgorithms();
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
export function getCachedStems(): StemsResponse | null {
  return stemsCache;
}

export function getCachedDomains(): DomainsResponse | null {
  return domainsCache;
}

export function getCachedPolysemy(): PolysemyResponse | null {
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
