/**
 * 벤치마크 실행 스크립트
 * 12개 테스트 카테고리의 성공률을 측정합니다.
 */

import {
  antiHardcodingTests,
  categoryTests,
  contextTests,
  finalTests,
  levelTests,
  localizationTests,
  polysemyTests,
  professionalTranslatorTests,
  spacingErrorTests,
  typoTests,
  uniqueTests,
  wordOrderTests,
} from './benchmark-data';
import { translate } from './translator-service';
import type { TestLevel } from './types';

interface CategoryResult {
  name: string;
  total: number;
  passed: number;
  failed: number;
  percentage: number;
}

function runTestLevel(tests: TestLevel[]): { passed: number; failed: number; details: string[] } {
  let passed = 0;
  let failed = 0;
  const details: string[] = [];

  for (const level of tests) {
    for (const category of level.categories) {
      for (const test of category.tests) {
        try {
          const result = translate(test.input, test.direction);
          // 정확히 일치하거나, 대소문자 무시 일치 확인
          const isMatch =
            result === test.expected || result.toLowerCase() === test.expected.toLowerCase();
          if (isMatch) {
            passed++;
          } else {
            failed++;
            details.push(
              `[${test.id}] Expected: "${test.expected.slice(0, 50)}..." Got: "${result.slice(0, 50)}..."`,
            );
          }
        } catch (e) {
          failed++;
          details.push(`[${test.id}] Error: ${e}`);
        }
      }
    }
  }

  return { passed, failed, details };
}

function countTests(tests: TestLevel[]): number {
  let count = 0;
  for (const level of tests) {
    for (const category of level.categories) {
      count += category.tests.length;
    }
  }
  return count;
}

// 실행
console.log('═══════════════════════════════════════════════════════════════');
console.log('            번역기 벤치마크 테스트 실행 결과');
console.log('═══════════════════════════════════════════════════════════════\n');

const results: CategoryResult[] = [];

const testSets = [
  { name: '1. levelTests (레벨별 테스트)', data: levelTests },
  { name: '2. categoryTests (카테고리별 테스트)', data: categoryTests },
  { name: '3. contextTests (문맥 기반 테스트)', data: contextTests },
  { name: '4. typoTests (오타 처리 테스트)', data: typoTests },
  { name: '5. uniqueTests (고유 표현 테스트)', data: uniqueTests },
  { name: '6. polysemyTests (다의어 처리 테스트)', data: polysemyTests },
  { name: '7. wordOrderTests (어순 변환 테스트)', data: wordOrderTests },
  { name: '8. spacingErrorTests (띄어쓰기 오류 테스트)', data: spacingErrorTests },
  { name: '9. finalTests (종합 테스트)', data: finalTests },
  { name: '10. professionalTranslatorTests (전문 번역 테스트)', data: professionalTranslatorTests },
  { name: '11. localizationTests (현지화 테스트)', data: localizationTests },
  { name: '12. antiHardcodingTests (하드코딩 방지 테스트)', data: antiHardcodingTests },
];

let totalPassed = 0;
let totalFailed = 0;

for (const testSet of testSets) {
  const count = countTests(testSet.data);
  const result = runTestLevel(testSet.data);

  totalPassed += result.passed;
  totalFailed += result.failed;

  const percentage = count > 0 ? ((result.passed / count) * 100).toFixed(1) : '0.0';

  results.push({
    name: testSet.name,
    total: count,
    passed: result.passed,
    failed: result.failed,
    percentage: Number.parseFloat(percentage),
  });

  console.log(`${testSet.name}`);
  console.log(
    `  총: ${count} | 통과: ${result.passed} | 실패: ${result.failed} | 성공률: ${percentage}%`,
  );

  // 실패한 테스트 일부 출력 (최대 3개)
  if (result.details.length > 0) {
    console.log('  실패 예시:');
    for (const detail of result.details.slice(0, 3)) {
      console.log(`    - ${detail}`);
    }
    if (result.details.length > 3) {
      console.log(`    ... 그 외 ${result.details.length - 3}개 실패`);
    }
  }
  console.log('');
}

const totalTests = totalPassed + totalFailed;
const overallPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';

console.log('═══════════════════════════════════════════════════════════════');
console.log('                        전체 결과 요약');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`총 테스트: ${totalTests}`);
console.log(`통과: ${totalPassed}`);
console.log(`실패: ${totalFailed}`);
console.log(`전체 성공률: ${overallPercentage}%`);
console.log('═══════════════════════════════════════════════════════════════');

// 카테고리별 성공률 순위
console.log('\n카테고리별 성공률 순위:');
const sortedResults = [...results].sort((a, b) => b.percentage - a.percentage);
for (let i = 0; i < sortedResults.length; i++) {
  const r = sortedResults[i];
  const bar =
    '█'.repeat(Math.floor(r.percentage / 5)) + '░'.repeat(20 - Math.floor(r.percentage / 5));
  console.log(`${i + 1}. ${r.name.padEnd(45)} ${bar} ${r.percentage.toFixed(1)}%`);
}
