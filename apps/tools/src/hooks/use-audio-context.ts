import { type Accessor, createSignal, onCleanup, onMount } from 'solid-js';
import {
  createGain,
  createOscillator,
  getAudioContext,
  getAudioContextState,
  getCurrentTime,
  getSampleRate,
  onAudioContextStateChange,
  resumeAudioContext,
} from '@/lib/audio-context';

/** Return type for useAudioContext hook */
export interface UseAudioContextReturn {
  context: typeof getAudioContext;
  state: Accessor<AudioContextState | null>;
  isReady: Accessor<boolean>;
  resume: () => Promise<void>;
  createOscillator: typeof createOscillator;
  createGain: typeof createGain;
  getCurrentTime: typeof getCurrentTime;
  getSampleRate: typeof getSampleRate;
}

/**
 * Hook to use the shared AudioContext
 * Provides utilities for audio operations
 */
export function useAudioContext(): UseAudioContextReturn {
  const [state, setState] = createSignal<AudioContextState | null>(null);
  const [isReady, setIsReady] = createSignal(false);

  onMount(() => {
    // Get initial state
    const currentState = getAudioContextState();
    setState(currentState);
    setIsReady(currentState === 'running');

    // Subscribe to state changes via native onstatechange event
    const unsubscribe = onAudioContextStateChange((newState) => {
      setState(newState);
      setIsReady(newState === 'running');
    });

    onCleanup(unsubscribe);
  });

  const resume = async (): Promise<void> => {
    await resumeAudioContext();
    setState('running');
    setIsReady(true);
  };

  return {
    context: getAudioContext,
    state,
    isReady,
    resume,
    createOscillator,
    createGain,
    getCurrentTime,
    getSampleRate,
  };
}
