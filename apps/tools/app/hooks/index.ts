/**
 * @fileoverview Custom Hooks Index
 *
 * Central export for all custom hooks used in the tools app.
 */

// Animation hooks
export { type AutoAnimateOptions, autoAnimatePresets, useAutoAnimate } from './useAutoAnimate';
// Clipboard hooks
export {
  type UseCopyToClipboardOptions,
  type UseCopyToClipboardReturn,
  useCopyToClipboard,
} from './useCopyToClipboard';
// Locale hooks
export { type SupportedLocale, useCurrentLocale } from './useCurrentLocale';
export {
  type DrumPattern,
  type DrumSoundId,
  type DrumSynthParams,
  type PresetName,
  type UseDrumMachineOptions,
  type UseDrumMachineReturn,
  useDrumMachine,
} from './useDrumMachine';
// Audio/Music hooks
export { type UseMetronomeOptions, type UseMetronomeReturn, useMetronome } from './useMetronome';
// Settings hooks
export { useSettingsMerge } from './useSettingsMerge';
