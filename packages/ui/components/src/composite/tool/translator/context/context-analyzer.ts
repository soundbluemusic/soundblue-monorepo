// ========================================
// Context Analyzer - 문맥 분석 메인 모듈
// ========================================

import { mergeShortClauses, splitIntoClauses } from './clause-splitter';
import { analyzeClauseDomains, getOverallDomain, isMultiDomain } from './domain-voter';
import { getDefaultTranslation, resolvePolysemyWithDomain } from './polysemy-resolver';
import type { ContextAnalysisResult, Domain } from './types';

/**
 * 문맥 분석 옵션
 */
export interface ContextAnalysisOptions {
  minClauseLength?: number; // 최소 절 길이 (기본: 5)
  inheritDomain?: boolean; // 앵커 없는 절에 이전 도메인 상속 (기본: true)
  fallbackDomain?: Domain; // 기본 폴백 도메인 (기본: 'general')
}

const DEFAULT_OPTIONS: Required<ContextAnalysisOptions> = {
  minClauseLength: 5,
  inheritDomain: true,
  fallbackDomain: 'general',
};

/**
 * 텍스트의 문맥을 분석하여 절별 도메인 결정
 *
 * @param text - 분석할 텍스트
 * @param options - 분석 옵션
 * @returns 문맥 분석 결과
 *
 * @example
 * analyzeContext("The developer pushed the branch, but got an injection in his deltoid")
 * // → {
 * //   clauses: [
 * //     { text: "The developer pushed the branch", domain: "technology.devops", ... },
 * //     { text: "but got an injection in his deltoid", domain: "medical", ... }
 * //   ],
 * //   overallDomain: "technology.devops",
 * //   isMultiDomain: true
 * // }
 */
export function analyzeContext(
  text: string,
  options: ContextAnalysisOptions = {},
): ContextAnalysisResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 1. 절 분할
  let clauses = splitIntoClauses(text);

  // 2. 짧은 절 병합
  clauses = mergeShortClauses(clauses, opts.minClauseLength);

  // 3. 각 절의 도메인 분석
  const analyzedClauses = analyzeClauseDomains(clauses);

  // 4. 앵커 없는 절 처리 (이전 절 도메인 상속)
  if (opts.inheritDomain) {
    let previousDomain: Domain = opts.fallbackDomain;

    for (const clause of analyzedClauses) {
      if (clause.confidence === 0 || !clause.domain) {
        clause.domain = previousDomain;
        clause.confidence = 0.3; // 상속된 도메인은 낮은 신뢰도
      } else {
        previousDomain = clause.domain;
      }
    }
  }

  // 5. 전체 도메인 및 다중 도메인 여부 결정
  const overallDomain = getOverallDomain(analyzedClauses);
  const multiDomain = isMultiDomain(analyzedClauses);

  return {
    clauses: analyzedClauses,
    overallDomain,
    isMultiDomain: multiDomain,
  };
}

/**
 * 문맥 기반 번역 조회
 *
 * @param word - 번역할 단어
 * @param text - 전체 문장 (문맥 분석용)
 * @returns 번역 결과 또는 null
 *
 * @example
 * translateWithContext("속성", "웹 개발에서 속성은 중요합니다")
 * // → "attribute" (technology.web 도메인 감지)
 *
 * translateWithContext("속성", "객체지향에서 속성은 필드입니다")
 * // → "property" (technology.oop 도메인 감지)
 */
export function translateWithContext(word: string, text: string): string | null {
  // 문맥 분석
  const analysis = analyzeContext(text);

  // 단어가 포함된 절 찾기
  const wordLower = word.toLowerCase();
  let domain: Domain = analysis.overallDomain;

  for (const clause of analysis.clauses) {
    if (clause.text.toLowerCase().includes(wordLower) && clause.domain) {
      domain = clause.domain;
      break;
    }
  }

  // 도메인 기반 번역
  const result = resolvePolysemyWithDomain(word, domain);

  if (result) {
    return result.translation;
  }

  // 기본 번역 폴백
  return getDefaultTranslation(word);
}

/**
 * 여러 단어를 문맥 기반으로 번역
 *
 * @param words - 번역할 단어 배열
 * @param text - 전체 문장
 * @returns 단어별 번역 맵
 */
export function translateWordsWithContext(words: string[], text: string): Map<string, string> {
  const analysis = analyzeContext(text);
  const results = new Map<string, string>();

  for (const word of words) {
    const wordLower = word.toLowerCase();
    let domain: Domain = analysis.overallDomain;

    // 단어가 포함된 절의 도메인 사용
    for (const clause of analysis.clauses) {
      if (clause.text.toLowerCase().includes(wordLower) && clause.domain) {
        domain = clause.domain;
        break;
      }
    }

    const result = resolvePolysemyWithDomain(word, domain);
    if (result) {
      results.set(word, result.translation);
    } else {
      const defaultTrans = getDefaultTranslation(word);
      if (defaultTrans) {
        results.set(word, defaultTrans);
      }
    }
  }

  return results;
}

/**
 * 단일 도메인 문장 최적화
 * 모든 절이 같은 도메인이면 단일 도메인으로 처리
 */
export function optimizeSingleDomain(analysis: ContextAnalysisResult): ContextAnalysisResult {
  if (!analysis.isMultiDomain) {
    // 모든 절에 동일한 도메인 적용
    const domain = analysis.overallDomain;
    const optimizedClauses = analysis.clauses.map((clause) => ({
      ...clause,
      domain,
      confidence: Math.max(clause.confidence, 0.8),
    }));

    return {
      ...analysis,
      clauses: optimizedClauses,
    };
  }

  return analysis;
}

/**
 * 도메인 동점 시 우선순위 결정
 * 더 구체적인 도메인 (서브도메인) 우선
 */
export function breakDomainTie(domains: Domain[]): Domain {
  if (domains.length === 0) return 'general';
  if (domains.length === 1) return domains[0];

  // 구체성 순으로 정렬 (서브도메인이 더 구체적)
  const sorted = [...domains].sort((a, b) => {
    const aDepth = a.split('.').length;
    const bDepth = b.split('.').length;
    return bDepth - aDepth; // 깊은 것(더 구체적인 것) 우선
  });

  return sorted[0];
}

export { splitIntoClauses } from './clause-splitter';
export { decideDomain, voteForDomain } from './domain-voter';
export {
  getAllTranslations,
  isPolysemousWord,
  resolvePolysemyWithDomain,
} from './polysemy-resolver';
// Re-export types and utilities
export type { Clause, ContextAnalysisResult, Domain } from './types';
