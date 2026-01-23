'use client';

import { useParaglideI18n } from '@soundblue/i18n';
import { useToast } from '@soundblue/ui-components/base';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import m from '~/lib/messages';

// Compatibility hook for react-router's useSearchParams
function useSearchParams(): [
  URLSearchParams,
  (params: URLSearchParams, options?: { replace?: boolean }) => void,
] {
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search });

  const searchParams = new URLSearchParams(search);

  const setSearchParams = useCallback(
    (params: URLSearchParams, options?: { replace?: boolean }) => {
      const searchObj: Record<string, string> = {};
      params.forEach((value, key) => {
        searchObj[key] = value;
      });
      navigate({
        to: '.',
        search: searchObj,
        replace: options?.replace,
      });
    },
    [navigate],
  );

  return [searchParams, setSearchParams];
}

import { getToolComponent, getToolInfo } from '~/lib/toolCategories';
import { getToolGuide } from '~/lib/toolGuides';
import { useAudioStore } from '~/stores/audio-store';
import { type ToolType, useToolStore } from '~/stores/tool-store';
import {
  type ColorDecomposerSettings,
  defaultColorDecomposerSettings,
} from '~/tools/color-decomposer/settings';
import type { DecomposeSize } from '~/tools/color-decomposer/types';
// Import tool types and default settings from local files (avoids loading heavy @soundblue/ui-components bundle)
import {
  type ColorHarmonySettings,
  defaultColorHarmonySettings,
} from '~/tools/color-harmony/settings';
import {
  type ColorPaletteSettings,
  defaultColorPaletteSettings,
} from '~/tools/color-palette/settings';
import type { PaletteSize } from '~/tools/color-palette/types';
import {
  type DelayCalculatorSettings,
  defaultDelayCalculatorSettings,
} from '~/tools/delay-calculator/settings';
import {
  type DrumMachineSettings,
  defaultDrumMachineSettings,
} from '~/tools/drum-machine/settings';
import {
  defaultEnglishSpellCheckerSettings,
  type EnglishSpellCheckerSettings,
} from '~/tools/english-spell-checker/settings';
import { defaultMetronomeSettings, type MetronomeSettings } from '~/tools/metronome/settings';
import { defaultQRSettings, type QRSettings } from '~/tools/qr/settings';
import {
  defaultSpellCheckerSettings,
  type SpellCheckerSettings,
} from '~/tools/spell-checker/settings';
import { defaultTapTempoSettings, type TapTempoSettings } from '~/tools/tap-tempo/settings';
import { defaultTranslatorSettings, type TranslatorSettings } from '~/tools/translator/settings';
import { ToolGuide } from './ToolGuide';

// Loading fallback component
function ToolLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

// Error fallback component for tool loading failures
function ToolErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const isChunkError =
    error.message.includes('Failed to fetch') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('dynamically imported module');

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="size-12 text-amber-500" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {isChunkError
            ? (m['tools.loadError_network']?.() ?? 'Network Error')
            : (m['tools.loadError_title']?.() ?? 'Failed to load tool')}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
          {isChunkError
            ? (m['tools.loadError_networkDesc']?.() ??
              'Please check your internet connection and try again.')
            : (m['tools.loadError_desc']?.() ??
              'An unexpected error occurred while loading the tool.')}
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded max-w-md overflow-auto">
            {error.message}
          </pre>
        )}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="size-4" />
        {m['tools.retry']?.() ?? 'Retry'}
      </button>
    </div>
  );
}

