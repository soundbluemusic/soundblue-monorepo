// ========================================
// Translator Benchmark Runner - 번역기 벤치마크 실행기
// 테스트 실행 및 보고서 생성
// ========================================

import { translate } from '../translator-service';
import { calculateGrade, evaluateTestCase, generateImprovements } from './evaluator';
import { CATEGORIES, getTestsByCategory, TEST_CASES } from './test-cases';
import type {
  BenchmarkProgress,
  BenchmarkReport,
  CategoryResult,
  CriteriaScores,
  TestResult,
} from './types';
import { CRITERIA_WEIGHTS } from './types';

/**
 * 진행 상황 콜백 타입
 */
export type ProgressCallback = (progress: BenchmarkProgress) => void;

/**
 * 단일 테스트 실행
 */
function runSingleTest(testCase: (typeof TEST_CASES)[number]): TestResult {
  const startTime = performance.now();

  // 번역 실행
  const direction = testCase.direction === 'ko-en' ? 'ko-en' : 'en-ko';
  const actualOutput = translate(testCase.input, direction);

  const executionTime = performance.now() - startTime;

  // 평가
  return evaluateTestCase(testCase, actualOutput, executionTime);
}

/**
 * 카테고리별 결과 집계
 */
function aggregateCategoryResults(results: TestResult[], categoryId: string): CategoryResult {
  const category = CATEGORIES.find((c) => c.id === categoryId);

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const averageScore =
    totalTests > 0 ? results.reduce((sum, r) => sum + r.score, 0) / totalTests : 0;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return {
    categoryId: categoryId as CategoryResult['categoryId'],
    name: category?.name || { ko: categoryId, en: categoryId },
    totalTests,
    passedTests,
    averageScore: Math.round(averageScore * 100) / 100,
    passRate: Math.round(passRate * 100) / 100,
    results,
  };
}

/**
 * 기준별 평균 점수 계산
 */
function calculateCriteriaAverages(allResults: TestResult[]): CriteriaScores {
  if (allResults.length === 0) {
    return {
      accuracy: 0,
      fluency: 0,
      context: 0,
      cultural: 0,
      consistency: 0,
      tone: 0,
      domain: 0,
    };
  }

  const totals = allResults.reduce(
    (acc, r) => ({
      accuracy: acc.accuracy + r.criteriaScores.accuracy,
      fluency: acc.fluency + r.criteriaScores.fluency,
      context: acc.context + r.criteriaScores.context,
      cultural: acc.cultural + r.criteriaScores.cultural,
      consistency: acc.consistency + r.criteriaScores.consistency,
      tone: acc.tone + r.criteriaScores.tone,
      domain: acc.domain + r.criteriaScores.domain,
    }),
    { accuracy: 0, fluency: 0, context: 0, cultural: 0, consistency: 0, tone: 0, domain: 0 }
  );

  const count = allResults.length;
  return {
    accuracy: Math.round((totals.accuracy / count) * 100) / 100,
    fluency: Math.round((totals.fluency / count) * 100) / 100,
    context: Math.round((totals.context / count) * 100) / 100,
    cultural: Math.round((totals.cultural / count) * 100) / 100,
    consistency: Math.round((totals.consistency / count) * 100) / 100,
    tone: Math.round((totals.tone / count) * 100) / 100,
    domain: Math.round((totals.domain / count) * 100) / 100,
  };
}

/**
 * 전체 벤치마크 실행
 */
export function runBenchmark(onProgress?: ProgressCallback): BenchmarkReport {
  const startTime = performance.now();
  const allResults: TestResult[] = [];
  const categoryResultsMap = new Map<string, TestResult[]>();

  // 카테고리별로 결과 초기화
  for (const category of CATEGORIES) {
    categoryResultsMap.set(category.id, []);
  }

  // 모든 테스트 실행
  const totalTests = TEST_CASES.length;
  let currentIndex = 0;

  for (const testCase of TEST_CASES) {
    // 진행 상황 보고
    if (onProgress) {
      onProgress({
        current: currentIndex,
        total: totalTests,
        currentCategory: testCase.categoryId,
        currentTestId: testCase.id,
        percentage: Math.round((currentIndex / totalTests) * 100),
      });
    }

    // 테스트 실행
    const result = runSingleTest(testCase);
    allResults.push(result);

    // 카테고리별 결과 저장
    const categoryResults = categoryResultsMap.get(testCase.categoryId);
    if (categoryResults) {
      categoryResults.push(result);
    }

    currentIndex++;
  }

  // 최종 진행 상황 보고
  if (onProgress) {
    onProgress({
      current: totalTests,
      total: totalTests,
      currentCategory: 'completed',
      currentTestId: 'done',
      percentage: 100,
    });
  }

  // 카테고리별 결과 집계
  const categoryResults: CategoryResult[] = [];
  for (const category of CATEGORIES) {
    const results = categoryResultsMap.get(category.id);
    if (results && results.length > 0) {
      categoryResults.push(aggregateCategoryResults(results, category.id));
    }
  }

  // 전체 통계 계산
  const totalPassed = allResults.filter((r) => r.passed).length;
  const overallPassRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

  // 기준별 평균 점수
  const criteriaAverages = calculateCriteriaAverages(allResults);

  // 가중 평균 전체 점수
  const overallScore =
    criteriaAverages.accuracy * CRITERIA_WEIGHTS.accuracy +
    criteriaAverages.fluency * CRITERIA_WEIGHTS.fluency +
    criteriaAverages.context * CRITERIA_WEIGHTS.context +
    criteriaAverages.cultural * CRITERIA_WEIGHTS.cultural +
    criteriaAverages.consistency * CRITERIA_WEIGHTS.consistency +
    criteriaAverages.tone * CRITERIA_WEIGHTS.tone +
    criteriaAverages.domain * CRITERIA_WEIGHTS.domain;

  // 등급 계산
  const grade = calculateGrade(overallScore);

  // 개선 제안 생성
  const improvements = generateImprovements(
    criteriaAverages,
    categoryResults.map((c) => ({ categoryId: c.categoryId, averageScore: c.averageScore }))
  );

  // 합격 여부 (평균 3.8 이상 + 통과율 85% 이상)
  const passed = overallScore >= 3.8 && overallPassRate >= 85;

  const totalExecutionTime = performance.now() - startTime;

  return {
    timestamp: new Date(),
    overallScore: Math.round(overallScore * 100) / 100,
    grade,
    overallPassRate: Math.round(overallPassRate * 100) / 100,
    totalTests,
    totalPassed,
    criteriaAverages,
    categories: categoryResults,
    improvements,
    totalExecutionTime: Math.round(totalExecutionTime),
    passed,
  };
}

