// ========================================
// BenchmarkRunner - 벤치마크 실행 컴포넌트
// 실행 버튼 및 진행 상태 표시
// ========================================

import { Play } from 'lucide-solid';
import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import type { BenchmarkProgress, DirectionFilter, DirectionTestCounts } from '../types';

interface BenchmarkRunnerProps {
  onRunFull: () => void;
  onRunQuick?: () => void;
  isRunning: boolean;
  progress: BenchmarkProgress | null;
  labels: {
    runFull: string;
    runQuick: string;
    running: string;
  };
  /** 방향 필터 지원 여부 */
  supportsDirection?: boolean;
  /** 현재 선택된 방향 */
  direction?: DirectionFilter;
  /** 방향 변경 핸들러 */
  onDirectionChange?: (direction: DirectionFilter) => void;
  /** 방향별 테스트 수 */
  directionCounts?: DirectionTestCounts;
  /** 방향 라벨 */
  directionLabels?: {
    all: string;
    'ko-en': string;
    'en-ko': string;
  };
}

export const BenchmarkRunner: Component<BenchmarkRunnerProps> = (props) => {
  const directions: DirectionFilter[] = ['all', 'ko-en', 'en-ko'];

  const getDirectionLabel = (dir: DirectionFilter) => {
    if (!props.directionLabels) {
      return dir === 'all' ? '전체' : dir === 'ko-en' ? '한→영' : '영→한';
    }
    return props.directionLabels[dir];
  };

  const getDirectionCount = (dir: DirectionFilter) => {
    if (!props.directionCounts) return null;
    return props.directionCounts[dir];
  };

  return (
    <div>
      {/* Direction Filter Tabs */}
      <Show when={props.supportsDirection && props.onDirectionChange}>
        <div class="mb-4">
          <div class="text-sm font-medium text-muted-foreground mb-2">
            {props.directionLabels ? '번역 방향' : 'Translation Direction'}
          </div>
          <div class="inline-flex rounded-lg border bg-muted/30 p-1">
            <For each={directions}>
              {(dir) => (
                <button
                  type="button"
                  class={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    props.direction === dir
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  onClick={() => props.onDirectionChange?.(dir)}
                  disabled={props.isRunning}
                >
                  {getDirectionLabel(dir)}
                  <Show when={getDirectionCount(dir) !== null}>
                    <span class="ml-1.5 text-xs opacity-70">({getDirectionCount(dir)})</span>
                  </Show>
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Buttons */}
      <div class="flex gap-3 mb-4">
        <Show when={props.onRunQuick}>
          <Button onClick={props.onRunQuick} disabled={props.isRunning} variant="outline">
            <Play class="h-4 w-4 mr-2" />
            {props.labels.runQuick}
          </Button>
        </Show>
        <Button onClick={props.onRunFull} disabled={props.isRunning}>
          <Play class="h-4 w-4 mr-2" />
          {props.labels.runFull}
        </Button>
      </div>

      {/* Progress */}
      <Show when={props.isRunning && props.progress}>
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span>{props.labels.running}</span>
            <span>{props.progress!.percentage}%</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2">
            <div
              class="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${props.progress!.percentage}%` }}
            />
          </div>
          <Show when={props.progress!.message}>
            <div class="text-xs text-muted-foreground mt-1">
              {props.progress!.current}/{props.progress!.total} - {props.progress!.message}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
