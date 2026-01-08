// ========================================
// Anchor Extractor - 앵커 단어 추출기
// ========================================

import { getDomainsForWord, getDomainWordMap } from './tagged-dictionary-builder';
import type { Domain } from './types';

/**
 * 앵커 단어 = 단일 도메인에만 속하는 단어
 * 해당 단어가 나타나면 도메인을 강하게 추론할 수 있음
 *
 * 예:
 * - "주사" → medical (앵커) - 의료 사전에만 있음
 * - "삼각근" → body.anatomy (앵커) - 해부학 사전에만 있음
 * - "클래스" → 다중 도메인 (technology, education 등에 있을 수 있음)
 *
 * ⚠️ 중요: 앵커는 사전에서 **자동 추출**됨
 * - 새 도메인 추가 시 사전만 추가하면 앵커가 자동 생성됨
 * - 수동으로 앵커 목록을 관리할 필요 없음
 */

/**
 * 도메인별 앵커 단어 추출
 * 단일 도메인에만 속하는 단어들을 찾아 반환
 *
 * @returns 도메인별 앵커 단어 Set
 */
export function extractDomainAnchors(): Map<Domain, Set<string>> {
  const domainWordMap = getDomainWordMap();
  const domainAnchors = new Map<Domain, Set<string>>();

  // 모든 단어에 대해 도메인 소속 확인
  for (const [domain, words] of domainWordMap) {
    const anchors = new Set<string>();

    for (const word of words) {
      const wordDomains = getDomainsForWord(word);

      // 단일 도메인에만 속하면 앵커
      if (wordDomains.length === 1) {
        anchors.add(word);
      }
    }

    if (anchors.size > 0) {
      domainAnchors.set(domain, anchors);
    }
  }

  return domainAnchors;
}

/**
 * 단어가 앵커인지 확인하고, 앵커라면 도메인 반환
 *
 * @param word - 확인할 단어
 * @returns 앵커 도메인 또는 null
 */
export function getAnchorDomain(word: string): Domain | null {
  const domains = getDomainsForWord(word);
  if (domains.length === 1) {
    return domains[0];
  }
  return null;
}

/**
 * 텍스트에서 앵커 단어들 찾기
 *
 * @param text - 분석할 텍스트
 * @param anchors - 도메인별 앵커 단어 맵
 * @returns 발견된 앵커 정보 배열
 */
export interface AnchorMatch {
  word: string;
  domain: Domain;
  position: number;
}

export function findAnchorsInText(text: string, anchors: Map<Domain, Set<string>>): AnchorMatch[] {
  const matches: AnchorMatch[] = [];
  const normalizedText = text.toLowerCase();

  for (const [domain, anchorWords] of anchors) {
    for (const word of anchorWords) {
      const normalizedWord = word.toLowerCase();
      let position = normalizedText.indexOf(normalizedWord);

      while (position !== -1) {
        // 단어 경계 확인 (한글은 공백/구두점으로만 구분)
        const beforeChar = position > 0 ? normalizedText[position - 1] : ' ';
        const afterChar =
          position + normalizedWord.length < normalizedText.length
            ? normalizedText[position + normalizedWord.length]
            : ' ';

        // 앞뒤가 공백, 구두점, 또는 문장 경계인지 확인
        const isWordBoundary = (char: string) => /[\s,.!?;:'"()[\]{}—–-]/.test(char) || char === '';

        if (isWordBoundary(beforeChar) && isWordBoundary(afterChar)) {
          matches.push({
            word,
            domain,
            position,
          });
        }

        position = normalizedText.indexOf(normalizedWord, position + 1);
      }
    }
  }

  // 위치순 정렬
  return matches.sort((a, b) => a.position - b.position);
}

/**
 * 단어가 앵커인지 확인 (사전 기반 자동 판별)
 *
 * 단일 도메인에만 속하는 단어는 앵커로 취급
 * 수동 목록 없이 사전에서 자동 추출됨
 */
export function isAnchor(word: string): boolean {
  return getDomainsForWord(word).length === 1;
}

/**
 * 단어의 앵커 강도 계산 (사전 기반)
 *
 * @returns 강도 점수 (0: 앵커 아님, 3: 일반 앵커)
 *
 * 참고: 모든 앵커는 동일한 강도 (3점)
 * 단일 도메인에만 속하면 앵커, 아니면 일반 도메인 단어
 */
export function getAnchorStrength(word: string): number {
  const domains = getDomainsForWord(word);
  if (domains.length === 1) {
    return 3; // 앵커 강도
  }
  return 0; // 앵커 아님
}

// 캐시된 앵커 맵
let _cachedAnchors: Map<Domain, Set<string>> | null = null;

/**
 * 앵커 맵 가져오기 (캐시됨)
 */
export function getDomainAnchors(): Map<Domain, Set<string>> {
  if (!_cachedAnchors) {
    _cachedAnchors = extractDomainAnchors();
  }
  return _cachedAnchors;
}

/**
 * 앵커 캐시 초기화 (테스트용)
 */
export function clearAnchorCache(): void {
  _cachedAnchors = null;
}
