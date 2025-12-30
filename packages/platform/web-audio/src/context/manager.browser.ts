// ========================================
// Audio Context Manager - Browser Implementation
// For runtime in browser environment
// ========================================

import type { AudioContextState } from '../types';

let audioContext: AudioContext | null = null;
const stateChangeCallbacks = new Set<(state: AudioContextState) => void>();

/**
 * Get the singleton AudioContext instance
 * Creates a new one if it doesn't exist
 */
export function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is not available during SSR');
  }
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext is not supported in this browser');
    }
    audioContext = new AudioContextClass();

    const ctx = audioContext;
    ctx.onstatechange = () => {
      for (const cb of stateChangeCallbacks) {
        cb(ctx.state);
      }
    };
  }
  return audioContext;
}

/**
 * Resume the AudioContext if it's suspended
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/**
 * Get the current state of the AudioContext
 */
export function getAudioContextState(): AudioContextState | null {
  return audioContext?.state ?? null;
}

/**
 * Subscribe to AudioContext state changes
 */
export function onAudioContextStateChange(
  callback: (state: AudioContextState) => void,
): () => void {
  stateChangeCallbacks.add(callback);
  return () => stateChangeCallbacks.delete(callback);
}

/**
 * Close the AudioContext
 */
export async function closeAudioContext(): Promise<void> {
  if (audioContext) {
    await audioContext.close();
    audioContext = null;
  }
}

/**
 * Create an oscillator with common settings
 */
export function createOscillator(frequency: number, type: OscillatorType = 'sine'): OscillatorNode {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = frequency;
  osc.type = type;
  return osc;
}

/**
 * Create a gain node with initial value
 */
export function createGain(initialValue = 1): GainNode {
  const ctx = getAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = initialValue;
  return gain;
}

/**
 * Get current audio time
 */
export function getCurrentTime(): number {
  return getAudioContext().currentTime;
}

/**
 * Get audio sample rate
 */
export function getSampleRate(): number {
  return getAudioContext().sampleRate;
}
