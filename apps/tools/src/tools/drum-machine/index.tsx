import { ChevronDown, Pause, Play, RotateCcw, Timer, Volume2 } from 'lucide-solid';
import { type Component, createSignal, For, onCleanup, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Slider } from '~/components/ui/slider';
import { useLanguage } from '~/i18n';
import { getAudioContext, resumeAudioContext } from '~/lib/audio-context';
import { cn } from '~/lib/utils';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { DrumGrid, type DrumId } from './components/DrumGrid';

// ========================================
// Drum Machine Tool - 드럼 머신
// ========================================

// Drum synth parameters
interface DrumSynthParams {
  pitch: number; // Base frequency (Hz)
  decay: number; // Decay time (seconds)
  tone: number; // Tone/brightness (0-100)
  punch: number; // Attack punch (0-100)
}

const DRUM_DEFAULTS: Record<DrumId, DrumSynthParams> = {
  kick: { pitch: 60, decay: 0.5, tone: 30, punch: 80 },
  snare: { pitch: 200, decay: 0.2, tone: 50, punch: 60 },
  hihat: { pitch: 800, decay: 0.05, tone: 90, punch: 40 },
  clap: { pitch: 400, decay: 0.15, tone: 60, punch: 70 },
};

const DRUM_SOUNDS: { id: DrumId; name: string; icon: string }[] = [
  { id: 'kick', name: 'Kick', icon: '🔈' },
  { id: 'snare', name: 'Snare', icon: '🥁' },
  { id: 'hihat', name: 'Hi-Hat', icon: '🎛️' },
  { id: 'clap', name: 'Clap', icon: '👏' },
];

export interface DrumMachineSettings {
  bpm: number;
  steps: number;
  pattern: Record<DrumId, boolean[]>;
  volume: number;
  swing: number;
  metronomeEnabled: boolean;
  synth: Record<DrumId, DrumSynthParams>;
}

const createEmptyPattern = (steps: number): Record<DrumId, boolean[]> => ({
  kick: Array(steps).fill(false),
  snare: Array(steps).fill(false),
  hihat: Array(steps).fill(false),
  clap: Array(steps).fill(false),
});

export const defaultDrumMachineSettings: DrumMachineSettings = {
  bpm: 120,
  steps: 16,
  pattern: createEmptyPattern(16),
  volume: 0.7,
  swing: 0,
  metronomeEnabled: false,
  synth: { ...DRUM_DEFAULTS },
};

// Metronome constants
const METRONOME = {
  ACCENT_FREQ: 1500,
  REGULAR_FREQ: 1000,
  CLICK_DURATION: 0.05,
};

