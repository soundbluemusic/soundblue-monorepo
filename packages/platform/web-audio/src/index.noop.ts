// ========================================
// @soundblue/web-audio - Noop Entry
// Web Audio API adapters and instruments
// For SSR/build time - provides empty implementations
// ========================================

// Context (AudioContext management - noop)
export * from './context/index.noop';
// Types (shared)
export * from './types';

// Instruments - these are browser-only, export noop versions
// Note: Instruments are typically only used at runtime, so we can skip them in noop

// Tone.js engine (noop)
export { Tone, toneEngine } from './tone-engine.noop';
export type { AudioEngineCallbacks, AudioEngineState } from './types';
