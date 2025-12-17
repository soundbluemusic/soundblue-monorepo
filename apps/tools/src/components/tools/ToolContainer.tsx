import { useBeforeLeave, useNavigate, useSearchParams } from '@solidjs/router';
import { Link2, Loader2, X } from 'lucide-solid';
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  lazy,
  Match,
  onCleanup,
  onMount,
  Show,
  Suspense,
  Switch,
} from 'solid-js';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
// Widget for default view
import { WorldClockWidget } from '~/components/widgets';
import { getLocalizedPath, useLanguage } from '~/i18n';
import { getToolInfo } from '~/lib/toolCategories';
import { cn } from '~/lib/utils';
import { audioStore } from '~/stores/audio-store';
import { toolActions, toolStore } from '~/stores/tool-store';
// Import tool types and default settings only (not components)
import { type DrumMachineSettings, defaultDrumMachineSettings } from '~/tools/drum-machine';
import { defaultMetronomeSettings, type MetronomeSettings } from '~/tools/metronome';
import { defaultQRSettings, type QRSettings } from '~/tools/qr-generator';
import { defaultTranslatorSettings, type TranslatorSettings } from '~/tools/translator';

// Lazy load tool components for code splitting
const LazyMetronome = lazy(() =>
  import('~/tools/metronome').then((m) => ({ default: m.metronomeTool.component }))
);
const LazyDrumMachine = lazy(() =>
  import('~/tools/drum-machine').then((m) => ({ default: m.drumMachineTool.component }))
);
const LazyQRGenerator = lazy(() =>
  import('~/tools/qr-generator').then((m) => ({ default: m.qrGeneratorTool.component }))
);
const LazyTranslator = lazy(() =>
  import('~/tools/translator').then((m) => ({ default: m.translatorTool.component }))
);

// Loading fallback component
const ToolLoading: Component = () => (
  <div class="flex h-full items-center justify-center">
    <Loader2 class="h-8 w-8 animate-spin text-primary" />
  </div>
);

// ========================================
// ToolContainer Component - 도구 렌더링 영역
// ========================================

// URL 파라미터 키 정의
const URL_PARAMS = {
  metronome: ['bpm', 'beatsPerMeasure', 'volume'] as const,
  drumMachine: ['bpm', 'swing', 'volume'] as const,
  qr: ['size', 'fgColor', 'bgColor'] as const,
  translator: ['direction'] as const,
};

// 보존해야 할 특수 파라미터 (각 도구에서 직접 관리)
const PRESERVED_PARAMS = ['s'] as const;

