// ========================================
// TranslatorBenchmarkResult - 번역기 벤치마크 결과 컴포넌트
// 번역기 품질 테스트 결과 표시
// ========================================

import { ChevronDown, ChevronUp } from 'lucide-solid';
import type { Component } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import { CriteriaScoreList, ImprovementsList, ScoreCard, StatsGrid } from '~/benchmark/components';
import type { CategoryResultData, CriteriaScore, ScoreData, StatItem } from '~/benchmark/types';
import { getScoreColor } from '~/benchmark/types';
import type { BenchmarkReport, CategoryResult } from './types';

interface TranslatorBenchmarkResultProps {
  report: BenchmarkReport;
  locale: string;
}

/**
 * 카테고리 결과 카드 (번역기 전용)
 */
const TranslatorCategoryCard: Component<{
  category: CategoryResult;
  locale: string;
}> = (props) => {
  const [expanded, setExpanded] = createSignal(false);

  const statusClass = () => {
    if (props.category.averageScore >= 3.8) return 'text-green-500';
    if (props.category.averageScore >= 3.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div class="rounded-lg border bg-card p-3">
      <button
        type="button"
        class="w-full flex items-center justify-between"
        onClick={() => setExpanded(!expanded())}
      >
        <div class="flex items-center gap-2">
          <div class={`w-2 h-2 rounded-full ${statusClass()} bg-current`} />
          <span class="font-medium text-sm">
            {props.category.categoryId}:{' '}
            {props.locale === 'ko' ? props.category.name.ko : props.category.name.en}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span class={`font-bold ${getScoreColor(props.category.averageScore, 5)}`}>
            {props.category.averageScore.toFixed(2)}
          </span>
          <span class="text-xs text-muted-foreground">
            {props.category.passedTests}/{props.category.totalTests}
          </span>
          <Show when={expanded()} fallback={<ChevronDown class="h-4 w-4" />}>
            <ChevronUp class="h-4 w-4" />
          </Show>
        </div>
      </button>

      <Show when={expanded()}>
        <div class="mt-3 pt-3 border-t space-y-2">
          <For each={props.category.results}>
            {(result) => (
              <div class="text-xs bg-muted/50 rounded p-2">
                <div class="flex justify-between mb-1">
                  <span class="font-medium">{result.testCase.id}</span>
                  <span class={getScoreColor(result.score, 5)}>{result.score.toFixed(2)}/5</span>
                </div>
                <div class="text-muted-foreground truncate mb-1">
                  {props.locale === 'ko' ? '입력' : 'Input'}: {result.testCase.input}
                </div>
                <div class="text-muted-foreground truncate mb-1">
                  {props.locale === 'ko' ? '결과' : 'Output'}: {result.actualOutput}
                </div>
                <Show when={result.feedback.length > 0}>
                  <div class="text-yellow-600 dark:text-yellow-400">{result.feedback[0]}</div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export const TranslatorBenchmarkResult: Component<TranslatorBenchmarkResultProps> = (props) => {
  const [showDetails, setShowDetails] = createSignal(false);
  const isKorean = () => props.locale === 'ko';

  // Convert to common types
  const scoreData = (): ScoreData => ({
    grade: props.report.grade,
    score: props.report.overallScore,
    maxScore: 5,
    passRate: props.report.overallPassRate,
    passed: props.report.passed,
  });

  const stats = (): StatItem[] => [
    {
      label: isKorean() ? '통과율' : 'Pass Rate',
      value: `${props.report.overallPassRate.toFixed(1)}%`,
    },
    {
      label: isKorean() ? '테스트 수' : 'Tests',
      value: `${props.report.totalPassed}/${props.report.totalTests}`,
    },
    {
      label: isKorean() ? '실행 시간' : 'Time',
      value: `${props.report.totalExecutionTime}ms`,
    },
  ];

  const criteriaScores = (): CriteriaScore[] => [
    {
      label: isKorean() ? '정확성' : 'Accuracy',
      score: props.report.criteriaAverages.accuracy,
      maxScore: 5,
      weight: '25%',
    },
    {
      label: isKorean() ? '유창성' : 'Fluency',
      score: props.report.criteriaAverages.fluency,
      maxScore: 5,
      weight: '20%',
    },
    {
      label: isKorean() ? '문맥 이해' : 'Context',
      score: props.report.criteriaAverages.context,
      maxScore: 5,
      weight: '15%',
    },
    {
      label: isKorean() ? '문화적 적절성' : 'Cultural',
      score: props.report.criteriaAverages.cultural,
      maxScore: 5,
      weight: '15%',
    },
    {
      label: isKorean() ? '일관성' : 'Consistency',
      score: props.report.criteriaAverages.consistency,
      maxScore: 5,
      weight: '10%',
    },
    {
      label: isKorean() ? '톤 보존' : 'Tone',
      score: props.report.criteriaAverages.tone,
      maxScore: 5,
      weight: '10%',
    },
    {
      label: isKorean() ? '전문성' : 'Domain',
      score: props.report.criteriaAverages.domain,
      maxScore: 5,
      weight: '5%',
    },
  ];

  return (
    <div class="space-y-6">
      {/* Test Complete Message */}
      <div class="text-sm text-muted-foreground">
        {isKorean() ? '테스트 완료' : 'Test Complete'}
      </div>

      {/* Score Card */}
      <ScoreCard
        data={scoreData()}
        gradeLabel={isKorean() ? '등급' : 'Grade'}
        passLabel={{
          passed: isKorean()
            ? '합격 (평균 3.8+ & 통과율 85%+)'
            : 'PASSED (Avg 3.8+ & Pass Rate 85%+)',
          failed: isKorean() ? '불합격 (기준 미달)' : 'FAILED (Below criteria)',
        }}
      />

      {/* Stats Grid */}
      <StatsGrid stats={stats()} columns={3} />

      {/* Criteria Scores */}
      <CriteriaScoreList
        title={isKorean() ? '평가 항목별 점수' : 'Criteria Scores'}
        criteria={criteriaScores()}
      />

      {/* Improvements */}
      <ImprovementsList
        title={isKorean() ? '개선 제안' : 'Improvements'}
        improvements={props.report.improvements}
      />

      {/* Category Results Toggle */}
      <button
        type="button"
        class="flex items-center gap-2 text-sm text-primary hover:underline"
        onClick={() => setShowDetails(!showDetails())}
      >
        <Show when={showDetails()} fallback={<ChevronDown class="h-4 w-4" />}>
          <ChevronUp class="h-4 w-4" />
        </Show>
        {showDetails()
          ? isKorean()
            ? '상세 결과 숨기기'
            : 'Hide Details'
          : isKorean()
            ? '상세 결과 보기'
            : 'View Details'}
      </button>

      {/* Category Details */}
      <Show when={showDetails()}>
        <div class="space-y-2">
          <h3 class="font-medium">{isKorean() ? '카테고리별 결과' : 'Category Results'}</h3>
          <For each={props.report.categories}>
            {(category) => <TranslatorCategoryCard category={category} locale={props.locale} />}
          </For>
        </div>
      </Show>
    </div>
  );
};
