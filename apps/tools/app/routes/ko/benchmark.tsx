import { CheckCircle2, ChevronDown, ChevronRight, Play, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MetaFunction } from 'react-router';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import {
  antiHardcodingTests,
  categoryTests,
  contextTests,
  countTests,
  finalTests,
  levelTests,
  localizationTests,
  polysemyTests,
  professionalTranslatorTests,
  spacingErrorTests,
  type TestCase,
  type TestLevel,
  typoTests,
  uniqueTests,
  wordOrderTests,
} from '~/tools/translator/benchmark-data';
import {
  getTranslatorWorker,
  type TranslatorWorkerApi,
} from '~/tools/translator/translator-worker-api';

export const meta: MetaFunction = () => [
  { title: '벤치마크 | Tools' },
  { name: 'description', content: '번역기 성능 벤치마크.' },
];

interface TestResult {
  id: string;
  passed: boolean;
  actual: string;
  expected: string;
  input: string;
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

export default function Benchmark() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [categoryResults, setCategoryResults] = useState<LevelResult[]>([]);
  const [contextResults, setContextResults] = useState<LevelResult[]>([]);
  const [typoResults, setTypoResults] = useState<LevelResult[]>([]);
  const [uniqueResults, setUniqueResults] = useState<LevelResult[]>([]);
  const [polysemyResults, setPolysemyResults] = useState<LevelResult[]>([]);
  const [wordOrderResults, setWordOrderResults] = useState<LevelResult[]>([]);
  const [spacingResults, setSpacingResults] = useState<LevelResult[]>([]);
  const [finalResults, setFinalResults] = useState<LevelResult[]>([]);
  const [professionalResults, setProfessionalResults] = useState<LevelResult[]>([]);
  const [localizationResults, setLocalizationResults] = useState<LevelResult[]>([]);
  const [antiHardcodingResults, setAntiHardcodingResults] = useState<LevelResult[]>([]);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const workerRef = useRef<TranslatorWorkerApi | null>(null);

  // Initialize worker on mount
  useEffect(() => {
    workerRef.current = getTranslatorWorker();
    workerRef.current.init();
  }, []);

