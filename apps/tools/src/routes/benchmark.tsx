// ========================================
// Benchmark Page - 벤치마크 페이지
// 도구별 품질 테스트 대시보드
// ========================================

import { Link, Meta, Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { Activity, Clock } from 'lucide-solid';
import { type Component, createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { Dynamic, isServer } from 'solid-js/web';
import {
  type BenchmarkDefinition,
  type BenchmarkProgress,
  BenchmarkRunner,
  BenchmarkSelector,
  type DirectionFilter,
  getAllBenchmarks,
} from '~/benchmark';
import { Footer } from '@soundblue/shared';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar';
import { useLanguage } from '~/i18n';
import { cn } from '~/lib/utils';
import { toolActions, toolStore } from '~/stores/tool-store';

// 벤치마크 등록을 위해 import (side effect)
import '~/tools/translator/benchmark';

const SITE_URL = 'https://tools.soundbluemusic.com';

/**
 * 벤치마크 콘텐츠 영역
 */
const BenchmarkContent: Component<{
  benchmark: BenchmarkDefinition<unknown>;
  locale: string;
}> = (props) => {
  const [isRunning, setIsRunning] = createSignal(false);
  const [progress, setProgress] = createSignal<BenchmarkProgress | null>(null);
  const [report, setReport] = createSignal<unknown>(null);
  const [direction, setDirection] = createSignal<DirectionFilter>('all');

  const isKorean = () => props.locale === 'ko';

  // 방향별 테스트 수
  const directionCounts = () => props.benchmark.getDirectionCounts?.();

  const handleRunBenchmark = (quick: boolean) => {
    setIsRunning(true);
    setReport(null);
    setProgress(null);

    // 비동기로 실행 (UI 블로킹 방지)
    setTimeout(() => {
      const runFn =
        quick && props.benchmark.runQuick ? props.benchmark.runQuick : props.benchmark.run;
      const result = runFn((p) => setProgress(p), direction());
      setReport(result);
      setIsRunning(false);
    }, 100);
  };

  const toolUrl = () =>
    props.benchmark.toolId
      ? isKorean()
        ? `/ko/${props.benchmark.toolId}`
        : `/${props.benchmark.toolId}`
      : null;

  return (
    <div class="rounded-lg border bg-card p-6">
      {/* Benchmark Header */}
      <div class="flex items-center gap-3 mb-4">
        <props.benchmark.icon class="h-6 w-6 text-brand" />
        <h2 class="font-semibold text-lg">
          <Show
            when={toolUrl()}
            fallback={isKorean() ? props.benchmark.name.ko : props.benchmark.name.en}
          >
            <A href={toolUrl()!} class="text-brand hover:underline">
              {isKorean()
                ? props.benchmark.name.ko.split(' ')[0]
                : props.benchmark.name.en.split(' ')[0]}
            </A>{' '}
            {isKorean()
              ? props.benchmark.name.ko.split(' ').slice(1).join(' ')
              : props.benchmark.name.en.split(' ').slice(1).join(' ')}
          </Show>
        </h2>
      </div>

      <p class="text-sm text-muted-foreground mb-4">
        {isKorean() ? props.benchmark.description.ko : props.benchmark.description.en}
      </p>

      {/* Runner */}
      <BenchmarkRunner
        onRunFull={() => handleRunBenchmark(false)}
        onRunQuick={props.benchmark.runQuick ? () => handleRunBenchmark(true) : undefined}
        isRunning={isRunning()}
        progress={progress()}
        labels={{
          runFull: isKorean() ? '전체 테스트' : 'Full Test',
          runQuick: isKorean() ? '빠른 테스트' : 'Quick Test',
          running: isKorean() ? '테스트 중...' : 'Testing...',
        }}
        supportsDirection={props.benchmark.supportsDirection}
        direction={direction()}
        onDirectionChange={setDirection}
        directionCounts={directionCounts()}
        directionLabels={
          isKorean()
            ? { all: '전체', 'ko-en': '한→영', 'en-ko': '영→한' }
            : { all: 'All', 'ko-en': 'Ko→En', 'en-ko': 'En→Ko' }
        }
      />

      {/* Results */}
      <Show when={report()}>
        <div class="border-t pt-4">
          <Dynamic
            component={props.benchmark.ResultComponent}
            report={report()}
            locale={props.locale}
          />
        </div>
      </Show>

      {/* Initial State */}
      <Show when={!isRunning() && !report()}>
        <div class="text-center py-8 text-muted-foreground">
          <Clock class="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>
            {isKorean()
              ? '위의 버튼을 클릭하여 테스트를 시작하세요.'
              : 'Click the button above to start the test.'}
          </p>
        </div>
      </Show>
    </div>
  );
};

export default function BenchmarkPage() {
  const { t, locale } = useLanguage();
  const benchmarks = getAllBenchmarks();
  const [selectedId, setSelectedId] = createSignal(benchmarks[0]?.id || '');
  const [isMobile, setIsMobile] = createSignal(false);

  const selectedBenchmark = () => benchmarks.find((b) => b.id === selectedId());

  const benchmark = () =>
    t().benchmark as {
      title: string;
      description: string;
    };

  const isKorean = () => locale() === 'ko';
  const currentUrl = () => (isKorean() ? `${SITE_URL}/ko/benchmark` : `${SITE_URL}/benchmark`);

  // Check screen size for mobile sidebar
  const checkScreenSize = () => {
    if (isServer || typeof window === 'undefined') return;
    setIsMobile(window.innerWidth < 768);
  };

  onMount(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
  });

  onCleanup(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', checkScreenSize);
    }
  });

  // Close sidebar when switching to mobile
  createEffect(() => {
    if (isMobile()) {
      toolActions.setSidebarOpen(false);
    }
  });

  // Mobile sidebar overlay
  const showMobileOverlay = () => isMobile() && toolStore.sidebarOpen;

  return (
    <>
      <Title>{benchmark().title} - Tools</Title>
      <Meta name="description" content={benchmark().description} />
      <Link rel="canonical" href={currentUrl()} />
      <Link rel="alternate" hreflang="en" href={`${SITE_URL}/benchmark`} />
      <Link rel="alternate" hreflang="ko" href={`${SITE_URL}/ko/benchmark`} />
      <Link rel="alternate" hreflang="x-default" href={`${SITE_URL}/benchmark`} />
      <Meta property="og:title" content={`${benchmark().title} - Tools`} />
      <Meta property="og:description" content={benchmark().description} />
      <Meta property="og:url" content={currentUrl()} />

      <div class="flex h-screen flex-col bg-background">
        <Header />

        <main class="flex flex-1 overflow-hidden">
          {/* Mobile Sidebar Overlay */}
          <Show when={showMobileOverlay()}>
            <div
              class="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => toolActions.setSidebarOpen(false)}
            />
          </Show>

          {/* Sidebar */}
          <div
            class={cn(
              'z-50',
              // Mobile: fixed overlay
              isMobile() && 'fixed inset-y-0 left-0 pt-14 transition-transform duration-200',
              isMobile() && !toolStore.sidebarOpen && '-translate-x-full',
              // Desktop: static
              !isMobile() && 'relative'
            )}
          >
            <ToolSidebar />
          </div>

          {/* Benchmark Content Area */}
          <div class="flex-1 overflow-auto px-4 py-8">
            <div class="mx-auto max-w-4xl">
              {/* Page Header */}
              <div class="flex items-center gap-3 mb-2">
                <Activity class="h-8 w-8 text-brand" />
                <h1 class="text-2xl font-bold">{benchmark().title}</h1>
              </div>
              <p class="text-muted-foreground mb-6">{benchmark().description}</p>

              {/* Benchmark Selector (Tabs) */}
              <Show when={benchmarks.length > 1}>
                <div class="mb-6">
                  <BenchmarkSelector
                    benchmarks={benchmarks}
                    selected={selectedId()}
                    onSelect={setSelectedId}
                    locale={locale()}
                  />
                </div>
              </Show>

              {/* Benchmark Content */}
              <Show when={selectedBenchmark()}>
                <BenchmarkContent benchmark={selectedBenchmark()!} locale={locale()} />
              </Show>

              {/* Note */}
              <div class="mt-6 p-4 rounded-lg bg-muted/50 border border-dashed">
                <p class="text-sm text-muted-foreground text-center">
                  {isKorean()
                    ? '각 도구의 품질과 성능을 측정하는 벤치마크입니다. 더 많은 도구 테스트가 추가될 예정입니다.'
                    : 'Benchmarks measure the quality and performance of each tool. More tool tests will be added.'}
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer appName="Tools" tagline="UI/UX based on web standards" />
      </div>
    </>
  );
}
