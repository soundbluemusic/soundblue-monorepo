// ========================================
// ScoreCard - 점수 카드 컴포넌트
// 등급, 점수, 합격 여부 표시
// ========================================

import { CheckCircle, XCircle } from 'lucide-solid';
import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { getGradeColor, getScoreBarColor, getScoreColor, type ScoreData } from '../types';

interface ScoreCardProps {
  data: ScoreData;
  passLabel?: { passed: string; failed: string };
  gradeLabel?: string;
}

export const ScoreCard: Component<ScoreCardProps> = (props) => {
  return (
    <div class="space-y-4">
      {/* Grade and Score */}
      <div class="flex items-center gap-6">
        <div class="text-center">
          <div class={`text-5xl font-bold ${getGradeColor(props.data.grade)}`}>
            {props.data.grade}
          </div>
          <Show when={props.gradeLabel}>
            <div class="text-xs text-muted-foreground mt-1">{props.gradeLabel}</div>
          </Show>
        </div>
        <div class="flex-1">
          <div class="flex items-end gap-2 mb-2">
            <span
              class={`text-4xl font-bold ${getScoreColor(props.data.score, props.data.maxScore)}`}
            >
              {props.data.score.toFixed(2)}
            </span>
            <span class="text-muted-foreground text-lg mb-1">
              / {props.data.maxScore.toFixed(2)}
            </span>
          </div>
          <div class="w-full bg-muted rounded-full h-3">
            <div
              class="h-3 rounded-full transition-all"
              style={{
                width: `${(props.data.score / props.data.maxScore) * 100}%`,
                'background-color': getScoreBarColor(props.data.score, props.data.maxScore),
              }}
            />
          </div>
        </div>
      </div>

      {/* Pass/Fail Status */}
      <Show when={props.passLabel}>
        <div class={`p-3 rounded-lg ${props.data.passed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <div class="flex items-center gap-2">
            <Show when={props.data.passed} fallback={<XCircle class="h-5 w-5 text-red-500" />}>
              <CheckCircle class="h-5 w-5 text-green-500" />
            </Show>
            <span
              class={
                props.data.passed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }
            >
              {props.data.passed ? props.passLabel!.passed : props.passLabel!.failed}
            </span>
          </div>
        </div>
      </Show>
    </div>
  );
};
