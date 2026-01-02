// ========================================
// Tagged Dictionary Builder - 도메인 태그 사전 빌더
// ========================================

// 도메인 사전 imports
import { ARTS_KO_EN } from '../dictionary/domains/arts';
import { ALL_BODY_KO_EN } from '../dictionary/domains/body';
import { BODY_MOVEMENTS_KO_EN } from '../dictionary/domains/body-movements';
import { EDUCATION_KO_EN } from '../dictionary/domains/education';
import { EMOTIONS_KO_EN } from '../dictionary/domains/emotions';
import { FITNESS_KO_EN } from '../dictionary/domains/fitness';
import { LEGAL_KO_EN } from '../dictionary/domains/legal';
import { MEDICAL_KO_EN } from '../dictionary/domains/medical';
import { SHOPPING_KO_EN } from '../dictionary/domains/shopping';
import { SPORTS_KO_EN } from '../dictionary/domains/sports';
import {
  TECH_ARCHITECTURE_KO_EN,
  TECH_COLLABORATION_KO_EN,
  TECH_DATABASE_KO_EN,
  TECH_DEVOPS_CLOUD_KO_EN,
  TECH_MISC_KO_EN,
  TECH_PROGRAMMING_CONCEPTS_KO_EN,
  TECH_SECURITY_TESTING_KO_EN,
  TECH_UI_UX_KO_EN,
  TECH_WEB_DEVELOPMENT_KO_EN,
  TECHNOLOGY_KO_EN,
} from '../dictionary/domains/technology';
import { mergeToTaggedDictionary } from './conflict-detector';
import { extractDomainFromPath } from './domain-tagger';
import type { Domain, TaggedDictionary } from './types';

/**
 * 도메인별 사전 정의
 * 파일 경로 기반으로 도메인 태그가 자동 결정됨
 */
interface DomainDictConfig {
  path: string; // 가상 파일 경로 (도메인 추출용)
  dictionary: Record<string, string>;
}

/**
 * 모든 도메인 사전 구성
 */
const DOMAIN_DICTIONARIES: DomainDictConfig[] = [
  // === 상위 레벨 도메인 ===
  { path: 'domains/arts.ts', dictionary: ARTS_KO_EN },
  { path: 'domains/education.ts', dictionary: EDUCATION_KO_EN },
  { path: 'domains/emotions.ts', dictionary: EMOTIONS_KO_EN },
  { path: 'domains/fitness.ts', dictionary: FITNESS_KO_EN },
  { path: 'domains/legal.ts', dictionary: LEGAL_KO_EN },
  { path: 'domains/medical.ts', dictionary: MEDICAL_KO_EN },
  { path: 'domains/shopping.ts', dictionary: SHOPPING_KO_EN },
  { path: 'domains/sports.ts', dictionary: SPORTS_KO_EN },

  // === Body 도메인 ===
  { path: 'domains/body.ts', dictionary: ALL_BODY_KO_EN },
  { path: 'domains/body/movements.ts', dictionary: BODY_MOVEMENTS_KO_EN },

  // === Technology 서브도메인 ===
  { path: 'domains/technology.ts', dictionary: TECHNOLOGY_KO_EN },
  { path: 'domains/technology/web-development.ts', dictionary: TECH_WEB_DEVELOPMENT_KO_EN },
  { path: 'domains/technology/database.ts', dictionary: TECH_DATABASE_KO_EN },
  { path: 'domains/technology/devops-cloud.ts', dictionary: TECH_DEVOPS_CLOUD_KO_EN },
  { path: 'domains/technology/security-testing.ts', dictionary: TECH_SECURITY_TESTING_KO_EN },
  { path: 'domains/technology/collaboration.ts', dictionary: TECH_COLLABORATION_KO_EN },
  { path: 'domains/technology/ui-ux.ts', dictionary: TECH_UI_UX_KO_EN },
  { path: 'domains/technology/misc.ts', dictionary: TECH_MISC_KO_EN },
  { path: 'domains/technology/architecture.ts', dictionary: TECH_ARCHITECTURE_KO_EN },
  {
    path: 'domains/technology/programming-concepts.ts',
    dictionary: TECH_PROGRAMMING_CONCEPTS_KO_EN,
  },
];

