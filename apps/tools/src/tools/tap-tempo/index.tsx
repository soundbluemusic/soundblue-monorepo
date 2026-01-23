import { useParaglideI18n } from '@soundblue/i18n';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Tone from 'tone';
import { ToolGuide } from '~/components/tools/ToolGuide';
import { Slider } from '~/components/ui/slider';
import { getToolGuide } from '~/lib/toolGuides';
import { BPM_RANGE, defaultTapTempoSettings, tapTempoTexts } from './settings';
import type { TapTempoProps } from './types';

// ========================================
// TAP Tempo Tool
// ========================================

export function TapTempo({ settings: propSettings, onSettingsChange }: TapTempoProps) {
  const { locale } = useParaglideI18n();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';
  const texts = tapTempoTexts[currentLocale];
  const guide = getToolGuide('tapTempo', currentLocale);

  // Merge settings
  const [internalSettings, setInternalSettings] = useState(defaultTapTempoSettings);
  const settings = useMemo(
    () => ({ ...defaultTapTempoSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<typeof settings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  // TAP state
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tone.js synth for click sound
  const synthRef = useRef<Tone.MembraneSynth | null>(null);

  // Initialize synth
  useEffect(() => {
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = -6 + (settings.volume / 100) * 12;
    }
  }, [settings.volume]);

  // Calculate BPM from taps
  const calculateBpm = useCallback((timestamps: number[]): number | null => {
    if (timestamps.length < 2) return null;

    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }

    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const calculatedBpm = 60000 / avgInterval;

    return Math.round(Math.max(BPM_RANGE.min, Math.min(BPM_RANGE.max, calculatedBpm)));
  }, []);

  // Calculate accuracy (standard deviation of intervals)
  const accuracy = useMemo(() => {
    if (tapTimestamps.length < 3) return null;

    const intervals: number[] = [];
    for (let i = 1; i < tapTimestamps.length; i++) {
      intervals.push(tapTimestamps[i] - tapTimestamps[i - 1]);
    }

    const avg = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + (i - avg) ** 2, 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Convert to percentage (lower stdDev = higher accuracy)
    // stdDev of 0 = 100%, stdDev of 100ms = ~80%, stdDev of 200ms = ~60%
    const accuracyPercent = Math.max(0, Math.min(100, 100 - stdDev / 2));
    return Math.round(accuracyPercent);
  }, [tapTimestamps]);

  // Average interval in ms
  const avgInterval = useMemo(() => {
    if (tapTimestamps.length < 2) return null;

    const intervals: number[] = [];
    for (let i = 1; i < tapTimestamps.length; i++) {
      intervals.push(tapTimestamps[i] - tapTimestamps[i - 1]);
    }

    return Math.round(intervals.reduce((sum, i) => sum + i, 0) / intervals.length);
  }, [tapTimestamps]);

  // Handle TAP
  const handleTap = useCallback(async () => {
    const now = Date.now();

    // Play sound if enabled
    if (settings.soundEnabled && synthRef.current) {
      await Tone.start();
      synthRef.current.triggerAttackRelease('C3', '16n');
    }

    // Animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100);

    setTapTimestamps((prev) => {
      // Reset if too much time has passed (2 seconds)
      const lastTap = prev[prev.length - 1];
      if (lastTap && now - lastTap > 2000) {
        return [now];
      }

      // Keep max 8 taps
      const newTaps = [...prev, now].slice(-8);
      return newTaps;
    });

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Auto-reset after 2 seconds of inactivity
    tapTimeoutRef.current = setTimeout(() => {
      // Don't reset, just stop updating
    }, 2000);
  }, [settings.soundEnabled]);

  // Update BPM when timestamps change
  useEffect(() => {
    const calculated = calculateBpm(tapTimestamps);
    if (calculated !== null) {
      setBpm(calculated);
    }
  }, [tapTimestamps, calculateBpm]);

  // Keyboard handler (Space)
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

  // Reset
  const handleReset = useCallback(() => {
    setTapTimestamps([]);
    setBpm(null);
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    handleSettingsChange({ soundEnabled: !settings.soundEnabled });
  }, [settings.soundEnabled, handleSettingsChange]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      {/* Main BPM Display */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="text-center">
          {/* BPM Number */}
          <div
            className={`text-7xl font-bold tabular-nums tracking-tight transition-transform duration-100 sm:text-8xl ${
              isAnimating ? 'scale-105' : ''
            }`}
          >
            {bpm ?? '--'}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{texts.bpm}</div>

          {/* Status */}
          <div className="mt-4 text-sm">
            {tapTimestamps.length === 0 ? (
              <span className="text-muted-foreground">{texts.listening}</span>
            ) : (
              <span className="text-primary font-medium">{texts.detected}</span>
            )}
          </div>
        </div>

        {/* TAP Button - Large and Central */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleTap}
            className={`h-32 w-32 rounded-full border-4 text-2xl font-bold transition-all duration-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 sm:h-40 sm:w-40 sm:text-3xl ${
              isAnimating
                ? 'scale-110 border-primary bg-primary text-white shadow-xl shadow-primary/40'
                : tapTimestamps.length > 0
                  ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                  : 'border-border bg-background text-foreground hover:border-primary hover:bg-primary/5'
            }`}
          >
            {texts.tap}
          </button>
          {/* Keyboard shortcut hint */}
          <span className="hidden text-xs text-muted-foreground sm:block">
            {currentLocale === 'ko' ? '또는 Space 키' : 'or press Space'}
          </span>
        </div>

        {/* Tap hint */}
        <p className="mt-4 text-center text-xs text-muted-foreground">{texts.tipContent}</p>
      </div>

      {/* Stats Card */}
      {tapTimestamps.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-around gap-4 text-center">
            {/* Tap Count */}
            <div className="min-w-16">
              <div className="text-2xl font-semibold tabular-nums">{tapTimestamps.length}</div>
              <div className="text-xs text-muted-foreground">{texts.tapCount}</div>
            </div>

            <div className="h-10 w-px bg-border" />

            {/* Average Interval */}
            <div className="min-w-20">
              <div className="text-2xl font-semibold tabular-nums">
                {avgInterval !== null ? `${avgInterval}ms` : '--'}
              </div>
              <div className="text-xs text-muted-foreground">{texts.avgInterval}</div>
            </div>

            {accuracy !== null && (
              <>
                <div className="h-10 w-px bg-border" />

                {/* Accuracy */}
                <div className="min-w-16">
                  <div
                    className={`text-2xl font-semibold tabular-nums ${
                      accuracy >= 90
                        ? 'text-green-600 dark:text-green-400'
                        : accuracy >= 70
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {accuracy}%
                  </div>
                  <div className="text-xs text-muted-foreground">{texts.accuracy}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings Card */}
      <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
        {/* Sound Toggle */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium">
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-primary" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
            {texts.sound}
          </span>
          <button
            type="button"
            onClick={toggleSound}
            className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors ${
              settings.soundEnabled
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {settings.soundEnabled ? texts.on : texts.off}
          </button>
        </div>

        {/* Volume (only show when sound is enabled) */}
        {settings.soundEnabled && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">{texts.volume}</span>
            <div className="flex items-center gap-3">
              <div className="w-24 sm:w-32">
                <Slider
                  value={[settings.volume]}
                  onValueChange={(v) => handleSettingsChange({ volume: v[0] ?? 80 })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              <span className="w-8 text-right text-sm tabular-nums text-muted-foreground">
                {settings.volume}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          {texts.reset}
        </button>
      </div>

      {/* Tool Guide */}
      <ToolGuide title={guide.title} sections={guide.sections} />
    </div>
  );
}

export { defaultTapTempoSettings, type TapTempoSettings } from './settings';
export type { TapTempoProps } from './types';
