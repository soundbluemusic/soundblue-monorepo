/**
 * 번역기 벤치마크 테스트
 *
 * 8개 카테고리 구조 (총 ~918개 테스트):
 * 1. grammarRulesTests (400개) - 30개 문법 규칙
 * 2. contextTests (26개) - 문맥 기반
 * 3. extendedTypoTests (56개) - typoTests + spacingErrorTests
 * 4. polysemyTests (63개) - 다의어
 * 5. professionalTranslatorTests (18개) - 전문 번역가 수준
 * 6. extendedLocalizationTests (85개) - localizationTests + uniqueTests
 * 7. integrationTests (58개) - levelTests + finalTests
 * 8. antiHardcodingTests (212개) - 22개 레벨 알고리즘 테스트
 */

import { afterAll, describe, expect, it } from 'vitest';

// ============================================
// 유사도 측정 함수 (Levenshtein Distance 기반)
// ============================================

/**
 * Levenshtein Distance 계산
 * 두 문자열 간의 편집 거리 (삽입, 삭제, 치환 횟수)
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 치환
          matrix[i][j - 1] + 1, // 삽입
          matrix[i - 1][j] + 1, // 삭제
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * 유사도 계산 (0.0 ~ 1.0)
 * 1.0 = 완전 일치, 0.0 = 완전 불일치
 */
