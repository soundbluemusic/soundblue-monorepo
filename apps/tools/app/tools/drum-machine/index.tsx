import { ChevronDown, Music, Pause, Play, RotateCcw, Timer, Volume2 } from 'lucide-react';
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
  PRESET_PATTERNS,
  type PresetName,
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
  const [showPresets, setShowPresets] = useState(false);

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
      try {
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
      } catch (e) {
        console.error('[DrumMachine] Metronome click failed:', e);
      }
    },
    [settings.volume],
  );

  // Create real white noise using AudioBuffer (like HTML reference)
  const createNoiseBuffer = useCallback((ctx: AudioContext, duration: number): AudioBuffer => {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // Real white noise: -1 to 1
    }
    return buffer;
  }, []);

  const playDrumSound = useCallback(
    (drumId: DrumId, time: number) => {
      try {
        const ctx = getAudioContext();
        const params = getSynthParams(drumId);
        const vol = settings.volume;

        const punchFactor = params.punch / 100;
        const toneFactor = params.tone / 100;

        if (drumId === 'kick') {
          // Kick: Sine oscillator with pitch sweep (like HTML reference)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          const startFreq = 150 * (1 + punchFactor);
          osc.frequency.setValueAtTime(startFreq, time);
          osc.frequency.exponentialRampToValueAtTime(Math.max(20, params.pitch), time + 0.05);
          osc.type = 'sine';

          gain.gain.setValueAtTime(vol, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);
          osc.start(time);
          osc.stop(time + params.decay);
        } else if (drumId === 'snare') {
          // Snare: Triangle oscillator + real noise buffer (like HTML reference)
          // Body oscillator
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.frequency.value = params.pitch;
          osc.type = 'triangle';
          oscGain.gain.setValueAtTime(vol * 0.5 * punchFactor, time);
          oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
          osc.start(time);
          osc.stop(time + 0.1);

          // Noise (real AudioBuffer noise, like HTML reference)
          const noiseBuffer = createNoiseBuffer(ctx, params.decay);
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          const noiseGain = ctx.createGain();
          noise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noiseGain.gain.setValueAtTime(vol * (0.3 + toneFactor * 0.4), time);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);
          noise.start(time);
          noise.stop(time + params.decay);
        } else if (drumId === 'hihat' || drumId === 'openhat') {
          // Hi-hat/Open hat: Noise + highpass filter (like HTML reference)
          const duration = drumId === 'hihat' ? params.decay : params.decay * 2;

          const noiseBuffer = createNoiseBuffer(ctx, duration);
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;

          // Highpass filter at 8kHz (like HTML reference)
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = params.pitch; // Default 8000Hz

          const gain = ctx.createGain();
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          const hatVolume = drumId === 'openhat' ? vol * 0.4 : vol * 0.3;
          gain.gain.setValueAtTime(hatVolume, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
          noise.start(time);
          noise.stop(time + duration);
        } else if (drumId === 'clap') {
          // Clap: Multiple short noise bursts (like HTML reference)
          const burstCount = 4;
          const burstGap = 0.02;

          for (let i = 0; i < burstCount; i++) {
            const burstDuration = 0.03;
            const noiseBuffer = createNoiseBuffer(ctx, burstDuration);
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            // Bandpass filter for clap character
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000 + toneFactor * 1000;
            filter.Q.value = 0.5;

            const gain = ctx.createGain();
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            const burstTime = time + i * burstGap;
            const burstVol = vol * (1 - i * 0.15) * punchFactor;
            gain.gain.setValueAtTime(burstVol * 0.5, burstTime);
            gain.gain.exponentialRampToValueAtTime(0.01, burstTime + burstDuration);
            noise.start(burstTime);
            noise.stop(burstTime + burstDuration);
          }

          // Tail noise
          const tailDuration = params.decay;
          const tailBuffer = createNoiseBuffer(ctx, tailDuration);
          const tailNoise = ctx.createBufferSource();
          tailNoise.buffer = tailBuffer;

          const tailFilter = ctx.createBiquadFilter();
          tailFilter.type = 'highpass';
          tailFilter.frequency.value = 1000;

          const tailGain = ctx.createGain();
          tailNoise.connect(tailFilter);
          tailFilter.connect(tailGain);
          tailGain.connect(ctx.destination);

          const tailStart = time + burstCount * burstGap;
          tailGain.gain.setValueAtTime(vol * 0.3 * punchFactor, tailStart);
          tailGain.gain.exponentialRampToValueAtTime(0.01, tailStart + tailDuration);
          tailNoise.start(tailStart);
          tailNoise.stop(tailStart + tailDuration);
        }
      } catch (e) {
        console.error('[DrumMachine] playDrumSound failed:', e);
      }
    },
    [getSynthParams, settings.volume, createNoiseBuffer],
  );

  const previewDrum = useCallback(
    async (drumId: DrumId) => {
      try {
        await resumeAudioContext();
        const ctx = getAudioContext();
        playDrumSound(drumId, ctx.currentTime);
      } catch (e) {
        console.error('[DrumMachine] previewDrum failed:', e);
      }
    },
    [playDrumSound],
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
      try {
        await resumeAudioContext();
        const ctx = getAudioContext();
        currentStepRef.current = 0;
        nextStepTimeRef.current = ctx.currentTime;
        scheduler();
        setIsPlaying(true);
      } catch (e) {
        console.error('[DrumMachine] Failed to start audio:', e);
      }
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

  const loadPreset = useCallback(
    (presetName: PresetName) => {
      const preset = PRESET_PATTERNS[presetName];
      if (preset) {
        // Deep copy the pattern to avoid mutation
        const patternCopy: Record<DrumId, boolean[]> = {
          kick: [...preset.pattern.kick],
          snare: [...preset.pattern.snare],
          hihat: [...preset.pattern.hihat],
          openhat: [...preset.pattern.openhat],
          clap: [...preset.pattern.clap],
        };
        handleSettingsChange({ pattern: patternCopy });
        setShowPresets(false);
      }
    },
    [handleSettingsChange],
  );

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

      {/* Preset Panel Toggle */}
      <button
        type="button"
        onClick={() => setShowPresets(!showPresets)}
        className={cn(
          'flex w-full items-center justify-center gap-2 border-t py-2',
          'text-sm text-muted-foreground transition-colors hover:text-foreground',
        )}
      >
        <Music className="h-4 w-4" />
        <span>Presets</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', showPresets && 'rotate-180')} />
      </button>

      {/* Preset Panel */}
      {showPresets && (
        <div className="flex flex-wrap gap-2 border-t bg-muted/30 p-3">
          {(Object.keys(PRESET_PATTERNS) as PresetName[]).map((presetName) => {
            const preset = PRESET_PATTERNS[presetName];
            return (
              <button
                key={presetName}
                type="button"
                onClick={() => loadPreset(presetName)}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      )}

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
                      min={
                        drum.id === 'kick'
                          ? 20
                          : drum.id === 'hihat' || drum.id === 'openhat'
                            ? 4000
                            : 80
                      }
                      max={
                        drum.id === 'kick'
                          ? 150
                          : drum.id === 'hihat' || drum.id === 'openhat'
                            ? 12000
                            : 800
                      }
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
