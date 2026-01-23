/**
 * Delay Time Calculator Engine
 * Pure calculation functions for BPM-based delay times
 */

import type { DelayTime, NoteValue, NoteVariant } from '../types';

/** Note value multipliers relative to quarter note (1/4) */
const NOTE_MULTIPLIERS: Record<NoteValue, number> = {
  '1/1': 4, // whole note
  '1/2': 2, // half note
  '1/4': 1, // quarter note (base)
  '1/8': 0.5, // eighth note
  '1/16': 0.25, // sixteenth note
  '1/32': 0.125, // thirty-second note
};

/** Variant multipliers */
const VARIANT_MULTIPLIERS: Record<NoteVariant, number> = {
  normal: 1,
  dotted: 1.5, // adds half the value
  triplet: 2 / 3, // two-thirds of normal
};

/**
 * Calculate quarter note duration in milliseconds
 * @param bpm - Beats per minute
 * @returns Duration in ms
 */
export function getQuarterNoteMs(bpm: number): number {
  if (bpm <= 0) return 0;
  return 60000 / bpm;
}

/**
 * Calculate delay time for a specific note value and variant
 * @param bpm - Beats per minute
 * @param note - Note value (1/4, 1/8, etc.)
 * @param variant - Note variant (normal, dotted, triplet)
 * @returns Delay time in milliseconds
 */
export function calculateDelayTime(
  bpm: number,
  note: NoteValue,
  variant: NoteVariant = 'normal',
): number {
  const quarterMs = getQuarterNoteMs(bpm);
  const noteMultiplier = NOTE_MULTIPLIERS[note];
  const variantMultiplier = VARIANT_MULTIPLIERS[variant];

  return quarterMs * noteMultiplier * variantMultiplier;
}

/**
 * Convert milliseconds to Hz (frequency)
 * @param ms - Duration in milliseconds
 * @returns Frequency in Hz
 */
export function msToHz(ms: number): number {
  if (ms <= 0) return 0;
  return 1000 / ms;
}

/**
 * Format milliseconds for display
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "500ms" or "1.5s")
 */
export function formatMs(ms: number): string {
  if (ms >= 1000) {
    const seconds = ms / 1000;
    // Show up to 2 decimal places, remove trailing zeros
    return `${Number.parseFloat(seconds.toFixed(2))}s`;
  }
  return `${Math.round(ms)}ms`;
}

/**
 * Format Hz for display
 * @param hz - Frequency in Hz
 * @returns Formatted string (e.g., "2.0 Hz")
 */
export function formatHz(hz: number): string {
  if (hz < 1) {
    return `${hz.toFixed(3)} Hz`;
  }
  return `${hz.toFixed(2)} Hz`;
}

/**
 * Calculate all delay times for a given BPM
 * @param bpm - Beats per minute
 * @returns Array of delay time objects for all note values
 */
export function calculateAllDelayTimes(bpm: number): DelayTime[] {
  const notes: NoteValue[] = ['1/1', '1/2', '1/4', '1/8', '1/16', '1/32'];
  const variants: NoteVariant[] = ['normal', 'dotted', 'triplet'];

  return notes.map((note) => {
    const times = {} as Record<NoteVariant, { ms: number; hz: number }>;

    for (const variant of variants) {
      const ms = calculateDelayTime(bpm, note, variant);
      times[variant] = {
        ms,
        hz: msToHz(ms),
      };
    }

    return {
      note,
      ...times,
    };
  });
}

/**
 * TAP Tempo calculation
 * Calculates BPM from an array of tap timestamps
 * @param timestamps - Array of tap timestamps in milliseconds
 * @param maxTaps - Maximum number of taps to consider (default: 8)
 * @returns Calculated BPM or null if not enough taps
 */
export function calculateTapTempo(timestamps: number[], maxTaps = 8): number | null {
  // Need at least 2 taps to calculate BPM
  if (timestamps.length < 2) return null;

  // Use only the most recent taps
  const recentTaps = timestamps.slice(-maxTaps);

  // Calculate intervals between taps
  const intervals: number[] = [];
  for (let i = 1; i < recentTaps.length; i++) {
    intervals.push(recentTaps[i] - recentTaps[i - 1]);
  }

  // Calculate average interval
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

  // Convert to BPM (60000ms / interval)
  const bpm = 60000 / avgInterval;

  // Clamp to reasonable range
  return Math.round(Math.max(20, Math.min(300, bpm)));
}

/**
 * Check if tap timestamps have expired (too much time between taps)
 * @param timestamps - Array of tap timestamps
 * @param timeout - Timeout in milliseconds (default: 2000ms)
 * @returns true if taps should be reset
 */
export function shouldResetTaps(timestamps: number[], timeout = 2000): boolean {
  if (timestamps.length === 0) return false;
  const lastTap = timestamps[timestamps.length - 1];
  return Date.now() - lastTap > timeout;
}
