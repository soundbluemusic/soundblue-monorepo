/**
 * @fileoverview Tone.js Audio Engine - Noop Implementation
 *
 * Provides empty implementations for SSR/build time.
 * All methods are safe to call but do nothing.
 */

import type { AudioEngineCallbacks, AudioEngineState, IAudioEngine } from './types';

class NoopToneEngine implements IAudioEngine {
  async initialize(): Promise<void> {
    // noop
  }

  isInitialized(): boolean {
    return false;
  }

  setBpm(_bpm: number): void {
    // noop
  }

  getBpm(): number {
    return 120;
  }

  play(): void {
    // noop
  }

  pause(): void {
    // noop
  }

  stop(): void {
    // noop
  }

  isPlaying(): boolean {
    return false;
  }

  startBeatLoop(_beatsPerBar?: number): void {
    // noop
  }

  stopBeatLoop(): void {
    // noop
  }

  setCallbacks(_callbacks: AudioEngineCallbacks): void {
    // noop
  }

  getState(): AudioEngineState {
    return {
      isInitialized: false,
      isPlaying: false,
      bpm: 120,
      currentBeat: 0,
      currentBar: 0,
    };
  }

  dispose(): void {
    // noop
  }
}

export const toneEngine = new NoopToneEngine();

// Re-export types
export type { AudioEngineCallbacks, AudioEngineState } from './types';

// Export a noop Tone object for compatibility
export const Tone = {
  start: async () => {},
  getTransport: () => ({
    bpm: { value: 120 },
    state: 'stopped' as const,
    start: () => {},
    pause: () => {},
    stop: () => {},
    cancel: () => {},
  }),
  Loop: class {
    start() {
      return this;
    }
    stop() {
      return this;
    }
    dispose() {}
  },
};
