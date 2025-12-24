import { CheckCircle2, ChevronDown, ChevronRight, Play, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { MetaFunction } from 'react-router';
import { cn } from '~/lib/utils';
import {
  categoryTests,
  countTests,
  levelTests,
  type TestCase,
  type TestLevel,
} from '~/tools/translator/benchmark-data';
import { translate } from '~/tools/translator/translator-service';

export const meta: MetaFunction = () => [
  { title: 'Benchmark | Tools' },
  { name: 'description', content: 'Translator performance benchmark.' },
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
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [categoryResults, setCategoryResults] = useState<LevelResult[]>([]);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const runTest = useCallback((test: TestCase): TestResult => {
    const actual = translate(test.input, test.direction);
    const passed = actual === test.expected;
    return {
      id: test.id,
      passed,
      actual,
      expected: test.expected,
      input: test.input,
    };
  }, []);

  const runLevelTests = useCallback(
    (levels: TestLevel[]): LevelResult[] => {
      return levels.map((level) => {
        const categoryResults: CategoryResult[] = level.categories.map((category) => {
          const results = category.tests.map(runTest);
          const passed = results.filter((r) => r.passed).length;
          return {
            id: category.id,
            passed,
            total: results.length,
            results,
          };
        });

        const totalPassed = categoryResults.reduce((sum, c) => sum + c.passed, 0);
        const totalTests = categoryResults.reduce((sum, c) => sum + c.total, 0);

        return {
          id: level.id,
          passed: totalPassed,
          total: totalTests,
          categories: categoryResults,
        };
      });
    },
    [runTest],
  );

  const runAllTests = useCallback(() => {
    setIsRunning(true);
    setExpandedLevels(new Set());
    setExpandedCategories(new Set());

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const levelRes = runLevelTests(levelTests);
      const catRes = runLevelTests(categoryTests);

      setLevelResults(levelRes);
      setCategoryResults(catRes);
      setIsRunning(false);
    }, 50);
  }, [runLevelTests]);

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
  const totalStats = {
    total: levelStats.total + categoryStats.total,
    passed: levelStats.passed + categoryStats.passed,
    percentage:
      levelStats.total + categoryStats.total > 0
        ? Math.round(
            ((levelStats.passed + categoryStats.passed) /
              (levelStats.total + categoryStats.total)) *
              100,
          )
        : 0,
  };

  const renderResults = (levels: TestLevel[], results: LevelResult[], prefix: string) => {
    if (results.length === 0) return null;

    return (
      <div className="space-y-2">
        {levels.map((level, levelIdx) => {
          const levelResult = results[levelIdx];
          if (!levelResult) return null;

          const levelId = `${prefix}-${level.id}`;
          const isLevelExpanded = expandedLevels.has(levelId);
          const levelPercentage = Math.round((levelResult.passed / levelResult.total) * 100);

          return (
            <div key={level.id} className="rounded-lg border border-border">
              <button
                type="button"
                onClick={() => toggleLevel(levelId)}
                className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {isLevelExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-medium">{level.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {levelResult.passed}/{levelResult.total}
                  </span>
                  <div
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      levelPercentage === 100
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : levelPercentage >= 50
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    )}
                  >
                    {levelPercentage}%
                  </div>
                </div>
              </button>

              {isLevelExpanded && (
                <div className="border-t border-border p-3 pt-2">
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
                          className="flex w-full items-center justify-between rounded-md p-2 text-left hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            {isCatExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {catResult.passed}/{catResult.total}
                            </span>
                            <span
                              className={cn(
                                'text-xs',
                                catPercentage === 100
                                  ? 'text-green-600 dark:text-green-400'
                                  : catPercentage >= 50
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-red-600 dark:text-red-400',
                              )}
                            >
                              {catPercentage}%
                            </span>
                          </div>
                        </button>

                        {isCatExpanded && (
                          <div className="ml-5 mt-1 space-y-1">
                            {catResult.results.map((result) => (
                              <div
                                key={result.id}
                                className={cn(
                                  'rounded-md p-2 text-xs',
                                  result.passed
                                    ? 'bg-green-50 dark:bg-green-900/20'
                                    : 'bg-red-50 dark:bg-red-900/20',
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  {result.passed ? (
                                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-red-600 dark:text-red-400" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1 truncate font-mono text-muted-foreground">
                                      {result.input.slice(0, 50)}...
                                    </div>
                                    {!result.passed && (
                                      <div className="space-y-1">
                                        <div className="text-red-600 dark:text-red-400">
                                          <span className="font-medium">Got: </span>
                                          {result.actual.slice(0, 100)}...
                                        </div>
                                        <div className="text-green-600 dark:text-green-400">
                                          <span className="font-medium">Expected: </span>
                                          {result.expected.slice(0, 100)}...
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

  const totalTestCount = countTests(levelTests) + countTests(categoryTests);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Translator Benchmark</h1>
        <p className="mb-6 text-muted-foreground">
          Test translation accuracy across {totalTestCount} test cases
        </p>

        {/* Run Button */}
        <button
          type="button"
          onClick={runAllTests}
          disabled={isRunning}
          className={cn(
            'mb-6 flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors',
            'bg-blue-600 text-white hover:bg-blue-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Running...' : 'Run All Tests'}
        </button>

        {/* Overall Stats */}
        {levelResults.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold">{totalStats.percentage}%</div>
              <div className="text-sm text-muted-foreground">Overall</div>
              <div className="text-xs text-muted-foreground">
                {totalStats.passed}/{totalStats.total}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold">{levelStats.percentage}%</div>
              <div className="text-sm text-muted-foreground">Level Tests</div>
              <div className="text-xs text-muted-foreground">
                {levelStats.passed}/{levelStats.total}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <div className="text-2xl font-bold">{categoryStats.percentage}%</div>
              <div className="text-sm text-muted-foreground">Category Tests</div>
              <div className="text-xs text-muted-foreground">
                {categoryStats.passed}/{categoryStats.total}
              </div>
            </div>
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

        {/* Initial State */}
        {levelResults.length === 0 && !isRunning && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            Click "Run All Tests" to start the benchmark
          </div>
        )}
      </div>
    </div>
  );
}
