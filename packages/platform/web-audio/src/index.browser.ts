// ========================================
// @soundblue/web-audio - Browser Entry
// Web Audio API adapters and instruments
// For runtime in browser environment
// ========================================

// Context (AudioContext management)
export * from './context/index.browser';
// Instruments (drum machine, metronome)
export * from './instruments';
export type { ToneEngineCallbacks, ToneEngineState } from './tone-engine.browser';

// Tone.js engine
export { Tone, toneEngine } from './tone-engine.browser';
// Types (shared)
export * from './types';
