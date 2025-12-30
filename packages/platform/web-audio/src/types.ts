// ========================================
// @soundblue/web-audio - Shared Types
// Types shared between browser and noop implementations
// ========================================

/**
 * Audio engine state
 */
export interface AudioEngineState {
  isInitialized: boolean;
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  currentBar: number;
}

/**
 * Audio engine callbacks
 */
export interface AudioEngineCallbacks {
  onBeat?: (beat: number, bar: number) => void;
  onStateChange?: (state: AudioEngineState) => void;
}

/**
 * Audio context state (matches Web Audio API)
 */
export type AudioContextState = 'suspended' | 'running' | 'closed' | 'interrupted';

/**
 * Audio context manager interface
 */
export interface IAudioContextManager {
  getContext(): AudioContext | null;
  resume(): Promise<void>;
  getState(): AudioContextState | null;
  onStateChange(callback: (state: AudioContextState) => void): () => void;
  close(): Promise<void>;
  getCurrentTime(): number;
  getSampleRate(): number;
}

/**
 * Audio engine interface
 */
export interface IAudioEngine {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  setBpm(bpm: number): void;
  getBpm(): number;
  play(): void;
  pause(): void;
  stop(): void;
  isPlaying(): boolean;
  startBeatLoop(beatsPerBar?: number): void;
  stopBeatLoop(): void;
  setCallbacks(callbacks: AudioEngineCallbacks): void;
  getState(): AudioEngineState;
  dispose(): void;
}

/**
 * Metronome configuration
 */
export interface MetronomeConfig {
  bpm: number;
  beatsPerBar: number;
  accentFirstBeat: boolean;
  volume: number;
}

/**
 * Drum machine pad configuration
 */
export interface DrumPadConfig {
  id: string;
  name: string;
  key: string;
  color: string;
}

// Note: DrumPattern and related types are in ./instruments/drum-machine.ts