  /**
   * 영어 정규화 (비교용)
   * - 소문자 변환
   * - 관사 제거 (a, an, the)
   * - 여러 공백 → 단일 공백
   */
  const normalizeEnglish = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\b(a|an|the)\s+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  /**
   * 한국어 정규화 (비교용)
   * - 조사 변형 통일 (은/는/이/가 → 가, 을/를 → 를)
   */
  const normalizeKorean = (text: string): string => {
    return text
      .replace(/은|는|이|가/g, '가')
      .replace(/을|를/g, '를')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Run single test asynchronously using worker
  const runTest = useCallback(async (test: TestCase): Promise<TestResult> => {
    const worker = workerRef.current;
    if (!worker) {
      throw new Error('Worker not initialized');
    }

    const actual = await worker.translateAsync(test.input, test.direction);

    // 방향에 따라 적절한 정규화 적용
    let passed: boolean;
    if (test.direction === 'ko-en') {
      passed = normalizeEnglish(actual) === normalizeEnglish(test.expected);
    } else {
      passed = normalizeKorean(actual) === normalizeKorean(test.expected);
    }

    return {
      id: test.id,
      passed,
      actual,
      expected: test.expected,
      input: test.input,
    };
  }, []);

  // Async batch processing using worker
  const runLevelTestsAsync = useCallback(
    async (
      levels: TestLevel[],
      phaseName: string,
      globalProgress: { current: number; total: number },
    ): Promise<LevelResult[]> => {
      const results: LevelResult[] = [];

      for (const level of levels) {
        const categoryResults: CategoryResult[] = [];

        for (const category of level.categories) {
          const testResults: TestResult[] = [];

          for (const test of category.tests) {
            // Run test asynchronously via worker (non-blocking)
            const result = await runTest(test);
            testResults.push(result);
            globalProgress.current++;
            setProgress({ ...globalProgress, phase: phaseName });
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
        const totalTests = categoryResults.reduce((sum, c) => sum + c.total, 0);

        results.push({
          id: level.id,
          passed: totalPassed,
          total: totalTests,
          categories: categoryResults,
        });
      }

      return results;
    },
    [runTest],
  );

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setExpandedLevels(new Set());
    setExpandedCategories(new Set());

    // Calculate total test count
    const total =
      countTests(levelTests) +
      countTests(categoryTests) +
      countTests(contextTests) +
      countTests(typoTests) +
      countTests(uniqueTests) +
      countTests(polysemyTests) +
      countTests(wordOrderTests) +
      countTests(spacingErrorTests) +
      countTests(finalTests) +
      countTests(professionalTranslatorTests) +
      countTests(localizationTests) +
      countTests(antiHardcodingTests);

    const globalProgress = { current: 0, total };
    setProgress({ current: 0, total, phase: '시작 중...' });

    try {
      const levelRes = await runLevelTestsAsync(levelTests, 'Level 테스트', globalProgress);
      setLevelResults(levelRes);

      const catRes = await runLevelTestsAsync(categoryTests, 'Category 테스트', globalProgress);
      setCategoryResults(catRes);

      const ctxRes = await runLevelTestsAsync(contextTests, 'Context 테스트', globalProgress);
      setContextResults(ctxRes);

      const typoRes = await runLevelTestsAsync(typoTests, 'Typo 테스트', globalProgress);
      setTypoResults(typoRes);

      const uniqueRes = await runLevelTestsAsync(uniqueTests, 'Unique 테스트', globalProgress);
      setUniqueResults(uniqueRes);

      const polysemyRes = await runLevelTestsAsync(
        polysemyTests,
        'Polysemy 테스트',
        globalProgress,
      );
      setPolysemyResults(polysemyRes);

      const wordOrderRes = await runLevelTestsAsync(
        wordOrderTests,
        'Word Order 테스트',
        globalProgress,
      );
      setWordOrderResults(wordOrderRes);

      const spacingRes = await runLevelTestsAsync(
        spacingErrorTests,
        'Spacing 테스트',
        globalProgress,
      );
      setSpacingResults(spacingRes);

      const finalRes = await runLevelTestsAsync(finalTests, 'Final 테스트', globalProgress);
      setFinalResults(finalRes);

      const professionalRes = await runLevelTestsAsync(
        professionalTranslatorTests,
        'Professional 테스트',
        globalProgress,
      );
      setProfessionalResults(professionalRes);

      const localizationRes = await runLevelTestsAsync(
        localizationTests,
        'Localization 테스트',
        globalProgress,
      );
      setLocalizationResults(localizationRes);

      const antiHardcodingRes = await runLevelTestsAsync(
        antiHardcodingTests,
        'Anti-Hardcoding 테스트',
        globalProgress,
      );
      setAntiHardcodingResults(antiHardcodingRes);
    } finally {
      setIsRunning(false);
      setProgress({ current: 0, total: 0, phase: '' });
    }
  }, [runLevelTestsAsync]);

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

  const calcTotalStats = (results: LevelResult[]) => {
    const total = results.reduce((sum, r) => sum + r.total, 0);
    const passed = results.reduce((sum, r) => sum + r.passed, 0);
    return { total, passed, percentage: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  const levelStats = calcTotalStats(levelResults);
  const categoryStats = calcTotalStats(categoryResults);
  const contextStats = calcTotalStats(contextResults);
  const typoStats = calcTotalStats(typoResults);
  const uniqueStats = calcTotalStats(uniqueResults);
  const polysemyStats = calcTotalStats(polysemyResults);
  const wordOrderStats = calcTotalStats(wordOrderResults);
  const spacingStats = calcTotalStats(spacingResults);
  const finalStats = calcTotalStats(finalResults);
  const professionalStats = calcTotalStats(professionalResults);
  const localizationStats = calcTotalStats(localizationResults);
  const antiHardcodingStats = calcTotalStats(antiHardcodingResults);

  const allStats = [
    levelStats,
    categoryStats,
    contextStats,
    typoStats,
    uniqueStats,
    polysemyStats,
    wordOrderStats,
    spacingStats,
    finalStats,
    professionalStats,
    localizationStats,
    antiHardcodingStats,
  ];
  const totalStats = {
    total: allStats.reduce((sum, s) => sum + s.total, 0),
    passed: allStats.reduce((sum, s) => sum + s.passed, 0),
    percentage:
      allStats.reduce((sum, s) => sum + s.total, 0) > 0
        ? Math.round(
            (allStats.reduce((sum, s) => sum + s.passed, 0) /
              allStats.reduce((sum, s) => sum + s.total, 0)) *
              100,
          )
        : 0,
  };

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

  const renderResults = (levels: TestLevel[], results: LevelResult[], prefix: string) => {
    if (results.length === 0) return null;

    return (
      <div className="flex flex-col gap-2">
        {levels.map((level, levelIdx) => {
          const levelResult = results[levelIdx];
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
                    {levelResult.passed}/{levelResult.total}
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
                  {level.categories.map((category, catIdx) => {
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
                              {catResult.passed}/{catResult.total}
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

  const totalTestCount =
    countTests(levelTests) +
    countTests(categoryTests) +
    countTests(contextTests) +
    countTests(typoTests) +
    countTests(uniqueTests) +
    countTests(polysemyTests) +
    countTests(wordOrderTests) +
    countTests(spacingErrorTests) +
    countTests(finalTests) +
    countTests(professionalTranslatorTests) +
    countTests(localizationTests) +
    countTests(antiHardcodingTests);

  const statsData = [
    { label: '전체', stats: totalStats },
    { label: 'Level', stats: levelStats },
    { label: 'Category', stats: categoryStats },
    { label: 'Context', stats: contextStats },
    { label: 'Typo', stats: typoStats },
    { label: 'Unique', stats: uniqueStats },
    { label: 'Polysemy', stats: polysemyStats },
    { label: 'SVO↔SOV', stats: wordOrderStats },
    { label: 'Spacing', stats: spacingStats },
    { label: 'Final', stats: finalStats },
    { label: 'Professional', stats: professionalStats },
    { label: 'Localization', stats: localizationStats },
    { label: 'Anti-Hardcode', stats: antiHardcodingStats },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">번역기 벤치마크</h1>
          <p className="mb-4 text-(--muted-foreground)">
            {totalTestCount}개의 테스트 케이스로 번역 정확도 측정
          </p>

          {/* Algorithm Description */}
          <div className="mb-6 rounded-lg border border-blue-500/50 bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="mb-3 text-sm text-blue-700 last:mb-0 dark:text-blue-300">
              <strong className="font-bold text-blue-800 dark:text-blue-200">
                🔬 번역 알고리즘:
              </strong>{' '}
              형태소 분석 → 문장 구조 파싱 (주어/목적어/서술어) → 어순 변환 (SOV↔SVO) → 목표 언어
              생성
            </p>
            <p className="mb-3 text-sm text-blue-700 last:mb-0 dark:text-blue-300">
              <strong className="font-bold text-blue-800 dark:text-blue-200">
                📋 테스트 방식:
              </strong>{' '}
              문장 사전 없음, 하드코딩 없음, 패턴 매칭 없음 — 100% 알고리즘 기반 번역
            </p>
          </div>

          {/* Run Button */}
          <button
            type="button"
            onClick={runAllTests}
            disabled={isRunning}
            className="mb-4 flex cursor-pointer items-center gap-2 rounded-lg border-none bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="size-4" />
            {isRunning ? '실행 중...' : '전체 테스트 실행'}
          </button>

          {/* Progress Bar */}
          {isRunning && progress.total > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-(--muted-foreground)">{progress.phase}</span>
                <span className="font-mono">
                  {progress.current}/{progress.total} (
                  {Math.round((progress.current / progress.total) * 100)}%)
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
          {levelResults.length > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {statsData.map(({ label, stats }) => (
                <div key={label} className="rounded-lg border border-(--border) p-4 text-center">
                  <div className="text-2xl font-bold">{stats.percentage}%</div>
                  <div className="text-sm text-(--muted-foreground)">{label}</div>
                  <div className="text-xs text-(--muted-foreground)">
                    {stats.passed}/{stats.total}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Level Tests */}
          {levelResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Level Tests</h2>
              {renderResults(levelTests, levelResults, 'level')}
            </div>
          )}

          {/* Category Tests */}
          {categoryResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Category Tests</h2>
              {renderResults(categoryTests, categoryResults, 'category')}
            </div>
          )}

          {/* Context Tests */}
          {contextResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Context Tests</h2>
              {renderResults(contextTests, contextResults, 'context')}
            </div>
          )}

          {/* Typo Tests */}
          {typoResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Typo Tests (오타 테스트)</h2>
              {renderResults(typoTests, typoResults, 'typo')}
            </div>
          )}

          {/* Unique Tests */}
          {uniqueResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">
                Unique Tests (유니크 테스트 - 100% 알고리즘 기반)
              </h2>
              {renderResults(uniqueTests, uniqueResults, 'unique')}
            </div>
          )}

          {/* Polysemy Tests */}
          {polysemyResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Polysemy Tests (다의어 테스트)</h2>
              {renderResults(polysemyTests, polysemyResults, 'polysemy')}
            </div>
          )}

          {/* Word Order Tests */}
          {wordOrderResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">
                Word Order Tests (SVO↔SOV 어순 변환 테스트)
              </h2>
              {renderResults(wordOrderTests, wordOrderResults, 'wordorder')}
            </div>
          )}

          {/* Spacing Error Tests */}
          {spacingResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">
                Spacing Error Tests (띄어쓰기 오류 테스트)
              </h2>
              {renderResults(spacingErrorTests, spacingResults, 'spacing')}
            </div>
          )}

          {/* Final Tests */}
          {finalResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Final Tests (최종 파이널 테스트)</h2>
              {renderResults(finalTests, finalResults, 'final')}
            </div>
          )}

          {/* Professional Translator Tests */}
          {professionalResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">
                Professional Translator Tests (전문 번역가 테스트)
              </h2>
              {renderResults(professionalTranslatorTests, professionalResults, 'professional')}
            </div>
          )}

          {/* Localization Tests */}
          {localizationResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">
                Localization Tests (의역/문화적 번역 테스트)
              </h2>
              {renderResults(localizationTests, localizationResults, 'localization')}
            </div>
          )}

          {/* Anti-Hardcoding Tests */}
          {antiHardcodingResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">
                Anti-Hardcoding Tests (안티하드코딩 알고리즘 테스트)
              </h2>
              {renderResults(antiHardcodingTests, antiHardcodingResults, 'antihardcoding')}
            </div>
          )}

          {/* Initial State */}
          {levelResults.length === 0 && !isRunning && (
            <div className="rounded-lg border border-dashed border-(--border) p-8 text-center text-(--muted-foreground)">
              "전체 테스트 실행" 버튼을 클릭하세요
            </div>
          )}
        </div>
      </main>
      <Footer appName="번역기 벤치마크" />
    </div>
  );
}
