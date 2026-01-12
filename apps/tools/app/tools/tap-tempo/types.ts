/**
 * TAP Tempo Tool Types
 */

export interface TapTempoSettings {
  /** Whether metronome sound is enabled */
  soundEnabled: boolean;
  /** Volume level 0-100 */
  volume: number;
}

export interface TapTempoProps {
  settings?: Partial<TapTempoSettings>;
  onSettingsChange?: (settings: Partial<TapTempoSettings>) => void;
}
