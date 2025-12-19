/**
 * WSD 테스트 스크립트
 * 실행: npx tsx apps/tools/src/tools/translator/nlp/wsd/wsd-test.script.ts
 */
import { exportWeightsAsCode, optimizeWeights, runWsdTests } from './index';

// 현재 가중치로 테스트 실행
console.log('=== WSD Test Results (Current Weights) ===\n');
const results = runWsdTests();
console.log('Passed: ' + results.passed + '/' + results.total);
console.log('Score: ' + (results.score * 100).toFixed(1) + '%\n');

// 실패한 케이스 출력
const failed = results.details.filter((d) => !d.passed);
if (failed.length > 0) {
  console.log('Failed cases:');
  for (const f of failed) {
    console.log(
      '  - ' + f.testId + ': expected "' + f.expectedSenseId + '", got "' + f.actualSenseId + '"',
    );
  }
  console.log('');
}

// 가중치 최적화 실행 (옵션)
if (process.argv.includes('--optimize')) {
  console.log('=== Running Weight Optimization ===\n');
  const optimized = optimizeWeights();
  console.log('Optimization complete!');
  console.log('Best Score: ' + (optimized.bestScore * 100).toFixed(1) + '%');
  console.log('Generations: ' + optimized.generations);
  console.log('\nOptimized Weights:');
  console.log(exportWeightsAsCode(optimized.bestWeights));
}
