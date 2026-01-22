/**
 * @fileoverview useDrumMachine Hook
 *
 * React hook wrapping Tone.js drum machine for precise timing.
 * Provides pattern-based drum sequencing with Transport-synchronized playback.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import {
  createEmptyPattern,
  DRUM_DEFAULTS,
  type DrumId,
  type DrumSynthParams,
  PRESET_PATTERNS,
  type PresetName,
} from '~/tools/drum-machine/settings';

// Re-export types for external use
export type { DrumId as DrumSoundId, DrumSynthParams, PresetName };

export interface DrumPattern {
  [key: string]: boolean[];
}

export interface UseDrumMachineOptions {
  /** Initial BPM (default: 120) */
  initialBpm?: number;
  /** Number of steps (default: 16) */
  steps?: number;
  /** Initial volume 0-1 (default: 0.8) */
  volume?: number;
  /** Enable metronome click (default: false) */
  metronomeEnabled?: boolean;
  /** Initial pattern */
  initialPattern?: DrumPattern;
  /** Initial synth params */
  initialSynthParams?: Record<DrumId, DrumSynthParams>;
}

export interface UseDrumMachineReturn {
  /** Current playing state */
  isPlaying: boolean;
  /** Current step (0-indexed, -1 when stopped) */
  currentStep: number;
  /** Current BPM */
  bpm: number;
  /** Number of steps */
  steps: number;
  /** Current pattern */
  pattern: DrumPattern;
  /** Current synth params */
  synthParams: Record<DrumId, DrumSynthParams>;
  /** Set BPM */
  setBpm: (bpm: number) => void;
  /** Set volume (0-1) */
  setVolume: (volume: number) => void;
  /** Toggle a step in the pattern */
  toggleStep: (drumId: DrumId, step: number) => void;
  /** Set a step value */
  setStep: (drumId: DrumId, step: number, value: boolean) => void;
  /** Clear entire pattern */
  clearPattern: () => void;
  /** Load a pattern */
  loadPattern: (pattern: DrumPattern) => void;
  /** Load a preset by name */
  loadPreset: (presetName: PresetName) => void;
  /** Start playback */
  start: () => Promise<void>;
  /** Stop playback */
  stop: () => void;
  /** Toggle playback */
  toggle: () => Promise<void>;
  /** Preview a drum sound */
  previewSound: (drumId: DrumId) => Promise<void>;
  /** Get synth params for a drum */
  getSynthParams: (drumId: DrumId) => DrumSynthParams;
  /** Update synth param */
  updateSynthParam: (drumId: DrumId, param: keyof DrumSynthParams, value: number) => void;
  /** Reset synth params to default */
  resetSynthParams: (drumId: DrumId) => void;
  /** Metronome enabled state */
  metronomeEnabled: boolean;
  /** Toggle metronome */
  setMetronomeEnabled: (enabled: boolean) => void;
  /** Current volume */
  volume: number;
}