export const ToolContainer: Component = () => {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTool = () => toolStore.currentTool;

  // Container size for tool props - measure actual size
  const [containerSize, setContainerSize] = createSignal({ width: 320, height: 400 });
  const [urlCopied, setUrlCopied] = createSignal(false);
  const [isAudioPlaying, setIsAudioPlaying] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  // Measure container size
  const updateContainerSize = () => {
    if (containerRef) {
      const rect = containerRef.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  };

  onMount(() => {
    updateContainerSize();
    const resizeObserver = new ResizeObserver(updateContainerSize);
    if (containerRef) {
      resizeObserver.observe(containerRef);
    }
    onCleanup(() => resizeObserver.disconnect());
  });

  // Track audio playing state from audioStore
  createEffect(() => {
    setIsAudioPlaying(audioStore.transport.isPlaying);
  });

  // useBeforeLeave - 오디오 재생 중 페이지 이탈 경고
  useBeforeLeave((e) => {
    if (isAudioPlaying() && !e.defaultPrevented) {
      e.preventDefault();
      if (window.confirm(t().tools.leaveWarning)) {
        e.retry(true);
      }
    }
  });

  // URL에서 설정 읽기 (도구 전환 시)
  createEffect(() => {
    const tool = currentTool();
    if (!tool) return;

    const params = URL_PARAMS[tool];
    let hasUrlSettings = false;

    // Type-safe URL param parsing per tool type
    const parseUrlValue = (
      param: string,
      rawValue: string | string[] | undefined
    ): { key: string; value: number | string } | null => {
      const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
      if (value === undefined || value === null || value === '') return null;

      const numericParams = ['bpm', 'beatsPerMeasure', 'volume', 'swing', 'size'];
      if (numericParams.includes(param)) {
        const numValue = Number(value);
        if (Number.isFinite(numValue)) {
          return { key: param, value: numValue };
        }
        return null;
      }
      return { key: param, value };
    };

    // Build type-safe settings object based on tool type
    if (tool === 'metronome') {
      const settings: Partial<MetronomeSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams[param]);
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'bpm') settings.bpm = parsed.value as number;
          if (parsed.key === 'beatsPerMeasure') settings.beatsPerMeasure = parsed.value as number;
          if (parsed.key === 'volume') settings.volume = parsed.value as number;
        }
      }
      if (hasUrlSettings) toolActions.updateToolSettings('metronome', settings);
    } else if (tool === 'drumMachine') {
      const settings: Partial<DrumMachineSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams[param]);
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'bpm') settings.bpm = parsed.value as number;
          if (parsed.key === 'swing') settings.swing = parsed.value as number;
          if (parsed.key === 'volume') settings.volume = parsed.value as number;
        }
      }
      if (hasUrlSettings) toolActions.updateToolSettings('drumMachine', settings);
    } else if (tool === 'qr') {
      const settings: Partial<QRSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams[param]);
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'size') settings.size = parsed.value as number;
          if (parsed.key === 'fgColor') settings.foregroundColor = parsed.value as string;
          if (parsed.key === 'bgColor') settings.backgroundColor = parsed.value as string;
        }
      }
      if (hasUrlSettings) toolActions.updateToolSettings('qr', settings);
    } else if (tool === 'translator') {
      const settings: Partial<TranslatorSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams[param]);
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'direction') settings.direction = parsed.value as TranslatorSettings['direction'];
        }
      }
      if (hasUrlSettings) toolActions.updateToolSettings('translator', settings);
    }
  });

  // 설정 변경 시 URL 업데이트
  createEffect(() => {
    const tool = currentTool();
    if (!tool) {
      // 도구 없으면 URL 파라미터 초기화 (보존 파라미터 제외)
      const preserved: Record<string, string | undefined> = {};
      for (const param of PRESERVED_PARAMS) {
        const value = searchParams[param];
        if (value) {
          preserved[param] = Array.isArray(value) ? value[0] : value;
        }
      }
      setSearchParams(preserved, { replace: true });
      return;
    }

    const settings = toolStore.toolSettings[tool];
    const params = URL_PARAMS[tool];
    const urlUpdate: Record<string, string | undefined> = {};

    // 보존 파라미터 유지
    for (const param of PRESERVED_PARAMS) {
      const value = searchParams[param];
      if (value) {
        urlUpdate[param] = Array.isArray(value) ? value[0] : value;
      }
    }

    for (const param of params) {
      const value = settings[param as keyof typeof settings];
      if (value !== undefined && value !== null) {
        urlUpdate[param] = String(value);
      }
    }

    setSearchParams(urlUpdate, { replace: true });
  });

  // 공유 URL 복사
  const copyShareUrl = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // Clipboard API failed - silent fail in production
    }
  };

  // Get tool info for header (simple lookup, no memo needed)
  const toolInfo = () => {
    const tool = currentTool();
    return tool ? getToolInfo(tool) : null;
  };

  // Handle close - navigate to home (locale-aware)
  const handleClose = () => {
    toolActions.closeTool();
    navigate(getLocalizedPath('/', locale()));
  };

  // Settings change handlers
  const handleMetronomeSettingsChange = (settings: Partial<MetronomeSettings>) => {
    toolActions.updateToolSettings('metronome', settings);
  };

  const handleQRSettingsChange = (settings: Partial<QRSettings>) => {
    toolActions.updateToolSettings('qr', settings);
  };

  const handleDrumMachineSettingsChange = (settings: Partial<DrumMachineSettings>) => {
    toolActions.updateToolSettings('drumMachine', settings);
  };

  const handleTranslatorSettingsChange = (settings: Partial<TranslatorSettings>) => {
    toolActions.updateToolSettings('translator', settings);
  };

  // Merged settings for each tool
  const metronomeSettings = createMemo(() => ({
    ...defaultMetronomeSettings,
    ...toolStore.toolSettings.metronome,
  }));

  const qrSettings = createMemo(() => ({
    ...defaultQRSettings,
    ...toolStore.toolSettings.qr,
  }));

  const drumMachineSettings = createMemo(() => {
    const storeSettings = toolStore.toolSettings.drumMachine;
    const merged = {
      ...defaultDrumMachineSettings,
      ...storeSettings,
    };
    // Ensure pattern is properly merged (not replaced with partial)
    if (storeSettings.pattern) {
      merged.pattern = {
        ...defaultDrumMachineSettings.pattern,
        ...storeSettings.pattern,
      };
    }
    return merged;
  });

  const translatorSettings = createMemo(() => ({
    ...defaultTranslatorSettings,
    ...toolStore.toolSettings.translator,
  }));

  return (
    <div class="flex h-full flex-col bg-background">
      {/* WorldClockWidget shown only on desktop (md+) when no tool selected */}
      <Show
        when={currentTool()}
        fallback={
          <div class="hidden h-full md:block">
            <WorldClockWidget />
          </div>
        }
      >
        {/* Tool Header */}
        <div class="flex items-center justify-between border-b px-4 py-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">{toolInfo()?.icon}</span>
            <h2 class="font-semibold text-sm">{toolInfo()?.name[locale()]}</h2>
          </div>
          <div class="flex items-center gap-1">
            {/* Share URL Button */}
            <Tooltip>
              <TooltipTrigger
                as="button"
                type="button"
                onClick={copyShareUrl}
                class={cn(
                  'p-1.5 rounded-lg',
                  'transition-all duration-200 ease-out',
                  'hover:bg-primary/10 hover:text-primary',
                  'active:bg-primary/20',
                  urlCopied() && 'text-green-500'
                )}
                aria-label={t().tools.shareUrl}
              >
                <Link2 class="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                {urlCopied() ? t().tools.urlCopied : t().tools.shareUrl}
              </TooltipContent>
            </Tooltip>
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              class={cn(
                'p-1.5 rounded-lg',
                'transition-all duration-200 ease-out',
                'hover:bg-destructive/25 hover:text-destructive',
                'active:bg-destructive/35'
              )}
              aria-label={t().tools.closeTool}
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tool Content */}
        <div ref={containerRef} class="flex-1 overflow-auto">
          <Suspense fallback={<ToolLoading />}>
            <Switch>
              <Match when={currentTool() === 'metronome'}>
                <LazyMetronome
                  instanceId="metronome-main"
                  settings={metronomeSettings()}
                  onSettingsChange={handleMetronomeSettingsChange}
                  size={containerSize()}
                  isActive={true}
                />
              </Match>
              <Match when={currentTool() === 'qr'}>
                <LazyQRGenerator
                  instanceId="qr-main"
                  settings={qrSettings()}
                  onSettingsChange={handleQRSettingsChange}
                  size={containerSize()}
                  isActive={true}
                />
              </Match>
              <Match when={currentTool() === 'drumMachine'}>
                <LazyDrumMachine
                  instanceId="drum-machine-main"
                  settings={drumMachineSettings()}
                  onSettingsChange={handleDrumMachineSettingsChange}
                  size={containerSize()}
                  isActive={true}
                />
              </Match>
              <Match when={currentTool() === 'translator'}>
                <LazyTranslator
                  instanceId="translator-main"
                  settings={translatorSettings()}
                  onSettingsChange={handleTranslatorSettingsChange}
                  size={containerSize()}
                  isActive={true}
                />
              </Match>
            </Switch>
          </Suspense>
        </div>
      </Show>
    </div>
  );
};
