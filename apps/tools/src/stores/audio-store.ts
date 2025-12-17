import { createStore } from 'solid-js/store';

// ========================================
// Audio Engine State (SolidJS Store)
// ========================================
// 이 스토어는 SolidJS(UI), Pixi.js(화면), Rust WASM(엔진) 간의
// 상태 공유를 위한 중앙 저장소입니다.

export interface TransportState {
  isPlaying: boolean;
  isPaused: boolean;
  isRecording: boolean;
  bpm: number;
  currentTime: number; // in seconds
  currentBeat: number;
  currentBar: number;
  loopStart: number;
  loopEnd: number;
  isLooping: boolean;
}

export interface MeterState {
  leftLevel: number; // 0-1
  rightLevel: number; // 0-1
  leftPeak: number;
  rightPeak: number;
}

export interface AudioEngineState {
  // Engine status
  isInitialized: boolean;
  isWasmLoaded: boolean;
  isWorkletReady: boolean;
  sampleRate: number;
  bufferSize: number;
  latency: number; // in ms

  // Transport
  transport: TransportState;

  // Meters
  masterMeter: MeterState;
}

const initialTransport: TransportState = {
  isPlaying: false,
  isPaused: false,
  isRecording: false,
  bpm: 120,
  currentTime: 0,
  currentBeat: 0,
  currentBar: 0,
  loopStart: 0,
  loopEnd: 16, // 16 bars default
  isLooping: false,
};

const initialMeter: MeterState = {
  leftLevel: 0,
  rightLevel: 0,
  leftPeak: 0,
  rightPeak: 0,
};

const initialState: AudioEngineState = {
  isInitialized: false,
  isWasmLoaded: false,
  isWorkletReady: false,
  sampleRate: 48000,
  bufferSize: 128,
  latency: 0,
  transport: initialTransport,
  masterMeter: initialMeter,
};

// Create the store
const [audioStore, setAudioStore] = createStore<AudioEngineState>(initialState);

/** Audio action methods with explicit return types */
export interface AudioActions {
  initialize: () => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setCurrentTime: (time: number) => void;
  toggleLoop: () => void;
  setLoopPoints: (start: number, end: number) => void;
  updateMeter: (left: number, right: number) => void;
}

// Actions
export const audioActions: AudioActions = {
  // Initialize audio engine
  initialize: async (): Promise<void> => {
    if (audioStore.isInitialized) return;

    try {
      // Create AudioContext with optimal settings for low latency
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported');
      }

      const audioContext = new AudioContextClass({
        sampleRate: 48000,
        latencyHint: 'interactive',
      });

      // Resume context if suspended (required for user gesture policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const actualSampleRate = audioContext.sampleRate;
      const bufferSize = 128;
      const latencyMs = (bufferSize / actualSampleRate) * 1000;

      setAudioStore({
        isInitialized: true,
        sampleRate: actualSampleRate,
        bufferSize: bufferSize,
        latency: latencyMs,
      });

      // Store audioContext reference for later use
      (window as Window & { __audioContext?: AudioContext }).__audioContext = audioContext;
    } catch (error: unknown) {
      // Log error in development, report to monitoring in production
      if (import.meta.env.DEV) {
        console.error('Audio engine initialization failed:', error);
      }
      // Re-throw to allow caller to handle
      throw error;
    }
  },

  // Transport controls
  play: (): void => {
    setAudioStore('transport', {
      isPlaying: true,
      isPaused: false,
    });
  },

  pause: (): void => {
    setAudioStore('transport', {
      isPlaying: false,
      isPaused: true,
    });
  },

  stop: (): void => {
    setAudioStore('transport', {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      currentBeat: 0,
      currentBar: 0,
    });
  },

  setBpm: (bpm: number): void => {
    setAudioStore('transport', 'bpm', Math.max(20, Math.min(300, bpm)));
  },

  setCurrentTime: (time: number): void => {
    const beatsPerSecond = audioStore.transport.bpm / 60;
    const currentBeat = (time * beatsPerSecond) % 4;
    const currentBar = Math.floor((time * beatsPerSecond) / 4);

    setAudioStore('transport', {
      currentTime: time,
      currentBeat,
      currentBar,
    });
  },

  toggleLoop: (): void => {
    setAudioStore('transport', 'isLooping', !audioStore.transport.isLooping);
  },

  setLoopPoints: (start: number, end: number): void => {
    setAudioStore('transport', {
      loopStart: start,
      loopEnd: end,
    });
  },

  // Meter update (called from AudioWorklet via SharedArrayBuffer)
  updateMeter: (left: number, right: number): void => {
    setAudioStore('masterMeter', {
      leftLevel: left,
      rightLevel: right,
      leftPeak: Math.max(audioStore.masterMeter.leftPeak * 0.99, left),
      rightPeak: Math.max(audioStore.masterMeter.rightPeak * 0.99, right),
    });
  },
};

// Export store and selectors
export { audioStore, setAudioStore };

// Direct store access helpers (these are thin wrappers kept for API compatibility)
// Note: For fine-grained reactivity, prefer accessing audioStore properties directly
export const useTransport = (): TransportState => audioStore.transport;
export const useMasterMeter = (): MeterState => audioStore.masterMeter;
export const useIsPlaying = (): boolean => audioStore.transport.isPlaying;
export const useBpm = (): number => audioStore.transport.bpm;
export const useIsInitialized = (): boolean => audioStore.isInitialized;

/** Zustand-compatible store interface for testing */
export interface ZustandCompatibleStore {
  getState: () => AudioEngineState & AudioActions;
  setState: (partial: Partial<AudioEngineState>) => void;
}

// Zustand-compatible API for testing
export const useAudioStore: ZustandCompatibleStore = {
  getState: (): AudioEngineState & AudioActions => ({ ...audioStore, ...audioActions }),
  setState: (partial: Partial<AudioEngineState>): void => {
    setAudioStore(partial);
  },
};
