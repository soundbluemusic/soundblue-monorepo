/**
 * @fileoverview Audio Engine State Management
 *
 * Central Zustand store for managing Web Audio API state across the Tools app.
 * This store serves as the single source of truth for audio engine state,
 * bridging React (UI), Pixi.js (visuals), and future Rust WASM (engine) layers.
 *
 * 이 스토어는 React(UI), Pixi.js(화면), Rust WASM(엔진) 간의
 * 상태 공유를 위한 중앙 저장소입니다.
 *
 * @module stores/audio-store
 *
 * @example
 * ```tsx
 * // Basic usage in a component
 * import { useAudioStore, useIsPlaying, useBpm } from '~/stores/audio-store';
 *
 * function PlayButton() {
 *   const isPlaying = useIsPlaying();
 *   const { play, pause, initialize } = useAudioStore();
 *
 *   const handleClick = async () => {
 *     await initialize(); // Required before first playback
 *     isPlaying ? pause() : play();
 *   };
 *
 *   return <button onClick={handleClick}>{isPlaying ? 'Pause' : 'Play'}</button>;
 * }
 * ```
 */

import { create } from 'zustand';

// ========================================
// Interfaces
// ========================================

/**
 * Transport state representing playback position and controls.
 *
 * The transport tracks the current playback position in multiple formats
 * (time, beat, bar) and manages loop points for pattern repetition.
 *
 * @interface TransportState
 *
 * @property {boolean} isPlaying - Whether audio is currently playing
 * @property {boolean} isPaused - Whether playback is paused (position preserved)
 * @property {boolean} isRecording - Whether recording is active (future feature)
 * @property {number} bpm - Tempo in beats per minute (range: 20-300)
 * @property {number} currentTime - Current playback position in seconds
 * @property {number} currentBeat - Current beat within the bar (0-3 for 4/4 time)
 * @property {number} currentBar - Current bar number (0-indexed)
 * @property {number} loopStart - Loop start point in bars
 * @property {number} loopEnd - Loop end point in bars
 * @property {boolean} isLooping - Whether loop mode is enabled
 *
 * @example
 * ```tsx
 * // Access transport state
 * const transport = useTransport();
 * console.log(`Bar ${transport.currentBar}, Beat ${transport.currentBeat}`);
 * console.log(`BPM: ${transport.bpm}, Looping: ${transport.isLooping}`);
 * ```
 */
export interface TransportState {
  isPlaying: boolean;
  isPaused: boolean;
  isRecording: boolean;
  bpm: number;
  currentTime: number;
  currentBeat: number;
  currentBar: number;
  loopStart: number;
  loopEnd: number;
  isLooping: boolean;
}

/**
 * Audio level meter state for stereo channels.
 *
 * Represents real-time audio levels with peak hold functionality.
 * Values are normalized to 0-1 range where:
 * - 0 = silence (-∞ dB)
 * - 1 = maximum level (0 dB)
 *
 * Peak values decay slowly (0.99 multiplier per update) to show recent maximums.
 *
 * @interface MeterState
 *
 * @property {number} leftLevel - Current left channel level (0-1)
 * @property {number} rightLevel - Current right channel level (0-1)
 * @property {number} leftPeak - Peak hold for left channel (decays at 0.99x per frame)
 * @property {number} rightPeak - Peak hold for right channel (decays at 0.99x per frame)
 *
 * @example
 * ```tsx
 * // Display level meters
 * const meter = useMasterMeter();
 *
 * return (
 *   <div className="meter">
 *     <div style={{ height: `${meter.leftLevel * 100}%` }} />
 *     <div className="peak" style={{ bottom: `${meter.leftPeak * 100}%` }} />
 *   </div>
 * );
 * ```
 */
export interface MeterState {
  leftLevel: number;
  rightLevel: number;
  leftPeak: number;
  rightPeak: number;
}