/**
 * 태그된 한→영 사전 생성
 * 충돌하는 단어는 TaggedEntry[]로, 단일 단어는 string으로 저장
 */
export function buildTaggedKoEnDictionary(): TaggedDictionary {
  const domainEntries = DOMAIN_DICTIONARIES.map(({ path, dictionary }) => ({
    domain: extractDomainFromPath(path),
    dictionary,
  }));

  return mergeToTaggedDictionary(domainEntries);
}

/**
 * 도메인별 단어 목록 생성 (앵커 단어 추출용)
 * 각 도메인에 속한 모든 단어 반환
 */
export function buildDomainWordMap(): Map<Domain, Set<string>> {
  const domainWords = new Map<Domain, Set<string>>();

  for (const { path, dictionary } of DOMAIN_DICTIONARIES) {
    const domain = extractDomainFromPath(path);
    const words = domainWords.get(domain) || new Set();

    for (const word of Object.keys(dictionary)) {
      words.add(word);
    }

    domainWords.set(domain, words);
  }

  return domainWords;
}

/**
 * 단어가 속한 모든 도메인 반환 (캐시 사용 - O(1))
 *
 * 성능 개선:
 * - 기존: 매 호출마다 DOMAIN_DICTIONARIES 전체 순회 (O(n))
 * - 개선: 역색인 캐시로 O(1) 조회
 */
export function getDomainsForWord(word: string): Domain[] {
  return getWordToDomains().get(word) || [];
}

/**
 * 단어가 단일 도메인에만 속하는지 확인 (앵커 후보)
 */
export function isSingleDomainWord(word: string): boolean {
  return getDomainsForWord(word).length === 1;
}

// 사전 싱글톤 (빌드 시 한 번만 생성)
let _cachedTaggedDictionary: TaggedDictionary | null = null;
let _cachedDomainWordMap: Map<Domain, Set<string>> | null = null;
let _cachedWordToDomains: Map<string, Domain[]> | null = null;

/**
 * 태그된 사전 가져오기 (캐시됨)
 */
export function getTaggedDictionary(): TaggedDictionary {
  if (!_cachedTaggedDictionary) {
    _cachedTaggedDictionary = buildTaggedKoEnDictionary();
  }
  return _cachedTaggedDictionary;
}

/**
 * 도메인별 단어 맵 가져오기 (캐시됨)
 */
export function getDomainWordMap(): Map<Domain, Set<string>> {
  if (!_cachedDomainWordMap) {
    _cachedDomainWordMap = buildDomainWordMap();
  }
  return _cachedDomainWordMap;
}

/**
 * 단어→도메인 역색인 빌드 (성능 최적화)
 * 기존: getDomainsForWord() 호출마다 O(n) 전체 순회
 * 개선: 최초 1회 빌드 후 O(1) 조회
 */
function buildWordToDomains(): Map<string, Domain[]> {
  const wordToDomains = new Map<string, Domain[]>();

  for (const { path, dictionary } of DOMAIN_DICTIONARIES) {
    const domain = extractDomainFromPath(path);

    for (const word of Object.keys(dictionary)) {
      const existing = wordToDomains.get(word) || [];
      if (!existing.includes(domain)) {
        existing.push(domain);
      }
      wordToDomains.set(word, existing);
    }
  }

  return wordToDomains;
}

/**
 * 단어→도메인 역색인 가져오기 (캐시됨)
 */
function getWordToDomains(): Map<string, Domain[]> {
  if (!_cachedWordToDomains) {
    _cachedWordToDomains = buildWordToDomains();
  }
  return _cachedWordToDomains;
}