export function useDrumMachine(options: UseDrumMachineOptions = {}): UseDrumMachineReturn {
  const {
    initialBpm = 120,
    steps = 16,
    volume: initialVolume = 0.8,
    metronomeEnabled: initialMetronome = false,
    initialPattern,
    initialSynthParams,
  } = options;

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpmState] = useState(initialBpm);
  const [pattern, setPattern] = useState<DrumPattern>(
    () => initialPattern ?? createEmptyPattern(steps),
  );
  const [synthParams, setSynthParams] = useState<Record<DrumId, DrumSynthParams>>(() => ({
    ...DRUM_DEFAULTS,
    ...initialSynthParams,
  }));
  const [metronomeEnabled, setMetronomeEnabled] = useState(initialMetronome);
  const [volume, setVolumeState] = useState(initialVolume);

  // Refs
  const synthsRef = useRef<Map<DrumId, Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth>>(
    new Map(),
  );
  const metronomeRef = useRef<Tone.MembraneSynth | null>(null);
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const patternRef = useRef(pattern);
  const volumeRef = useRef(volume);

  // Keep refs in sync
  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Initialize synths
  useEffect(() => {
    // Kick
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    }).toDestination();
    kick.volume.value = -6;
    synthsRef.current.set('kick', kick);

    // Snare
    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination();
    snare.volume.value = -10;
    synthsRef.current.set('snare', snare);

    // Hi-hat
    const hihat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();
    hihat.frequency.value = 200;
    hihat.volume.value = -20;
    synthsRef.current.set('hihat', hihat);

    // Open hat
    const openhat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();
    openhat.frequency.value = 200;
    openhat.volume.value = -18;
    synthsRef.current.set('openhat', openhat);

    // Clap
    const clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 },
    }).toDestination();
    clap.volume.value = -12;
    synthsRef.current.set('clap', clap);

    // Metronome
    metronomeRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination();
    metronomeRef.current.volume.value = -10;

    return () => {
      for (const synth of synthsRef.current.values()) {
        synth.dispose();
      }
      synthsRef.current.clear();
      if (metronomeRef.current) {
        metronomeRef.current.dispose();
      }
    };
  }, []);

  // Trigger a drum sound
  const triggerDrum = useCallback((drumId: DrumId, time?: number) => {
    const synth = synthsRef.current.get(drumId);
    if (!synth) return;

    const triggerTime = time ?? Tone.now();
    const vol = volumeRef.current;

    if (synth instanceof Tone.MembraneSynth) {
      synth.volume.value = -6 + (vol - 0.8) * 10;
      synth.triggerAttackRelease('C1', '8n', triggerTime);
    } else if (synth instanceof Tone.NoiseSynth) {
      synth.volume.value = -10 + (vol - 0.8) * 10;
      synth.triggerAttackRelease('16n', triggerTime);
    } else if (synth instanceof Tone.MetalSynth) {
      synth.volume.value = -18 + (vol - 0.8) * 10;
      synth.triggerAttackRelease('16n', triggerTime);
    }
  }, []);

  // Set BPM
  const setBpm = useCallback((newBpm: number) => {
    const clampedBpm = Math.max(40, Math.min(300, newBpm));
    setBpmState(clampedBpm);
    Tone.getTransport().bpm.value = clampedBpm;
  }, []);

  // Set volume
  const setVolume = useCallback((vol: number) => {
    setVolumeState(Math.max(0, Math.min(1, vol)));
  }, []);

  // Toggle step
  const toggleStep = useCallback(
    (drumId: DrumId, step: number) => {
      setPattern((prev) => {
        const newPattern = { ...prev };
        newPattern[drumId] = [...(prev[drumId] || Array(steps).fill(false))];
        newPattern[drumId][step] = !newPattern[drumId][step];
        return newPattern;
      });
    },
    [steps],
  );

  // Set step
  const setStep = useCallback(
    (drumId: DrumId, step: number, value: boolean) => {
      setPattern((prev) => {
        if (prev[drumId]?.[step] === value) return prev;
        const newPattern = { ...prev };
        newPattern[drumId] = [...(prev[drumId] || Array(steps).fill(false))];
        newPattern[drumId][step] = value;
        return newPattern;
      });
    },
    [steps],
  );

  // Clear pattern
  const clearPattern = useCallback(() => {
    setPattern(createEmptyPattern(steps));
  }, [steps]);

  // Load pattern
  const loadPattern = useCallback((newPattern: DrumPattern) => {
    setPattern(newPattern);
  }, []);

  // Load preset
  const loadPreset = useCallback((presetName: PresetName) => {
    const preset = PRESET_PATTERNS[presetName];
    if (preset) {
      // Deep copy the pattern to avoid mutation
      const patternCopy: DrumPattern = {
        kick: [...preset.pattern.kick],
        snare: [...preset.pattern.snare],
        hihat: [...preset.pattern.hihat],
        openhat: [...preset.pattern.openhat],
        clap: [...preset.pattern.clap],
      };
      setPattern(patternCopy);
    }
  }, []);

  // Stop
  const stop = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    setIsPlaying(false);
    setCurrentStep(-1);
  }, []);

  // Start
  const start = useCallback(async () => {
    await Tone.start();

    Tone.getTransport().bpm.value = bpm;

    const stepIndices = Array.from({ length: steps }, (_, i) => i);

    sequenceRef.current = new Tone.Sequence(
      (time, step) => {
        const currentPattern = patternRef.current;

        // Play metronome click
        if (metronomeEnabled && step % 4 === 0) {
          const isAccent = step === 0;
          metronomeRef.current?.triggerAttackRelease(
            isAccent ? 'C3' : 'C2',
            '16n',
            time,
            isAccent ? 0.8 : 0.5,
          );
        }

        // Play drum sounds
        const drums: DrumId[] = ['kick', 'snare', 'hihat', 'openhat', 'clap'];
        for (const drumId of drums) {
          if (currentPattern[drumId]?.[step]) {
            triggerDrum(drumId, time);
          }
        }

        // Update UI
        Tone.getDraw().schedule(() => {
          setCurrentStep(step);
        }, time);
      },
      stepIndices,
      '16n',
    );

    sequenceRef.current.start(0);
    Tone.getTransport().start();
    setIsPlaying(true);
  }, [bpm, steps, metronomeEnabled, triggerDrum]);

  // Toggle
  const toggle = useCallback(async () => {
    if (isPlaying) {
      stop();
    } else {
      await start();
    }
  }, [isPlaying, start, stop]);

  // Preview sound
  const previewSound = useCallback(
    async (drumId: DrumId) => {
      await Tone.start();
      triggerDrum(drumId);
    },
    [triggerDrum],
  );

  // Get synth params
  const getSynthParams = useCallback(
    (drumId: DrumId): DrumSynthParams => {
      return synthParams[drumId] ?? DRUM_DEFAULTS[drumId];
    },
    [synthParams],
  );

  // Update synth param
  const updateSynthParam = useCallback(
    (drumId: DrumId, param: keyof DrumSynthParams, value: number) => {
      setSynthParams((prev) => ({
        ...prev,
        [drumId]: {
          ...prev[drumId],
          [param]: value,
        },
      }));
    },
    [],
  );

  // Reset synth params
  const resetSynthParams = useCallback((drumId: DrumId) => {
    setSynthParams((prev) => ({
      ...prev,
      [drumId]: { ...DRUM_DEFAULTS[drumId] },
    }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPlaying,
    currentStep,
    bpm,
    steps,
    pattern,
    synthParams,
    volume,
    setBpm,
    setVolume,
    toggleStep,
    setStep,
    clearPattern,
    loadPattern,
    loadPreset,
    start,
    stop,
    toggle,
    previewSound,
    getSynthParams,
    updateSynthParam,
    resetSynthParams,
    metronomeEnabled,
    setMetronomeEnabled,
  };
}
