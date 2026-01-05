/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    규칙 기반 일반화 (Rule-based Generalization)                  ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  핵심 원칙:                                                                    ║
 * ║  각 Level의 문법 규칙을 알고리즘으로 구현하여,                                       ║
 * ║  해당 난이도의 **어떤 문장이든** 번역 가능하게 만드는 것                               ║
 * ║                                                                              ║
 * ║  ┌─────────────────────────────────────────────────────────────────────┐    ║
 * ║  │ Level = 난이도 수준 (특정 테스트 문장 ❌)                                 │    ║
 * ║  │ 테스트 문장 = 규칙이 동작하는지 확인하는 샘플                               │    ║
 * ║  └─────────────────────────────────────────────────────────────────────┘    ║
 * ║                                                                              ║
 * ║  예시: Level 1 의문문 규칙                                                     ║
 * ║    규칙: "Did + S + V + O?" → "S는 O를 V했니?"                                ║
 * ║                                                                              ║
 * ║    적용 가능한 모든 문장:                                                       ║
 * ║    - Did you eat breakfast?    → 너는 아침을 먹었니?                           ║
 * ║    - Did she read the book?    → 그녀는 책을 읽었니?                           ║
 * ║    - (... 무한히 많은 문장들)                                                  ║
 * ║                                                                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  ⚠️ 절대 금지 (PROHIBITED):                                                   ║
 * ║                                                                              ║
 * ║  ❌ 테스트 문장 하드코딩: /^Did you go to the museum/                          ║
 * ║  ❌ 사전에 테스트 문장 등록: i18n-sentences.ts, idioms.ts                       ║
 * ║                                                                              ║
 * ║  ✅ 올바른 방식:                                                               ║
 * ║     문법 패턴 알고리즘 구현 (grammar/, core/)                                   ║
 * ║     개별 단어만 사전에 추가 (dictionary/words.ts)                               ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * 번역기 벤치마크 테스트 데이터
 * 14개 테스트 카테고리로 분리 관리
 */

// ========================================
// 개별 테스트 파일 import
// ========================================

import { antiHardcodingTests } from './benchmark-tests/anti-hardcoding-tests';
import { categoryTests } from './benchmark-tests/category-tests';
import { contextTests } from './benchmark-tests/context-tests';
import { figurativeTests } from './benchmark-tests/figurative-tests';
import { finalTests } from './benchmark-tests/final-tests';
import { grammarRulesTests } from './benchmark-tests/grammar-rules-tests';
import { levelTests } from './benchmark-tests/level-tests';
import { localizationTests } from './benchmark-tests/localization-tests';
import { polysemyTests } from './benchmark-tests/polysemy-tests';
import { professionalTranslatorTests } from './benchmark-tests/professional-translator-tests';
import { spacingErrorTests } from './benchmark-tests/spacing-error-tests';
import { typoTests } from './benchmark-tests/typo-tests';
import { uniqueTests } from './benchmark-tests/unique-tests';
import { wordOrderTests } from './benchmark-tests/word-order-tests';

import type { TestCase, TestCategory, TestLevel } from './types';

// ========================================
// 타입 및 테스트 데이터 re-export
// ========================================

export type { TestCase, TestCategory, TestLevel };

export {
  grammarRulesTests,
  levelTests,
  categoryTests,
  contextTests,
  typoTests,
  uniqueTests,
  polysemyTests,
  wordOrderTests,
  spacingErrorTests,
  finalTests,
  professionalTranslatorTests,
  localizationTests,
  antiHardcodingTests,
  figurativeTests,
};

// ========================================
// 통합 테스트 (Integration Tests)
// ========================================

export const integrationTests: TestLevel[] = [...levelTests, ...finalTests];
export const extendedLocalizationTests: TestLevel[] = [...localizationTests, ...uniqueTests];
export const extendedTypoTests: TestLevel[] = [...typoTests, ...spacingErrorTests];

// ========================================
// 헬퍼 함수
// ========================================