/**
 * Complete audio engine state including initialization status and configuration.
 *
 * This interface represents the full state of the audio engine, including:
 * - Initialization status flags for async setup steps
 * - Audio configuration (sample rate, buffer size, latency)
 * - Transport state (playback controls)
 * - Meter state (level monitoring)
 *
 * @interface AudioEngineState
 *
 * @property {boolean} isInitialized - Whether AudioContext has been created and resumed
 * @property {boolean} isWasmLoaded - Whether Rust WASM module is loaded (future feature)
 * @property {boolean} isWorkletReady - Whether AudioWorklet is registered (future feature)
 * @property {number} sampleRate - Audio sample rate in Hz (typically 44100 or 48000)
 * @property {number} bufferSize - Audio buffer size in samples (affects latency)
 * @property {number} latency - Calculated audio latency in milliseconds
 * @property {TransportState} transport - Current transport/playback state
 * @property {MeterState} masterMeter - Master output level meters
 *
 * @example
 * ```tsx
 * // Check engine status before using audio features
 * const { isInitialized, sampleRate, latency } = useAudioStore();
 *
 * if (!isInitialized) {
 *   return <button onClick={initialize}>Enable Audio</button>;
 * }
 *
 * return <span>Audio ready at {sampleRate}Hz ({latency.toFixed(1)}ms latency)</span>;
 * ```
 */
export interface AudioEngineState {
  isInitialized: boolean;
  isWasmLoaded: boolean;
  isWorkletReady: boolean;
  sampleRate: number;
  bufferSize: number;
  latency: number;
  transport: TransportState;
  masterMeter: MeterState;
}

/**
 * Actions available on the audio store for controlling playback and state.
 *
 * These actions modify the audio engine state and should be called from
 * React components or event handlers.
 *
 * @interface AudioActions
 *
 * @property {() => Promise<void>} initialize - Initialize the Web Audio API context.
 *   Must be called from a user gesture (click/touch) due to browser autoplay policies.
 *   Safe to call multiple times - subsequent calls are no-ops if already initialized.
 *
 * @property {() => void} play - Start or resume playback.
 *   Sets isPlaying=true and isPaused=false.
 *
 * @property {() => void} pause - Pause playback while preserving position.
 *   Sets isPlaying=false and isPaused=true.
 *
 * @property {() => void} stop - Stop playback and reset position to beginning.
 *   Resets currentTime, currentBeat, and currentBar to 0.
 *
 * @property {(bpm: number) => void} setBpm - Set tempo in beats per minute.
 *   Automatically clamped to valid range (20-300 BPM).
 *
 * @property {(time: number) => void} setCurrentTime - Seek to a specific time position.
 *   Automatically calculates and updates currentBeat and currentBar.
 *
 * @property {() => void} toggleLoop - Toggle loop mode on/off.
 *
 * @property {(start: number, end: number) => void} setLoopPoints - Set loop boundaries.
 *   Start and end are specified in bar numbers.
 *
 * @property {(left: number, right: number) => void} updateMeter - Update level meters.
 *   Called internally from AudioWorklet via SharedArrayBuffer or polling.
 *   Values should be normalized 0-1.
 *
 * @example
 * ```tsx
 * // Transport controls
 * const { initialize, play, pause, stop, setBpm } = useAudioStore();
 *
 * // Initialize on first user interaction
 * <button onClick={() => initialize().then(play)}>Start</button>
 *
 * // BPM control
 * <input
 *   type="range"
 *   min={20}
 *   max={300}
 *   onChange={(e) => setBpm(Number(e.target.value))}
 * />
 * ```
 */
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

// ========================================
// Initial State
// ========================================

/**
 * Default transport state values.
 * @internal
 */
const initialTransport: TransportState = {
  isPlaying: false,
  isPaused: false,
  isRecording: false,
  bpm: 120,
  currentTime: 0,
  currentBeat: 0,
  currentBar: 0,
  loopStart: 0,
  loopEnd: 16,
  isLooping: false,
};

/**
 * Default meter state values (silence).
 * @internal
 */
const initialMeter: MeterState = {
  leftLevel: 0,
  rightLevel: 0,
  leftPeak: 0,
  rightPeak: 0,
};

// ========================================
// Store
// ========================================

