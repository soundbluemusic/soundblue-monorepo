import { create } from 'zustand';

// ========================================
// Audio Engine State (Zustand Store)
// ========================================
// 이 스토어는 React(UI), Pixi.js(화면), Rust WASM(엔진) 간의
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

export const useAudioStore = create<AudioEngineState & AudioActions>()((set, get) => ({
  // Initial state
  isInitialized: false,
  isWasmLoaded: false,
  isWorkletReady: false,
  sampleRate: 48000,
  bufferSize: 128,
  latency: 0,
  transport: initialTransport,
  masterMeter: initialMeter,

  // Actions
  initialize: async (): Promise<void> => {
    if (get().isInitialized) return;

    try {
      // Create AudioContext with optimal settings for low latency
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

      set({
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
    set((state) => ({
      transport: {
        ...state.transport,
        isPlaying: true,
        isPaused: false,
      },
    }));
  },

  pause: (): void => {
    set((state) => ({
      transport: {
        ...state.transport,
        isPlaying: false,
        isPaused: true,
      },
    }));
  },

  stop: (): void => {
    set((state) => ({
      transport: {
        ...state.transport,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        currentBeat: 0,
        currentBar: 0,
      },
    }));
  },

  setBpm: (bpm: number): void => {
    set((state) => ({
      transport: {
        ...state.transport,
        bpm: Math.max(20, Math.min(300, bpm)),
      },
    }));
  },

  setCurrentTime: (time: number): void => {
    const state = get();
    const beatsPerSecond = state.transport.bpm / 60;
    const currentBeat = (time * beatsPerSecond) % 4;
    const currentBar = Math.floor((time * beatsPerSecond) / 4);

    set((state) => ({
      transport: {
        ...state.transport,
        currentTime: time,
        currentBeat,
        currentBar,
      },
    }));
  },

  toggleLoop: (): void => {
    set((state) => ({
      transport: {
        ...state.transport,
        isLooping: !state.transport.isLooping,
      },
    }));
  },

  setLoopPoints: (start: number, end: number): void => {
    set((state) => ({
      transport: {
        ...state.transport,
        loopStart: start,
        loopEnd: end,
      },
    }));
  },

  // Meter update (called from AudioWorklet via SharedArrayBuffer)
  updateMeter: (left: number, right: number): void => {
    set((state) => ({
      masterMeter: {
        leftLevel: left,
        rightLevel: right,
        leftPeak: Math.max(state.masterMeter.leftPeak * 0.99, left),
        rightPeak: Math.max(state.masterMeter.rightPeak * 0.99, right),
      },
    }));
  },
}));

// Selector hooks for convenience
export const useTransport = () => useAudioStore((state) => state.transport);
export const useMasterMeter = () => useAudioStore((state) => state.masterMeter);
export const useIsPlaying = () => useAudioStore((state) => state.transport.isPlaying);
export const useBpm = () => useAudioStore((state) => state.transport.bpm);
export const useIsInitialized = () => useAudioStore((state) => state.isInitialized);