const DrumMachineComponent: Component<ToolProps<DrumMachineSettings>> = (props) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentStep, setCurrentStep] = createSignal(-1);
  const [showSynth, setShowSynth] = createSignal(false);

  let schedulerTimeout: ReturnType<typeof setTimeout> | null = null;
  let nextStepTime = 0;
  let currentStepRef = 0;

  const settings = () => props.settings;

  // Get synth params with fallback to defaults
  const getSynthParams = (drumId: DrumId): DrumSynthParams => {
    return settings()?.synth?.[drumId] ?? DRUM_DEFAULTS[drumId];
  };

  // Update synth params for a drum
  const updateSynthParam = (drumId: DrumId, param: keyof DrumSynthParams, value: number) => {
    const currentSynth = settings()?.synth ?? { ...DRUM_DEFAULTS };
    const drumParams = currentSynth[drumId] ?? DRUM_DEFAULTS[drumId];
    props.onSettingsChange({
      synth: {
        ...currentSynth,
        [drumId]: { ...drumParams, [param]: value },
      },
    });
  };

  // Reset synth params for a drum
  const resetSynthParams = (drumId: DrumId) => {
    const currentSynth = settings()?.synth ?? { ...DRUM_DEFAULTS };
    props.onSettingsChange({
      synth: {
        ...currentSynth,
        [drumId]: { ...DRUM_DEFAULTS[drumId] },
      },
    });
  };

  // Preview drum sound
  const previewDrum = async (drumId: DrumId) => {
    await resumeAudioContext();
    const ctx = getAudioContext();
    playDrumSound(drumId, ctx.currentTime);
  };

  // Safe pattern access with fallback
  const getPattern = () => settings()?.pattern ?? createEmptyPattern(settings()?.steps ?? 16);
  const isStepActive = (drumId: DrumId, step: number): boolean => {
    const pattern = getPattern();
    return pattern[drumId]?.[step] ?? false;
  };

  // Play metronome click sound
  const playMetronomeClick = (time: number, isAccent: boolean) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const vol = settings().volume * 0.5; // Metronome slightly quieter than drums
    osc.frequency.value = isAccent ? METRONOME.ACCENT_FREQ : METRONOME.REGULAR_FREQ;
    osc.type = 'sine';

    gain.gain.setValueAtTime(isAccent ? vol * 0.8 : vol * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + METRONOME.CLICK_DURATION);

    osc.start(time);
    osc.stop(time + METRONOME.CLICK_DURATION);
  };

  // Handle BPM change
  const handleBpmChange = (newBpm: number) => {
    props.onSettingsChange({ bpm: newBpm });
  };

  // Play drum sound with synth parameters (using shared AudioContext)
  const playDrumSound = (drumId: DrumId, time: number) => {
    const ctx = getAudioContext();
    const params = getSynthParams(drumId);
    const vol = settings().volume;

    // Punch affects attack characteristics
    const punchFactor = params.punch / 100;
    // Tone affects harmonic content
    const toneFactor = params.tone / 100;

    if (drumId === 'kick') {
      // Kick: pitch sweep sine wave
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const startFreq = params.pitch * (1 + punchFactor * 2); // Higher punch = higher start freq
      osc.frequency.setValueAtTime(startFreq, time);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, params.pitch), time + 0.05);
      osc.type = 'sine';

      // Add sub harmonic for more body based on tone
      if (toneFactor < 0.5) {
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.frequency.value = params.pitch * 0.5;
        sub.type = 'sine';
        subGain.gain.setValueAtTime(vol * (0.5 - toneFactor), time);
        subGain.gain.exponentialRampToValueAtTime(0.01, time + params.decay * 0.8);
        sub.start(time);
        sub.stop(time + params.decay);
      }

      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);
      osc.start(time);
      osc.stop(time + params.decay);
    } else if (drumId === 'snare') {
      // Snare: triangle + noise
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = params.pitch;
      osc.type = 'triangle';

      // Noise component - more noise with higher tone
      const noise = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      noise.frequency.value = 800 + toneFactor * 400;
      noise.type = 'square';
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseGain.gain.setValueAtTime(vol * (0.2 + toneFactor * 0.3), time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);
      noise.start(time);
      noise.stop(time + params.decay);

      gain.gain.setValueAtTime(vol * punchFactor, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);
      osc.start(time);
      osc.stop(time + params.decay);
    } else if (drumId === 'hihat') {
      // Hi-hat: high frequency square/saw mix
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.frequency.value = params.pitch;
      osc1.type = 'square';
      osc2.frequency.value = params.pitch * (1.5 + toneFactor);
      osc2.type = 'sawtooth';

      gain.gain.setValueAtTime(vol * 0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);
      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + params.decay);
      osc2.stop(time + params.decay);
    } else {
      // Clap: multiple short bursts
      const burstCount = 3;
      const burstGap = 0.01;

      for (let i = 0; i < burstCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = params.pitch * (1 + toneFactor * 0.5);
        osc.type = 'sawtooth';

        const burstTime = time + i * burstGap;
        const burstVol = vol * (1 - i * 0.2) * punchFactor;
        gain.gain.setValueAtTime(burstVol, burstTime);
        gain.gain.exponentialRampToValueAtTime(0.01, burstTime + params.decay / burstCount);
        osc.start(burstTime);
        osc.stop(burstTime + params.decay / burstCount);
      }
    }
  };

  // Scheduler for precise timing (using shared AudioContext)
  const scheduler = () => {
    const ctx = getAudioContext();

    const scheduleAheadTime = 0.1;
    const lookahead = 25;

    while (nextStepTime < ctx.currentTime + scheduleAheadTime) {
      const step = currentStepRef;
      const scheduledTime = nextStepTime;

      // Play metronome click on quarter notes (every 4 steps)
      if (settings().metronomeEnabled && step % 4 === 0) {
        const isAccent = step === 0; // First beat of measure
        playMetronomeClick(scheduledTime, isAccent);
      }

      // Play drums for this step
      DRUM_SOUNDS.forEach((drum) => {
        if (isStepActive(drum.id, step)) {
          playDrumSound(drum.id, scheduledTime);
        }
      });

      // Schedule UI update to sync with audio
      const delay = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
      setTimeout(() => setCurrentStep(step), delay);

      // Advance step
      const secondsPerBeat = 60.0 / settings().bpm / 4;
      nextStepTime += secondsPerBeat;
      currentStepRef = (step + 1) % settings().steps;
    }

    schedulerTimeout = setTimeout(scheduler, lookahead);
  };

  // Toggle play/stop (using shared AudioContext)
  const togglePlay = async () => {
    if (isPlaying()) {
      if (schedulerTimeout) {
        clearTimeout(schedulerTimeout);
        schedulerTimeout = null;
      }
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      await resumeAudioContext();
      const ctx = getAudioContext();
      currentStepRef = 0;
      nextStepTime = ctx.currentTime;
      scheduler();
      setIsPlaying(true);
    }
  };

  // Set pattern step to specific value
  const setStep = (drumId: DrumId, step: number, value: boolean) => {
    const currentPattern = getPattern();
    if (currentPattern[drumId]?.[step] === value) return; // No change needed
    const newPattern = { ...currentPattern };
    newPattern[drumId] = [...(currentPattern[drumId] || Array(settings().steps).fill(false))];
    newPattern[drumId][step] = value;
    props.onSettingsChange({ pattern: newPattern });
  };

  // Clear pattern
  const clearPattern = () => {
    props.onSettingsChange({ pattern: createEmptyPattern(settings().steps) });
  };

  // Cleanup
  onCleanup(() => {
    if (schedulerTimeout) {
      clearTimeout(schedulerTimeout);
    }
  });

  return (
    <div class="flex h-full flex-col gap-2 p-2 sm:gap-3 sm:p-3">
      {/* Header Controls - Stack on mobile */}
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Row 1: Playback + BPM */}
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <Button
              variant={isPlaying() ? 'destructive' : 'default'}
              size="sm"
              onClick={togglePlay}
            >
              <Show when={isPlaying()} fallback={<Play class="h-4 w-4" />}>
                <Pause class="h-4 w-4" />
              </Show>
            </Button>
            <Button variant="outline" size="sm" onClick={clearPattern}>
              <RotateCcw class="h-4 w-4" />
            </Button>
            <Button
              variant={settings().metronomeEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                props.onSettingsChange({ metronomeEnabled: !settings().metronomeEnabled })
              }
              title={t().drumMachine.metronome}
            >
              <Timer class="h-4 w-4" />
            </Button>
          </div>
          {/* BPM - always visible */}
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-muted-foreground">BPM</span>
            <input
              type="number"
              value={settings().bpm}
              onInput={(e) =>
                handleBpmChange(
                  Math.max(40, Math.min(300, parseInt(e.currentTarget.value, 10) || 120))
                )
              }
              class="w-14 rounded border bg-background px-1.5 py-1 text-center text-sm transition-colors hover:bg-black/[0.08] dark:hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        {/* Row 2: Volume (hidden on very small, shown inline on sm+) */}
        <div class="hidden sm:flex items-center gap-2">
          <Volume2 class="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[settings().volume * 100]}
            onChange={([v]) => props.onSettingsChange({ volume: (v ?? 0) / 100 })}
            max={100}
            class="w-20"
          />
        </div>
      </div>

      {/* Pattern Grid - Canvas 2D with horizontal scroll */}
      <div class="flex-1 min-h-0 overflow-x-auto overflow-y-hidden select-none -mx-2 px-2">
        <DrumGrid
          pattern={getPattern()}
          steps={settings().steps}
          currentStep={currentStep()}
          isPlaying={isPlaying()}
          onStepToggle={setStep}
          onDragStart={() => {}}
          onDragEnter={() => {}}
          onDragEnd={() => {}}
          class="rounded-lg"
        />
      </div>

      {/* Synth Panel Toggle */}
      <button
        type="button"
        onClick={() => setShowSynth(!showSynth())}
        class={cn(
          'flex w-full items-center justify-center gap-2 py-2 border-t',
          'text-sm text-muted-foreground hover:text-foreground transition-colors'
        )}
      >
        <Volume2 class="h-4 w-4" />
        <span>Drum Synth</span>
        <ChevronDown class={cn('h-4 w-4 transition-transform', showSynth() && 'rotate-180')} />
      </button>

      {/* Synth Panel */}
      <Show when={showSynth()}>
        <div class="border-t bg-muted/30 p-3 space-y-3 max-h-64 overflow-auto">
          <For each={DRUM_SOUNDS}>
            {(drum) => {
              const params = () => getSynthParams(drum.id);
              return (
                <div class="rounded-lg border bg-background p-3">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">{drum.icon}</span>
                      <span class="text-sm font-medium">{drum.name}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => previewDrum(drum.id)}
                        class="h-7 px-2"
                      >
                        <Play class="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetSynthParams(drum.id)}
                        class="h-7 px-2"
                      >
                        <RotateCcw class="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    {/* Pitch */}
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-muted-foreground">Pitch</span>
                        <span class="text-xs font-mono">{params().pitch}Hz</span>
                      </div>
                      <Slider
                        value={[params().pitch]}
                        onChange={([v]) => updateSynthParam(drum.id, 'pitch', v ?? 80)}
                        min={drum.id === 'kick' ? 20 : drum.id === 'hihat' ? 400 : 80}
                        max={drum.id === 'kick' ? 150 : drum.id === 'hihat' ? 2000 : 800}
                        step={1}
                      />
                    </div>

                    {/* Decay */}
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-muted-foreground">Decay</span>
                        <span class="text-xs font-mono">
                          {(params().decay * 1000).toFixed(0)}ms
                        </span>
                      </div>
                      <Slider
                        value={[params().decay * 1000]}
                        onChange={([v]) => updateSynthParam(drum.id, 'decay', (v ?? 100) / 1000)}
                        min={10}
                        max={drum.id === 'kick' ? 1000 : 500}
                        step={1}
                      />
                    </div>

                    {/* Tone */}
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-muted-foreground">Tone</span>
                        <span class="text-xs font-mono">{params().tone}%</span>
                      </div>
                      <Slider
                        value={[params().tone]}
                        onChange={([v]) => updateSynthParam(drum.id, 'tone', v ?? 50)}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>

                    {/* Punch */}
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-muted-foreground">Punch</span>
                        <span class="text-xs font-mono">{params().punch}%</span>
                      </div>
                      <Slider
                        value={[params().punch]}
                        onChange={([v]) => updateSynthParam(drum.id, 'punch', v ?? 50)}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
};

// Tool Definition
export const drumMachineTool: ToolDefinition<DrumMachineSettings> = {
  meta: {
    id: 'drum-machine',
    name: {
      ko: '드럼 머신',
      en: 'Drum Machine',
    },
    description: {
      ko: '16스텝 드럼 패턴 시퀀서',
      en: '16-step drum pattern sequencer',
    },
    icon: '🥁',
    category: 'music',
    defaultSize: 'lg',
    minSize: { width: 400, height: 300 },
    tags: ['drums', 'beats', 'sequencer', 'rhythm'],
  },
  defaultSettings: defaultDrumMachineSettings,
  component: DrumMachineComponent,
};

// Auto-register
registerTool(drumMachineTool);
