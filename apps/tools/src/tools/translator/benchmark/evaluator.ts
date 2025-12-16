// ========================================
// Translator Benchmark Evaluator - 번역기 벤치마크 평가기
// 테스트지 v3.0 기반 점수 평가 로직
// ========================================

import type { CriteriaScores, TestCase, TestResult } from './types';
import { CRITERIA_WEIGHTS } from './types';

/**
 * 문자열 정규화 (비교용)
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 토큰화 (단어 분리)
 */
function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

/**
 * Jaccard 유사도 계산
 */
function jaccardSimilarity(str1: string, str2: string): number {
  const set1 = new Set(tokenize(str1));
  const set2 = new Set(tokenize(str2));

  if (set1.size === 0 && set2.size === 0) return 1;
  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Levenshtein 거리 계산
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[]);

  for (let i = 0; i <= m; i++) {
    const row = dp[i];
    if (row) row[0] = i;
  }
  for (let j = 0; j <= n; j++) {
    const row = dp[0];
    if (row) row[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const currentRow = dp[i];
      const prevRow = dp[i - 1];
      if (!currentRow || !prevRow) continue;

      if (str1[i - 1] === str2[j - 1]) {
        currentRow[j] = prevRow[j - 1] ?? 0;
      } else {
        currentRow[j] = 1 + Math.min(prevRow[j] ?? 0, currentRow[j - 1] ?? 0, prevRow[j - 1] ?? 0);
      }
    }
  }

  return dp[m]?.[n] ?? 0;
}

/**
 * Levenshtein 유사도 (0-1)
 */
function levenshteinSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(normalize(str1), normalize(str2));
  return 1 - distance / maxLen;
}

/**
 * 키워드 매칭 점수 (0-1)
 */
function keywordMatchScore(actual: string, keywords: string[]): number {
  if (!keywords || keywords.length === 0) return 1;

  const normalizedActual = normalize(actual);
  let matchCount = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalize(keyword);
    if (normalizedActual.includes(normalizedKeyword)) {
      matchCount++;
    }
  }

  return matchCount / keywords.length;
}

/**
 * 대안 정답과의 최대 유사도
 */
function bestMatchSimilarity(
  actual: string,
  expected: string,
  alternatives: string[] = []
): { similarity: number; bestMatch: string } {
  const allExpected = [expected, ...alternatives];
  let bestSimilarity = 0;
  let bestMatch = expected;

  for (const exp of allExpected) {
    // Jaccard와 Levenshtein의 가중 평균
    const jaccard = jaccardSimilarity(actual, exp);
    const levenshtein = levenshteinSimilarity(actual, exp);
    const combined = jaccard * 0.6 + levenshtein * 0.4;

    if (combined > bestSimilarity) {
      bestSimilarity = combined;
      bestMatch = exp;
    }
  }

  return { similarity: bestSimilarity, bestMatch };
}

/**
 * 유사도를 5점 척도로 변환
 */
function similarityToScore(similarity: number): number {
  // 0.95+ → 5점, 0.8+ → 4점, 0.6+ → 3점, 0.4+ → 2점, 그 외 → 1점
  if (similarity >= 0.95) return 5;
  if (similarity >= 0.85) return 4 + (similarity - 0.85) * 10;
  if (similarity >= 0.7) return 3 + (similarity - 0.7) * 6.67;
  if (similarity >= 0.5) return 2 + (similarity - 0.5) * 5;
  if (similarity >= 0.3) return 1 + (similarity - 0.3) * 5;
  return similarity * 3.33;
}

/**
 * 정확성 점수 계산 (25%)
 */
function evaluateAccuracy(
  actual: string,
  expected: string,
  alternatives: string[],
  keywords: string[]
): number {
  const { similarity } = bestMatchSimilarity(actual, expected, alternatives);
  const keywordScore = keywordMatchScore(actual, keywords);

  // 유사도 70% + 키워드 30%
  const combined = similarity * 0.7 + keywordScore * 0.3;
  return similarityToScore(combined);
}

