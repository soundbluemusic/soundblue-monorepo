'use client';

import { Link2, Loader2, X } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
// Widget for default view
import { WorldClockWidget } from '~/components/widgets';
import { useI18n } from '~/i18n';
import { getToolInfo } from '~/lib/toolCategories';
import { cn } from '~/lib/utils';
import { useAudioStore } from '~/stores/audio-store';
import { useToolStore } from '~/stores/tool-store';
// Import tool types and default settings only (not components)
import {
  type DrumMachineSettings,
  defaultDrumMachineSettings,
} from '~/tools/drum-machine/settings';
import { defaultMetronomeSettings, type MetronomeSettings } from '~/tools/metronome/settings';
import { defaultQRSettings, type QRSettings } from '~/tools/qr-generator/settings';
import { defaultTranslatorSettings, type TranslatorSettings } from '~/tools/translator/settings';

// Lazy load tool components for code splitting
const LazyMetronome = lazy(() =>
  import('~/tools/metronome').then((m) => ({ default: m.Metronome })),
);
const LazyDrumMachine = lazy(() =>
  import('~/tools/drum-machine').then((m) => ({ default: m.DrumMachine })),
);
const LazyQRGenerator = lazy(() =>
  import('~/tools/qr-generator').then((m) => ({ default: m.QRGenerator })),
);
const LazyTranslator = lazy(() =>
  import('~/tools/translator').then((m) => ({ default: m.Translator })),
);

// Loading fallback component
function ToolLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

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

