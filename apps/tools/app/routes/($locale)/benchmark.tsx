import type { TestCase, TestCategory, TestLevel } from '@soundblue/ui-components/composite/tool';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { getSeoMeta } from '~/lib/seo';

// Dynamic import types for lazy loading
type TranslateFn = (input: string, direction: 'ko-en' | 'en-ko') => string;
type SimilarityFn = (a: string, b: string) => number;
type LevenshteinFn = (a: string, b: string) => number;
type TestGroup = { name: string; data: TestLevel[] };
type BenchmarkDataModule = {
  benchmarkTestGroups: TestGroup[];
};
type HangulModule = {
  similarity: SimilarityFn;
  levenshteinDistance: LevenshteinFn;
};

// Official metrics data type
interface OfficialMetrics {
  generatedAt: string;
  testCount: number;
  koToEn: {
    meteor: number;
    chrF: number;
    bleu: number;
    ter: number;
  };
  enToKo: {
    meteor: number;
    chrF: number;
    bleu: number;
    ter: number;
  };
}

export const meta: MetaFunction = ({ location }) => [
  { title: 'Benchmark | Tools' },
  { name: 'description', content: 'Translator performance benchmark.' },
  ...getSeoMeta(location),
];

interface TestResult {
  id: string;
  passed: boolean;
  actual: string;
  expected: string;
  input: string;
  similarity: number; // 0~100%
}

interface CategoryResult {
  id: string;
  passed: number;
  total: number;
  results: TestResult[];
}

interface LevelResult {
  id: string;
  passed: number;
  total: number;
  categories: CategoryResult[];
}

// Lazy-loaded test groups and translate function (loaded on demand)
let cachedTestGroups: TestGroup[] | null = null;
let cachedTranslateFn: TranslateFn | null = null;
let cachedHangulModule: HangulModule | null = null;

async function loadBenchmarkData(): Promise<TestGroup[]> {
  if (cachedTestGroups) return cachedTestGroups;

  // benchmarkTestGroups를 직접 import하여 자동 동기화
  const uiModule = (await import('@soundblue/ui-components/composite/tool')) as BenchmarkDataModule;
  cachedTestGroups = uiModule.benchmarkTestGroups;
  return cachedTestGroups;
}

async function loadTranslate(): Promise<TranslateFn> {
  if (cachedTranslateFn) return cachedTranslateFn;

  const uiModule = await import('@soundblue/ui-components/composite/tool');
  cachedTranslateFn = uiModule.translate;
  return cachedTranslateFn;
}

async function loadHangul(): Promise<HangulModule> {
  if (cachedHangulModule) return cachedHangulModule;

  const hangulModule = (await import('@soundblue/hangul')) as HangulModule;
  cachedHangulModule = hangulModule;
  return cachedHangulModule;
}

/**
 * 문자열 유사도 계산 (0~100%)
 * - 한글: 자모 기반 유사도 (jamoEditDistance)
 * - 영어: Levenshtein 기반 유사도
 */
function calculateSimilarity(
  actual: string,
  expected: string,
  hangul: HangulModule,
  isKorean: boolean,
): number {
  if (actual === expected) return 100;
  if (!actual || !expected) return 0;

  if (isKorean) {
    // 한글: 자모 기반 유사도 (0~1 반환)
    return Math.round(hangul.similarity(actual, expected) * 100);
  }
  // 영어: Levenshtein 기반 유사도
  const maxLen = Math.max(actual.length, expected.length);
  if (maxLen === 0) return 100;
  const distance = hangul.levenshteinDistance(actual.toLowerCase(), expected.toLowerCase());
  return Math.round((1 - distance / maxLen) * 100);
}

// Helper function to count tests in a level array
function countTestsInLevels(levels: TestLevel[]): number {
  return levels.reduce(
    (sum, level) => sum + level.categories.reduce((catSum, cat) => catSum + cat.tests.length, 0),
    0,
  );
}

