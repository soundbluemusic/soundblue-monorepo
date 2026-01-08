/**
 * 번역기 벤치마크 테스트
 *
 * 단일 소스: benchmarkTestGroups (UI와 vitest 완전 동기화)
 * 14개 그룹, 1,105개 테스트
 *
 * 통과 기준: benchmark.tsx와 완전히 동일
 */

import { describe, expect, it } from 'vitest';

import { benchmarkTestGroups, type TestLevel } from './benchmark-data';
import { translate } from './v2.1/index';

// ============================================
// 정규화 함수 (benchmark.tsx와 완전히 동일)
// ============================================

const normalizeEnglish = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\b(a|an|the)\s+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeKorean = (text: string): string => {
  return text
    .replace(/은|는|이|가/g, '가')
    .replace(/을|를/g, '를')
    .replace(/\s+/g, ' ')
    .trim();
};

// ============================================
// 테스트 실행 (benchmark.tsx와 완전히 동일한 로직)
// ============================================

function runTestsForLevel(level: TestLevel) {
  describe(level.name, () => {
    for (const category of level.categories) {
      describe(category.name, () => {
        for (const test of category.tests) {
          it(`[${test.id}] ${test.input.slice(0, 50)}...`, () => {
            const actual = translate(test.input, test.direction);

            // 정규화 함수 선택
            const normalize = test.direction === 'ko-en' ? normalizeEnglish : normalizeKorean;

            // Compare results
            // 슬래시 대안 지원: 번역 결과가 "A / B"일 때 expected가 A 또는 B와 일치하면 통과
            // 또는 expected가 "A / B"일 때 actual이 그 중 하나와 일치하면 통과

            // 슬래시로 분리된 대안들
            const actualAlternatives = actual.split(' / ').map((s) => normalize(s.trim()));
            const expectedAlternatives = test.expected.split(' / ').map((s) => normalize(s.trim()));

            // 양방향 매칭: actual의 대안 중 하나가 expected의 대안 중 하나와 일치하면 통과
            const passed = actualAlternatives.some((actualAlt) =>
              expectedAlternatives.some((expectedAlt) => actualAlt === expectedAlt),
            );

            if (!passed) {
              console.log(
                `[${test.id}] "${test.input}" → "${actual}" (expected: "${test.expected}")`,
              );
            }

            expect(passed).toBe(true);
          });
        }
      });
    }
  });
}

// ============================================
// benchmarkTestGroups 기반 테스트 실행 (14개 그룹, 1,105개)
// ============================================
for (const group of benchmarkTestGroups) {
  describe(group.name, () => {
    for (const level of group.data) {
      runTestsForLevel(level);
    }
  });
}
