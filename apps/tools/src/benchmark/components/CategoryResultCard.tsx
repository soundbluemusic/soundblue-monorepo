// ========================================
// CategoryResultCard - 카테고리 결과 카드
// 카테고리별 테스트 결과 접기/펼치기
// ========================================

import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-solid';
import type { Component } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import { type CategoryResultData, getScoreColor } from '../types';

interface CategoryResultCardProps {
  category: CategoryResultData;
}

export const CategoryResultCard: Component<CategoryResultCardProps> = (props) => {
  const [expanded, setExpanded] = createSignal(false);

  const statusIcon = () => {
    const ratio = props.category.averageScore / props.category.maxScore;
    if (ratio >= 0.76) return <CheckCircle class="h-4 w-4 text-green-500" />;
    if (ratio >= 0.6) return <AlertTriangle class="h-4 w-4 text-yellow-500" />;
    return <XCircle class="h-4 w-4 text-red-500" />;
  };

  return (
    <div class="rounded-lg border bg-card p-3">
      <button
        type="button"
        class="w-full flex items-center justify-between"
        onClick={() => setExpanded(!expanded())}
      >
        <div class="flex items-center gap-2">
          {statusIcon()}
          <span class="font-medium text-sm">
            {props.category.id}: {props.category.name}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span
            class={`font-bold ${getScoreColor(props.category.averageScore, props.category.maxScore)}`}
          >
            {props.category.averageScore.toFixed(2)}
          </span>
          <span class="text-xs text-muted-foreground">
            {props.category.passedCount}/{props.category.totalCount}
          </span>
          <Show when={expanded()} fallback={<ChevronDown class="h-4 w-4" />}>
            <ChevronUp class="h-4 w-4" />
          </Show>
        </div>
      </button>

      <Show when={expanded() && props.category.details}>
        <div class="mt-3 pt-3 border-t space-y-2">
          <For each={props.category.details}>
            {(detail) => (
              <div class="text-xs bg-muted/50 rounded p-2">
                <div class="flex justify-between mb-1">
                  <span class="font-medium">{detail.id}</span>
                  <span class={getScoreColor(detail.score, detail.maxScore)}>
                    {detail.score.toFixed(2)}/{detail.maxScore}
                  </span>
                </div>
                <div class="text-muted-foreground truncate mb-1">입력: {detail.input}</div>
                <div class="text-muted-foreground truncate mb-1">결과: {detail.output}</div>
                <Show when={detail.feedback}>
                  <div class="text-yellow-600 dark:text-yellow-400">{detail.feedback}</div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
