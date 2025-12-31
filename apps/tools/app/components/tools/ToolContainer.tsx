'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { Link2, Loader2, X } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
// Widget for default view
import { WorldClockWidget } from '~/components/widgets';
import m from '~/lib/messages';
import { getToolComponent, getToolInfo } from '~/lib/toolCategories';
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

// Loading fallback component
function ToolLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-(--primary)" />
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
  const { locale, localizedPath } = useParaglideI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentTool, toolSettings, updateToolSettings, closeTool } = useToolStore();
  const isPlaying = useAudioStore((state) => state.transport.isPlaying);

  const [urlCopied, setUrlCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const urlCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (urlCopiedTimeoutRef.current) clearTimeout(urlCopiedTimeoutRef.current);
    };
  }, []);

  // useBeforeUnload - 오디오 재생 중 페이지 이탈 경고
  useEffect(() => {
    if (!isPlaying) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const warningMessage = m['tools.leaveWarning']?.() ?? '';
      e.returnValue = warningMessage;
      return warningMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPlaying]);

  // URL에서 설정 읽기 (도구 전환 시)
  useEffect(() => {
    if (!currentTool) return;

    const params = URL_PARAMS[currentTool];
    let hasUrlSettings = false;

    // Parameter range constraints for validation
    const paramRanges: Record<string, { min: number; max: number }> = {
      bpm: { min: 20, max: 300 },
      beatsPerMeasure: { min: 1, max: 16 },
      volume: { min: 0, max: 1 },
      swing: { min: 0, max: 100 },
      size: { min: 64, max: 512 },
    };

    // Type-safe URL param parsing per tool type with range validation
    const parseUrlValue = (
      param: string,
      rawValue: string | null,
    ): { key: string; value: number | string } | null => {
      if (rawValue === null || rawValue === '') return null;

      const numericParams = ['bpm', 'beatsPerMeasure', 'volume', 'swing', 'size'];
      if (numericParams.includes(param)) {
        const numValue = Number(rawValue);
        if (!Number.isFinite(numValue)) return null;

        // Apply range constraints
        const range = paramRanges[param];
        if (range) {
          const clampedValue = Math.max(range.min, Math.min(range.max, numValue));
          return { key: param, value: clampedValue };
        }
        return { key: param, value: numValue };
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
      if (urlCopiedTimeoutRef.current) clearTimeout(urlCopiedTimeoutRef.current);
      urlCopiedTimeoutRef.current = setTimeout(() => setUrlCopied(false), 2000);
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

  // Settings registry for each tool type
  const toolSettingsRegistry = useMemo(
    () => ({
      metronome: { settings: metronomeSettings, onSettingsChange: handleMetronomeSettingsChange },
      drumMachine: {
        settings: drumMachineSettings,
        onSettingsChange: handleDrumMachineSettingsChange,
      },
      qr: { settings: qrSettings, onSettingsChange: handleQRSettingsChange },
      translator: {
        settings: translatorSettings,
        onSettingsChange: handleTranslatorSettingsChange,
      },
    }),
    [
      metronomeSettings,
      handleMetronomeSettingsChange,
      drumMachineSettings,
      handleDrumMachineSettingsChange,
      qrSettings,
      handleQRSettingsChange,
      translatorSettings,
      handleTranslatorSettingsChange,
    ],
  );

  // Render tool content using registry pattern (no switch statement)
  const renderToolContent = () => {
    if (!currentTool) return null;

    const LazyComponent = getToolComponent(currentTool);
    if (!LazyComponent) return null;

    const config = toolSettingsRegistry[currentTool];
    return <LazyComponent settings={config.settings} onSettingsChange={config.onSettingsChange} />;
  };

  return (
    <div className="flex h-full flex-col bg-(--background)">
      {/* WorldClockWidget shown only on desktop (md+) when no tool selected */}
      {!currentTool ? (
        <div className="hidden h-full md:block">
          <WorldClockWidget />
        </div>
      ) : (
        <>
          {/* Tool Header */}
          <div className="flex items-center justify-between border-b border-(--border) px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{toolInfo?.icon}</span>
              <h2 className="text-sm font-semibold">{toolInfo?.name[locale]}</h2>
            </div>
            <div className="flex items-center gap-1">
              {/* Share URL Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={copyShareUrl}
                      className={`cursor-pointer rounded-xl border-none bg-transparent p-1.5 text-inherit transition-all duration-200 ease-out hover:bg-(color-mix(in_srgb,var(--primary)_10%,transparent)) hover:text-(--primary) active:bg-(color-mix(in_srgb,var(--primary)_20%,transparent)) ${
                        urlCopied ? 'text-(--color-success)' : ''
                      }`}
                      aria-label={m['tools.shareUrl']?.()}
                    >
                      <Link2 className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {urlCopied ? m['tools.urlCopied']?.() : m['tools.shareUrl']?.()}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer rounded-xl border-none bg-transparent p-1.5 text-inherit transition-all duration-200 ease-out hover:bg-(color-mix(in_srgb,var(--destructive)_25%,transparent)) hover:text-(--destructive) active:bg-(color-mix(in_srgb,var(--destructive)_35%,transparent))"
                aria-label={m['tools.closeTool']?.()}
              >
                <X className="size-4" />
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
