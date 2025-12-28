import { Pause, Play, RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Slider } from '~/components/ui/slider';
import { useMetronome } from '~/hooks/useMetronome';
import m from '~/lib/messages';
import { BPM_RANGE, defaultMetronomeSettings, type MetronomeSettings } from './settings';

// ========================================
// Metronome Tool - Tone.js Version
// ========================================

interface MetronomeProps {
  settings?: MetronomeSettings;
  onSettingsChange?: (settings: Partial<MetronomeSettings>) => void;
}

export function Metronome({ settings: propSettings, onSettingsChange }: MetronomeProps) {
  // Merge provided settings with defaults
  const [internalSettings, setInternalSettings] = useState(defaultMetronomeSettings);
  const settings = useMemo(
    () => ({ ...defaultMetronomeSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<MetronomeSettings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  // Calculate timer duration in milliseconds
  const timerDuration = useMemo(() => {
    const minutes = Number.parseInt(settings.timerMinutes, 10) || 0;
    const seconds = Number.parseInt(settings.timerSeconds, 10) || 0;
    return (minutes * 60 + seconds) * 1000;
  }, [settings.timerMinutes, settings.timerSeconds]);

  // Use Tone.js metronome hook
  const metronome = useMetronome({
    initialBpm: settings.bpm,
    beatsPerMeasure: settings.beatsPerMeasure,
    volume: -6 + (settings.volume / 100) * 12, // Convert 0-100 to dB range
    accentFirst: true,
    timerDuration,
  });

  // Handle BPM change
  const handleBpmChange = useCallback(
    (newBpm: number) => {
      handleSettingsChange({ bpm: newBpm });
      metronome.setBpm(newBpm);
    },
    [handleSettingsChange, metronome],
  );

  // Handle beats per measure change
  const handleBeatsChange = useCallback(
    (beats: number) => {
      handleSettingsChange({ beatsPerMeasure: beats });
      metronome.setBeatsPerMeasure(beats);
    },
    [handleSettingsChange, metronome],
  );

  // Handle volume change
  const handleVolumeChange = useCallback(
    (volume: number) => {
      handleSettingsChange({ volume });
      metronome.setVolume(-6 + (volume / 100) * 12);
    },
    [handleSettingsChange, metronome],
  );

  // Handle timer change
  const handleTimerChange = useCallback(
    (minutes: string, seconds: string) => {
      handleSettingsChange({ timerMinutes: minutes, timerSeconds: seconds });
      const ms =
        ((Number.parseInt(minutes, 10) || 0) * 60 + (Number.parseInt(seconds, 10) || 0)) * 1000;
      metronome.setTimerDuration(ms);
    },
    [handleSettingsChange, metronome],
  );

  const handleReset = useCallback(() => {
    metronome.reset();
  }, [metronome]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const beatIndicators = useMemo(
    () => Array.from({ length: settings.beatsPerMeasure }),
    [settings.beatsPerMeasure],
  );

  const timeSignatureOptions = [2, 3, 4, 5, 6, 7, 8, 9, 12];

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-3 sm:gap-4 sm:p-4">
      {/* BPM Display Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="text-center">
          <div className="text-5xl font-bold tabular-nums tracking-tight sm:text-7xl">
            {settings.bpm}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">BPM</div>
        </div>

        {/* BPM Slider */}
        <div className="mt-6 px-2">
          <Slider
            value={[settings.bpm]}
            onValueChange={(v) => handleBpmChange(v[0] ?? BPM_RANGE.MIN)}
            min={BPM_RANGE.MIN}
            max={BPM_RANGE.MAX}
            step={1}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{BPM_RANGE.MIN}</span>
            <span>{BPM_RANGE.MAX}</span>
          </div>
        </div>

        {/* Beat Indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {beatIndicators.map((_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-all duration-100 sm:h-5 sm:w-5 ${
                metronome.isPlaying && i === metronome.currentBeat
                  ? i === 0
                    ? 'scale-125 border-red-500 bg-red-500 shadow-lg shadow-red-500/50'
                    : 'scale-110 border-primary bg-primary shadow-lg shadow-primary/50'
                  : i === 0
                    ? 'border-red-300 bg-red-100 dark:border-red-400/50 dark:bg-red-500/20'
                    : 'border-primary/40 bg-primary/20 dark:border-primary/50 dark:bg-primary/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center justify-around gap-2 text-center">
          <div className="min-w-15">
            <div className="text-xl font-semibold tabular-nums sm:text-2xl">
              {metronome.measureCount}
            </div>
            <div className="text-xs text-muted-foreground">{m['metronome.measure']?.()}</div>
          </div>
          <div className="h-8 w-px bg-border sm:h-10" />
          <div className="min-w-20">
            <div className="font-mono text-lg tabular-nums sm:text-2xl">
              {formatTime(metronome.elapsedTime)}
            </div>
            <div className="text-xs text-muted-foreground">{m['metronome.elapsedTime']?.()}</div>
          </div>
          {timerDuration > 0 && (
            <>
              <div className="h-8 w-px bg-border sm:h-10" />
              <div className="min-w-20">
                <div className="font-mono text-lg tabular-nums text-primary sm:text-2xl">
                  {formatTime(metronome.remainingTime)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {m['metronome.remainingTime']?.()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Settings Card */}
      <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
        {/* Time Signature */}
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="text-xs font-medium sm:text-sm">{m['metronome.timeSignature']?.()}</span>
          <select
            value={settings.beatsPerMeasure}
            onChange={(e) => handleBeatsChange(Number.parseInt(e.currentTarget.value, 10))}
            className="h-8 cursor-pointer rounded-lg border border-border bg-background px-2 text-sm transition-colors hover:bg-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 dark:hover:bg-white/12 sm:h-9 sm:px-3"
            disabled={metronome.isPlaying}
          >
            {timeSignatureOptions.map((n) => (
              <option key={n} value={n}>
                {n}/4
              </option>
            ))}
          </select>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="text-xs font-medium sm:text-sm">{m['metronome.volume']?.()}</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-20 sm:w-28">
              <Slider
                value={[settings.volume]}
                onValueChange={(v) => handleVolumeChange(v[0] ?? 100)}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <span className="w-6 text-right text-xs tabular-nums text-muted-foreground sm:w-8 sm:text-sm">
              {settings.volume}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="text-xs font-medium sm:text-sm">{m['metronome.timer']?.()}</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="99"
              value={settings.timerMinutes}
              onChange={(e) => handleTimerChange(e.currentTarget.value, settings.timerSeconds)}
              placeholder="0"
              className="h-8 w-10 rounded-lg border border-border bg-background px-1 text-center text-sm transition-colors hover:bg-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 dark:hover:bg-white/12 sm:h-9 sm:w-12 sm:px-2"
              disabled={metronome.isPlaying}
            />
            <span className="font-medium text-muted-foreground">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={settings.timerSeconds}
              onChange={(e) => handleTimerChange(settings.timerMinutes, e.currentTarget.value)}
              placeholder="00"
              className="h-8 w-10 rounded-lg border border-border bg-background px-1 text-center text-sm transition-colors hover:bg-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 dark:hover:bg-white/12 sm:h-9 sm:w-12 sm:px-2"
              disabled={metronome.isPlaying}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 pt-2 sm:gap-4">
        {/* Play/Pause Button - Main */}
        <button
          type="button"
          onClick={metronome.toggle}
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-white shadow-lg transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 sm:h-16 sm:w-16 ${
            metronome.isPlaying
              ? 'border-red-600 bg-red-500 shadow-red-500/30 hover:bg-red-600'
              : 'border-primary/80 bg-primary shadow-primary/30 hover:bg-primary/90'
          }`}
        >
          {metronome.isPlaying ? (
            <Pause className="h-6 w-6 sm:h-7 sm:w-7" />
          ) : (
            <Play className="ml-0.5 h-6 w-6 sm:ml-1 sm:h-7 sm:w-7" />
          )}
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-200 hover:bg-black/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 dark:hover:bg-white/12 sm:h-12 sm:w-12"
        >
          <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
}

export { defaultMetronomeSettings, type MetronomeSettings } from './settings';
