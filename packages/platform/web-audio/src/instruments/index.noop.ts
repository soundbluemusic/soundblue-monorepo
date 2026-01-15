// ========================================
// @soundblue/web-audio - Instruments (SSG/SSR Stub)
// This file is used during SSG build to prevent Tone.js instantiation
// ========================================

// Re-export types (types are erased at runtime, safe for SSG)
export type {
  DrumMachineCallbacks,
  DrumMachineOptions,
  DrumPattern,
  DrumSound,
} from './drum-machine';
export type { MetronomeCallbacks, MetronomeOptions } from './metronome';

const SSR_ERROR_MESSAGE =
  '@soundblue/web-audio/instruments is not available during SSR/SSG. ' +
  'Import this module only in browser context (useEffect, event handlers, etc.)';

/**
 * SSR stub for DrumMachine
 * All methods throw an error when called during SSR
 */
const createDrumMachineStub = () => ({
  initialize: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  start: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  stop: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setBpm: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  getBpm: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setVolume: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setSwing: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setStep: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  toggleStep: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setPattern: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  getPattern: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  clearPattern: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  triggerSound: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setCallbacks: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  isPlaying: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  getCurrentStep: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  dispose: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
});

/**
 * SSR stub for Metronome
 * All methods throw an error when called during SSR
 */
const createMetronomeStub = () => ({
  initialize: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  start: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  stop: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setBpm: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  getBpm: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setVolume: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setBeatsPerBar: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  setCallbacks: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  isPlaying: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  getCurrentBeat: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  getCurrentBar: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
  dispose: () => {
    throw new Error(SSR_ERROR_MESSAGE);
  },
});

// Export stubs as singletons (matches browser API)
export const drumMachine =
  createDrumMachineStub() as unknown as typeof import('./drum-machine').drumMachine;
export const metronome = createMetronomeStub() as unknown as typeof import('./metronome').metronome;
