/**
 * @fileoverview 지식베이스 검색 엔진 (Knowledge Base Search Engine)
 *
 * 사용자 쿼리와 지식베이스 항목 간의 관련성을 점수화하여 최적의 결과를 반환합니다.
 * Scores relevance between user queries and knowledge base items to return optimal results.
 *
 * ## 검색 알고리즘 (Search Algorithm)
 * 토큰 기반 매칭으로 쿼리와 지식베이스 항목의 유사도를 계산합니다.
 * - 정규화: 소문자 변환 + 공백/구두점 기준 토큰화
 * - 로케일 필터링: 'all' 또는 현재 로케일과 일치하는 항목만 검색
 *
 * @module search
 */

import type { KnowledgeItem } from '~/data/knowledge';
import { knowledge } from '~/data/knowledge';
import type { Locale } from '~/i18n';
import { isSimilar, normalizeForMatch } from './fuzzy';

interface SearchResult {
  item: KnowledgeItem;
  score: number;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s,.\-_!?]+/)
    .filter((token) => token.length > 0);
}

/**
 * 쿼리와 지식베이스 항목 간의 관련성 점수를 계산합니다.
 * Calculates relevance score between query and knowledge base item.
 *
 * ## 가중치 계산 공식 (Scoring Formula)
 *
 * | 매칭 타입 | 가중치 | 설명 |
 * |----------|--------|------|
 * | 키워드 완전 포함 | +10 | 쿼리가 키워드를 완전히 포함 |
 * | 키워드 퍼지 매칭 | +7 | 쿼리가 키워드와 퍼지 매칭 |
 * | 키워드 부분 매칭 | +5 | 쿼리 토큰이 키워드에 포함됨 |
 * | 질문 토큰 매칭 | +3 | 쿼리 토큰 ↔ 질문 토큰 상호 포함 |
 * | 답변 부분 매칭 | +1 | 쿼리 토큰이 답변에 포함됨 |
 *
 * ## 가중치 근거 (Rationale)
 * - **키워드 (10점)**: 사전 정의된 핵심 단어로 가장 정확한 매칭 지표
 * - **퍼지 매칭 (7점)**: 오타 허용 매칭
 * - **질문 (3점)**: 사용자 의도와 직접 관련되나 표현 방식이 다를 수 있음
 * - **답변 (1점)**: 관련성은 있으나 노이즈가 많아 낮은 가중치 부여
 *
 * @param {string} query - 사용자 검색 쿼리
 * @param {KnowledgeItem} item - 비교할 지식베이스 항목
 * @returns {number} 관련성 점수 (0 이상)
 *
 * @example
 * // 쿼리: "메트로놈 사용법"
 * // 항목: { keywords: ["메트로놈", "박자"], question: "메트로놈 어떻게 써요?", answer: "..." }
 *
 * // 점수 계산 과정:
 * // 1. "메트로놈" 키워드 완전 포함 → +10
 * // 2. "메트로놈" 토큰이 키워드에 포함 → +5
 * // 3. "메트로놈" 토큰이 질문의 "메트로놈"과 매칭 → +3
 * // 4. "사용법" 토큰이 답변에 포함되면 → +1
 * // 총점: 18점 이상
 */
function calculateScore(query: string, item: KnowledgeItem): number {
  const queryNormalized = normalizeText(query);
  const queryNoSpaces = normalizeForMatch(query);
  const queryTokens = tokenize(query);

  let score = 0;

  // Exact keyword match (highest weight: +10) and fuzzy match (+7)
  for (const keyword of item.keywords) {
    const keywordNormalized = normalizeText(keyword);
    const keywordNoSpaces = normalizeForMatch(keyword);

    // Exact match (with spaces removed for comparison)
    if (queryNormalized.includes(keywordNormalized) || queryNoSpaces.includes(keywordNoSpaces)) {
      score += 10;
    } else if (isSimilar(queryNoSpaces, keywordNoSpaces)) {
      // Fuzzy match with typo tolerance: +7
      score += 7;
    }

    // Partial keyword match: +5
    if (queryTokens.some((token) => keywordNormalized.includes(token))) {
      score += 5;
    }
  }

  // Question similarity: +3 (with fuzzy matching)
  const questionTokens = tokenize(item.question);
  for (const queryToken of queryTokens) {
    for (const questionToken of questionTokens) {
      if (questionToken.includes(queryToken) || queryToken.includes(questionToken)) {
        score += 3;
      } else if (isSimilar(queryToken, questionToken)) {
        score += 2; // Fuzzy match in question
      }
    }
  }

  // Partial match in answer (lower weight: +1)
  const answerNormalized = normalizeText(item.answer);
  for (const queryToken of queryTokens) {
    if (answerNormalized.includes(queryToken)) {
      score += 1;
    }
  }

  return score;
}

export function searchKnowledge(query: string, locale: Locale, limit: number = 3): KnowledgeItem[] {
  if (!query.trim()) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const item of knowledge) {
    // Filter by locale
    if (item.locale !== 'all' && item.locale !== locale) {
      continue;
    }

    const score = calculateScore(query, item);
    if (score > 0) {
      results.push({ item, score });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Return top results
  return results.slice(0, limit).map((r) => r.item);
}

export function getWelcomeResponse(locale: Locale): string {
  const intro = knowledge.find(
    (item) => item.id.startsWith('dialogue-intro') && item.locale === locale,
  );
  return intro?.answer || '';
}
