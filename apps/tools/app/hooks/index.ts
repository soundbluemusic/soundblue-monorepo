/**
 * @fileoverview Custom Hooks Index
 *
 * Central export for all custom hooks used in the tools app.
 */

// Animation hooks
export { type AutoAnimateOptions, autoAnimatePresets, useAutoAnimate } from './useAutoAnimate';
export {
  type DrumPattern,
  type DrumSoundId,
  type DrumSynthParams,
  type UseDrumMachineOptions,
  type UseDrumMachineReturn,
  useDrumMachine,
} from './useDrumMachine';
// Audio/Music hooks
export { type UseMetronomeOptions, type UseMetronomeReturn, useMetronome } from './useMetronome';
