// ========================================
// Context Analysis Types - 문맥 분석 타입 정의
// ========================================
// ⚠️ 수동 관리 없음 - Domain은 파일 경로에서 자동 추출되는 문자열
// ========================================

/**
 * 도메인 식별자
 *
 * ✅ 완전 자동: 수동 목록 관리 없음
 * - 파일 경로 구조에서 자동 추출 (예: domains/technology/web-development.ts → "technology.web-development")
 * - 새 도메인 추가 시 파일만 추가하면 자동 인식
 * - 'general'은 기본값 (도메인 없는 단어)
 *
 * @example
 * "technology" - 상위 도메인
 * "technology.web-development" - 하위 도메인
 * "body.anatomy" - 중첩 도메인
 * "general" - 기본값
 */
export type Domain = string;

/**
 * 태그된 사전 엔트리
 * 다의어인 경우 여러 도메인별 번역을 가짐
 */
export interface TaggedEntry {
  domain: Domain;
  translation: string;
}

/**
 * 태그된 사전 구조
 * - 단일 의미: string
 * - 다의어: TaggedEntry[]
 */
export type TaggedDictionary = Record<string, string | TaggedEntry[]>;

/**
 * 절(Clause) 정보
 */
export interface Clause {
  text: string;
  startIndex: number;
  endIndex: number;
  domain?: Domain;
  confidence: number; // 0-1 도메인 감지 신뢰도
}

/**
 * 도메인 투표 결과
 */
export interface DomainVote {
  domain: Domain;
  score: number;
  anchors: string[]; // 투표에 기여한 앵커 단어들
}

/**
 * 문맥 분석 결과
 */
export interface ContextAnalysisResult {
  clauses: Clause[];
  overallDomain: Domain;
  isMultiDomain: boolean;
}
