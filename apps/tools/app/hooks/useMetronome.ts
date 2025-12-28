/**
 * @fileoverview useMetronome Hook
 *
 * React hook wrapping Tone.js metronome for precise timing.
 * Replaces manual Web Audio API scheduling with Transport-synchronized timing.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

export interface UseMetronomeOptions {
  /** Initial BPM (default: 120) */
  initialBpm?: number;
  /** Beats per measure (default: 4) */
  beatsPerMeasure?: number;
  /** Volume in dB (default: -6) */
  volume?: number;
  /** Accent the first beat (default: true) */
  accentFirst?: boolean;
  /** Timer duration in milliseconds (0 = no timer) */
  timerDuration?: number;
}

export interface UseMetronomeReturn {
  /** Current playing state */
  isPlaying: boolean;
  /** Current beat (0-indexed within measure) */
  currentBeat: number;
  /** Current measure count (1-indexed) */
  measureCount: number;
  /** Elapsed time in milliseconds */
  elapsedTime: number;
  /** Remaining time in milliseconds (when timer is set) */
  remainingTime: number;
  /** Current BPM */
  bpm: number;
  /** Set BPM */
  setBpm: (bpm: number) => void;
  /** Set beats per measure */
  setBeatsPerMeasure: (beats: number) => void;
  /** Set volume in dB */
  setVolume: (volume: number) => void;
  /** Start the metronome */
  start: () => Promise<void>;
  /** Stop the metronome */
  stop: () => void;
  /** Toggle play/stop */
  toggle: () => Promise<void>;
  /** Reset all counters */
  reset: () => void;
  /** Set timer duration */
  setTimerDuration: (ms: number) => void;
}

export function useMetronome(options: UseMetronomeOptions = {}): UseMetronomeReturn {
  const {
    initialBpm = 120,
    beatsPerMeasure: initialBeats = 4,
    volume: initialVolume = -6,
    accentFirst = true,
    timerDuration: initialTimer = 0,
  } = options;

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [measureCount, setMeasureCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bpm, setBpmState] = useState(initialBpm);
  const [beatsPerMeasure, setBeatsPerMeasureState] = useState(initialBeats);
  const [timerDuration, setTimerDuration] = useState(initialTimer);

  // Refs for Tone.js objects
  const synthRef = useRef<Tone.MembraneSynth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);
  const startTimeRef = useRef<number>(0);
  const beatCountRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  // Initialize synth on mount
  useEffect(() => {
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();
    synthRef.current.volume.value = initialVolume;

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, [initialVolume]);

  // Update BPM in Transport
  const setBpm = useCallback((newBpm: number) => {
    const clampedBpm = Math.max(20, Math.min(300, newBpm));
    setBpmState(clampedBpm);
    Tone.getTransport().bpm.value = clampedBpm;
  }, []);

  // Update volume
  const setVolume = useCallback((volume: number) => {
    if (synthRef.current) {
      synthRef.current.volume.value = volume;
    }
  }, []);

  // Update beats per measure
  const setBeatsPerMeasure = useCallback((beats: number) => {
    setBeatsPerMeasureState(beats);
  }, []);

  // Stop handler
  const stop = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current.dispose();
      loopRef.current = null;
    }

    Tone.getTransport().stop();
    Tone.getTransport().position = 0;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  // Start handler
  const start = useCallback(async () => {
    await Tone.start();

    // Reset state
    setCurrentBeat(0);
    setMeasureCount(1);
    setElapsedTime(0);
    beatCountRef.current = 0;
    startTimeRef.current = Tone.now();

    // Set BPM
    Tone.getTransport().bpm.value = bpm;

    // Create the loop
    loopRef.current = new Tone.Loop((time) => {
      const beatInMeasure = beatCountRef.current % beatsPerMeasure;
      const isAccent = accentFirst && beatInMeasure === 0;
      const note = isAccent ? 'C3' : 'C2';
      const velocity = isAccent ? 1 : 0.7;

      synthRef.current?.triggerAttackRelease(note, '16n', time, velocity);

      // Schedule UI updates
      Tone.getDraw().schedule(() => {
        setCurrentBeat(beatInMeasure);
        setMeasureCount(Math.floor(beatCountRef.current / beatsPerMeasure) + 1);
      }, time);

      beatCountRef.current++;
    }, '4n');

    loopRef.current.start(0);
    Tone.getTransport().start();
    setIsPlaying(true);

    // Animation loop for elapsed time
    const updateElapsed = () => {
      const elapsed = (Tone.now() - startTimeRef.current) * 1000;
      setElapsedTime(elapsed);

      // Check timer
      if (timerDuration > 0 && elapsed >= timerDuration) {
        stop();
        return;
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(updateElapsed);
      }
    };
    animationRef.current = requestAnimationFrame(updateElapsed);
  }, [bpm, beatsPerMeasure, accentFirst, timerDuration, stop, isPlaying]);

  // Keep animation loop running when playing
  useEffect(() => {
    if (isPlaying && !animationRef.current) {
      const updateElapsed = () => {
        const elapsed = (Tone.now() - startTimeRef.current) * 1000;
        setElapsedTime(elapsed);

        if (timerDuration > 0 && elapsed >= timerDuration) {
          stop();
          return;
        }

        animationRef.current = requestAnimationFrame(updateElapsed);
      };
      animationRef.current = requestAnimationFrame(updateElapsed);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, timerDuration, stop]);

  // Toggle handler
  const toggle = useCallback(async () => {
    if (isPlaying) {
      stop();
    } else {
      await start();
    }
  }, [isPlaying, start, stop]);

  // Reset handler
  const reset = useCallback(() => {
    stop();
    setCurrentBeat(0);
    setMeasureCount(0);
    setElapsedTime(0);
    beatCountRef.current = 0;
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, [stop]);

  // Calculate remaining time
  const remainingTime = timerDuration > 0 ? Math.max(0, timerDuration - elapsedTime) : 0;

  return {
    isPlaying,
    currentBeat,
    measureCount,
    elapsedTime,
    remainingTime,
    bpm,
    setBpm,
    setBeatsPerMeasure,
    setVolume,
    start,
    stop,
    toggle,
    reset,
    setTimerDuration,
  };
}
