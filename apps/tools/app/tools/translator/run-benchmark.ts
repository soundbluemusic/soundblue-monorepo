/**
 * 벤치마크 실행 스크립트
 * 14개 테스트 카테고리의 성공률을 측정합니다.
 */

import { benchmarkTestGroups, countTests } from './benchmark-data';
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

// 실행
console.log('═══════════════════════════════════════════════════════════════');
console.log('            번역기 벤치마크 테스트 실행 결과');
console.log('═══════════════════════════════════════════════════════════════\n');

const results: CategoryResult[] = [];

let totalPassed = 0;
let totalFailed = 0;

for (const testSet of benchmarkTestGroups) {
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
