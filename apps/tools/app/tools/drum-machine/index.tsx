import { ChevronDown, Pause, Play, RotateCcw, Timer, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Slider } from '~/components/ui/slider';
import { getAudioContext, resumeAudioContext } from '~/lib/audio-context';
import m from '~/lib/messages';
import { cn } from '~/lib/utils';
import { DrumGrid } from './DrumGrid';
import {
  createEmptyPattern,
  DRUM_DEFAULTS,
  DRUM_SOUNDS,
  type DrumId,
  type DrumMachineSettings,
  type DrumSynthParams,
  defaultDrumMachineSettings,
  METRONOME,
} from './settings';

interface DrumMachineProps {
  settings?: DrumMachineSettings;
  onSettingsChange?: (settings: Partial<DrumMachineSettings>) => void;
}

export function DrumMachine({ settings: propSettings, onSettingsChange }: DrumMachineProps) {
  const [internalSettings, setInternalSettings] = useState(defaultDrumMachineSettings);
  const settings = useMemo(
    () => ({ ...defaultDrumMachineSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<DrumMachineSettings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showSynth, setShowSynth] = useState(false);

  const schedulerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextStepTimeRef = useRef(0);
  const currentStepRef = useRef(0);

  const getSynthParams = useCallback(
    (drumId: DrumId): DrumSynthParams => {
      return settings?.synth?.[drumId] ?? DRUM_DEFAULTS[drumId];
    },
    [settings],
  );

  const updateSynthParam = useCallback(
    (drumId: DrumId, param: keyof DrumSynthParams, value: number) => {
      const currentSynth = settings?.synth ?? { ...DRUM_DEFAULTS };
      const drumParams = currentSynth[drumId] ?? DRUM_DEFAULTS[drumId];
      handleSettingsChange({
        synth: {
          ...currentSynth,
          [drumId]: { ...drumParams, [param]: value },
        },
      });
    },
    [settings, handleSettingsChange],
  );

  const resetSynthParams = useCallback(
    (drumId: DrumId) => {
      const currentSynth = settings?.synth ?? { ...DRUM_DEFAULTS };
      handleSettingsChange({
        synth: {
          ...currentSynth,
          [drumId]: { ...DRUM_DEFAULTS[drumId] },
        },
      });
    },
    [settings, handleSettingsChange],
  );

  const previewDrum = useCallback(
    async (drumId: DrumId) => {
      await resumeAudioContext();
      const ctx = getAudioContext();
      playDrumSound(drumId, ctx.currentTime);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const getPattern = useCallback(() => {
    return settings?.pattern ?? createEmptyPattern(settings?.steps ?? 16);
  }, [settings]);

  const isStepActive = useCallback(
    (drumId: DrumId, step: number): boolean => {
      const pattern = getPattern();
      return pattern[drumId]?.[step] ?? false;
    },
    [getPattern],
  );

  const playMetronomeClick = useCallback(
    (time: number, isAccent: boolean) => {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const vol = settings.volume * 0.5;
      osc.frequency.value = isAccent ? METRONOME.ACCENT_FREQ : METRONOME.REGULAR_FREQ;
      osc.type = 'sine';

      gain.gain.setValueAtTime(isAccent ? vol * 0.8 : vol * 0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + METRONOME.CLICK_DURATION);

      osc.start(time);
      osc.stop(time + METRONOME.CLICK_DURATION);
    },
    [settings.volume],
  );

  const playDrumSound = useCallback(
    (drumId: DrumId, time: number) => {
      const ctx = getAudioContext();
      const params = getSynthParams(drumId);
      const vol = settings.volume;

      const punchFactor = params.punch / 100;
      const toneFactor = params.tone / 100;

      if (drumId === 'kick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const startFreq = params.pitch * (1 + punchFactor * 2);
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, params.pitch), time + 0.05);
        osc.type = 'sine';

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
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = params.pitch;
        osc.type = 'triangle';

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
    },
    [getSynthParams, settings.volume],
  );

  const scheduler = useCallback(() => {
    const ctx = getAudioContext();
    const scheduleAheadTime = 0.1;
    const lookahead = 25;

    while (nextStepTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const step = currentStepRef.current;
      const scheduledTime = nextStepTimeRef.current;

      if (settings.metronomeEnabled && step % 4 === 0) {
        const isAccent = step === 0;
        playMetronomeClick(scheduledTime, isAccent);
      }

      DRUM_SOUNDS.forEach((drum) => {
        if (isStepActive(drum.id, step)) {
          playDrumSound(drum.id, scheduledTime);
        }
      });

      const delay = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
      setTimeout(() => setCurrentStep(step), delay);

      const secondsPerBeat = 60.0 / settings.bpm / 4;
      nextStepTimeRef.current += secondsPerBeat;
      currentStepRef.current = (step + 1) % settings.steps;
    }

    schedulerTimeoutRef.current = setTimeout(scheduler, lookahead);
  }, [
    settings.bpm,
    settings.steps,
    settings.metronomeEnabled,
    isStepActive,
    playDrumSound,
    playMetronomeClick,
  ]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      if (schedulerTimeoutRef.current) {
        clearTimeout(schedulerTimeoutRef.current);
        schedulerTimeoutRef.current = null;
      }
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      await resumeAudioContext();
      const ctx = getAudioContext();
      currentStepRef.current = 0;
      nextStepTimeRef.current = ctx.currentTime;
      scheduler();
      setIsPlaying(true);
    }
  }, [isPlaying, scheduler]);

  const setStep = useCallback(
    (drumId: DrumId, step: number, value: boolean) => {
      const currentPattern = getPattern();
      if (currentPattern[drumId]?.[step] === value) return;
      const newPattern = { ...currentPattern };
      newPattern[drumId] = [...(currentPattern[drumId] || Array(settings.steps).fill(false))];
      newPattern[drumId][step] = value;
      handleSettingsChange({ pattern: newPattern });
    },
    [getPattern, settings.steps, handleSettingsChange],
  );

  const clearPattern = useCallback(() => {
    handleSettingsChange({ pattern: createEmptyPattern(settings.steps) });
  }, [settings.steps, handleSettingsChange]);

  useEffect(() => {
    return () => {
      if (schedulerTimeoutRef.current) {
        clearTimeout(schedulerTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-2 p-2 sm:gap-3 sm:p-3">
      {/* Header Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isPlaying
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={clearPattern}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleSettingsChange({ metronomeEnabled: !settings.metronomeEnabled })}
              title={m['drumMachine.metronome']?.()}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                settings.metronomeEnabled
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Timer className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">BPM</span>
            <input
              type="number"
              value={settings.bpm}
              onChange={(e) =>
                handleSettingsChange({
                  bpm: Math.max(
                    40,
                    Math.min(300, Number.parseInt(e.currentTarget.value, 10) || 120),
                  ),
                })
              }
              className="w-14 rounded border bg-background px-1.5 py-1 text-center text-sm transition-colors hover:bg-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/12"
            />
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[settings.volume * 100]}
            onValueChange={([v]) => handleSettingsChange({ volume: (v ?? 0) / 100 })}
            max={100}
            className="w-20"
          />
        </div>
      </div>

      {/* Pattern Grid */}
      <div className="-mx-2 min-h-0 flex-1 select-none overflow-x-auto overflow-y-hidden px-2">
        <DrumGrid
          pattern={getPattern()}
          steps={settings.steps}
          currentStep={currentStep}
          isPlaying={isPlaying}
          onStepToggle={setStep}
          className="rounded-lg"
        />
      </div>

      {/* Synth Panel Toggle */}
      <button
        type="button"
        onClick={() => setShowSynth(!showSynth)}
        className={cn(
          'flex w-full items-center justify-center gap-2 border-t py-2',
          'text-sm text-muted-foreground transition-colors hover:text-foreground',
        )}
      >
        <Volume2 className="h-4 w-4" />
        <span>Drum Synth</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', showSynth && 'rotate-180')} />
      </button>

      {/* Synth Panel */}
      {showSynth && (
        <div className="max-h-64 space-y-3 overflow-auto border-t bg-muted/30 p-3">
          {DRUM_SOUNDS.map((drum) => {
            const params = getSynthParams(drum.id);
            return (
              <div key={drum.id} className="rounded-lg border bg-background p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{drum.icon}</span>
                    <span className="text-sm font-medium">{drum.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => previewDrum(drum.id)}
                      className="inline-flex h-7 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Play className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => resetSynthParams(drum.id)}
                      className="inline-flex h-7 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Pitch</span>
                      <span className="font-mono text-xs">{params.pitch}Hz</span>
                    </div>
                    <Slider
                      value={[params.pitch]}
                      onValueChange={([v]) => updateSynthParam(drum.id, 'pitch', v ?? 80)}
                      min={drum.id === 'kick' ? 20 : drum.id === 'hihat' ? 400 : 80}
                      max={drum.id === 'kick' ? 150 : drum.id === 'hihat' ? 2000 : 800}
                      step={1}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Decay</span>
                      <span className="font-mono text-xs">
                        {(params.decay * 1000).toFixed(0)}ms
                      </span>
                    </div>
                    <Slider
                      value={[params.decay * 1000]}
                      onValueChange={([v]) => updateSynthParam(drum.id, 'decay', (v ?? 100) / 1000)}
                      min={10}
                      max={drum.id === 'kick' ? 1000 : 500}
                      step={1}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tone</span>
                      <span className="font-mono text-xs">{params.tone}%</span>
                    </div>
                    <Slider
                      value={[params.tone]}
                      onValueChange={([v]) => updateSynthParam(drum.id, 'tone', v ?? 50)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Punch</span>
                      <span className="font-mono text-xs">{params.punch}%</span>
                    </div>
                    <Slider
                      value={[params.punch]}
                      onValueChange={([v]) => updateSynthParam(drum.id, 'punch', v ?? 50)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { type DrumId, type DrumMachineSettings, defaultDrumMachineSettings } from './settings';
