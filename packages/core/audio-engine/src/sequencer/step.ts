// ========================================
// @soundblue/audio-engine - Step Sequencer
// Step sequencer state management
// Pure computation - no browser APIs
// ========================================

import type { Pattern } from './pattern';
import { getActiveStepsAt } from './pattern';

/**
 * Step sequencer state
 */
export interface StepSequencerState {
  pattern: Pattern;
  currentStep: number;
  isPlaying: boolean;
  bpm: number;
  swing: number; // 0-1
  loop: boolean;
}

/**
 * Event emitted on each step
 */
export interface StepEvent {
  step: number;
  time: number;
  activeSteps: { trackId: string; velocity: number }[];
}

/**
 * Create initial sequencer state
 */
export function createSequencerState(pattern: Pattern, bpm = 120): StepSequencerState {
  return {
    pattern,
    currentStep: 0,
    isPlaying: false,
    bpm,
    swing: 0,
    loop: true,
  };
}

/**
 * Advance to next step
 */
export function nextStep(state: StepSequencerState): StepSequencerState {
  const nextStepIndex = (state.currentStep + 1) % state.pattern.length;

  // If not looping and we've reached the end, stop
  if (!state.loop && nextStepIndex === 0) {
    return {
      ...state,
      currentStep: 0,
      isPlaying: false,
    };
  }

  return {
    ...state,
    currentStep: nextStepIndex,
  };
}

/**
 * Go to specific step
 */
export function goToStep(state: StepSequencerState, step: number): StepSequencerState {
  const clampedStep = Math.max(0, Math.min(state.pattern.length - 1, step));
  return {
    ...state,
    currentStep: clampedStep,
  };
}

/**
 * Start playback
 */
export function play(state: StepSequencerState): StepSequencerState {
  return {
    ...state,
    isPlaying: true,
  };
}

/**
 * Pause playback
 */
export function pause(state: StepSequencerState): StepSequencerState {
  return {
    ...state,
    isPlaying: false,
  };
}

/**
 * Stop and reset
 */
export function stop(state: StepSequencerState): StepSequencerState {
  return {
    ...state,
    isPlaying: false,
    currentStep: 0,
  };
}

/**
 * Set BPM
 */
export function setBpm(state: StepSequencerState, bpm: number): StepSequencerState {
  const clampedBpm = Math.max(20, Math.min(300, bpm));
  return {
    ...state,
    bpm: clampedBpm,
  };
}

/**
 * Set swing amount
 */
export function setSwing(state: StepSequencerState, swing: number): StepSequencerState {
  const clampedSwing = Math.max(0, Math.min(1, swing));
  return {
    ...state,
    swing: clampedSwing,
  };
}

/**
 * Toggle loop mode
 */
export function toggleLoop(state: StepSequencerState): StepSequencerState {
  return {
    ...state,
    loop: !state.loop,
  };
}

/**
 * Get current step event
 */
export function getCurrentStepEvent(state: StepSequencerState, time: number): StepEvent {
  const activeSteps = getActiveStepsAt(state.pattern, state.currentStep);

  return {
    step: state.currentStep,
    time,
    activeSteps: activeSteps.map((s) => ({
      trackId: s.trackId,
      velocity: s.step.velocity,
    })),
  };
}

/**
 * Calculate step interval in milliseconds
 */
export function getStepInterval(state: StepSequencerState): number {
  // One beat = 60000 / bpm milliseconds
  // Steps per beat = subdivision (e.g., 4 for 16th notes)
  const beatDuration = 60000 / state.bpm;
  return beatDuration / state.pattern.subdivision;
}

/**
 * Calculate swing-adjusted interval for current step
 */
export function getSwingAdjustedInterval(state: StepSequencerState): number {
  const baseInterval = getStepInterval(state);

  // Swing affects off-beats (odd steps)
  const isOffBeat = state.currentStep % 2 === 1;

  if (!isOffBeat || state.swing === 0) {
    return baseInterval;
  }

  // Off-beat is delayed by swing amount
  // Full swing (1.0) = triplet feel = delay by 1/3 of base interval
  return baseInterval + (baseInterval / 3) * state.swing;
}
