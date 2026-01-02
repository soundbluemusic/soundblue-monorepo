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

import { describe, expect, it } from 'vitest';
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
            // 유연한 매칭: 정확히 일치하거나 expected의 일부를 포함하면 통과
            const normalizedResult = result
              .toLowerCase()
              .replace(/[.,!?]/g, '')
              .trim();
            const normalizedExpected = test.expected
              .toLowerCase()
              .replace(/[.,!?]/g, '')
              .trim();

            // 정확히 일치하거나, 부분 일치, 또는 "/" 구분 옵션 중 하나와 일치
            const options = normalizedExpected.split('/').map((s) => s.trim());
            const matches = options.some(
              (opt) => normalizedResult.includes(opt) || opt.includes(normalizedResult),
            );

            expect(matches || normalizedResult === normalizedExpected).toBe(true);
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
