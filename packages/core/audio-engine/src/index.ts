/**
 * @module @soundblue/audio-engine
 *
 * @description
 * Pure audio computation library for timing, sequencing, and music theory.
 *
 * This package provides core audio logic without any browser API dependencies,
 * making it safe to use in SSG (Static Site Generation) and SSR environments.
 * The actual audio playback is handled by `@soundblue/web-audio` which wraps
 * this logic with Web Audio API implementations.
 *
 * ## Package Structure
 *
 * The package is organized into three main modules:
 *
 * - **Sequencer** (`./sequencer`) - Pattern and step sequencer state management
 * - **Theory** (`./theory`) - Music theory: scales, rhythms, and note calculations
 * - **Timing** (`./timing`) - BPM calculations, scheduling, and clock utilities
 *
 * ## Installation
 *
 * ```bash
 * pnpm add @soundblue/audio-engine
 * ```
 *
 * ## Quick Start
 *
 * ```typescript
 * import {
 *   // Sequencer
 *   createEmptyPattern,
 *   createSequencerState,
 *   toggleStep,
 *   play,
 *   nextStep,
 *
 *   // Timing
 *   bpmToMs,
 *   getStepInterval,
 *
 *   // Theory
 *   euclideanRhythm,
 *   getScaleNotes,
 *   midiToFrequency,
 * } from '@soundblue/audio-engine';
 *
 * // Create a drum pattern
 * const pattern = createEmptyPattern('drums', 'Drum Pattern', 4, 16);
 * const withKick = toggleStep(pattern, 'track-0', 0);  // Kick on beat 1
 *
 * // Create sequencer state
 * const state = createSequencerState(withKick, 120);  // 120 BPM
 *
 * // Calculate timing
 * const stepInterval = getStepInterval(state);  // ~125ms for 16th notes at 120 BPM
 *
 * // Generate Euclidean rhythm
 * const hiHat = euclideanRhythm(5, 8);  // 5 hits distributed across 8 steps
 *
 * // Get notes in a scale
 * const cMajor = getScaleNotes('C', 'major', 4);  // [60, 62, 64, 65, 67, 69, 71]
 * ```
 *
 * ## Sub-module Imports
 *
 * For tree-shaking, you can import from specific sub-modules:
 *
 * ```typescript
 * import { Clock, bpmToMs } from '@soundblue/audio-engine/timing';
 * import { Pattern, toggleStep } from '@soundblue/audio-engine/sequencer';
 * import { euclideanRhythm, SCALE_INTERVALS } from '@soundblue/audio-engine/theory';
 * ```
 *
 * ## Design Principles
 *
 * 1. **Pure Functions** - All functions are pure with no side effects
 * 2. **Immutable State** - State updates return new objects (suitable for React)
 * 3. **No Browser APIs** - Safe for SSG/SSR build environments
 * 4. **TypeScript First** - Full type safety with exported interfaces
 *
 * ## Related Packages
 *
 * - `@soundblue/web-audio` - Browser implementation using Web Audio API and Tone.js
 * - `@soundblue/ui-components` - React components for audio visualization
 *
 * @example
 * ```typescript
 * // Complete drum machine example
 * import {
 *   createEmptyPattern,
 *   createSequencerState,
 *   toggleStep,
 *   play,
 *   nextStep,
 *   getCurrentStepEvent,
 *   getStepInterval,
 * } from '@soundblue/audio-engine';
 *
 * // Initialize pattern with 4 tracks (kick, snare, hihat, perc)
 * let pattern = createEmptyPattern('main', 'Main Beat', 4, 16, 4);
 *
 * // Add kick on beats 1 and 3
 * pattern = toggleStep(pattern, 'track-0', 0);
 * pattern = toggleStep(pattern, 'track-0', 8);
 *
 * // Add snare on beats 2 and 4
 * pattern = toggleStep(pattern, 'track-1', 4);
 * pattern = toggleStep(pattern, 'track-1', 12);
 *
 * // Create sequencer at 120 BPM
 * let sequencer = createSequencerState(pattern, 120);
 * sequencer = play(sequencer);
 *
 * // Get timing for playback loop
 * const interval = getStepInterval(sequencer);
 *
 * // Advance steps (would be called in a timer/RAF loop)
 * function tick(currentTime: number) {
 *   const event = getCurrentStepEvent(sequencer, currentTime);
 *   // event.activeSteps contains tracks that should play
 *   for (const { trackId, velocity } of event.activeSteps) {
 *     // Trigger sound for trackId with velocity
 *   }
 *   sequencer = nextStep(sequencer);
 * }
 * ```
 *
 * @packageDocumentation
 */

// ========================================
// @soundblue/audio-engine
// Pure audio computation logic
// NO browser APIs - can be used in SSG
// ========================================

// Sequencer pattern and state
export * from './sequencer';
// Music theory
export * from './theory';
// Timing utilities
export * from './timing';
