// ========================================
// Domain Tagger - 파일 경로에서 도메인 태그 추출
// ========================================
// ⚠️ 수동 관리 없음 - 모든 도메인은 파일 경로에서 자동 추출됨
// ========================================

import type { Domain } from './types';

/**
 * 파일 경로에서 도메인 태그 자동 추출
 *
 * ✅ 완전 자동: 수동 매핑 없음
 * - 파일 경로 구조가 곧 도메인 구조
 * - 새 도메인 추가 시 파일만 추가하면 자동 인식
 *
 * @param filePath - 파일 경로 (예: "domains/technology/web-development.ts")
 * @returns Domain 문자열
 *
 * @example
 * extractDomainFromPath("domains/technology/web-development.ts")
 * // → "technology.web-development"
 *
 * extractDomainFromPath("domains/sports.ts")
 * // → "sports"
 *
 * extractDomainFromPath("domains/body/anatomy.ts")
 * // → "body.anatomy"
 */
export function extractDomainFromPath(filePath: string): Domain {
  // 경로 정규화: 백슬래시 → 슬래시
  const normalizedPath = filePath.replace(/\\/g, '/');

  // domains/ 이후 경로 추출
  const domainsMatch = normalizedPath.match(/domains\/(.+?)\.ts$/);
  if (!domainsMatch) {
    return 'general';
  }

  const relativePath = domainsMatch[1]; // 예: "technology/web-development" 또는 "sports"
  const parts = relativePath.split('/');

  // index.ts 파일은 무시
  if (parts[parts.length - 1] === 'index') {
    return 'general';
  }

  // 단일 파일 (예: "sports.ts") → "sports"
  if (parts.length === 1) {
    return parts[0] as Domain;
  }

  // 중첩 폴더 (예: "technology/web-development.ts") → "technology.web-development"
  // 파일 이름을 그대로 사용 (수동 매핑 제거)
  const parentDomain = parts[0];
  const fileName = parts[parts.length - 1];

  return `${parentDomain}.${fileName}` as Domain;
}

/**
 * 도메인 계층 확인 (하위 도메인이 상위 도메인에 포함되는지)
 *
 * @example
 * isDomainMatch("technology.web", "technology") // → true
 * isDomainMatch("technology", "technology.web") // → false
 * isDomainMatch("sports", "sports") // → true
 */
export function isDomainMatch(specific: Domain, general: Domain): boolean {
  if (specific === general) return true;
  return specific.startsWith(`${general}.`);
}

/**
 * 도메인의 상위 도메인 반환
 *
 * @example
 * getParentDomain("technology.web") // → "technology"
 * getParentDomain("technology") // → null
 */
export function getParentDomain(domain: Domain): Domain | null {
  const parts = domain.split('.');
  if (parts.length <= 1) return null;
  return parts[0] as Domain;
}
