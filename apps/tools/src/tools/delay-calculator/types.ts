/**
 * Delay Calculator Types
 */

/** Note value (duration relative to quarter note) */
export type NoteValue = '1/1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/32';

/** Note variant (timing modification) */
export type NoteVariant = 'normal' | 'dotted' | 'triplet';

/** Delay time data for a single note value */
export interface DelayTime {
  note: NoteValue;
  normal: { ms: number; hz: number };
  dotted: { ms: number; hz: number };
  triplet: { ms: number; hz: number };
}

/** Delay Calculator settings */
export interface DelayCalculatorSettings {
  /** BPM (beats per minute) */
  bpm: number;
}

/** Props for DelayCalculator component */
export interface DelayCalculatorProps {
  settings: DelayCalculatorSettings;
  onSettingsChange: (settings: Partial<DelayCalculatorSettings>) => void;
}

/** Localized text for the calculator UI */
export interface DelayCalculatorTexts {
  title: string;
  bpm: string;
  tap: string;
  note: string;
  normal: string;
  dotted: string;
  triplet: string;
  copyTip: string;
  tapTip: string;
  copied: string;
  reset: string;
}