export function ToolContainer() {
  const navigate = useNavigate();
  const { locale, t, localizedPath } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentTool, toolSettings, updateToolSettings, closeTool } = useToolStore();
  const isPlaying = useAudioStore((state) => state.transport.isPlaying);

  const [urlCopied, setUrlCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // useBeforeUnload - 오디오 재생 중 페이지 이탈 경고
  useEffect(() => {
    if (!isPlaying) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = t.tools.leaveWarning;
      return t.tools.leaveWarning;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPlaying, t.tools.leaveWarning]);

  // URL에서 설정 읽기 (도구 전환 시)
  useEffect(() => {
    if (!currentTool) return;

    const params = URL_PARAMS[currentTool];
    let hasUrlSettings = false;

    // Type-safe URL param parsing per tool type
    const parseUrlValue = (
      param: string,
      rawValue: string | null,
    ): { key: string; value: number | string } | null => {
      if (rawValue === null || rawValue === '') return null;

      const numericParams = ['bpm', 'beatsPerMeasure', 'volume', 'swing', 'size'];
      if (numericParams.includes(param)) {
        const numValue = Number(rawValue);
        if (Number.isFinite(numValue)) {
          return { key: param, value: numValue };
        }
        return null;
      }
      return { key: param, value: rawValue };
    };

    // Build type-safe settings object based on tool type
    if (currentTool === 'metronome') {
      const settings: Partial<MetronomeSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams.get(param));
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'bpm') settings.bpm = parsed.value as number;
          if (parsed.key === 'beatsPerMeasure') settings.beatsPerMeasure = parsed.value as number;
          if (parsed.key === 'volume') settings.volume = parsed.value as number;
        }
      }
      if (hasUrlSettings) updateToolSettings('metronome', settings);
    } else if (currentTool === 'drumMachine') {
      const settings: Partial<DrumMachineSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams.get(param));
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'bpm') settings.bpm = parsed.value as number;
          if (parsed.key === 'swing') settings.swing = parsed.value as number;
          if (parsed.key === 'volume') settings.volume = parsed.value as number;
        }
      }
      if (hasUrlSettings) updateToolSettings('drumMachine', settings);
    } else if (currentTool === 'qr') {
      const settings: Partial<QRSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams.get(param));
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'size') settings.size = parsed.value as number;
          if (parsed.key === 'fgColor') settings.foregroundColor = parsed.value as string;
          if (parsed.key === 'bgColor') settings.backgroundColor = parsed.value as string;
        }
      }
      if (hasUrlSettings) updateToolSettings('qr', settings);
    } else if (currentTool === 'translator') {
      const settings: Partial<TranslatorSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams.get(param));
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'direction')
            settings.direction = parsed.value as TranslatorSettings['direction'];
        }
      }
      if (hasUrlSettings) updateToolSettings('translator', settings);
    }
  }, [currentTool, searchParams, updateToolSettings]);

  // 설정 변경 시 URL 업데이트
  useEffect(() => {
    if (!currentTool) {
      // 도구 없으면 URL 파라미터 초기화 (보존 파라미터 제외)
      const preserved = new URLSearchParams();
      for (const param of PRESERVED_PARAMS) {
        const value = searchParams.get(param);
        if (value) {
          preserved.set(param, value);
        }
      }
      setSearchParams(preserved, { replace: true });
      return;
    }

    const settings = toolSettings[currentTool];
    const params = URL_PARAMS[currentTool];
    const urlUpdate = new URLSearchParams();

    // 보존 파라미터 유지
    for (const param of PRESERVED_PARAMS) {
      const value = searchParams.get(param);
      if (value) {
        urlUpdate.set(param, value);
      }
    }

    for (const param of params) {
      const value = settings[param as keyof typeof settings];
      if (value !== undefined && value !== null) {
        urlUpdate.set(param, String(value));
      }
    }

    setSearchParams(urlUpdate, { replace: true });
  }, [currentTool, toolSettings, searchParams, setSearchParams]);

  // 공유 URL 복사
  const copyShareUrl = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // Clipboard API failed - silent fail in production
    }
  }, []);

  // Get tool info for header (simple lookup, no memo needed)
  const toolInfo = currentTool ? getToolInfo(currentTool) : null;

  // Handle close - navigate to home (locale-aware)
  const handleClose = useCallback(() => {
    closeTool();
    navigate(localizedPath('/'));
  }, [closeTool, navigate, localizedPath]);

  // Settings change handlers
  const handleMetronomeSettingsChange = useCallback(
    (settings: Partial<MetronomeSettings>) => {
      updateToolSettings('metronome', settings);
    },
    [updateToolSettings],
  );

  const handleQRSettingsChange = useCallback(
    (settings: Partial<QRSettings>) => {
      updateToolSettings('qr', settings);
    },
    [updateToolSettings],
  );

  const handleDrumMachineSettingsChange = useCallback(
    (settings: Partial<DrumMachineSettings>) => {
      updateToolSettings('drumMachine', settings);
    },
    [updateToolSettings],
  );

  const handleTranslatorSettingsChange = useCallback(
    (settings: Partial<TranslatorSettings>) => {
      updateToolSettings('translator', settings);
    },
    [updateToolSettings],
  );

  // Merged settings for each tool
  const metronomeSettings = useMemo(
    () => ({
      ...defaultMetronomeSettings,
      ...toolSettings.metronome,
    }),
    [toolSettings.metronome],
  );

  const qrSettings = useMemo(
    () => ({
      ...defaultQRSettings,
      ...toolSettings.qr,
    }),
    [toolSettings.qr],
  );

  const drumMachineSettings = useMemo(() => {
    const storeSettings = toolSettings.drumMachine;
    const merged = {
      ...defaultDrumMachineSettings,
      ...storeSettings,
    };
    // Ensure pattern is properly merged (not replaced with partial)
    if (storeSettings['pattern']) {
      merged.pattern = {
        ...defaultDrumMachineSettings.pattern,
        ...storeSettings['pattern'],
      };
    }
    return merged;
  }, [toolSettings.drumMachine]);

  const translatorSettings = useMemo(
    () => ({
      ...defaultTranslatorSettings,
      ...toolSettings.translator,
    }),
    [toolSettings.translator],
  );

  // Render tool content based on current tool
  const renderToolContent = () => {
    switch (currentTool) {
      case 'metronome':
        return (
          <LazyMetronome
            settings={metronomeSettings}
            onSettingsChange={handleMetronomeSettingsChange}
          />
        );
      case 'qr':
        return <LazyQRGenerator settings={qrSettings} onSettingsChange={handleQRSettingsChange} />;
      case 'drumMachine':
        return (
          <LazyDrumMachine
            settings={drumMachineSettings}
            onSettingsChange={handleDrumMachineSettingsChange}
          />
        );
      case 'translator':
        return (
          <LazyTranslator
            settings={translatorSettings}
            onSettingsChange={handleTranslatorSettingsChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* WorldClockWidget shown only on desktop (md+) when no tool selected */}
      {!currentTool ? (
        <div className="hidden h-full md:block">
          <WorldClockWidget />
        </div>
      ) : (
        <>
          {/* Tool Header */}
          <div className="flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{toolInfo?.icon}</span>
              <h2 className="font-semibold text-sm">{toolInfo?.name[locale]}</h2>
            </div>
            <div className="flex items-center gap-1">
              {/* Share URL Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={copyShareUrl}
                      className={cn(
                        'p-1.5 rounded-lg',
                        'transition-all duration-200 ease-out',
                        'hover:bg-primary/10 hover:text-primary',
                        'active:bg-primary/20',
                        urlCopied && 'text-green-500',
                      )}
                      aria-label={t.tools.shareUrl}
                    >
                      <Link2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {urlCopied ? t.tools.urlCopied : t.tools.shareUrl}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className={cn(
                  'p-1.5 rounded-lg',
                  'transition-all duration-200 ease-out',
                  'hover:bg-destructive/25 hover:text-destructive',
                  'active:bg-destructive/35',
                )}
                aria-label={t.tools.closeTool}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tool Content */}
          <div ref={containerRef} className="flex-1 overflow-auto">
            <Suspense fallback={<ToolLoading />}>{renderToolContent()}</Suspense>
          </div>
        </>
      )}
    </div>
  );
}
