// ========================================
// BenchmarkRunner - 벤치마크 실행 컴포넌트
// 실행 버튼 및 진행 상태 표시
// ========================================

import { Play } from 'lucide-solid';
import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { Button } from '@/components/ui/button';
import type { BenchmarkProgress } from '../types';

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
}

export const BenchmarkRunner: Component<BenchmarkRunnerProps> = (props) => {
  return (
    <div>
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
