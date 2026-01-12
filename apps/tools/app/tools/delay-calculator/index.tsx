import { useParaglideI18n } from '@soundblue/i18n';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToolGuide } from '~/components/tools/ToolGuide';
import { Slider } from '~/components/ui/slider';
import { getToolGuide } from '~/lib/toolGuides';
import {
  calculateAllDelayTimes,
  calculateTapTempo,
  formatHz,
  formatMs,
  shouldResetTaps,
} from './engine/calculator';
import { BPM_RANGE, defaultDelayCalculatorSettings, delayCalculatorTexts } from './settings';
import type { DelayCalculatorProps, NoteVariant } from './types';

// ========================================
// Delay Time Calculator Tool
// ========================================

export function DelayCalculator({
  settings: propSettings,
  onSettingsChange,
}: DelayCalculatorProps) {
  const { locale } = useParaglideI18n();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';
  const texts = delayCalculatorTexts[currentLocale];
  const guide = getToolGuide('delayCalculator', currentLocale);

  // Merge provided settings with defaults
  const [internalSettings, setInternalSettings] = useState(defaultDelayCalculatorSettings);
  const settings = useMemo(
    () => ({ ...defaultDelayCalculatorSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<typeof settings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  // TAP Tempo state
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Copy feedback state
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // Calculate all delay times
  const delayTimes = useMemo(() => calculateAllDelayTimes(settings.bpm), [settings.bpm]);

  // Handle BPM change
  const handleBpmChange = useCallback(
    (newBpm: number) => {
      const clampedBpm = Math.max(BPM_RANGE.min, Math.min(BPM_RANGE.max, newBpm));
      handleSettingsChange({ bpm: clampedBpm });
    },
    [handleSettingsChange],
  );

  // Handle TAP
  const handleTap = useCallback(() => {
    const now = Date.now();

    setTapTimestamps((prev) => {
      // Reset if too much time has passed
      if (shouldResetTaps(prev)) {
        return [now];
      }
      return [...prev, now];
    });
  }, []);

  // Calculate BPM from taps
  useEffect(() => {
    if (tapTimestamps.length < 2) return;

    const bpm = calculateTapTempo(tapTimestamps);
    if (bpm !== null) {
      handleSettingsChange({ bpm });
    }

    // Clear timeout and set new one
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    tapTimeoutRef.current = setTimeout(() => {
      setTapTimestamps([]);
    }, 2000);

    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, [tapTimestamps, handleSettingsChange]);

  // Keyboard handler for TAP (Space key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTap]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(label);
      setTimeout(() => setCopiedValue(null), 1500);
    } catch {
      // Clipboard API not available
    }
  }, []);

  // Reset to default
  const handleReset = useCallback(() => {
    handleSettingsChange({ bpm: defaultDelayCalculatorSettings.bpm });
    setTapTimestamps([]);
  }, [handleSettingsChange]);

  // Note labels for display
  const noteLabels: Record<string, { en: string; ko: string }> = {
    '1/1': { en: 'Whole', ko: '온음표' },
    '1/2': { en: 'Half', ko: '2분' },
    '1/4': { en: 'Quarter', ko: '4분' },
    '1/8': { en: '8th', ko: '8분' },
    '1/16': { en: '16th', ko: '16분' },
    '1/32': { en: '32nd', ko: '32분' },
  };

  const variants: NoteVariant[] = ['normal', 'dotted', 'triplet'];

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-3 sm:gap-4 sm:p-4">
      {/* BPM Control Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="text-center">
          <div className="text-5xl font-bold tabular-nums tracking-tight sm:text-7xl">
            {settings.bpm}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{texts.bpm}</div>
        </div>

        {/* BPM Slider */}
        <div className="mt-6 px-2">
          <Slider
            value={[settings.bpm]}
            onValueChange={(v) => handleBpmChange(v[0] ?? BPM_RANGE.min)}
            min={BPM_RANGE.min}
            max={BPM_RANGE.max}
            step={BPM_RANGE.step}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{BPM_RANGE.min}</span>
            <span>{BPM_RANGE.max}</span>
          </div>
        </div>

        {/* BPM Input + TAP Button */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <input
            type="number"
            value={settings.bpm}
            onChange={(e) => handleBpmChange(Number.parseInt(e.target.value, 10) || BPM_RANGE.min)}
            min={BPM_RANGE.min}
            max={BPM_RANGE.max}
            className="h-10 w-20 rounded-lg border border-border bg-background px-2 text-center text-lg font-medium tabular-nums transition-colors hover:bg-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 dark:hover:bg-white/12 sm:h-12 sm:w-24 sm:text-xl"
          />
          <button
            type="button"
            onClick={handleTap}
            className={`inline-flex h-10 items-center justify-center rounded-lg border-2 px-4 font-semibold transition-all duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:scale-95 sm:h-12 sm:px-6 ${
              tapTimestamps.length > 0
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-background text-foreground hover:bg-black/8 dark:hover:bg-white/12'
            }`}
          >
            {texts.tap}
            {tapTimestamps.length > 0 && (
              <span className="ml-1.5 text-xs opacity-80">({tapTimestamps.length})</span>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 hover:bg-black/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 dark:hover:bg-white/12 sm:h-12 sm:w-12"
            title={texts.reset}
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* TAP Tip */}
        <p className="mt-3 text-center text-xs text-muted-foreground">{texts.tapTip}</p>
      </div>

      {/* Delay Times Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-1 border-b border-border bg-muted/50 px-2 py-2.5 text-xs font-medium sm:px-4 sm:py-3 sm:text-sm">
          <div className="text-muted-foreground">{texts.note}</div>
          <div className="text-center text-muted-foreground">{texts.normal}</div>
          <div className="text-center text-muted-foreground">{texts.dotted}</div>
          <div className="text-center text-muted-foreground">{texts.triplet}</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {delayTimes.map((row) => (
            <div key={row.note} className="grid grid-cols-4 gap-1 px-2 py-2 sm:px-4 sm:py-2.5">
              {/* Note Label */}
              <div className="flex items-center">
                <span className="font-mono text-xs font-medium sm:text-sm">{row.note}</span>
                <span className="ml-1.5 hidden text-xs text-muted-foreground sm:inline">
                  {locale === 'ko' ? noteLabels[row.note]?.ko : noteLabels[row.note]?.en}
                </span>
              </div>

              {/* Values for each variant */}
              {variants.map((variant) => {
                const data = row[variant];
                const msStr = formatMs(data.ms);
                const hzStr = formatHz(data.hz);
                const copyLabel = `${row.note}-${variant}`;
                const isCopied = copiedValue === copyLabel;

                return (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => handleCopy(Math.round(data.ms).toString(), copyLabel)}
                    className="group relative flex flex-col items-center justify-center rounded-lg px-1 py-1 text-center transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2"
                    title={`${texts.copyTip}: ${Math.round(data.ms)}ms`}
                  >
                    <span className="font-mono text-xs font-semibold tabular-nums sm:text-sm">
                      {msStr}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums sm:text-xs">
                      {hzStr}
                    </span>
                    {/* Copy indicator */}
                    <span
                      className={`absolute -right-0.5 -top-0.5 transition-opacity ${
                        isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                      }`}
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Copy Tip */}
      <p className="text-center text-xs text-muted-foreground">
        {copiedValue ? (
          <span className="text-green-600 dark:text-green-400">{texts.copied}</span>
        ) : (
          texts.copyTip
        )}
      </p>

      {/* Tool Guide */}
      <ToolGuide title={guide.title} sections={guide.sections} />
    </div>
  );
}

export { type DelayCalculatorSettings, defaultDelayCalculatorSettings } from './settings';
export type { DelayCalculatorProps } from './types';