/**
 * Main Zustand store hook for audio engine state and actions.
 *
 * This is the primary hook for accessing and controlling the audio engine.
 * It combines both state (AudioEngineState) and actions (AudioActions) into
 * a single store following Zustand patterns.
 *
 * **Important:** The `initialize()` action must be called from a user gesture
 * (click, touch, keypress) before any audio playback due to browser autoplay
 * policies. This creates and resumes the AudioContext.
 *
 * @returns {AudioEngineState & AudioActions} Combined state and actions object
 *
 * @example
 * ```tsx
 * // Full access to state and actions
 * function AudioControls() {
 *   const store = useAudioStore();
 *
 *   return (
 *     <div>
 *       <p>Status: {store.isInitialized ? 'Ready' : 'Not initialized'}</p>
 *       <p>Playing: {store.transport.isPlaying ? 'Yes' : 'No'}</p>
 *       <p>BPM: {store.transport.bpm}</p>
 *       <button onClick={store.initialize}>Initialize</button>
 *       <button onClick={store.play}>Play</button>
 *       <button onClick={store.stop}>Stop</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Selective subscription (recommended for performance)
 * function BpmDisplay() {
 *   const bpm = useAudioStore((state) => state.transport.bpm);
 *   return <span>{bpm} BPM</span>;
 * }
 * ```
 *
 * @see useTransport - Selector hook for transport state only
 * @see useMasterMeter - Selector hook for meter state only
 * @see useIsPlaying - Selector hook for playback status
 * @see useBpm - Selector hook for current BPM
 * @see useIsInitialized - Selector hook for initialization status
 */
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

// ========================================
// Selector Hooks
// ========================================

/**
 * Selector hook for transport state.
 *
 * Returns the complete transport state object. Component will re-render
 * when any transport property changes.
 *
 * @returns {TransportState} Current transport state
 *
 * @example
 * ```tsx
 * function TransportDisplay() {
 *   const transport = useTransport();
 *   return (
 *     <div>
 *       Bar: {transport.currentBar + 1} | Beat: {Math.floor(transport.currentBeat) + 1}
 *     </div>
 *   );
 * }
 * ```
 */
export const useTransport = (): TransportState => useAudioStore((state) => state.transport);

/**
 * Selector hook for master output level meters.
 *
 * Returns stereo level meter state. Updates frequently during playback
 * (typically 60fps), so use with caution in complex components.
 *
 * @returns {MeterState} Current meter levels and peaks
 *
 * @example
 * ```tsx
 * function LevelMeter() {
 *   const meter = useMasterMeter();
 *   return (
 *     <div className="flex gap-1">
 *       <div style={{ height: `${meter.leftLevel * 100}%` }} />
 *       <div style={{ height: `${meter.rightLevel * 100}%` }} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useMasterMeter = (): MeterState => useAudioStore((state) => state.masterMeter);

/**
 * Selector hook for playback status.
 *
 * Returns whether audio is currently playing. Useful for toggling
 * play/pause button icons or conditional rendering.
 *
 * @returns {boolean} True if audio is playing, false otherwise
 *
 * @example
 * ```tsx
 * function PlayPauseButton() {
 *   const isPlaying = useIsPlaying();
 *   const { play, pause } = useAudioStore();
 *   return (
 *     <button onClick={isPlaying ? pause : play}>
 *       {isPlaying ? '⏸️' : '▶️'}
 *     </button>
 *   );
 * }
 * ```
 */
export const useIsPlaying = (): boolean => useAudioStore((state) => state.transport.isPlaying);

/**
 * Selector hook for current BPM (tempo).
 *
 * Returns the current beats-per-minute value. Useful for BPM displays
 * and tempo-related calculations.
 *
 * @returns {number} Current BPM (20-300 range)
 *
 * @example
 * ```tsx
 * function BpmSlider() {
 *   const bpm = useBpm();
 *   const { setBpm } = useAudioStore();
 *   return (
 *     <input
 *       type="range"
 *       min={20}
 *       max={300}
 *       value={bpm}
 *       onChange={(e) => setBpm(Number(e.target.value))}
 *     />
 *   );
 * }
 * ```
 */
export const useBpm = (): number => useAudioStore((state) => state.transport.bpm);

/**
 * Selector hook for audio engine initialization status.
 *
 * Returns whether the AudioContext has been created and resumed.
 * Useful for showing "enable audio" prompts or disabling controls
 * until audio is ready.
 *
 * @returns {boolean} True if audio engine is initialized and ready
 *
 * @example
 * ```tsx
 * function AudioStatus() {
 *   const isInitialized = useIsInitialized();
 *   const { initialize } = useAudioStore();
 *
 *   if (!isInitialized) {
 *     return (
 *       <button onClick={initialize}>
 *         🔊 Enable Audio
 *       </button>
 *     );
 *   }
 *
 *   return <span>Audio Ready ✓</span>;
 * }
 * ```
 */
export const useIsInitialized = (): boolean => useAudioStore((state) => state.isInitialized);
