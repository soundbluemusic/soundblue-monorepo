/**
 * @module sequencer
 *
 * @description
 * Step sequencer module for pattern-based music composition and playback.
 *
 * This module provides a complete state management system for step sequencers,
 * commonly used in drum machines, arpeggiators, and pattern-based synthesizers.
 * All functions are pure and return new state objects, making them ideal for
 * use with React or other immutable state management systems.
 *
 * ## Core Concepts
 *
 * ### Pattern
 * A pattern is a collection of tracks, where each track represents one
 * instrument or sound (e.g., kick, snare, hi-hat). Each track contains
 * an array of steps that can be toggled on/off.
 *
 * ### Step
 * A step is a single position in the pattern timeline. Steps have:
 * - `active`: Whether the step triggers a sound
 * - `velocity`: Volume/intensity (0-1)
 * - `noteId`: Optional custom identifier
 *
 * ### Sequencer State
 * The sequencer state tracks the current playback position, BPM, swing,
 * and loop settings. State updates are immutable.
 *
 * ## Typical Workflow
 *
 * ```typescript
 * import {
 *   createEmptyPattern,
 *   toggleStep,
 *   createSequencerState,
 *   play,
 *   nextStep,
 *   getCurrentStepEvent,
 *   getStepInterval,
 * } from '@soundblue/audio-engine/sequencer';
 *
 * // 1. Create a pattern with 4 tracks and 16 steps
 * let pattern = createEmptyPattern('drums', 'Drums', 4, 16);
 *
 * // 2. Toggle steps to create a beat
 * pattern = toggleStep(pattern, 'track-0', 0);   // Kick on 1
 * pattern = toggleStep(pattern, 'track-0', 8);   // Kick on 3
 * pattern = toggleStep(pattern, 'track-1', 4);   // Snare on 2
 * pattern = toggleStep(pattern, 'track-1', 12);  // Snare on 4
 *
 * // 3. Create sequencer state at 120 BPM
 * let state = createSequencerState(pattern, 120);
 *
 * // 4. Start playback
 * state = play(state);
 *
 * // 5. In your audio loop, advance steps and get events
 * const interval = getStepInterval(state);  // ms between steps
 * function tick(time: number) {
 *   const event = getCurrentStepEvent(state, time);
 *   // Play sounds based on event.activeSteps
 *   state = nextStep(state);
 * }
 * ```
 *
 * ## Track Mute/Solo
 *
 * Tracks can be muted or soloed:
 *
 * ```typescript
 * import { toggleMute, toggleSolo, getActiveTracks } from '@soundblue/audio-engine/sequencer';
 *
 * // Mute the snare track
 * pattern = toggleMute(pattern, 'track-1');
 *
 * // Solo the kick track (only kick plays)
 * pattern = toggleSolo(pattern, 'track-0');
 *
 * // Get currently audible tracks
 * const audible = getActiveTracks(pattern);
 * ```
 *
 * ## Pattern Manipulation
 *
 * ```typescript
 * import {
 *   shiftPattern,
 *   randomizePattern,
 *   clearPattern,
 *   setStepVelocity,
 * } from '@soundblue/audio-engine/sequencer';
 *
 * // Shift all steps left or right
 * pattern = shiftPattern(pattern, 'left');
 *
 * // Randomize with 30% density
 * pattern = randomizePattern(pattern, 0.3);
 *
 * // Clear all steps
 * pattern = clearPattern(pattern);
 *
 * // Set velocity for a specific step
 * pattern = setStepVelocity(pattern, 'track-0', 0, 0.8);
 * ```
 *
 * ## Swing
 *
 * Add groove by delaying off-beat notes:
 *
 * ```typescript
 * import { setSwing, getSwingAdjustedInterval } from '@soundblue/audio-engine/sequencer';
 *
 * // Add 50% swing
 * state = setSwing(state, 0.5);
 *
 * // Get swing-adjusted timing for current step
 * const interval = getSwingAdjustedInterval(state);
 * ```
 *
 * @see {@link Pattern} - Pattern data structure
 * @see {@link StepSequencerState} - Sequencer state
 * @see {@link StepEvent} - Step playback event
 */

// ========================================
// @soundblue/audio-engine - Sequencer
// Public API
// ========================================

export {
  clearPattern,
  createEmptyPattern,
  getActiveStepsAt,
  getActiveTracks,
  type Pattern,
  type PatternStep,
  type PatternTrack,
  randomizePattern,
  setStepVelocity,
  shiftPattern,
  toggleMute,
  toggleSolo,
  toggleStep,
} from './pattern';

export {
  createSequencerState,
  getCurrentStepEvent,
  getStepInterval,
  getSwingAdjustedInterval,
  goToStep,
  nextStep,
  pause,
  play,
  type StepEvent,
  type StepSequencerState,
  setBpm,
  setSwing,
  stop,
  toggleLoop,
} from './step';