/**
 * 유창성 점수 계산 (20%)
 * - 문법적 자연스러움 추정
 */
function evaluateFluency(actual: string, direction: 'ko-en' | 'en-ko'): number {
  let score = 5;

  if (direction === 'ko-en') {
    // 영어 출력 품질 체크
    const words = actual.split(' ');

    // 너무 짧거나 긴 문장
    if (words.length < 2 && actual.length > 10) {
      score -= 0.5;
    }

    // 반복 단어 체크
    const wordSet = new Set(words.map((w) => w.toLowerCase()));
    if (wordSet.size < words.length * 0.7) {
      score -= 0.3;
    }

    // 기본적인 영어 패턴 체크
    if (!/^[A-Z]/.test(actual) && actual.length > 5) {
      score -= 0.2; // 대문자로 시작하지 않음
    }
  } else {
    // 한국어 출력 품질 체크
    // 한글 포함 여부
    if (!/[가-힣]/.test(actual)) {
      score -= 1;
    }
  }

  return Math.max(1, Math.min(5, score));
}

/**
 * 문맥 이해 점수 계산 (15%)
 */
function evaluateContext(actual: string, testCase: TestCase): number {
  // 기본적으로 정확성과 유사하게 평가
  const { similarity } = bestMatchSimilarity(
    actual,
    testCase.expectedOutput,
    testCase.alternativeOutputs
  );

  // 동음이의어/다의어 카테고리는 문맥이 중요
  const contextCategories = ['A1.1', 'A1.2', 'B1.1'];
  const weight = contextCategories.includes(testCase.categoryId) ? 1.2 : 1;

  return Math.min(5, similarityToScore(similarity) * weight);
}

/**
 * 문화적 적절성 점수 계산 (15%)
 */
function evaluateCultural(actual: string, testCase: TestCase): number {
  // 문화 관련 카테고리
  const culturalCategories = ['A3.1', 'B1.3', 'D2', 'C1', 'C2'];

  if (culturalCategories.includes(testCase.categoryId)) {
    const { similarity } = bestMatchSimilarity(
      actual,
      testCase.expectedOutput,
      testCase.alternativeOutputs
    );
    return similarityToScore(similarity);
  }

  // 일반 카테고리는 높은 점수 부여
  return 4.5;
}

/**
 * 일관성 점수 계산 (10%)
 * - 단일 테스트에서는 기본값 부여
 */
function evaluateConsistency(): number {
  // 단일 테스트에서는 측정 어려움, 기본 점수 부여
  return 4;
}

/**
 * 톤 보존 점수 계산 (10%)
 */
function evaluateTone(actual: string, testCase: TestCase): number {
  // 경어/존칭 카테고리
  if (testCase.categoryId === 'A2.1') {
    const formalIndicators = ['please', 'kindly', 'would you', 'request'];
    const hasFormal = formalIndicators.some((ind) => actual.toLowerCase().includes(ind));
    return hasFormal ? 5 : 3;
  }

  // 기본 점수
  const { similarity } = bestMatchSimilarity(
    actual,
    testCase.expectedOutput,
    testCase.alternativeOutputs
  );
  return similarityToScore(similarity);
}

/**
 * 전문성 점수 계산 (5%)
 */
function evaluateDomain(actual: string, testCase: TestCase): number {
  // 전문 분야 카테고리
  const domainCategories = ['A4.1', 'A4.2', 'A4.3', 'A4.4'];

  if (domainCategories.includes(testCase.categoryId)) {
    const keywordScore = keywordMatchScore(actual, testCase.keywords || []);
    return similarityToScore(keywordScore);
  }

  // 일반 카테고리
  return 4.5;
}

/**
 * 피드백 생성
 */
