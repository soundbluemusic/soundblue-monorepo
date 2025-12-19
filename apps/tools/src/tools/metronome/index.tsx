import { Pause, Play, RotateCcw } from 'lucide-solid';
import { type Component, createEffect, createSignal, For, onCleanup, Show } from 'solid-js';
import { Slider } from '~/components/ui/slider';
import { useLanguage } from '~/i18n';
import { getAudioContext, resumeAudioContext } from '~/lib/audio-context';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';

// ========================================
// Metronome Tool - 메트로놈 (Full Featured)
// ========================================

// Constants
const BPM_RANGE = { MIN: 40, MAX: 240 };
const FREQUENCIES = { ACCENT: 2000, REGULAR: 800 };
const TIMING = {
  SCHEDULER_INTERVAL_MS: 25,
  LOOK_AHEAD_SECONDS: 0.1,
  CLICK_DURATION_SECONDS: 0.08,
};
const PENDULUM = { MAX_ANGLE: 30, SWING_RANGE: 60 };

export interface MetronomeSettings {
  bpm: number;
  beatsPerMeasure: number;
  beatUnit: number;
  volume: number;
  timerMinutes: string;
  timerSeconds: string;
}

export const defaultMetronomeSettings: MetronomeSettings = {
  bpm: 120,
  beatsPerMeasure: 4,
  beatUnit: 4,
  volume: 80,
  timerMinutes: '',
  timerSeconds: '',
};

