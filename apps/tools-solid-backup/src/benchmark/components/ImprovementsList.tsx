// ========================================
// ImprovementsList - 개선 제안 목록
// 벤치마크 결과 기반 개선점 표시
// ========================================

import { AlertTriangle } from 'lucide-solid';
import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';

interface ImprovementsListProps {
  title?: string;
  improvements: string[];
}

export const ImprovementsList: Component<ImprovementsListProps> = (props) => {
  return (
    <Show when={props.improvements.length > 0}>
      <div>
        <Show when={props.title}>
          <h3 class="font-medium mb-3">{props.title}</h3>
        </Show>
        <ul class="space-y-1 text-sm">
          <For each={props.improvements}>
            {(improvement) => (
              <li class="flex items-start gap-2 text-muted-foreground">
                <AlertTriangle class="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                {improvement}
              </li>
            )}
          </For>
        </ul>
      </div>
    </Show>
  );
};
