// ========================================
// CriteriaScoreDisplay - 기준별 점수 표시
// 평가 항목별 점수 바 표시
// ========================================

import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import { type CriteriaScore, getScoreBarColor, getScoreColor } from '../types';

interface CriteriaScoreItemProps {
  criteria: CriteriaScore;
}

const CriteriaScoreItem: Component<CriteriaScoreItemProps> = (props) => (
  <div class="flex items-center justify-between text-sm">
    <div class="flex items-center gap-2">
      <span>{props.criteria.label}</span>
      <Show when={props.criteria.weight}>
        <span class="text-xs text-muted-foreground">({props.criteria.weight})</span>
      </Show>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-24 bg-muted rounded-full h-2">
        <div
          class="h-2 rounded-full"
          style={{
            width: `${(props.criteria.score / props.criteria.maxScore) * 100}%`,
            'background-color': getScoreBarColor(props.criteria.score, props.criteria.maxScore),
          }}
        />
      </div>
      <span
        class={`font-medium w-10 text-right ${getScoreColor(props.criteria.score, props.criteria.maxScore)}`}
      >
        {props.criteria.score.toFixed(2)}
      </span>
    </div>
  </div>
);

interface CriteriaScoreListProps {
  title?: string;
  criteria: CriteriaScore[];
}

export const CriteriaScoreList: Component<CriteriaScoreListProps> = (props) => {
  return (
    <div>
      <Show when={props.title}>
        <h3 class="font-medium mb-3">{props.title}</h3>
      </Show>
      <div class="space-y-2 bg-muted/30 rounded-lg p-3">
        <For each={props.criteria}>{(criteria) => <CriteriaScoreItem criteria={criteria} />}</For>
      </div>
    </div>
  );
};

export { CriteriaScoreItem };