function generateFeedback(
  actual: string,
  testCase: TestCase,
  criteriaScores: CriteriaScores
): string[] {
  const feedback: string[] = [];

  if (criteriaScores.accuracy < 3) {
    feedback.push('정확성 향상 필요: 원문 의미가 충분히 전달되지 않았습니다.');
  }

  if (criteriaScores.fluency < 3) {
    feedback.push('유창성 향상 필요: 자연스러운 표현으로 개선이 필요합니다.');
  }

  if (criteriaScores.context < 3) {
    feedback.push('문맥 이해 향상 필요: 문맥에 맞는 번역이 필요합니다.');
  }

  if (testCase.keywords && testCase.keywords.length > 0) {
    const missingKeywords = testCase.keywords.filter(
      (kw) => !normalize(actual).includes(normalize(kw))
    );
    if (missingKeywords.length > 0) {
      feedback.push(`누락된 핵심어: ${missingKeywords.join(', ')}`);
    }
  }

  return feedback;
}

/**
 * 단일 테스트 케이스 평가
 */
export function evaluateTestCase(
  testCase: TestCase,
  actualOutput: string,
  executionTime: number
): TestResult {
  // 각 기준별 점수 계산
  const criteriaScores: CriteriaScores = {
    accuracy: evaluateAccuracy(
      actualOutput,
      testCase.expectedOutput,
      testCase.alternativeOutputs || [],
      testCase.keywords || []
    ),
    fluency: evaluateFluency(actualOutput, testCase.direction),
    context: evaluateContext(actualOutput, testCase),
    cultural: evaluateCultural(actualOutput, testCase),
    consistency: evaluateConsistency(),
    tone: evaluateTone(actualOutput, testCase),
    domain: evaluateDomain(actualOutput, testCase),
  };

  // 가중 평균 계산
  const totalScore =
    criteriaScores.accuracy * CRITERIA_WEIGHTS.accuracy +
    criteriaScores.fluency * CRITERIA_WEIGHTS.fluency +
    criteriaScores.context * CRITERIA_WEIGHTS.context +
    criteriaScores.cultural * CRITERIA_WEIGHTS.cultural +
    criteriaScores.consistency * CRITERIA_WEIGHTS.consistency +
    criteriaScores.tone * CRITERIA_WEIGHTS.tone +
    criteriaScores.domain * CRITERIA_WEIGHTS.domain;

  // 소수점 둘째 자리까지 반올림
  const score = Math.round(totalScore * 100) / 100;

  // 피드백 생성
  const feedback = generateFeedback(actualOutput, testCase, criteriaScores);

  return {
    testCase,
    actualOutput,
    score,
    criteriaScores,
    passed: score >= 3.0,
    feedback,
    executionTime,
  };
}

/**
 * 등급 계산
 */
export function calculateGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 4.5) return 'S';
  if (score >= 4.0) return 'A';
  if (score >= 3.5) return 'B';
  if (score >= 3.0) return 'C';
  return 'D';
}

/**
 * 개선 제안 생성
 */
export function generateImprovements(
  averageScores: CriteriaScores,
  categoryResults: { categoryId: string; averageScore: number }[]
): string[] {
  const improvements: string[] = [];

  // 기준별 개선 제안
  if (averageScores.accuracy < 4) {
    improvements.push('정확성 향상: 동음이의어/다의어 처리 로직 강화 필요');
  }
  if (averageScores.fluency < 4) {
    improvements.push('유창성 향상: 자연스러운 문장 생성 알고리즘 개선 필요');
  }
  if (averageScores.context < 4) {
    improvements.push('문맥 이해 향상: 문맥 기반 단어 의미 결정 로직 강화 필요');
  }
  if (averageScores.cultural < 4) {
    improvements.push('문화적 적절성 향상: 관용구/속담 사전 확장 필요');
  }
  if (averageScores.tone < 4) {
    improvements.push('톤 보존 향상: 경어/존칭 체계 처리 개선 필요');
  }

  // 카테고리별 개선 제안
  const weakCategories = categoryResults
    .filter((c) => c.averageScore < 3.5)
    .sort((a, b) => a.averageScore - b.averageScore);

  for (const cat of weakCategories.slice(0, 3)) {
    improvements.push(
      `카테고리 '${cat.categoryId}' 집중 개선 필요 (평균 ${cat.averageScore.toFixed(2)}점)`
    );
  }

  return improvements;
}
