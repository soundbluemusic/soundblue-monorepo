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
 * 단일 소스: benchmarkTestGroups (14개 그룹, 1,105개 테스트)
 * UI와 vitest 완전 동기화
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
// 타입 re-export
// ========================================

export type { TestCase, TestCategory, TestLevel };

// ========================================
// 단일 소스: benchmarkTestGroups
// UI, vitest, getAllTests 모두 이것만 사용
// ========================================

/** 벤치마크 테스트 그룹 (14개 그룹, 1,105개 테스트) */
export const benchmarkTestGroups: { name: string; data: TestLevel[] }[] = [
  { name: 'Grammar Rules', data: grammarRulesTests },
  { name: 'Level Tests', data: levelTests },
  { name: 'Category Tests', data: categoryTests },
  { name: 'Context Tests', data: contextTests },
  { name: 'Typo Tests', data: typoTests },
  { name: 'Unique Tests', data: uniqueTests },
  { name: 'Polysemy Tests', data: polysemyTests },
  { name: 'Word Order Tests', data: wordOrderTests },
  { name: 'Spacing Tests', data: spacingErrorTests },
  { name: 'Final Tests', data: finalTests },
  { name: 'Professional Tests', data: professionalTranslatorTests },
  { name: 'Localization Tests', data: localizationTests },
  { name: 'Anti-Hardcoding Tests', data: antiHardcodingTests },
  { name: 'Figurative Tests', data: figurativeTests },
];

// ========================================
// 헬퍼 함수
// ========================================

/** TestLevel[] 배열의 테스트 개수를 계산합니다 */
export function countTests(levels: TestLevel[]): number {
  let count = 0;
  for (const level of levels) {
    for (const category of level.categories) {
      count += category.tests.length;
    }
  }
  return count;
}

/** 모든 벤치마크 테스트를 반환합니다 (benchmarkTestGroups 기반) */
export function getAllTests(): TestCase[] {
  const tests: TestCase[] = [];

  for (const group of benchmarkTestGroups) {
    for (const level of group.data) {
      for (const category of level.categories) {
        tests.push(...category.tests);
      }
    }
  }

  return tests;
}

/** 총 테스트 개수를 반환합니다 */
export function getTotalTestCount(): number {
  let total = 0;
  for (const group of benchmarkTestGroups) {
    total += countTests(group.data);
  }
  return total;
}