/**
 * 모든 벤치마크 테스트를 반환합니다.
 *
 * 새 카테고리 구조 (9개):
 * 1. grammarRulesTests (424개) - 30개 문법 규칙
 * 2. contextTests (26개) - 문맥 기반
 * 3. extendedTypoTests (56개) - typoTests + spacingErrorTests
 * 4. polysemyTests (63개) - 다의어
 * 5. professionalTranslatorTests (18개) - 전문 번역가 수준
 * 6. extendedLocalizationTests (85개) - localizationTests + uniqueTests
 * 7. integrationTests (58개) - levelTests + finalTests
 * 8. antiHardcodingTests (278개) - 22개 레벨 알고리즘 테스트
 * 9. figurativeTests (118개) - 비유 표현 테스트 (직유, 은유, 의인법 등 9개 유형)
 */
export function getAllTests(): TestCase[] {
  const tests: TestCase[] = [];

  // 1. 문법 규칙 테스트 (424개)
  for (const level of grammarRulesTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  // 2. 문맥 테스트 (26개)
  for (const level of contextTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  // 3. 오타 테스트 (56개) - typoTests + spacingErrorTests
  for (const level of extendedTypoTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  // 4. 다의어 테스트 (63개)
  for (const level of polysemyTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  // 5. 전문 번역가 수준 테스트 (18개)
  for (const level of professionalTranslatorTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  // 6. 의역 테스트 (85개) - localizationTests + uniqueTests
  for (const level of extendedLocalizationTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  // 7. 통합 테스트 (58개) - levelTests + finalTests
  for (const level of integrationTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  // 8. 안티하드코딩 테스트 (278개) - 22개 레벨
  for (const level of antiHardcodingTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  // 9. 비유 표현 테스트 (118개) - 직유, 은유, 의인법, 과장법, 관용적 비유, 역설, 환유, 제유, 문화 특수 비유
  for (const level of figurativeTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  return tests;
}

/**
 * 레거시 getAllTests - 기존 모든 카테고리 포함
 * @deprecated 새 구조로 마이그레이션 권장
 */
export function getAllTestsLegacy(): TestCase[] {
  const tests: TestCase[] = [];

  for (const level of levelTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of categoryTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of contextTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of typoTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of uniqueTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of polysemyTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of wordOrderTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of spacingErrorTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of finalTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of professionalTranslatorTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of localizationTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  for (const level of antiHardcodingTests) {
    for (const category of level.categories) {
      tests.push(...category.tests);
    }
  }

  return tests;
}

export function countTests(levels: TestLevel[]): number {
  let count = 0;
  for (const level of levels) {
    for (const category of level.categories) {
      count += category.tests.length;
    }
  }
  return count;
}

// ========================================
// 벤치마크 카테고리 (14개 개별 + 3개 통합 = 17개)
// ========================================

export const allBenchmarkCategories = {
  // 개별 카테고리 (14개)
  grammarRulesTests, // 1. 문법 규칙 (424개)
  levelTests, // 2. 레벨 테스트
  categoryTests, // 3. 카테고리 테스트
  contextTests, // 4. 문맥 기반 (26개)
  typoTests, // 5. 오타 처리
  uniqueTests, // 6. 고유 표현
  polysemyTests, // 7. 다의어 (63개)
  wordOrderTests, // 8. 어순 변환
  spacingErrorTests, // 9. 띄어쓰기 오류
  finalTests, // 10. 종합 테스트
  professionalTranslatorTests, // 11. 전문 번역 (18개)
  localizationTests, // 12. 현지화
  antiHardcodingTests, // 13. 안티하드코딩 (278개)
  figurativeTests, // 14. 비유 표현 (118개)

  // 통합 카테고리 (3개)
  integrationTests, // levelTests + finalTests
  extendedLocalizationTests, // localizationTests + uniqueTests
  extendedTypoTests, // typoTests + spacingErrorTests
};