export default function Benchmark() {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testGroups, setTestGroups] = useState<TestGroup[]>([]);
  const [currentTest, setCurrentTest] = useState<{
    input: string;
    output: string;
    expected: string;
    testId: string;
  } | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const abortRef = useRef(false);
  const translateFnRef = useRef<TranslateFn | null>(null);
  const hangulRef = useRef<HangulModule | null>(null);

  // Results state for each group
  const [results, setResults] = useState<Map<string, LevelResult[]>>(new Map());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Official metrics state
  const [officialMetrics, setOfficialMetrics] = useState<OfficialMetrics | null>(null);

  // Load official metrics
  useEffect(() => {
    fetch('/data/official-metrics.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setOfficialMetrics(data))
      .catch(() => setOfficialMetrics(null));
  }, []);

  // Load test data and translate function on mount
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    Promise.all([loadBenchmarkData(), loadTranslate(), loadHangul()])
      .then(([groups, translateFn, hangulModule]) => {
        if (mounted) {
          setTestGroups(groups);
          translateFnRef.current = translateFn;
          hangulRef.current = hangulModule;
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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

  // Run single test and update UI
  const runSingleTest = useCallback(async (test: TestCase): Promise<TestResult> => {
    // Show current test in UI
    setCurrentTest({
      input: test.input,
      output: '번역 중...',
      expected: test.expected,
      testId: test.id,
    });

    // Small delay to let UI update
    await new Promise((r) => setTimeout(r, 50));

    // Run translation using dynamically loaded translate function
    const translateFn = translateFnRef.current;
    if (!translateFn) {
      throw new Error('Translate function not loaded');
    }
    const actual = translateFn(test.input, test.direction);

    // Update UI with result
    setCurrentTest({
      input: test.input,
      output: actual,
      expected: test.expected,
      testId: test.id,
    });

    // Compare results
    let passed: boolean;
    const isKoreanOutput = test.direction === 'en-ko';
    if (test.direction === 'ko-en') {
      passed = normalizeEnglish(actual) === normalizeEnglish(test.expected);
    } else {
      passed = normalizeKorean(actual) === normalizeKorean(test.expected);
    }

    // 유사도 계산
    const hangul = hangulRef.current;
    const similarityScore = hangul
      ? calculateSimilarity(actual, test.expected, hangul, isKoreanOutput)
      : 0;

    return {
      id: test.id,
      passed,
      actual,
      expected: test.expected,
      input: test.input,
      similarity: similarityScore,
    };
  }, []);

  // Run all tests sequentially
  const runAllTests = useCallback(async () => {
    if (testGroups.length === 0 || !translateFnRef.current) return;

    setIsRunning(true);
    abortRef.current = false;
    setResults(new Map());
    setExpandedLevels(new Set());
    setExpandedCategories(new Set());

    const totalTests = testGroups.reduce((sum, group) => sum + countTestsInLevels(group.data), 0);
    let currentCount = 0;

    const newResults = new Map<string, LevelResult[]>();

    for (const group of testGroups) {
      if (abortRef.current) break;

      setProgress({ current: currentCount, total: totalTests, phase: group.name });

      const groupResults: LevelResult[] = [];

      for (const level of group.data) {
        if (abortRef.current) break;

        const categoryResults: CategoryResult[] = [];

        for (const category of level.categories) {
          if (abortRef.current) break;

          const testResults: TestResult[] = [];

          for (const test of category.tests) {
            if (abortRef.current) break;

            const result = await runSingleTest(test);
            testResults.push(result);
            currentCount++;
            setProgress({ current: currentCount, total: totalTests, phase: group.name });
          }

          const passed = testResults.filter((r) => r.passed).length;
          categoryResults.push({
            id: category.id,
            passed,
            total: testResults.length,
            results: testResults,
          });
        }

        const totalPassed = categoryResults.reduce((sum, c) => sum + c.passed, 0);
        const totalInLevel = categoryResults.reduce((sum, c) => sum + c.total, 0);

        groupResults.push({
          id: level.id,
          passed: totalPassed,
          total: totalInLevel,
          categories: categoryResults,
        });
      }

      newResults.set(group.name, groupResults);
      setResults(new Map(newResults));
    }

    setIsRunning(false);
    setCurrentTest(null);
    setProgress({ current: 0, total: 0, phase: '' });
  }, [runSingleTest, testGroups]);

  const stopTests = useCallback(() => {
    abortRef.current = true;
  }, []);

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(levelId)) {
        next.delete(levelId);
      } else {
        next.add(levelId);
      }
      return next;
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const calcTotalStats = (levelResults: LevelResult[]) => {
    const total = levelResults.reduce((sum, r) => sum + r.total, 0);
    const passed = levelResults.reduce((sum, r) => sum + r.passed, 0);
    return { total, passed, percentage: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  // Calculate average similarity for failed tests
  const calcAverageSimilarity = (levelResults: LevelResult[]) => {
    const allTestResults: TestResult[] = [];
    for (const level of levelResults) {
      for (const cat of level.categories) {
        allTestResults.push(...cat.results);
      }
    }
    if (allTestResults.length === 0) return 0;
    const totalSimilarity = allTestResults.reduce((sum, r) => sum + r.similarity, 0);
    return Math.round(totalSimilarity / allTestResults.length);
  };

  // Calculate overall stats
  const allResults = Array.from(results.values()).flat();
  const overallStats = calcTotalStats(allResults);
  const averageSimilarity = calcAverageSimilarity(allResults);

  const getBadgeClass = (percentage: number) => {
    if (percentage === 100)
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (percentage >= 50)
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  const getPercentageClass = (percentage: number) => {
    if (percentage === 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const totalTestCount = testGroups.reduce((sum, group) => sum + countTestsInLevels(group.data), 0);

  const renderResults = (levels: TestLevel[], levelResults: LevelResult[], prefix: string) => {
    if (levelResults.length === 0) return null;

    return (
      <div className="flex flex-col gap-2">
        {levels.map((level, levelIdx) => {
          const levelResult = levelResults[levelIdx];
          if (!levelResult) return null;

          const levelId = `${prefix}-${level.id}`;
          const isLevelExpanded = expandedLevels.has(levelId);
          const levelPercentage = Math.round((levelResult.passed / levelResult.total) * 100);

          return (
            <div key={level.id} className="overflow-hidden rounded-lg border border-(--border)">
              <button
                type="button"
                onClick={() => toggleLevel(levelId)}
                className="flex w-full items-center justify-between bg-transparent p-3 text-left transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  {isLevelExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                  <span className="font-medium">{level.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-(--muted-foreground)">
                    {`${levelResult.passed}/${levelResult.total}`}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getBadgeClass(levelPercentage)}`}
                  >
                    {levelPercentage}%
                  </span>
                </div>
              </button>

              {isLevelExpanded && (
                <div className="border-t border-(--border) p-3 pt-2">
                  {level.categories.map((category: TestCategory, catIdx: number) => {
                    const catResult = levelResult.categories[catIdx];
                    if (!catResult) return null;

                    const catId = `${levelId}-${category.id}`;
                    const isCatExpanded = expandedCategories.has(catId);
                    const catPercentage = Math.round((catResult.passed / catResult.total) * 100);

                    return (
                      <div key={category.id} className="mb-2 last:mb-0">
                        <button
                          type="button"
                          onClick={() => toggleCategory(catId)}
                          className="flex w-full items-center justify-between rounded-md bg-transparent p-2 text-left transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2">
                            {isCatExpanded ? (
                              <ChevronDown className="size-3" />
                            ) : (
                              <ChevronRight className="size-3" />
                            )}
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-(--muted-foreground)">
                              {`${catResult.passed}/${catResult.total}`}
                            </span>
                            <span className={`text-xs ${getPercentageClass(catPercentage)}`}>
                              {catPercentage}%
                            </span>
                          </div>
                        </button>

                        {isCatExpanded && (
                          <div className="ml-5 mt-1 flex flex-col gap-1">
                            {catResult.results.map((result) => (
                              <div
                                key={result.id}
                                className={`rounded-md p-2 text-xs ${
                                  result.passed
                                    ? 'bg-green-50 dark:bg-green-900/20'
                                    : 'bg-red-50 dark:bg-red-900/20'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {result.passed ? (
                                    <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <XCircle className="mt-0.5 size-3 shrink-0 text-red-600 dark:text-red-400" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1 break-words font-mono text-(--muted-foreground)">
                                      {result.input}
                                    </div>
                                    {!result.passed && (
                                      <div className="flex flex-col gap-1">
                                        <div className="break-words text-red-600 dark:text-red-400">
                                          <span className="font-medium">Got: </span>
                                          {result.actual}
                                        </div>
                                        <div className="break-words text-green-600 dark:text-green-400">
                                          <span className="font-medium">Expected: </span>
                                          {result.expected}
                                        </div>
                                        <div
                                          className={`mt-1 text-xs font-medium ${
                                            result.similarity >= 80
                                              ? 'text-yellow-600 dark:text-yellow-400'
                                              : result.similarity >= 50
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-red-600 dark:text-red-400'
                                          }`}
                                        >
                                          유사도: {result.similarity}%
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 pt-(--header-height) max-md:pt-[52px] sm:p-8 sm:pt-(--header-height)">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Translator Benchmark</h1>
          <p className="mb-4 text-(--muted-foreground)">
            {`Test translation accuracy across ${totalTestCount} test cases`}
          </p>

          {/* Official Metrics Display */}
          {officialMetrics && (
            <div className="mb-6 rounded-lg border border-(--border) bg-white p-4 dark:bg-gray-900">
              <h2 className="mb-3 text-lg font-semibold">Official Metrics (공식 지표)</h2>
              <p className="mb-4 text-xs text-(--muted-foreground)">
                {`Evaluated on ${officialMetrics.testCount} sentence pairs • Generated: ${new Date(officialMetrics.generatedAt).toLocaleDateString()}`}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {/* METEOR */}
                <div className="rounded-md border border-(--border) p-3 text-center">
                  <div className="mb-1 text-xs font-medium text-(--muted-foreground)">METEOR</div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {((officialMetrics.koToEn.meteor + officialMetrics.enToKo.meteor) / 2).toFixed(
                      4,
                    )}
                  </div>
                  <div className="mt-1 text-xs text-(--muted-foreground)">
                    <span>Ko→En: {officialMetrics.koToEn.meteor.toFixed(4)}</span>
                    <span className="mx-1">|</span>
                    <span>En→Ko: {officialMetrics.enToKo.meteor.toFixed(4)}</span>
                  </div>
                </div>
                {/* chrF */}
                <div className="rounded-md border border-(--border) p-3 text-center">
                  <div className="mb-1 text-xs font-medium text-(--muted-foreground)">chrF</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {((officialMetrics.koToEn.chrF + officialMetrics.enToKo.chrF) / 2).toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-(--muted-foreground)">
                    <span>Ko→En: {officialMetrics.koToEn.chrF.toFixed(2)}</span>
                    <span className="mx-1">|</span>
                    <span>En→Ko: {officialMetrics.enToKo.chrF.toFixed(2)}</span>
                  </div>
                </div>
                {/* BLEU */}
                <div className="rounded-md border border-(--border) p-3 text-center">
                  <div className="mb-1 text-xs font-medium text-(--muted-foreground)">BLEU</div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {((officialMetrics.koToEn.bleu + officialMetrics.enToKo.bleu) / 2).toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-(--muted-foreground)">
                    <span>Ko→En: {officialMetrics.koToEn.bleu.toFixed(2)}</span>
                    <span className="mx-1">|</span>
                    <span>En→Ko: {officialMetrics.enToKo.bleu.toFixed(2)}</span>
                  </div>
                </div>
                {/* TER */}
                <div className="rounded-md border border-(--border) p-3 text-center">
                  <div className="mb-1 text-xs font-medium text-(--muted-foreground)">TER ↓</div>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {((officialMetrics.koToEn.ter + officialMetrics.enToKo.ter) / 2).toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-(--muted-foreground)">
                    <span>Ko→En: {officialMetrics.koToEn.ter.toFixed(2)}</span>
                    <span className="mx-1">|</span>
                    <span>En→Ko: {officialMetrics.enToKo.ter.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-(--muted-foreground)">
                METEOR/chrF/BLEU: 높을수록 좋음 (↑) • TER: 낮을수록 좋음 (↓)
              </p>
            </div>
          )}

          {/* Algorithm Description */}
          <div className="mb-6 rounded-lg border border-blue-500/50 bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="mb-3 text-sm text-blue-700 last:mb-0 dark:text-blue-300">
              <strong className="font-bold text-blue-800 dark:text-blue-200">
                {'🔬 번역 알고리즘: '}
              </strong>
              <span>
                {
                  '형태소 분석 → 문장 구조 파싱 (주어/목적어/서술어) → 어순 변환 (SOV↔SVO) → 목표 언어 생성'
                }
              </span>
            </p>
            <p className="mb-3 text-sm text-blue-700 last:mb-0 dark:text-blue-300">
              <strong className="font-bold text-blue-800 dark:text-blue-200">
                {'📋 테스트 방식: '}
              </strong>
              <span>
                {'문장 사전 없음, 하드코딩 없음, 패턴 매칭 없음 — 100% 알고리즘 기반 번역'}
              </span>
            </p>
          </div>

          {/* Run/Stop Button */}
          <div className="mb-4 flex gap-2">
            {isLoading ? (
              <button
                type="button"
                disabled
                className="flex cursor-not-allowed items-center gap-2 rounded-lg border-none bg-gray-400 px-4 py-2 font-medium text-white"
              >
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </button>
            ) : !isRunning ? (
              <button
                type="button"
                onClick={runAllTests}
                className="flex cursor-pointer items-center gap-2 rounded-lg border-none bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
              >
                <Play className="size-4" />
                Run All Tests
              </button>
            ) : (
              <button
                type="button"
                onClick={stopTests}
                className="flex cursor-pointer items-center gap-2 rounded-lg border-none bg-red-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-red-700"
              >
                <Pause className="size-4" />
                Stop
              </button>
            )}
          </div>

          {/* Current Test Display */}
          {currentTest && (
            <div className="mb-6 rounded-lg border border-(--border) bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="mb-2 text-sm font-medium text-(--muted-foreground)">
                현재 테스트 중...
              </div>
              <div className="mb-3 rounded-md bg-white p-3 dark:bg-gray-900">
                <div className="mb-1 text-xs text-(--muted-foreground)">입력</div>
                <div className="font-mono text-sm">{currentTest.input}</div>
              </div>
              <div className="mb-3 rounded-md bg-white p-3 dark:bg-gray-900">
                <div className="mb-1 text-xs text-(--muted-foreground)">번역 결과</div>
                <div className="font-mono text-sm text-blue-600 dark:text-blue-400">
                  {currentTest.output}
                </div>
              </div>
              <div className="rounded-md bg-white p-3 dark:bg-gray-900">
                <div className="mb-1 text-xs text-(--muted-foreground)">예상 결과</div>
                <div className="font-mono text-sm text-green-600 dark:text-green-400">
                  {currentTest.expected}
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isRunning && progress.total > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-(--muted-foreground)">{progress.phase}</span>
                <span className="font-mono">
                  {`${progress.current}/${progress.total} (${Math.round((progress.current / progress.total) * 100)}%)`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-blue-600 transition-all duration-150"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Overall Stats */}
          {results.size > 0 && (
            <div className="mb-6 rounded-lg border border-(--border) bg-white p-4 dark:bg-gray-900">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{overallStats.percentage}%</div>
                  <div className="text-sm text-(--muted-foreground)">Pass Rate</div>
                  <div className="text-xs text-(--muted-foreground)">
                    {`${overallStats.passed}/${overallStats.total}`}
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold ${
                      averageSimilarity >= 80
                        ? 'text-green-600 dark:text-green-400'
                        : averageSimilarity >= 60
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {averageSimilarity}%
                  </div>
                  <div className="text-sm text-(--muted-foreground)">Avg Similarity</div>
                  <div className="text-xs text-(--muted-foreground)">문자열 유사도</div>
                </div>
              </div>
            </div>
          )}

          {/* Results by Group */}
          {testGroups.map((group) => {
            const groupResults = results.get(group.name);
            if (!groupResults || groupResults.length === 0) return null;

            const stats = calcTotalStats(groupResults);

            return (
              <div key={group.name} className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{group.name}</h2>
                  <span className={`text-sm font-medium ${getPercentageClass(stats.percentage)}`}>
                    {stats.percentage}% ({stats.passed}/{stats.total})
                  </span>
                </div>
                {renderResults(
                  group.data,
                  groupResults,
                  group.name.toLowerCase().replace(/\s+/g, '-'),
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {results.size === 0 && !isRunning && !isLoading && (
            <div className="rounded-lg border border-dashed border-(--border) p-8 text-center text-(--muted-foreground)">
              <p>Run All Tests 버튼을 클릭하여 벤치마크를 시작하세요.</p>
              <p className="mt-2 text-sm">
                각 테스트가 순차적으로 실행되며 결과를 실시간으로 확인할 수 있습니다.
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="rounded-lg border border-dashed border-(--border) p-8 text-center text-(--muted-foreground)">
              <Loader2 className="mx-auto mb-4 size-8 animate-spin" />
              <p>벤치마크 데이터 로딩 중...</p>
              <p className="mt-2 text-sm">번역기와 테스트 데이터를 불러오고 있습니다.</p>
            </div>
          )}
        </div>
      </main>
      <Footer appName="Translator Benchmark" />
    </div>
  );
}
