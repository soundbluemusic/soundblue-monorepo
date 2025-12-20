// ========================================
// BenchmarkSelector - 벤치마크 선택 탭
// 도구별 벤치마크 탭 네비게이션
// ========================================

import type { Component } from 'solid-js';
import { For } from 'solid-js';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { BenchmarkDefinition } from '../types';

interface BenchmarkSelectorProps {
  benchmarks: BenchmarkDefinition<unknown>[];
  selected: string;
  onSelect: (id: string) => void;
  locale: string;
}

export const BenchmarkSelector: Component<BenchmarkSelectorProps> = (props) => {
  return (
    <Tabs value={props.selected} onChange={props.onSelect}>
      <TabsList class="flex-wrap">
        <For each={props.benchmarks}>
          {(benchmark) => (
            <TabsTrigger value={benchmark.id}>
              <benchmark.icon class="h-4 w-4 mr-2" />
              {props.locale === 'ko' ? benchmark.name.ko : benchmark.name.en}
            </TabsTrigger>
          )}
        </For>
      </TabsList>
    </Tabs>
  );
};