/**
 * 특정 카테고리만 벤치마크 실행
 */
export function runCategoryBenchmark(
  categoryId: string,
  onProgress?: ProgressCallback
): CategoryResult | null {
  const tests = getTestsByCategory(categoryId as (typeof TEST_CASES)[number]['categoryId']);

  if (tests.length === 0) return null;

  const results: TestResult[] = [];
  let currentIndex = 0;

  for (const testCase of tests) {
    if (onProgress) {
      onProgress({
        current: currentIndex,
        total: tests.length,
        currentCategory: categoryId,
        currentTestId: testCase.id,
        percentage: Math.round((currentIndex / tests.length) * 100),
      });
    }

    const result = runSingleTest(testCase);
    results.push(result);
    currentIndex++;
  }

  if (onProgress) {
    onProgress({
      current: tests.length,
      total: tests.length,
      currentCategory: categoryId,
      currentTestId: 'done',
      percentage: 100,
    });
  }

  return aggregateCategoryResults(results, categoryId);
}

/**
 * 빠른 테스트 (샘플링)
 * - 각 카테고리에서 1-2개씩만 테스트
 */
export function runQuickBenchmark(onProgress?: ProgressCallback): BenchmarkReport {
  const startTime = performance.now();
  const allResults: TestResult[] = [];
  const categoryResultsMap = new Map<string, TestResult[]>();

  // 각 카테고리에서 최대 2개씩 샘플링
  const sampledTests: (typeof TEST_CASES)[number][] = [];
  for (const category of CATEGORIES) {
    const categoryTests = TEST_CASES.filter((t) => t.categoryId === category.id);
    const sampled = categoryTests.slice(0, 2);
    sampledTests.push(...sampled);
    categoryResultsMap.set(category.id, []);
  }

  const totalTests = sampledTests.length;
  let currentIndex = 0;

  for (const testCase of sampledTests) {
    if (onProgress) {
      onProgress({
        current: currentIndex,
        total: totalTests,
        currentCategory: testCase.categoryId,
        currentTestId: testCase.id,
        percentage: Math.round((currentIndex / totalTests) * 100),
      });
    }

    const result = runSingleTest(testCase);
    allResults.push(result);

    const categoryResults = categoryResultsMap.get(testCase.categoryId);
    if (categoryResults) {
      categoryResults.push(result);
    }

    currentIndex++;
  }

  if (onProgress) {
    onProgress({
      current: totalTests,
      total: totalTests,
      currentCategory: 'completed',
      currentTestId: 'done',
      percentage: 100,
    });
  }

  // 카테고리별 결과 집계
  const categoryResults: CategoryResult[] = [];
  for (const category of CATEGORIES) {
    const results = categoryResultsMap.get(category.id);
    if (results && results.length > 0) {
      categoryResults.push(aggregateCategoryResults(results, category.id));
    }
  }

  // 전체 통계
  const totalPassed = allResults.filter((r) => r.passed).length;
  const overallPassRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
  const criteriaAverages = calculateCriteriaAverages(allResults);

  const overallScore =
    criteriaAverages.accuracy * CRITERIA_WEIGHTS.accuracy +
    criteriaAverages.fluency * CRITERIA_WEIGHTS.fluency +
    criteriaAverages.context * CRITERIA_WEIGHTS.context +
    criteriaAverages.cultural * CRITERIA_WEIGHTS.cultural +
    criteriaAverages.consistency * CRITERIA_WEIGHTS.consistency +
    criteriaAverages.tone * CRITERIA_WEIGHTS.tone +
    criteriaAverages.domain * CRITERIA_WEIGHTS.domain;

  const grade = calculateGrade(overallScore);
  const improvements = generateImprovements(
    criteriaAverages,
    categoryResults.map((c) => ({ categoryId: c.categoryId, averageScore: c.averageScore }))
  );

  const passed = overallScore >= 3.8 && overallPassRate >= 85;
  const totalExecutionTime = performance.now() - startTime;

  return {
    timestamp: new Date(),
    overallScore: Math.round(overallScore * 100) / 100,
    grade,
    overallPassRate: Math.round(overallPassRate * 100) / 100,
    totalTests,
    totalPassed,
    criteriaAverages,
    categories: categoryResults,
    improvements,
    totalExecutionTime: Math.round(totalExecutionTime),
    passed,
  };
}
