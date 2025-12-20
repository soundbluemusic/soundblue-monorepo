import { type Accessor, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import {
  type BeatTickEvent,
  emitBeatTick,
  emitTempoChange,
  onBeatTick,
  onTempoChange,
  type TempoChangeEvent,
} from '~/lib/event-bus';

interface UseTempoOptions {
  /** Source identifier for this hook instance */
  sourceId: string;
  /** Initial BPM value */
  initialBpm?: number;
  /** Whether to listen to external tempo changes */
  syncEnabled?: boolean;
}

/** Return type for useTempo hook */
export interface UseTempoReturn {
  bpm: Accessor<number>;
  setBpm: (newBpm: number) => void;
  currentBeat: Accessor<number>;
  currentMeasure: Accessor<number>;
  tick: (beat: number, measure: number, time: number) => void;
  getSecondsPerBeat: Accessor<number>;
  getSecondsPerMeasure: (beatsPerMeasure?: number) => number;
}

/** Return type for useTempoSubscriber hook */
export interface UseTempoSubscriberReturn {
  bpm: Accessor<number>;
  currentBeat: Accessor<number>;
  currentMeasure: Accessor<number>;
}

/**
 * Hook for tempo synchronization across tools
 * Manages BPM state and beat tracking via Event Bus
 */
export function useTempo({
  sourceId,
  initialBpm = 120,
  syncEnabled = true,
}: UseTempoOptions): UseTempoReturn {
  const [bpm, setBpmState] = createSignal(initialBpm);
  const [currentBeat, setCurrentBeat] = createSignal(-1);
  const [currentMeasure, setCurrentMeasure] = createSignal(0);

  onMount(() => {
    if (!syncEnabled) return;

    // Listen for external tempo changes
    const unsubTempo = onTempoChange((event: TempoChangeEvent) => {
      // Ignore events from self
      if (event.source === sourceId) return;
      setBpmState(event.bpm);
    });

    // Listen for beat ticks
    const unsubBeat = onBeatTick((event: BeatTickEvent) => {
      setCurrentBeat(event.beat);
      setCurrentMeasure(event.measure);
    });

    onCleanup(() => {
      unsubTempo();
      unsubBeat();
    });
  });

  // Set BPM and broadcast change
  const setTempo = (newBpm: number): void => {
    setBpmState(newBpm);
    if (syncEnabled) {
      emitTempoChange(newBpm, sourceId);
    }
  };

  // Emit beat tick (for metronome-like sources)
  const tick = (beat: number, measure: number, time: number): void => {
    if (syncEnabled) {
      emitBeatTick(beat, measure, time);
    }
  };

  // Calculate timing utilities
  const getSecondsPerBeat = createMemo((): number => 60 / bpm());
  const getSecondsPerMeasure = (beatsPerMeasure: number = 4): number =>
    (60 / bpm()) * beatsPerMeasure;

  return {
    bpm,
    setBpm: setTempo,
    currentBeat,
    currentMeasure,
    tick,
    getSecondsPerBeat,
    getSecondsPerMeasure,
  };
}

/**
 * Read-only tempo subscriber
 * For tools that only need to receive tempo updates
 */
export function useTempoSubscriber(): UseTempoSubscriberReturn {
  const [bpm, setBpm] = createSignal(120);
  const [currentBeat, setCurrentBeat] = createSignal(-1);
  const [currentMeasure, setCurrentMeasure] = createSignal(0);

  onMount(() => {
    const unsubTempo = onTempoChange((event) => {
      setBpm(event.bpm);
    });

    const unsubBeat = onBeatTick((event) => {
      setCurrentBeat(event.beat);
      setCurrentMeasure(event.measure);
    });

    onCleanup(() => {
      unsubTempo();
      unsubBeat();
    });
  });

  return { bpm, currentBeat, currentMeasure };
}
