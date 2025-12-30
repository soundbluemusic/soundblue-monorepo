// ========================================
// Fuzzy Q&A Matcher - 오타 허용 Q&A 매칭
// ========================================

import {
  calculateKeyboardSimilarity,
  isKoreanText,
  jamoEditDistance,
  levenshteinDistance,
} from '@soundblue/hangul';
import type { QAItem } from './response-handler';

/**
 * 퍼지 Q&A 매칭 결과
 */
export interface FuzzyQAMatchResult {
  item: QAItem;
  matchScore: number;
  fuzzyMatches: Array<{
    word: string;
    keyword: string;
    distance: number;
    similarity: number;
  }>;
  confidence: number;
}

/**
 * 퍼지 Q&A 매칭 옵션
 */
export interface FuzzyQAMatchOptions {
  maxDistance?: number; // 기본: 2
  keywordWeight?: number; // 기본: 2
  patternWeight?: number; // 기본: 3
  fuzzyWeight?: number; // 기본: 1.5
  minScore?: number; // 기본: 2
  locale?: 'ko' | 'en';
}

/**
 * 텍스트를 단어로 분리
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.!?;:'"()[\]{}]+/)
    .filter((word) => word.length > 1);
}

/**
 * 퍼지 Q&A 검색
 *
 * 점수 계산:
 * 1. 키워드 정확 매칭: +keywordWeight (기본 2)
 * 2. 패턴 매칭: +patternWeight (기본 3)
 * 3. 자모 편집거리 <= maxDistance인 유사 단어: +fuzzyWeight × similarity
 */
export function fuzzySearchQA(
  question: string,
  database: QAItem[],
  options: FuzzyQAMatchOptions = {},
): FuzzyQAMatchResult | null {
  const {
    maxDistance = 2,
    keywordWeight = 2,
    patternWeight = 3,
    fuzzyWeight = 1.5,
    minScore = 2,
    locale,
  } = options;

  const lowerQuestion = question.toLowerCase();
  const questionWords = tokenize(question);

  // 언어 감지
  const isKorean = locale === 'ko' || (locale !== 'en' && isKoreanText(question));

  const scored = database.map((item) => {
    let score = 0;
    const fuzzyMatches: FuzzyQAMatchResult['fuzzyMatches'] = [];

    // 1. 키워드 정확 매칭
    for (const keyword of item.keywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        score += keywordWeight;
      }
    }

    // 2. 패턴 매칭
    if (item.patterns) {
      for (const pattern of item.patterns) {
        try {
          if (new RegExp(pattern, 'i').test(question)) {
            score += patternWeight;
          }
        } catch {
          // 잘못된 정규식 무시
        }
      }
    }

    // 3. 퍼지 매칭 (오타 허용)
    for (const word of questionWords) {
      for (const keyword of item.keywords) {
        const keywordLower = keyword.toLowerCase();

        // 이미 정확히 매칭된 경우 건너뜀
        if (word === keywordLower) continue;

        // 편집 거리 계산
        let distance: number;
        let similarity: number;

        if (isKorean) {
          distance = jamoEditDistance(word, keywordLower);
          similarity = calculateKeyboardSimilarity(word, keywordLower);
        } else {
          distance = levenshteinDistance(word, keywordLower);
          const maxLen = Math.max(word.length, keywordLower.length);
          similarity = maxLen > 0 ? Math.max(0, 1 - distance / maxLen) : 0;
        }

        // 편집 거리가 threshold 이하이고, 0보다 크면 (정확 매칭 제외)
        if (distance <= maxDistance && distance > 0) {
          fuzzyMatches.push({
            word,
            keyword,
            distance,
            similarity,
          });
          score += similarity * fuzzyWeight;
        }
      }
    }

    // confidence 계산 (0-1 정규화)
    const confidence = Math.min(score / 10, 1);

    return { item, matchScore: score, fuzzyMatches, confidence };
  });

  // 필터링 및 정렬
  const matches = scored
    .filter((s) => s.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);

  return matches[0] ?? null;
}

/**
 * 입력이 키워드의 오타인지 확인
 */
export function isTypoOfKeyword(input: string, keyword: string, maxDistance = 2): boolean {
  const isKorean = isKoreanText(input) || isKoreanText(keyword);

  const distance = isKorean
    ? jamoEditDistance(input.toLowerCase(), keyword.toLowerCase())
    : levenshteinDistance(input.toLowerCase(), keyword.toLowerCase());

  return distance > 0 && distance <= maxDistance;
}
