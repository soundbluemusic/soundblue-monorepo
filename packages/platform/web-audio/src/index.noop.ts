// ========================================
// @soundblue/web-audio - Noop Entry
// Web Audio API adapters and instruments
// For SSR/build time - provides empty implementations
// ========================================

// Context (AudioContext management - noop)
export * from './context/index.noop';
// Instruments (drum machine, metronome - noop stubs)
export * from './instruments/index.noop';
// Tone.js engine (noop)
export { Tone, toneEngine } from './tone-engine.noop';
export type { AudioEngineCallbacks, AudioEngineState } from './types';
// Types (shared)
export * from './types';
