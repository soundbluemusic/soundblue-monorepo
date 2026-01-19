/**
 * Shared Constants for Tools App
 *
 * Consolidated from multiple tool settings files.
 */

// ========================================
// BPM (Beats Per Minute) Constants
// ========================================

/**
 * BPM range for music tools (metronome, tap-tempo, delay-calculator, drum-machine)
 */
export const BPM_RANGE = {
  MIN: 20,
  MAX: 300,
  DEFAULT: 120,
  STEP: 1,
} as const;

/**
 * Metronome-specific BPM range (narrower for practical use)
 */
export const METRONOME_BPM_RANGE = {
  MIN: 40,
  MAX: 240,
} as const;

// ========================================
// Timing Constants
// ========================================

/**
 * Common timing values in milliseconds
 */
export const TIMING = {
  /** Delay before resetting tap tempo */
  TAP_RESET_DELAY: 2000,
  /** Copy feedback display duration */
  COPY_FEEDBACK_DELAY: 2000,
  /** URL copy feedback duration */
  URL_COPIED_DELAY: 2000,
  /** Debounce delay for inputs */
  INPUT_DEBOUNCE: 300,
} as const;

// ========================================
// Audio Constants
// ========================================

/**
 * Click sound frequencies in Hz
 */
export const FREQUENCIES = {
  /** Accent beat frequency */
  ACCENT: 2000,
  /** Regular beat frequency */
  REGULAR: 800,
} as const;

/**
 * Audio timing for metronome
 */
export const AUDIO_TIMING = {
  SCHEDULER_INTERVAL_MS: 25,
  LOOK_AHEAD_SECONDS: 0.1,
  CLICK_DURATION_SECONDS: 0.08,
} as const;

// ========================================
// UI Constants
// ========================================

/**
 * Pendulum animation settings
 */
export const PENDULUM = {
  MAX_ANGLE: 30,
  SWING_RANGE: 60,
} as const;

/**
 * Note variants for delay calculator
 */
export const NOTE_VARIANTS = ['normal', 'dotted', 'triplet'] as const;
export type NoteVariant = (typeof NOTE_VARIANTS)[number];

/**
 * Note labels (localized)
 */
export const NOTE_LABELS: Record<string, { en: string; ko: string }> = {
  '1/1': { en: 'Whole', ko: '온음표' },
  '1/2': { en: 'Half', ko: '2분음표' },
  '1/4': { en: 'Quarter', ko: '4분음표' },
  '1/8': { en: '8th', ko: '8분음표' },
  '1/16': { en: '16th', ko: '16분음표' },
  '1/32': { en: '32nd', ko: '32분음표' },
  '1/64': { en: '64th', ko: '64분음표' },
};

// ========================================
// Size Constants
// ========================================

/**
 * Drum grid cell sizes
 */
export const DRUM_GRID = {
  BASE_CELL_SIZE: 28,
  BASE_CELL_GAP: 3,
  BASE_LABEL_WIDTH: 52,
  HEADER_HEIGHT: 0,
  MIN_CELL_SIZE: 24,
} as const;
