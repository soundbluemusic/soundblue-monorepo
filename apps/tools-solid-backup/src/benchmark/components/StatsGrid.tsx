// ========================================
// StatsGrid - 통계 그리드 컴포넌트
// 통과율, 테스트 수, 실행 시간 등 표시
// ========================================

import type { Component } from 'solid-js';
import { For } from 'solid-js';
import type { StatItem } from '../types';

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export const StatsGrid: Component<StatsGridProps> = (props) => {
  const gridCols = () => {
    switch (props.columns ?? 3) {
      case 2:
        return 'grid-cols-2';
      case 4:
        return 'grid-cols-4';
      default:
        return 'grid-cols-3';
    }
  };

  return (
    <div class={`grid ${gridCols()} gap-4`}>
      <For each={props.stats}>
        {(stat) => (
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold">{stat.value}</div>
            <div class="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        )}
      </For>
    </div>
  );
};