const MetronomeComponent: Component<ToolProps<MetronomeSettings>> = (props) => {
  const { t } = useLanguage();
  const settings = () => props.settings;

  // State
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentBeat, setCurrentBeat] = createSignal(0);
  const [measureCount, setMeasureCount] = createSignal(0);
  const [_pendulumAngle, setPendulumAngle] = createSignal(0);
  const [elapsedTime, setElapsedTime] = createSignal(0);
  const [countdownTime, setCountdownTime] = createSignal(0);

  // Refs (using let for mutable values)
  let schedulerInterval: ReturnType<typeof setInterval> | null = null;
  let animationId: number | null = null;
  let nextNoteTime = 0;
  let schedulerBeat = 0;
  let startAudioTime = 0;

  // Handle BPM change
  const handleBpmChange = (newBpm: number) => {
    props.onSettingsChange({ bpm: newBpm });
  };

  // Play click sound with precise timing
  const playClick = (time: number, beatNumber: number) => {
    const ctx = getAudioContext();

    const isFirst = beatNumber === 0;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const volumeMultiplier = settings().volume / 100;

    if (isFirst) {
      osc.frequency.value = FREQUENCIES.ACCENT;
      gain.gain.setValueAtTime(0.8 * volumeMultiplier, time);
    } else {
      osc.frequency.value = FREQUENCIES.REGULAR;
      gain.gain.setValueAtTime(0.4 * volumeMultiplier, time);
    }

    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, 0.01 * volumeMultiplier),
      time + TIMING.CLICK_DURATION_SECONDS
    );

    osc.start(time);
    osc.stop(time + TIMING.CLICK_DURATION_SECONDS);
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  // Toggle play/stop (matching drum-machine pattern)
  const togglePlay = async () => {
    if (isPlaying()) {
      handleStop();
    } else {
      await resumeAudioContext();
      const ctx = getAudioContext();

      // Set countdown if timer is set
      const totalMinutes = parseInt(settings().timerMinutes, 10) || 0;
      const totalSeconds = parseInt(settings().timerSeconds, 10) || 0;
      const totalMs = (totalMinutes * 60 + totalSeconds) * 1000;
      if (totalMs > 0) {
        setCountdownTime(totalMs);
      }

      startAudioTime = ctx.currentTime;
      nextNoteTime = ctx.currentTime;
      schedulerBeat = 0;
      setIsPlaying(true);
    }
  };

  // Animation loop effect
  createEffect(() => {
    if (isPlaying()) {
      const animate = () => {
        const ctx = getAudioContext();
        if (startAudioTime === 0) {
          animationId = requestAnimationFrame(animate);
          return;
        }

        const currentTime = ctx.currentTime;
        const secondsPerBeat = 60 / settings().bpm;
        const elapsed = currentTime - startAudioTime;
        const totalBeats = elapsed / secondsPerBeat;
        const currentBeatIndex = Math.floor(totalBeats) % settings().beatsPerMeasure;
        const currentMeasure = Math.floor(totalBeats / settings().beatsPerMeasure) + 1;

        // Pendulum swing
        const swingCycle = totalBeats % 2;
        const angle =
          swingCycle < 1
            ? -PENDULUM.MAX_ANGLE + swingCycle * PENDULUM.SWING_RANGE
            : PENDULUM.MAX_ANGLE - (swingCycle - 1) * PENDULUM.SWING_RANGE;

        setCurrentBeat(currentBeatIndex);
        setMeasureCount(currentMeasure);
        setPendulumAngle(angle);

        const elapsedMs = elapsed * 1000;
        setElapsedTime(elapsedMs);

        if (countdownTime() > 0 && elapsedMs >= countdownTime()) {
          handleStop();
          return;
        }

        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);

      onCleanup(() => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      });
    }
  });

  // Scheduler effect
  createEffect(() => {
    if (isPlaying()) {
      const scheduleNotes = () => {
        const ctx = getAudioContext();
        const secondsPerBeat = 60.0 / settings().bpm;

        while (nextNoteTime < ctx.currentTime + TIMING.LOOK_AHEAD_SECONDS) {
          playClick(nextNoteTime, schedulerBeat);
          nextNoteTime += secondsPerBeat;
          schedulerBeat = (schedulerBeat + 1) % settings().beatsPerMeasure;
        }
      };

      schedulerInterval = setInterval(scheduleNotes, TIMING.SCHEDULER_INTERVAL_MS);

      onCleanup(() => {
        if (schedulerInterval) {
          clearInterval(schedulerInterval);
        }
      });
    }
  });

  const handleReset = () => {
    handleStop();
    setCurrentBeat(0);
    setMeasureCount(0);
    setPendulumAngle(0);
    setElapsedTime(0);
    setCountdownTime(0);
    startAudioTime = 0;
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const remainingTime = () =>
    countdownTime() > 0 ? Math.max(0, countdownTime() - elapsedTime()) : 0;

  return (
    <div class="flex h-full flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-auto">
      {/* BPM Display Card */}
      <div class="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <div class="text-center">
          <div class="text-5xl sm:text-7xl font-bold tabular-nums tracking-tight">
            {settings().bpm}
          </div>
          <div class="text-sm text-muted-foreground mt-1">BPM</div>
        </div>

        {/* BPM Slider */}
        <div class="mt-6 px-2">
          <Slider
            value={[settings().bpm]}
            onChange={(v) => handleBpmChange(v[0] ?? BPM_RANGE.MIN)}
            min={BPM_RANGE.MIN}
            max={BPM_RANGE.MAX}
            step={1}
          />
          <div class="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{BPM_RANGE.MIN}</span>
            <span>{BPM_RANGE.MAX}</span>
          </div>
        </div>

        {/* Beat Indicators */}
        <div class="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <For each={Array.from({ length: settings().beatsPerMeasure })}>
            {(_, i) => (
              <div
                class={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 transition-all duration-100 ${
                  isPlaying() && i() === currentBeat()
                    ? i() === 0
                      ? 'border-red-500 bg-red-500 scale-125 shadow-lg shadow-red-500/50'
                      : 'border-primary bg-primary scale-110 shadow-lg shadow-primary/50'
                    : i() === 0
                      ? 'border-red-300 bg-red-100 dark:border-red-400/50 dark:bg-red-500/20'
                      : 'border-primary/40 bg-primary/20 dark:border-primary/50 dark:bg-primary/20'
                }`}
              />
            )}
          </For>
        </div>
      </div>

      {/* Stats Card */}
      <div class="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-around gap-2 text-center">
          <div class="min-w-15">
            <div class="text-xl sm:text-2xl font-semibold tabular-nums">{measureCount()}</div>
            <div class="text-xs text-muted-foreground">{t().metronome.measure}</div>
          </div>
          <div class="h-8 sm:h-10 w-px bg-border" />
          <div class="min-w-20">
            <div class="text-lg sm:text-2xl font-mono tabular-nums">
              {formatTime(elapsedTime())}
            </div>
            <div class="text-xs text-muted-foreground">{t().metronome.elapsedTime}</div>
          </div>
          <Show when={countdownTime() > 0}>
            <div class="h-8 sm:h-10 w-px bg-border" />
            <div class="min-w-20">
              <div class="text-lg sm:text-2xl font-mono tabular-nums text-primary">
                {formatTime(remainingTime())}
              </div>
              <div class="text-xs text-muted-foreground">{t().metronome.remainingTime}</div>
            </div>
          </Show>
        </div>
      </div>

      {/* Settings Card */}
      <div class="rounded-2xl border border-border bg-card shadow-sm divide-y divide-border">
        {/* Time Signature */}
        <div class="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <span class="text-xs sm:text-sm font-medium">{t().metronome.timeSignature}</span>
          <select
            value={settings().beatsPerMeasure}
            onChange={(e) =>
              props.onSettingsChange({
                beatsPerMeasure: parseInt(e.currentTarget.value, 10),
              })
            }
            class="h-8 sm:h-9 rounded-lg border border-border bg-background px-2 sm:px-3 text-sm transition-colors hover:bg-black/8 dark:hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer disabled:opacity-50"
            disabled={isPlaying()}
          >
            <For each={[2, 3, 4, 5, 6, 7, 8, 9, 12]}>{(n) => <option value={n}>{n}/4</option>}</For>
          </select>
        </div>

        {/* Volume */}
        <div class="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <span class="text-xs sm:text-sm font-medium">{t().metronome.volume}</span>
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-20 sm:w-28">
              <Slider
                value={[settings().volume]}
                onChange={(v) => props.onSettingsChange({ volume: v[0] })}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <span class="w-6 sm:w-8 text-right text-xs sm:text-sm tabular-nums text-muted-foreground">
              {settings().volume}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div class="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <span class="text-xs sm:text-sm font-medium">{t().metronome.timer}</span>
          <div class="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="99"
              value={settings().timerMinutes}
              onInput={(e) => props.onSettingsChange({ timerMinutes: e.currentTarget.value })}
              placeholder="0"
              class="h-8 sm:h-9 w-10 sm:w-12 rounded-lg border border-border bg-background px-1 sm:px-2 text-center text-sm transition-colors hover:bg-black/8 dark:hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
              disabled={isPlaying()}
            />
            <span class="text-muted-foreground font-medium">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={settings().timerSeconds}
              onInput={(e) => props.onSettingsChange({ timerSeconds: e.currentTarget.value })}
              placeholder="00"
              class="h-8 sm:h-9 w-10 sm:w-12 rounded-lg border border-border bg-background px-1 sm:px-2 text-center text-sm transition-colors hover:bg-black/8 dark:hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
              disabled={isPlaying()}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div class="flex items-center justify-center gap-3 sm:gap-4 pt-2">
        {/* Play/Pause Button - Main */}
        <button
          type="button"
          onClick={() => togglePlay()}
          class={`inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-2 text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isPlaying()
              ? 'border-red-600 bg-red-500 hover:bg-red-600 shadow-red-500/30'
              : 'border-primary/80 bg-primary hover:bg-primary/90 shadow-primary/30'
          }`}
        >
          <Show when={isPlaying()} fallback={<Play class="h-6 w-6 sm:h-7 sm:w-7 ml-0.5 sm:ml-1" />}>
            <Pause class="h-6 w-6 sm:h-7 sm:w-7" />
          </Show>
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => handleReset()}
          class="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-200 hover:bg-black/8 dark:hover:bg-white/12 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <RotateCcw class="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
};

// Tool Definition
export const metronomeTool: ToolDefinition<MetronomeSettings> = {
  meta: {
    id: 'metronome',
    name: {
      ko: '메트로놈',
      en: 'Metronome',
    },
    description: {
      ko: '정확한 템포 연습을 위한 메트로놈',
      en: 'Precision metronome for tempo practice',
    },
    icon: '⏱️',
    category: 'music',
    defaultSize: 'lg',
    minSize: { width: 320, height: 400 },
    tags: ['tempo', 'practice', 'rhythm', 'bpm'],
  },
  defaultSettings: defaultMetronomeSettings,
  component: MetronomeComponent,
};

// Auto-register
registerTool(metronomeTool);