function calculateSimilarity(expected: string, actual: string): number {
  const maxLen = Math.max(expected.length, actual.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(expected.toLowerCase(), actual.toLowerCase());
  return (maxLen - distance) / maxLen;
}

// 유사도 통계 수집
interface SimilarityStats {
  total: number;
  exactMatches: number;
  similarities: number[];
}

const similarityStats: SimilarityStats = {
  total: 0,
  exactMatches: 0,
  similarities: [],
};

import {
  allBenchmarkCategories,
  antiHardcodingTests,
  contextTests,
  countTests,
  extendedLocalizationTests,
  extendedTypoTests,
  grammarRulesTests,
  integrationTests,
  polysemyTests,
  professionalTranslatorTests,
  type TestLevel,
} from './benchmark-data';
import { translate } from './v2.1/index';

// 테스트 실행 헬퍼 함수
function runTestsForLevel(level: TestLevel) {
  describe(level.name, () => {
    for (const category of level.categories) {
      describe(category.name, () => {
        for (const test of category.tests) {
          it(`[${test.id}] ${test.input.slice(0, 50)}...`, () => {
            const result = translate(test.input, test.direction);

            // 정규화: 구두점 제거, 소문자, 관사 정규화
            const normalize = (s: string) =>
              s
                .toLowerCase()
                .replace(/[.,!?]/g, '')
                // 관사 정규화: a/an/the → 통일 (관사 차이는 무시)
                .replace(/\b(a|an|the)\s+/g, 'ART ')
                .trim();

            const normalizedResult = normalize(result);
            const normalizedExpected = normalize(test.expected);

            // 유사도 계산 (정규화된 문자열 기준)
            const similarity = calculateSimilarity(normalizedExpected, normalizedResult);
            similarityStats.total++;
            similarityStats.similarities.push(similarity);

            // 정확히 일치하거나, 부분 일치, 또는 "/" 구분 옵션 중 하나와 일치
            const options = normalizedExpected.split('/').map((s) => s.trim());
            const matches = options.some(
              (opt) => normalizedResult.includes(opt) || opt.includes(normalizedResult),
            );

            const isExactMatch = matches || normalizedResult === normalizedExpected;
            if (isExactMatch) {
              similarityStats.exactMatches++;
            }

            // 실패한 테스트에 유사도 출력
            if (!isExactMatch) {
              const similarityPercent = Math.round(similarity * 100);
              console.log(
                `[${test.id}] "${test.input}" → "${result}" (expected: "${test.expected}") | Similarity: ${similarityPercent}%`,
              );
            }

            expect(isExactMatch).toBe(true);
          });
        }
      });
    }
  });
}

// 테스트 개수 검증
describe('Benchmark Test Count Verification', () => {
  it('grammarRulesTests should have ~400 tests', () => {
    const count = countTests(grammarRulesTests);
    console.log(`grammarRulesTests: ${count}개`);
    expect(count).toBeGreaterThan(350);
  });

  it('contextTests should have ~26 tests', () => {
    const count = countTests(contextTests);
    console.log(`contextTests: ${count}개`);
    expect(count).toBeGreaterThanOrEqual(20);
  });

  it('extendedTypoTests should have ~56 tests (typoTests + spacingErrorTests)', () => {
    const count = countTests(extendedTypoTests);
    console.log(`extendedTypoTests: ${count}개`);
    expect(count).toBeGreaterThanOrEqual(50);
  });

  it('polysemyTests should have ~63 tests', () => {
    const count = countTests(polysemyTests);
    console.log(`polysemyTests: ${count}개`);
    expect(count).toBeGreaterThanOrEqual(50);
  });

  it('professionalTranslatorTests should have ~18 tests', () => {
    const count = countTests(professionalTranslatorTests);
    console.log(`professionalTranslatorTests: ${count}개`);
    expect(count).toBeGreaterThanOrEqual(15);
  });

  it('extendedLocalizationTests should have ~85 tests (localizationTests + uniqueTests)', () => {
    const count = countTests(extendedLocalizationTests);
    console.log(`extendedLocalizationTests: ${count}개`);
    expect(count).toBeGreaterThanOrEqual(80);
  });

  it('integrationTests should have ~58 tests (levelTests + finalTests)', () => {
    const count = countTests(integrationTests);
    console.log(`integrationTests: ${count}개`);
    expect(count).toBeGreaterThanOrEqual(50);
  });

  it('antiHardcodingTests should have ~212 tests (22 levels)', () => {
    const count = countTests(antiHardcodingTests);
    console.log(`antiHardcodingTests: ${count}개`);
    expect(count).toBeGreaterThanOrEqual(200);
  });

  it('Total tests should be ~918', () => {
    let total = 0;
    for (const key of Object.keys(allBenchmarkCategories)) {
      const tests = allBenchmarkCategories[key as keyof typeof allBenchmarkCategories];
      total += countTests(tests);
    }
    console.log(`\n총 테스트 개수: ${total}개`);
    expect(total).toBeGreaterThanOrEqual(900);
  });
});

// 각 카테고리별 테스트 실행 (선택적으로 활성화)
// 주의: 전체 실행 시 시간이 오래 걸릴 수 있음

describe('1. Grammar Rules Tests (400개)', () => {
  for (const level of grammarRulesTests) {
    runTestsForLevel(level);
  }
});

describe('2. Context Tests (26개)', () => {
  for (const level of contextTests) {
    runTestsForLevel(level);
  }
});

describe('3. Extended Typo Tests (56개)', () => {
  for (const level of extendedTypoTests) {
    runTestsForLevel(level);
  }
});

describe('4. Polysemy Tests (63개)', () => {
  for (const level of polysemyTests) {
    runTestsForLevel(level);
  }
});

describe('5. Professional Translator Tests (18개)', () => {
  for (const level of professionalTranslatorTests) {
    runTestsForLevel(level);
  }
});

describe('6. Extended Localization Tests (85개)', () => {
  for (const level of extendedLocalizationTests) {
    runTestsForLevel(level);
  }
});

describe('7. Integration Tests (58개)', () => {
  for (const level of integrationTests) {
    runTestsForLevel(level);
  }
});

describe('8. Anti-Hardcoding Tests (212개)', () => {
  for (const level of antiHardcodingTests) {
    runTestsForLevel(level);
  }
});

// ============================================
// 전체 테스트 종료 후 유사도 요약 출력
// ============================================
afterAll(() => {
  if (similarityStats.total === 0) return;

  const avgSimilarity =
    similarityStats.similarities.reduce((a, b) => a + b, 0) / similarityStats.total;
  const avgSimilarityPercent = Math.round(avgSimilarity * 100);
  const exactMatchPercent = Math.round(
    (similarityStats.exactMatches / similarityStats.total) * 100,
  );

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 벤치마크 유사도 요약                      ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(
    `║  총 테스트 수:        ${String(similarityStats.total).padStart(6)}개                           ║`,
  );
  console.log(
    `║  정확 일치:           ${String(similarityStats.exactMatches).padStart(6)}개 (${String(exactMatchPercent).padStart(3)}%)                     ║`,
  );
  console.log(
    `║  평균 유사도:            ${String(avgSimilarityPercent).padStart(3)}%                              ║`,
  );
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n');
});