// Error Boundary for tool lazy loading failures
interface ToolErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ToolErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ToolErrorBoundary extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  constructor(props: ToolErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ToolErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Tool loading error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return <ToolErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

// ========================================
// ToolContainer Component - 도구 렌더링 영역
// ========================================

// Filter out undefined values from an object to prevent overwriting defaults
function filterUndefined<T extends Record<string, unknown>>(obj: T | undefined | null): Partial<T> {
  if (!obj) return {} as Partial<T>;
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

// URL 파라미터 키 정의
const URL_PARAMS = {
  metronome: ['bpm', 'beatsPerMeasure', 'volume', 'beatUnit'] as const,
  drumMachine: ['bpm', 'swing', 'volume'] as const,
  delayCalculator: ['bpm'] as const,
  tapTempo: ['soundEnabled', 'volume'] as const,
  qr: ['text', 'size', 'fgColor', 'bgColor', 'errorCorrection'] as const,
  translator: ['direction', 'formality', 'text'] as const,
  spellChecker: ['checkSpacing', 'checkTypo', 'checkGrammar'] as const,
  englishSpellChecker: [] as const,
  colorHarmony: ['baseColor', 'mode'] as const,
  colorPalette: ['size', 'colors'] as const,
  colorDecomposer: ['targetColor', 'size'] as const,
};

// 보존해야 할 특수 파라미터 (각 도구에서 직접 관리)
const PRESERVED_PARAMS = ['s'] as const;

interface ToolContainerProps {
  /** Tool type to render - overrides store state for SSG initial render */
  tool?: ToolType;
}

export function ToolContainer({ tool: propTool }: ToolContainerProps) {
  const navigate = useNavigate();
  const { locale, localizedPath } = useParaglideI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentTool: storeTool, toolSettings, updateToolSettings, closeTool } = useToolStore();
  const { toast } = useToast();

  // Use prop tool if provided, otherwise fall back to store state
  const currentTool = propTool ?? storeTool;
  const isPlaying = useAudioStore((state) => state.transport.isPlaying);

  const [urlCopied, setUrlCopied] = useState(false);
  const [urlCopyFailed, setUrlCopyFailed] = useState(false);
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
          if (parsed.key === 'beatUnit') settings.beatUnit = parsed.value as number;
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
          if (parsed.key === 'text') settings.text = decodeURIComponent(parsed.value as string);
          if (parsed.key === 'size') settings.size = parsed.value as number;
          if (parsed.key === 'fgColor')
            settings.foregroundColor = `#${(parsed.value as string).replace('#', '')}`;
          if (parsed.key === 'bgColor')
            settings.backgroundColor = `#${(parsed.value as string).replace('#', '')}`;
          if (parsed.key === 'errorCorrection') {
            const ec = parsed.value as string;
            if (['L', 'M', 'Q', 'H'].includes(ec)) {
              settings.errorCorrection = ec as QRSettings['errorCorrection'];
            }
          }
        }
      }
      if (hasUrlSettings) updateToolSettings('qr', settings);
    } else if (currentTool === 'delayCalculator') {
      const settings: Partial<DelayCalculatorSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams.get(param));
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'bpm') settings.bpm = parsed.value as number;
        }
      }
      if (hasUrlSettings) updateToolSettings('delayCalculator', settings);
    } else if (currentTool === 'translator') {
      const settings: Partial<TranslatorSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams.get(param));
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'direction')
            settings.direction = parsed.value as TranslatorSettings['direction'];
          if (parsed.key === 'formality')
            settings.formality = parsed.value as TranslatorSettings['formality'];
          if (parsed.key === 'text')
            settings.lastInput = decodeURIComponent(parsed.value as string);
        }
      }
      if (hasUrlSettings) updateToolSettings('translator', settings);
    } else if (currentTool === 'spellChecker') {
      const settings: Partial<SpellCheckerSettings> = {};
      for (const param of params) {
        const rawValue = searchParams.get(param);
        if (rawValue !== null) {
          hasUrlSettings = true;
          const boolValue = rawValue === '1' || rawValue === 'true';
          if (param === 'checkSpacing') settings.checkSpacing = boolValue;
          if (param === 'checkTypo') settings.checkTypo = boolValue;
          if (param === 'checkGrammar') settings.checkGrammar = boolValue;
        }
      }
      if (hasUrlSettings) updateToolSettings('spellChecker', settings);
    } else if (currentTool === 'colorPalette') {
      const settings: Partial<ColorPaletteSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams.get(param));
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'size') {
            const sizeVal = parsed.value as number;
            if ([2, 3, 4, 5].includes(sizeVal)) {
              settings.size = sizeVal as PaletteSize;
            }
          }
        }
      }
      // Handle colors array separately
      const colorsParam = searchParams.get('colors');
      if (colorsParam) {
        hasUrlSettings = true;
        settings.colors = colorsParam.split(',').map((c) => `#${c.replace('#', '')}`);
      }
      if (hasUrlSettings) updateToolSettings('colorPalette', settings);
    } else if (currentTool === 'colorDecomposer') {
      const settings: Partial<ColorDecomposerSettings> = {};
      for (const param of params) {
        const parsed = parseUrlValue(param, searchParams.get(param));
        if (parsed) {
          hasUrlSettings = true;
          if (parsed.key === 'size') {
            const sizeVal = parsed.value as number;
            if ([2, 3, 4, 5].includes(sizeVal)) {
              settings.size = sizeVal as DecomposeSize;
            }
          }
          if (parsed.key === 'targetColor')
            settings.targetColor = `#${(parsed.value as string).replace('#', '')}`;
        }
      }
      if (hasUrlSettings) updateToolSettings('colorDecomposer', settings);
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

    const settings = toolSettings[currentTool] ?? {};
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
      // Handle special parameter mappings
      let value: unknown;
      if (currentTool === 'qr') {
        const qrSettings = settings as Partial<QRSettings>;
        if (param === 'text') value = qrSettings.text;
        else if (param === 'fgColor') value = qrSettings.foregroundColor?.replace('#', '');
        else if (param === 'bgColor') value = qrSettings.backgroundColor?.replace('#', '');
        else if (param === 'errorCorrection') value = qrSettings.errorCorrection;
        else value = qrSettings[param as keyof QRSettings];
      } else if (currentTool === 'translator') {
        const translatorSettingsLocal = settings as Partial<TranslatorSettings>;
        if (param === 'text') value = translatorSettingsLocal.lastInput;
        else value = translatorSettingsLocal[param as keyof TranslatorSettings];
      } else if (currentTool === 'colorPalette') {
        const paletteSettings = settings as Partial<ColorPaletteSettings>;
        if (param === 'colors') {
          const colors = paletteSettings.colors;
          if (colors?.length) value = colors.map((c) => c.replace('#', '')).join(',');
        } else {
          value = paletteSettings[param as keyof ColorPaletteSettings];
        }
      } else if (currentTool === 'colorDecomposer') {
        const decomposerSettings = settings as Partial<ColorDecomposerSettings>;
        if (param === 'targetColor') value = decomposerSettings.targetColor?.replace('#', '');
        else value = decomposerSettings[param as keyof ColorDecomposerSettings];
      } else if (currentTool === 'colorHarmony') {
        const harmonySettings = settings as Partial<ColorHarmonySettings>;
        if (param === 'baseColor') value = harmonySettings.baseColor?.replace('#', '');
        else value = harmonySettings[param as keyof ColorHarmonySettings];
      } else {
        value = (settings as Record<string, unknown>)[param];
      }

      if (value !== undefined && value !== null && value !== '') {
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
      setUrlCopyFailed(false);
      if (urlCopiedTimeoutRef.current) clearTimeout(urlCopiedTimeoutRef.current);
      urlCopiedTimeoutRef.current = setTimeout(() => setUrlCopied(false), 2000);
    } catch (error: unknown) {
      // Clipboard API failed - show error feedback to user
      console.warn('[clipboard] URL copy failed:', error);
      setUrlCopyFailed(true);
      if (urlCopiedTimeoutRef.current) clearTimeout(urlCopiedTimeoutRef.current);
      urlCopiedTimeoutRef.current = setTimeout(() => setUrlCopyFailed(false), 2000);
    }
  }, []);

  // Get tool info for header (simple lookup, no memo needed)
  const toolInfo = currentTool ? getToolInfo(currentTool) : null;

  // Handle close - navigate to home (locale-aware)
  const handleClose = useCallback(() => {
    closeTool();
    navigate({ to: localizedPath('/') });
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

  const handleSpellCheckerSettingsChange = useCallback(
    (settings: Partial<SpellCheckerSettings>) => {
      updateToolSettings('spellChecker', settings);
    },
    [updateToolSettings],
  );

  const handleEnglishSpellCheckerSettingsChange = useCallback(
    (settings: Partial<EnglishSpellCheckerSettings>) => {
      updateToolSettings('englishSpellChecker', settings);
    },
    [updateToolSettings],
  );

  const handleDelayCalculatorSettingsChange = useCallback(
    (settings: Partial<DelayCalculatorSettings>) => {
      updateToolSettings('delayCalculator', settings);
    },
    [updateToolSettings],
  );

  const handleTapTempoSettingsChange = useCallback(
    (settings: Partial<TapTempoSettings>) => {
      updateToolSettings('tapTempo', settings);
    },
    [updateToolSettings],
  );

  const handleColorHarmonySettingsChange = useCallback(
    (settings: Partial<ColorHarmonySettings>) => {
      updateToolSettings('colorHarmony', settings);
    },
    [updateToolSettings],
  );

  const handleColorPaletteSettingsChange = useCallback(
    (settings: Partial<ColorPaletteSettings>) => {
      updateToolSettings('colorPalette', settings);
    },
    [updateToolSettings],
  );

  const handleColorDecomposerSettingsChange = useCallback(
    (settings: Partial<ColorDecomposerSettings>) => {
      updateToolSettings('colorDecomposer', settings);
    },
    [updateToolSettings],
  );

  // Toast callbacks for copy operations
  const handleTranslatorCopySuccess = useCallback(() => {
    toast.success(locale === 'ko' ? '복사됨!' : 'Copied!');
  }, [toast, locale]);

  const handleTranslatorCopyError = useCallback(() => {
    toast.error(locale === 'ko' ? '복사 실패' : 'Copy failed');
  }, [toast, locale]);

  const handleQRCopySuccess = useCallback(() => {
    toast.success(locale === 'ko' ? 'QR 코드 복사됨!' : 'QR code copied!');
  }, [toast, locale]);

  const handleQRCopyError = useCallback(() => {
    toast.error(locale === 'ko' ? 'QR 코드 복사 실패' : 'QR code copy failed');
  }, [toast, locale]);

  // Merged settings for each tool (with null-safe access)
  const metronomeSettings = useMemo(
    () => ({
      ...defaultMetronomeSettings,
      ...(toolSettings.metronome ?? {}),
    }),
    [toolSettings.metronome],
  );

  const qrSettings = useMemo(
    () => ({
      ...defaultQRSettings,
      ...(toolSettings.qr ?? {}),
    }),
    [toolSettings.qr],
  );

  const drumMachineSettings = useMemo(() => {
    const storeSettings = toolSettings.drumMachine ?? {};
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
  }, [toolSettings.drumMachine]);

  const translatorSettings = useMemo(
    () => ({
      ...defaultTranslatorSettings,
      ...(toolSettings.translator ?? {}),
    }),
    [toolSettings.translator],
  );

  const spellCheckerSettings = useMemo(
    () => ({
      ...defaultSpellCheckerSettings,
      ...(toolSettings.spellChecker ?? {}),
    }),
    [toolSettings.spellChecker],
  );

  const englishSpellCheckerSettings = useMemo(
    () => ({
      ...defaultEnglishSpellCheckerSettings,
      ...(toolSettings.englishSpellChecker ?? {}),
    }),
    [toolSettings.englishSpellChecker],
  );

  const delayCalculatorSettings = useMemo(
    () => ({
      ...defaultDelayCalculatorSettings,
      ...(toolSettings.delayCalculator ?? {}),
    }),
    [toolSettings.delayCalculator],
  );

  const tapTempoSettings = useMemo(
    () => ({
      ...defaultTapTempoSettings,
      ...(toolSettings.tapTempo ?? {}),
    }),
    [toolSettings.tapTempo],
  );

  const colorHarmonySettings = useMemo(
    () => ({
      ...defaultColorHarmonySettings,
      ...(toolSettings.colorHarmony ?? {}),
    }),
    [toolSettings.colorHarmony],
  );

  const colorPaletteSettings = useMemo(
    () => ({
      ...defaultColorPaletteSettings,
      ...filterUndefined(toolSettings.colorPalette ?? {}),
    }),
    [toolSettings.colorPalette],
  );

  const colorDecomposerSettings = useMemo(
    () => ({
      ...defaultColorDecomposerSettings,
      ...filterUndefined(toolSettings.colorDecomposer ?? {}),
    }),
    [toolSettings.colorDecomposer],
  );

  // Settings registry for each tool type
  const toolSettingsRegistry = useMemo(
    () => ({
      metronome: { settings: metronomeSettings, onSettingsChange: handleMetronomeSettingsChange },
      drumMachine: {
        settings: drumMachineSettings,
        onSettingsChange: handleDrumMachineSettingsChange,
      },
      delayCalculator: {
        settings: delayCalculatorSettings,
        onSettingsChange: handleDelayCalculatorSettingsChange,
      },
      tapTempo: {
        settings: tapTempoSettings,
        onSettingsChange: handleTapTempoSettingsChange,
      },
      qr: { settings: qrSettings, onSettingsChange: handleQRSettingsChange },
      translator: {
        settings: translatorSettings,
        onSettingsChange: handleTranslatorSettingsChange,
      },
      spellChecker: {
        settings: spellCheckerSettings,
        onSettingsChange: handleSpellCheckerSettingsChange,
      },
      englishSpellChecker: {
        settings: englishSpellCheckerSettings,
        onSettingsChange: handleEnglishSpellCheckerSettingsChange,
      },
      colorHarmony: {
        settings: colorHarmonySettings,
        onSettingsChange: handleColorHarmonySettingsChange,
      },
      colorPalette: {
        settings: colorPaletteSettings,
        onSettingsChange: handleColorPaletteSettingsChange,
      },
      colorDecomposer: {
        settings: colorDecomposerSettings,
        onSettingsChange: handleColorDecomposerSettingsChange,
      },
    }),
    [
      metronomeSettings,
      handleMetronomeSettingsChange,
      drumMachineSettings,
      handleDrumMachineSettingsChange,
      delayCalculatorSettings,
      handleDelayCalculatorSettingsChange,
      tapTempoSettings,
      handleTapTempoSettingsChange,
      qrSettings,
      handleQRSettingsChange,
      translatorSettings,
      handleTranslatorSettingsChange,
      spellCheckerSettings,
      handleSpellCheckerSettingsChange,
      englishSpellCheckerSettings,
      handleEnglishSpellCheckerSettingsChange,
      colorHarmonySettings,
      handleColorHarmonySettingsChange,
      colorPaletteSettings,
      handleColorPaletteSettingsChange,
      colorDecomposerSettings,
      handleColorDecomposerSettingsChange,
    ],
  );

  // Get current locale for tool guide
  const currentLocale = locale === 'ko' ? 'ko' : 'en';

  // Render tool content using registry pattern (no switch statement)
  const renderToolContent = () => {
    if (!currentTool) return null;

    const LazyComponent = getToolComponent(currentTool);
    if (!LazyComponent) return null;

    const config = toolSettingsRegistry[currentTool];

    // For external package tools (qr, translator), inject guideSlot and copy callbacks
    if (currentTool === 'translator') {
      const guide = getToolGuide(currentTool, currentLocale);
      return (
        <LazyComponent
          settings={config.settings}
          onSettingsChange={config.onSettingsChange}
          guideSlot={<ToolGuide title={guide.title} sections={guide.sections} />}
          onCopySuccess={handleTranslatorCopySuccess}
          onCopyError={handleTranslatorCopyError}
        />
      );
    }

    if (currentTool === 'qr') {
      const guide = getToolGuide(currentTool, currentLocale);
      return (
        <LazyComponent
          settings={config.settings}
          onSettingsChange={config.onSettingsChange}
          guideSlot={<ToolGuide title={guide.title} sections={guide.sections} />}
          onCopySuccess={handleQRCopySuccess}
          onCopyError={handleQRCopyError}
        />
      );
    }

    return <LazyComponent settings={config.settings} onSettingsChange={config.onSettingsChange} />;
  };

  // 도구가 선택되지 않으면 아무것도 렌더링하지 않음
  if (!currentTool) {
    return null;
  }

  return (
    <div className="flex h-full flex-col bg-[var(--color-bg-primary)]">
      {/* Tool Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{toolInfo?.icon}</span>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {toolInfo?.name[locale]}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Share URL Button */}
          <button
            type="button"
            onClick={copyShareUrl}
            className={`inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg border-none bg-transparent cursor-pointer transition-colors duration-150 hover:bg-[var(--color-interactive-hover)] text-sm font-medium ${
              urlCopyFailed
                ? 'text-red-500 dark:text-red-400'
                : urlCopied
                  ? 'text-[var(--color-accent-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
            aria-label={m['tools.shareUrl']?.()}
          >
            {urlCopyFailed ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            )}
            <span className="hidden sm:inline">
              {urlCopyFailed
                ? (m['tools.urlCopyFailed']?.() ?? 'Copy failed')
                : urlCopied
                  ? m['tools.urlCopied']?.()
                  : m['tools.shareUrl']?.()}
            </span>
          </button>
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent text-[var(--color-text-secondary)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]"
            aria-label={m['tools.closeTool']?.()}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tool Content */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <ToolErrorBoundary>
          <Suspense fallback={<ToolLoading />}>{renderToolContent()}</Suspense>
        </ToolErrorBoundary>
      </div>
    </div>
  );
}
