// ========================================
// Audio Context Manager - Noop Implementation
// For SSR/build time - provides empty implementations
// ========================================

import type { AudioContextState, IAudioContextManager } from '../types';

/**
 * Noop AudioContext manager for SSR/build time
 * All methods are safe to call but do nothing
 */
class NoopAudioContextManager implements IAudioContextManager {
  getContext(): AudioContext | null {
    return null;
  }

  async resume(): Promise<void> {
    // noop
  }

  getState(): AudioContextState | null {
    return null;
  }

  onStateChange(_callback: (state: AudioContextState) => void): () => void {
    return () => {};
  }

  async close(): Promise<void> {
    // noop
  }

  getCurrentTime(): number {
    return 0;
  }

  getSampleRate(): number {
    return 44100; // Default sample rate
  }
}

// Export singleton instance
export const audioContextManager = new NoopAudioContextManager();

// Export convenience functions (matching browser API)
export function getAudioContext(): AudioContext | null {
  return null;
}

export async function resumeAudioContext(): Promise<void> {
  // noop
}

export function getAudioContextState(): AudioContextState | null {
  return null;
}

export function onAudioContextStateChange(
  _callback: (state: AudioContextState) => void,
): () => void {
  return () => {};
}

export async function closeAudioContext(): Promise<void> {
  // noop
}

export function createOscillator(_frequency: number, _type?: OscillatorType): null {
  return null;
}

export function createGain(_initialValue?: number): null {
  return null;
}

export function getCurrentTime(): number {
  return 0;
}

export function getSampleRate(): number {
  return 44100;
}
